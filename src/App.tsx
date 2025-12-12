import "./App.css";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignIn } from "./SignIn";
import { SignOutButton } from "./SignOutButton";
import { DinoGame } from "./DinoGame";

// Auth + create lark customer (+ subscribe to free plan)
// Report usage
// Check billing state on frontend
// paywall + plan upgrades
// lark customer portal for sub cancellations, invoices view

function Content() {
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
          <Content />
          <SignOutButton />
        </div>
      </Authenticated>
    </>
  );
}

export default App;
