import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required.",
      });
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "Forbidden: You do not have permission to perform this action.",
      });
    }

    next();
  };
}
