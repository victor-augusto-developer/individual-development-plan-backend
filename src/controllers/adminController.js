import service from "../services/adminService.js";
import userService from "../services/userService.js";
import tokenService from "../services/tokenService.js";
import notificationService from "../services/notificationService.js";
import cache from "../cache/cache.js";

async function GetAllUsersController(req, res) {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 8;

        const result = await cache.remember(
            `users:${page}:${limit}`,
            300,
            () => service.GetAllUsersService(page, limit)
        );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || "Erro interno do servidor."
        });
    }
}

async function GetPDIByIdController(req,res){

    try {

        const id = Number(req.params.id);

        if (!id || Number.isNaN(id)) {

            return res.status(400).json({
                success:false,
                error:"ID inválido."
            });

        }


        const result = await cache.remember(
            `users:pdi:${id}`,
            300,
            () => userService.GetPDIService(id)
        );


        return res.status(200).json({
            success:true,
            data:result
        });


    } catch(error){

        console.error(error);


        switch(error.message){

            case "USER_NOT_FOUND":

                return res.status(404).json({
                    success:false,
                    error:"Usuário não encontrado."
                });


            default:

                return res.status(error.statusCode || 500).json({
                    success:false,
                    error:error.message || "Erro interno do servidor."
                });

        }

    }
}

async function GetAllUsersFilter(req, res) {

    try {

        const { id, name, turma, pages } = req.query;

        const filters = {};

        let page = 1;


        if (pages !== undefined) {

            const parsedPage = Number(pages);

            if (!Number.isInteger(parsedPage) || parsedPage < 1) {

                return res.status(400).json({
                    error: "O campo 'pages' deve ser um número inteiro maior que zero",
                    success:false
                });

            }

            page = parsedPage;

        }



        if (id !== undefined) {

            const parsedId = Number(id);

            if (!Number.isInteger(parsedId)) {

                return res.status(400).json({
                    error:"O campo 'id' deve ser um número inteiro",
                    success:false
                });

            }

            filters.id = parsedId;
        }



        if (name !== undefined) {

            if (typeof name !== "string" || name.trim() === "") {

                return res.status(400).json({
                    error:"O campo 'name' deve ser uma string válida",
                    success:false
                });

            }

            filters.name = name.trim();

        }



        if (turma !== undefined) {

            if (typeof turma !== "string" || turma.trim() === "") {

                return res.status(400).json({
                    error:"O campo 'turma' deve ser uma string válida",
                    success:false
                });

            }

            filters.turma = turma.trim();

        }



        const cacheKey = 
            `users:filter:${JSON.stringify(filters)}:page:${page}`;



        const result = await cache.remember(
            cacheKey,
            300,
            () => service.GetAllUsersFiltered(filters,page)
        );



        if(result.total === 0){

            return res.status(200).json({
                message:"Não existe usuário com essas características.",
                users:[],
                total:0,
                success:false
            });

        }



        return res.status(200).json({
            ...result,
            success:true
        });


    } catch(error){

        console.error(error);

        return res.status(500).json({
            error:"Falha ao buscar usuários",
            success:false
        });

    }

}

async function CreateNotificationController(req, res) {

    try {

        let { user_id, link, message } = req.body;


        user_id = Number(user_id);



        if (!user_id || isNaN(user_id)) {

            return res.status(400).json({
                error: "O ID fornecido é inválido.",
                success: false
            });

        }



        if (!link) {

            return res.status(400).json({
                error: "link é obrigatório!",
                success: false
            });

        }



        if (!message) {

            message = "Olá, acesse o site para ver atualizações!";

        }



        const notification = await notificationService.CreateNotificationService(
            user_id,
            {
                link,
                message
            }
        );



        try {

            await tokenService.sendPushToUser(
                notification.user_id,
                {
                    title: "Nova notificação",
                    body: notification.message,
                    data: {
                        url: notification.link || "/"
                    }
                }
            );


        } catch(pushError) {

            console.error(
                "Erro ao enviar push:",
                pushError.message
            );

        }



        return res.status(201).json({
            data: notification,
            success: true
        });



    } catch(error) {


        return res.status(400).json({
            error: error.message,
            success: false
        });


    }

}

async function UpdateNotificationController(req, res) {

    try {

        const id_notification = Number(req.params.id);


        if (!id_notification || isNaN(id_notification)) {
            return res.status(400).json({
                error: "id_notification inválido",
                success: false
            });
        }



        const { link, message } = req.body;



        const notification = await notificationService.UpdateNotificationService(
            id_notification,
            {
                link: link || undefined,
                message: message || undefined
            }
        );



        try {

            await tokenService.sendPushToUser(
                notification.user_id,
                {
                    title: "Notificação atualizada",
                    body: notification.message,
                    data: {
                        url: notification.link || "/"
                    }
                }
            );


        } catch(pushError) {

            console.error(
                "Erro ao enviar push:",
                pushError.message
            );

        }



        return res.status(200).json({
            data: notification,
            success: true
        });



    } catch(error) {

        return res.status(400).json({
            error: error.message,
            success:false
        });

    }

}

async function DeleteNotificationController(req, res){
    try {
        const id_notification = Number(req.params.id);

        if (!id_notification || isNaN(id_notification)) {
            return res.status(400).json({ error: "id_notification inválido", success: false });
        }

        const notification = await notificationService.DeleteNotificationService(id_notification);

        return res.status(200).json({data : notification, success : true});
    } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
    }
}

async function GetAllNotificationsController(req, res){
    return res.redirect("/admin/notification/filter?");
}

async function GetNotificationByFilterController(req, res){
    try {
        const { id, message, link, user_id } = req.query;

        const filters = {};

        if (id !== undefined) {
            const parsedId = Number(id);
            if (Number.isNaN(parsedId)) {
                return res.status(400).json({ message: "O campo 'id' deve ser um número válido." });
            }
            filters.id = parsedId;
        }

        if (message !== undefined) {
            if (typeof message !== "string" || message.trim() === "") {
                return res.status(400).json({ message: "O campo 'message' deve ser uma string válida." });
            }
            filters.message = message.trim();
        }

        if (link !== undefined) {
            if (typeof link !== "string" || link.trim() === "") {
                return res.status(400).json({ message: "O campo 'link' deve ser uma string válida." });
            }
            filters.link = link.trim();
        }
        if (user_id !== undefined) {
            const parsedUserId = Number(user_id);
            if (Number.isNaN(parsedUserId)) {
                return res.status(400).json({ message: "O campo 'user_id' deve ser um número válido." });
            }
            filters.userId = parsedUserId;
        }

        const notifications = await notificationService.GetNotificationsByFilterService(filters);

        return res.status(200).json(notifications);
    } catch (error) {
        console.error("Erro ao buscar notificações por filtro:", error);
        return res.status(500).json({ message: "Erro interno ao buscar notificações." });
    }
}

async function ResetPasswordUserController(req, res) {
    try {

        const { user_id , password} = req.body;
        
        if (!user_id || isNaN(user_id)) {
            return res.status(400).json({ error: "id_user inválido", success: false });
        }

        if(!password){
            return res.status(400).json({error : "Password inválida", success: false});
        }

        const result = await userService.ResetPasswordService(user_id, password);

        return res.status(200).json({message : "Password resetada com sucesso", success : true});


    } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
    }
}



async function ResetPasswordAdminController(req, res) {
    try {
        const user_id = req.user.sub;
        const { password} = req.body;
        
        if(!password){
            return res.status(400).json({error : "Password inválida", success: false});
        }

        const result = await adminService.ResetPasswordService(user_id, password);

        return res.status(200).json({message : "Password resetada com sucesso", success : true});


    } catch (error) {
        return res.status(400).json({ error: error.message, success: false });
    }
}


export default {
    GetAllUsersController,
    GetPDIByIdController,
    GetAllUsersFilter,
    CreateNotificationController,
    UpdateNotificationController,
    DeleteNotificationController,
    GetAllNotificationsController,
    GetNotificationByFilterController,
    ResetPasswordUserController,
    ResetPasswordAdminController
};