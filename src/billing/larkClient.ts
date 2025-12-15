import Lark from "lark-billing";
import { isOverageAllowedForRateCardId } from "./paywallPlans";
import { useEffect, useState } from "react";

const LARK_PUBLIC_API_KEY = import.meta.env.VITE_LARK_PUBLIC_API_KEY;
const LARK_BASE_URL = import.meta.env.VITE_LARK_BASE_URL;

const lark = new Lark({
  apiKey: LARK_PUBLIC_API_KEY,
  baseURL: LARK_BASE_URL ?? undefined,
});

export type BillingState = {
  subscriptionId: string;
  subscribedRateCardId: string;
  creditsRemaining: number;
  overageAllowed: boolean;
};
export async function getBillingState({
  subjectId,
  retryCount = 0,
}: {
  subjectId: string;
  retryCount?: number;
}): Promise<BillingState> {
  try {
    const billingState = await lark.customerAccess.retrieveBillingState(
      subjectId
    );

    if (billingState.active_subscriptions.length !== 1) {
      throw new Error(
        "We always expect a user to have a single active subscription since we subscribe them to free plan on signup"
      );
    }
    const subscribedRateCardId =
      billingState.active_subscriptions[0].rate_card_id;
    const subscriptionId = billingState.active_subscriptions[0].subscription_id;

    if (billingState.usage_data.length !== 1) {
      throw new Error(
        "We always expect a user to have a single usage data since we track usage for a single pricing metric"
      );
    }

    const includedCredits = billingState.usage_data[0].included_units;
    const usedCredits = parseInt(billingState.usage_data[0].used_units);
    const overageAllowed = isOverageAllowedForRateCardId(subscribedRateCardId);

    return {
      subscriptionId,
      subscribedRateCardId,
      creditsRemaining: includedCredits - usedCredits,
      overageAllowed,
    };
  } catch (err) {
    // a hack to refetch billing state after a short delay
    // since right after signup we asynchronously subscribe customer
    // so fetching this right after will return 0 subs
    if (retryCount < 3) {
      console.log(
        "error while fetching billing state, retrying in 1 second",
        err
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await getBillingState({ subjectId, retryCount: retryCount + 1 });
    }

    console.error("Error fetching billing state:", err);
    throw new Error("Error fetching billing state");
  }
}

export function useBillingManager({ subjectId }: { subjectId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [billingState, setBillingState] = useState<BillingState | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const getBillingStateWrapper = async () => {
    try {
      const billingState = await getBillingState({ subjectId: subjectId });
      setBillingState(billingState);
    } catch (err) {
      setError("Error fetching billing state. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBillingStateWrapper();
  }, []);

  return {
    billingState,
    error,
    isLoading,
    refreshBillingState: getBillingStateWrapper,
  };
}
