import { internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { Lark } from "lark-billing";

const lark_client = new Lark({ apiKey: process.env.LARK_API_KEY });

const LARK_FREE_PLAN_ID = "rc_VOd1dnsD885nm65WsF2m1ryk";
const LARK_PRICING_METRIC_EVENT_NAME = "dinosaur_game_play";

export const potentiallyCreateCustomerAndSubscribeToFreePlan = internalAction({
  args: { email: v.optional(v.string()), user_id: v.string() },
  handler: async (_, args) => {
    await lark_client.subjects.create({
      email: args.email,
      external_id: args.user_id,
    });

    await lark_client.subscriptions.create({
      subject_id: args.user_id,
      rate_card_id: LARK_FREE_PLAN_ID,
    });
  },
});

export const reportUsage = internalAction({
  args: { user_id: v.string(), idempotency_key: v.string() },
  handler: async (_, args) => {
    await lark_client.usageEvents.create({
      idempotency_key: args.idempotency_key,
      subject_id: args.user_id,
      event_name: LARK_PRICING_METRIC_EVENT_NAME,
      data: {
        value: "1",
      },
    });
  },
});

export const updateSubscription = action({
  args: {
    subscription_id: v.string(),
    new_rate_card_id: v.string(),
    checkout_success_callback_url: v.string(),
    checkout_cancel_callback_url: v.string(),
  },
  handler: async (_, args) => {
    console.log("Updating subscription", args);
    const response = await lark_client.subscriptions.changeRateCard(
      args.subscription_id,
      {
        rate_card_id: args.new_rate_card_id,
        upgrade_behavior: "rate_difference",
        checkout_callback_urls: {
          success_url: args.checkout_success_callback_url,
          cancelled_url: args.checkout_cancel_callback_url,
        },
      }
    );

    if (response.result.type === "requires_action") {
      return {
        type: "requires_checkout",
        checkout_url: response.result.action.checkout_url,
      };
    } else {
      return {
        type: "success",
      };
    }
  },
});

export const createCustomerPortalSession = action({
  args: {
    subject_id: v.string(),
    return_url: v.string(),
  },
  handler: async (_, args) => {
    console.log("Creating customer portal session", args);
    const response = await lark_client.customerPortal.createSession({
      subject_id: args.subject_id,
      return_url: args.return_url,
    });

    return response.url;
  },
});
