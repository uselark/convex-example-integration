import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const createGameAttempt = mutation({
  args: {},
  handler: async (ctx, _) => {
    const userId = await getAuthUserId(ctx);
    // use a randum UUID for now but ideally this is this is a unique request or a attempt object ID
    const attemptID = crypto.randomUUID();

    console.log("Game attempt for user", userId, attemptID);
    ctx.scheduler.runAfter(0, internal.lark.reportUsage, {
      user_id: userId!,
      idempotency_key: attemptID,
    });
  },
});
