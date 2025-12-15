import { useAuthActions } from "@convex-dev/auth/react";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  return (
    <button style={{ marginBottom: "2rem" }} onClick={() => void signOut()}>
      Sign out
    </button>
  );
}
