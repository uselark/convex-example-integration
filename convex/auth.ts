import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { internal } from "./_generated/api";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    afterUserCreatedOrUpdated: async (context, args) => {
      console.log("afterUserCreatedOrUpdated", args);

      context.scheduler.runAfter(
        0,
        internal.lark.potentiallyCreateCustomerAndSubscribeToFreePlan,
        {
          email: args.profile.email,
          user_id: args.userId,
        }
      );
    },
  },
});
