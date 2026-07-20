import express from "express";
import Middlewares from "../middlewares/authMiddleware.js";
import Controllers from "../controllers/adminController.js";

const adminRoute = express.Router();
adminRoute.use(Middlewares.authMiddleware, Middlewares.adminOnly);

adminRoute.get("/users/all", Controllers.GetAllUsersController);
adminRoute.get("/users/pdi/:id", Controllers.GetPDIByIdController);
adminRoute.get("/users/filter", Controllers.GetAllUsersFilter);

adminRoute.post("/user/reset-password", Controllers.ResetPasswordUserController);
adminRoute.post("/reset-password", Controllers.ResetPasswordAdminController);

adminRoute.post("/notification/create", Controllers.CreateNotificationController);
adminRoute.put("/notification/update/:id", Controllers.UpdateNotificationController);
adminRoute.delete("/notification/delete/:id", Controllers.DeleteNotificationController);
adminRoute.get("/notification/all", Controllers.GetAllNotificationsController);
adminRoute.get("/notification/filter", Controllers.GetNotificationByFilterController);

export default adminRoute;