import express from "express";
import Middlewares from "../middlewares/authMiddleware.js"
import Controllers from "../controllers/userController.js"
const userRoute = express.Router();

userRoute.use(Middlewares.authMiddleware, Middlewares.onlyUsers);

userRoute.post("/pdi/register", Controllers.RegisterPdiController);
userRoute.put("/pdi/update", Controllers.UpdatePdiController);
userRoute.get("/pdi/me", Controllers.GetPdisController);

export default userRoute;