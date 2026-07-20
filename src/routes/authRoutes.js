import express from "express";
import schema from "../validators/authValidator.js";
import validate from "../middlewares/validateMiddleware.js";
import Controllers from "../controllers/authController.js"

const authRoute = express.Router();

authRoute.post("/register", validate(schema.registerSchema), Controllers.RegisterController);
authRoute.post("/login", validate(schema.loginSchema), Controllers.LoginController);

export default authRoute;