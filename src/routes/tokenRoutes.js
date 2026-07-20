import express from "express";
import Middlewares from "../middlewares/authMiddleware.js";
import Controllers from "../controllers/tokenController.js"

const tokenRoute = express.Router();
tokenRoute.use(Middlewares.authMiddleware);

tokenRoute.post("/push/register-token", Controllers.RegisterTokenController);
tokenRoute.delete("/push/unregister-token", Controllers.RemoveTokenController);
tokenRoute.post("/push/sendMessage", Controllers.SendMessageController);


export default tokenRoute;