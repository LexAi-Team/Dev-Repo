import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase.js";
import prisma from "../config/prisma.js";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "fail",
        message: "Authorization token missing or malformed.",
      });
    }

    const idToken = authHeader.split(" ")[1];
    
    // In local development, if Firebase Admin is not fully initialized,
    // allow a fallback bypass if a specific mock token is supplied,
    // which enables offline testing/sync testing.
    if (process.env.NODE_ENV !== "production" && idToken.startsWith("mock-token-")) {
      const mockUid = idToken.replace("mock-token-", "");
      const user = await prisma.user.findUnique({
        where: { firebaseUid: mockUid },
      });
      if (user) {
        req.user = user;
        return next();
      }
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (tokenError: any) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid or expired authorization token.",
        error: tokenError.message,
      });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    });

    if (!user) {
      // User is authenticated in Firebase but does not exist in our DB yet.
      // This is expected during the first login where registration triggers sync.
      // We will attach the firebaseUid to request so endpoints like /api/auth/sync can handle registration.
      (req as any).firebaseUid = decodedToken.uid;
      (req as any).firebaseEmail = decodedToken.email;
      (req as any).firebaseName = decodedToken.name || "User";
      (req as any).firebaseAvatarUrl = decodedToken.picture || null;
      return next();
    }

    req.user = user;
    next();
  } catch (error: any) {
    next(error);
  }
}

export function requireRole(allowedRole: "STUDENT" | "LAWYER" | "ADMIN") {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required.",
      });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        status: "fail",
        message: "Forbidden: Access denied for this user role.",
      });
    }

    next();
  };
}
