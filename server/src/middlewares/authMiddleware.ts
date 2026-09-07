import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    isGuest: boolean;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token de autorización faltante o formato incorrecto" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}
