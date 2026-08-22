export function getFirebaseAuthErrorMessage(error: unknown): string {
  const err = error as { code?: string; message?: string };
  const code = err?.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/user-not-found":
      return "No account was found with this email.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Please allow popups in your browser and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/google-only":
      return err.message || "This account uses Google Sign-In. Please continue with Google.";
    case "db/connection-error":
      return "Unable to connect to the application database.";
    default:
      return "Unable to complete authentication. Please try again.";
  }
}
