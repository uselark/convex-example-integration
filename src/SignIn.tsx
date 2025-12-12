import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signUp" | "signIn">("signIn");
  const [error, setError] = useState<string>("");

  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
  };

  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "24px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "32px",
    marginTop: "0",
    color: "#667eea",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    background: "#f9fafb",
    color: "#1f2937",
    marginBottom: "16px",
    transition: "all 0.3s ease",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const primaryButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "12px",
    border: "none",
    background: "#667eea",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  };

  const toggleContainerStyle: React.CSSProperties = {
    display: "flex",
    background: "#f3f4f6",
    borderRadius: "12px",
    padding: "4px",
    gap: "4px",
    marginBottom: "32px",
  };

  const getToggleButtonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: isActive ? "#667eea" : "transparent",
    color: isActive ? "white" : "#6b7280",
    boxShadow: isActive ? "0 2px 8px rgba(102, 126, 234, 0.3)" : "none",
  });

  const errorStyle: React.CSSProperties = {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "#dc2626",
    marginBottom: "16px",
    fontSize: "14px",
    lineHeight: "1.5",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Convex & Lark</h2>

        <div style={toggleContainerStyle}>
          <button
            type="button"
            style={getToggleButtonStyle(step === "signIn")}
            onClick={() => {
              setError("");
              setStep("signIn");
            }}
            onMouseEnter={(e) => {
              if (step !== "signIn") {
                e.currentTarget.style.background = "#e5e7eb";
                e.currentTarget.style.color = "#374151";
              }
            }}
            onMouseLeave={(e) => {
              if (step !== "signIn") {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#6b7280";
              }
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            style={getToggleButtonStyle(step === "signUp")}
            onClick={() => {
              setError("");
              setStep("signUp");
            }}
            onMouseEnter={(e) => {
              if (step !== "signUp") {
                e.currentTarget.style.background = "#e5e7eb";
                e.currentTarget.style.color = "#374151";
              }
            }}
            onMouseLeave={(e) => {
              if (step !== "signUp") {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#6b7280";
              }
            }}
          >
            Sign Up
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            const formData = new FormData(event.currentTarget);

            signIn("password", formData).catch((err) => {
              console.error("Sign in error:", err);

              // Handle specific error cases
              const errorMessage = err.message || String(err);
              if (errorMessage.includes("InvalidAccountId")) {
                setError(
                  "Account not found. Please sign up first or check your email."
                );
              } else if (errorMessage.includes("Invalid password")) {
                if (step === "signUp") {
                  setError("Password must be at least 8 characters long.");
                } else {
                  setError("Incorrect password. Please try again.");
                }
              } else {
                setError(
                  errorMessage || "Authentication failed. Please try again."
                );
              }
            });
          }}
        >
          <input
            name="email"
            placeholder="Email"
            type="email"
            required
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#667eea";
              e.currentTarget.style.background = "white";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.background = "#f9fafb";
            }}
          />
          <input
            name="password"
            placeholder="Password (min 8 characters)"
            type="password"
            required
            minLength={8}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#667eea";
              e.currentTarget.style.background = "white";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.background = "#f9fafb";
            }}
          />
          <input name="flow" type="hidden" value={step} />

          {error && <div style={errorStyle}>{error}</div>}

          <button
            type="submit"
            style={primaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(102, 126, 234, 0.5)";
              e.currentTarget.style.background = "#5568d3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(102, 126, 234, 0.4)";
              e.currentTarget.style.background = "#667eea";
            }}
          >
            {step === "signIn" ? "Sign in" : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}
