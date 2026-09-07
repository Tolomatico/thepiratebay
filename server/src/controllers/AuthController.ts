import type { Request, Response } from "express";
import { authService } from "../services/AuthService.js";
import { userRepository } from "../repositories/UserRepository.js";

export class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ error: "Todos los campos son requeridos" });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
        return;
      }

      const result = await authService.register(username, email, password);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Error al registrar la cuenta" });
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Correo y contraseña son requeridos" });
        return;
      }

      const result = await authService.login(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message || "Credenciales inválidas" });
    }
  }

  /**
   * POST /api/auth/google
   */
  async google(req: Request, res: Response): Promise<void> {
    try {
      const { credential, profile, guestId } = req.body;

      if (!credential && !profile) {
        res.status(400).json({ error: "Token o perfil de Google requerido" });
        return;
      }

      const target = credential || profile;
      const result = await authService.loginWithGoogle(target, guestId);
      res.json(result);
    } catch (error: any) {
      console.error("[AUTH GOOGLE ERROR]:", error.message);
      res.status(401).json({ error: error.message || "Fallo al autenticar con Google" });
    }
  }

  /**
   * POST /api/auth/guest
   */
  async guest(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.body;
      const name = username?.trim() || "Capitán_Invitado";
      const result = await authService.loginAsGuest(name);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error al crear sesión de invitado" });
    }
  }

  /**
   * GET /api/auth/me (Requiere authMiddleware)
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: "No autenticado" });
        return;
      }

      const user = await userRepository.findById(userId);
      if (!user) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }

      res.json({ user: authService.sanitizeUser(user) });
    } catch (error: any) {
      res.status(500).json({ error: "Error al consultar perfil" });
    }
  }
}

export const authController = new AuthController();
