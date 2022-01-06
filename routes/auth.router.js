import { Router } from "express";
import { body } from "express-validator";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", userController.login);
router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 3, max: 10 }),
  userController.registration
);
router.post("/logout", userController.logout);
router.get("/activate/:link", userController.activateUser);
router.get("/refresh", userController.refreshToken);
router.get("/users", authMiddleware, userController.getUsers);

export default router;
