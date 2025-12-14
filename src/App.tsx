import "./App.css";
import { createContext, useContext, type ReactNode } from "react";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
  useMutation,
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
  return <DinoGame />;
}

function App() {
  return (
    <>
      <AuthLoading>Loading...</AuthLoading>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <UserIdWrapper>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              gap: "2rem",
              padding: "2rem",
            }}
          >
            <ContentWrapper />
            <SignOutButton />
          </div>
        </UserIdWrapper>
      </Authenticated>
    </>
  );
}

export default App;
