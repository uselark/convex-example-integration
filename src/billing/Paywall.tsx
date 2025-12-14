import { useEffect, useState } from "react";
import type { BillingState } from "./larkClient";
import { getPlanChangeType, type PricingPlan } from "./paywallPlans";

function getPaywallSubText({
  billingState,
}: {
  billingState: BillingState;
}): string {
  if (billingState.creditsRemaining > 0 || billingState.overageAllowed) {
    return "Choose the plan that best fits your needs.";
  } else {
    return "You're out of credits. Please upgrade to continue. ";
  }
}

export function Paywall({
  plans,
  billingState,
  upgradeSubscriptionPlan,
}: {
  plans: PricingPlan[];
  billingState: BillingState;
  upgradeSubscriptionPlan: ({
    subscriptionId,
    newRateCardId,
  }: {
    subscriptionId: string;
    newRateCardId: string;
  }) => Promise<{ result_type: "redirected_for_checkout" | "success" }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loadingRateCardId, setLoadingRateCardId] = useState<string | null>(
    null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpgrade, setPendingUpgrade] = useState<{
    subscriptionId: string;
    newRateCardId: string;
    planName: string;
  } | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    // Check for upgrade_success query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const upgradeSuccess = urlParams.get("upgrade_success");

    if (upgradeSuccess === "true") {
      setShowSuccessToast(true);
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, []);

  const handleSelectPlan = ({
    subscriptionId,
    newRateCardId,
    planName,
  }: {
    subscriptionId: string;
    newRateCardId: string;
    planName: string;
  }) => {
    setPendingUpgrade({ subscriptionId, newRateCardId, planName });
    setShowConfirmModal(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!pendingUpgrade) return;

    const { subscriptionId, newRateCardId } = pendingUpgrade;

    setShowConfirmModal(false);

    try {
      setLoadingRateCardId(newRateCardId);

      const result = await upgradeSubscriptionPlan({
        subscriptionId,
        newRateCardId,
      });

      if (result.result_type === "success") {
        // Show success toast and redirect to home page
        setShowSuccessToast(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (err) {
      console.error("Error updating subscription:", err);
      setError("Failed to update subscription. Please try again.");
    } finally {
      setLoadingRateCardId(null);
      setPendingUpgrade(null);
    }
  };

  const handleCancelUpgrade = () => {
    setShowConfirmModal(false);
    setPendingUpgrade(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {!billingState && error && (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        {!billingState && !error && (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Loading...
              </h2>
              <p className="text-gray-600">
                Please wait while we fetch your account details
              </p>
            </div>
          </div>
        )}

        {billingState && (
          <>
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Pricing
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-4">
                {getPaywallSubText({ billingState })}
              </p>
              <p className="text-gray-600 text-base">
                You'll use fake money (via{" "}
                <a
                  href="https://docs.stripe.com/testing#testing-interactively"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                >
                  test cards
                </a>
                ) to pay for the plans.
              </p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {plans.map((plan) => {
                const subscribedRateCardId = billingState.subscribedRateCardId;
                const planChangeType = getPlanChangeType({
                  currentRateCardId: subscribedRateCardId,
                  newRateCardId: plan.rateCardId,
                });
                return (
                  <div
                    key={plan.name}
                    className="relative bg-white rounded-2xl shadow-lg p-8 flex flex-col transition-all hover:shadow-2xl border border-gray-100"
                  >
                    {/* Plan Header */}
                    <div className="mb-8">
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 text-base min-h-[48px] leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600">per month</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    {planChangeType === "no-change" && (
                      <div className="w-full py-3 px-6 rounded-lg font-semibold text-base mb-8 bg-green-100 text-green-700 text-center border-2 border-green-200">
                        Current Plan
                      </div>
                    )}
                    {planChangeType === "downgrade" && (
                      <div
                        className="w-full py-3 px-6 rounded-lg font-semibold text-base mb-8 bg-gray-100 text-gray-500 text-center cursor-not-allowed relative group border border-gray-200"
                        title="Contact support for downgrade"
                      >
                        Downgrade
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                          Contact support for downgrade
                        </div>
                      </div>
                    )}
                    {planChangeType === "upgrade" && (
                      <button
                        onClick={() =>
                          handleSelectPlan({
                            subscriptionId: billingState.subscriptionId,
                            newRateCardId: plan.rateCardId,
                            planName: plan.name,
                          })
                        }
                        disabled={loadingRateCardId !== null}
                        className={`w-full py-3 px-6 rounded-lg font-semibold text-base mb-8 transition-all flex items-center justify-center ${
                          loadingRateCardId !== null
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                        }`}
                      >
                        {loadingRateCardId === plan.rateCardId ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          "Upgrade"
                        )}
                      </button>
                    )}

                    {/* Features List */}
                    <div className="flex-1">
                      <ul className="space-y-4">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <svg
                                className="w-6 h-6 text-green-500"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </svg>
                            </div>
                            <span className="text-gray-700 text-base">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && pendingUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Confirm Upgrade
              </h3>
              <p className="text-gray-700 text-base leading-relaxed">
                Are you sure you want to upgrade to the{" "}
                <span className="font-semibold text-indigo-600">
                  {pendingUpgrade.planName}
                </span>{" "}
                plan?
              </p>
              <p className="text-gray-600 text-sm mt-4 leading-relaxed">
                You will be charged the new price for the current month and
                going forward.
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleCancelUpgrade}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-8 py-4 rounded-lg shadow-2xl flex items-center gap-4 border border-green-600">
            <div className="flex-shrink-0">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">Success!</p>
              <p className="text-sm text-green-50">
                Your plan was upgraded successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
