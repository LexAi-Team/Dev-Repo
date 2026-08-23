import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
  UserCredential,
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  if (Capacitor.isNativePlatform()) {
    const result = await FirebaseAuthentication.signInWithGoogle();
    if (!result || !result.credential || !result.credential.idToken) {
      throw new Error("Google Sign-In failed or was cancelled.");
    }
    const credential = GoogleAuthProvider.credential(result.credential.idToken);
    return signInWithCredential(auth, credential);
  }
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await FirebaseAuthentication.signOut().catch(() => {});
  }
  return signOut(auth);
}

export async function sendVerificationEmail(user: User): Promise<void> {
  return sendEmailVerification(user);
}

export async function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

export async function getCurrentIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken(true);
}

