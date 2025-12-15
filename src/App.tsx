import "./App.css";
import { createContext, useContext, useState, type ReactNode } from "react";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
  useMutation,
  useAction,
} from "convex/react";
import { SignIn } from "./SignIn";
import { SignOutButton } from "./SignOutButton";
import { DinoGame } from "./DinoGame";
import { useBillingManager } from "./billing/larkClient";
import { Paywall } from "./billing/Paywall";
import { plans } from "./billing/paywallPlans";
import { api } from "../convex/_generated/api";

// Context for providing userId throughout the app
const UserIdContext = createContext<string | null>(null);

export const useUserId = () => {
  const userId = useContext(UserIdContext);
  if (userId === null) {
    throw new Error("useUserId must be used within UserIdWrapper");
  }
  return userId;
};

function UserIdWrapper({ children }: { children: ReactNode }) {
  const userId = useQuery(api.user.currentUserId);

  // Handle loading state - useQuery returns undefined while loading
  if (userId === undefined) {
    return <div>Loading user...</div>;
  }

  return (
    <UserIdContext.Provider value={userId}>{children}</UserIdContext.Provider>
  );
}

function ContentWrapper() {
  const userId = useUserId();
  const {
    billingState,
    error: billingStateError,
    isLoading: isLoadingBillingState,
    refreshBillingState,
  } = useBillingManager({ subjectId: userId });
  const [isPlaying, setIsPlaying] = useState(false);
  const createGameAttempt = useMutation(api.attempts.createGameAttempt);
  const updateSubscription = useAction(api.lark.updateSubscription);
  const createCustomerPortalSession = useAction(
    api.lark.createCustomerPortalSession
  );

  // Handle loading state
  if (isLoadingBillingState) {
    return <div>Loading...</div>;
  }

  if (billingStateError) {
    return <div>Error: {billingStateError}</div>;
  }

  const userIsAllowedToUseProduct =
    billingState!.creditsRemaining > 0 || billingState!.overageAllowed;

  // const userIsAllowedToUseProduct = false;

  if (!userIsAllowedToUseProduct) {
    return (
      <Paywall
        plans={plans}
        billingState={billingState!}
        upgradeSubscriptionPlan={async ({ subscriptionId, newRateCardId }) => {
          console.log("upgrading subscription", subscriptionId, newRateCardId);

          const result = await updateSubscription({
            subscription_id: subscriptionId,
            new_rate_card_id: newRateCardId,
            checkout_success_callback_url: window.location.href,
            checkout_cancel_callback_url: window.location.href,
          });

          if (result.type === "requires_checkout") {
            window.location.href = result.checkout_url!;

            return Promise.resolve({ result_type: "redirected_for_checkout" });
          } else if (result.type === "success") {
            refreshBillingState();
            return Promise.resolve({ result_type: "success" });
          } else {
            return Promise.reject(new Error("Failed to update subscription"));
          }
        }}
      />
    );
  }

  return (
    <div>
      <DinoGame
        onGameStart={() => {
          console.log("Game started");
          createGameAttempt();
          setIsPlaying(true);
        }}
        onGameOver={() => {
          console.log("Game over");
          setIsPlaying(false);
          refreshBillingState();
        }}
      />
      {!isPlaying && (
        <div style={{ textAlign: "center" }}>
          <span>
            {`You have ${billingState!.creditsRemaining} credits remaining. `}
          </span>
          <span>
            Click{" "}
            <a
              onClick={async () => {
                const url = await createCustomerPortalSession({
                  subject_id: userId,
                  return_url: window.location.href,
                });

                window.open(url, "_blank");
              }}
              style={{
                color: "#0066cc",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              here{" "}
            </a>{" "}
            to manage your subscription.
          </span>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          gap: "2rem",
          width: "100%",
        }}
      >
        <AuthLoading>Loading...</AuthLoading>
        <Unauthenticated>
          <SignIn />
        </Unauthenticated>
        <Authenticated>
          <UserIdWrapper>
            <ContentWrapper />
            <SignOutButton />
          </UserIdWrapper>
        </Authenticated>
      </div>
      <footer
        style={{
          textAlign: "center",
          padding: "1rem",
          color: "#666",
          fontSize: "0.9rem",
          borderTop: "1px solid #e0e0e0",
          width: "100%",
        }}
      >
        <span>Explore </span>
        <a
          href="https://docs.uselark.ai/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#666",
            textDecoration: "underline",
          }}
        >
          Lark billing docs
        </a>
        <span> or </span>
        <a
          href="https://calendly.com/founders-uselark/30min"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#666",
            textDecoration: "underline",
          }}
        >
          schedule time with a founder
        </a>
      </footer>
    </div>
  );
}

export default App;
