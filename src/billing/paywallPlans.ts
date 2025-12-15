export interface PricingPlan {
  rateCardId: string;
  name: string;
  price: number;
  description: string;
  credits: number;
  features: string[];
}

const FREE_PLAN_RATE_CARD_ID = "rc_VOd1dnsD885nm65WsF2m1ryk";
const STARTER_PLAN_RATE_CARD_ID = "rc_B5JMOGqEUtCNH2oZN5A8FMUI";
const PREMIUM_PLAN_RATE_CARD_ID = "rc_IMMz6ZPqVOfV5ETCBDMW42y2";

export const plans: PricingPlan[] = [
  {
    rateCardId: FREE_PLAN_RATE_CARD_ID,
    name: "Free",
    price: 0,
    description: "Perfect for trying out our T-Rex game",
    credits: 5,
    features: ["5 credits per month", "Basic game play", "Community support"],
  },
  {
    rateCardId: STARTER_PLAN_RATE_CARD_ID,
    name: "Starter",
    price: 20,
    description: "Best for prolonged game play for individuals",
    credits: 25,
    features: ["25 credits per month", "Premium game play", "Priority support"],
  },
  {
    rateCardId: PREMIUM_PLAN_RATE_CARD_ID,
    name: "Premium",
    price: 100,
    description: "Unlimited game play for T-Rex fans",
    credits: 105,
    features: [
      "105 included credits, $0.90 per additional game play",
      "Premium game play",
      "Priority support",
    ],
  },
];

export function isOverageAllowedForRateCardId(rateCardId: string): boolean {
  return rateCardId === PREMIUM_PLAN_RATE_CARD_ID;
}

export function getPricingPlanForRateCardId(rateCardId: string): PricingPlan {
  const plan = plans.find((plan) => plan.rateCardId === rateCardId);
  if (!plan) {
    throw new Error(`Plan not found for rate card ID: ${rateCardId}`);
  }
  return plan;
}

export function getPlanChangeType({
  currentRateCardId,
  newRateCardId,
}: {
  currentRateCardId: string;
  newRateCardId: string;
}): "upgrade" | "downgrade" | "no-change" {
  const currentPlan = getPricingPlanForRateCardId(currentRateCardId);
  const newPlan = getPricingPlanForRateCardId(newRateCardId);
  if (currentPlan.rateCardId === newPlan.rateCardId) {
    return "no-change";
  }
  if (currentPlan.price > newPlan.price) {
    return "downgrade";
  } else if (currentPlan.price < newPlan.price) {
    return "upgrade";
  }
  throw new Error("Invalid plan change");
}
