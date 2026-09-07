import { Router } from "express";
import { authController } from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Rutas Públicas de Autenticación
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.post("/google", (req, res) => authController.google(req, res));
router.post("/guest", (req, res) => authController.guest(req, res));

// Rutas Protegidas
router.get("/me", authMiddleware, (req, res) => authController.me(req, res));

export default router;
