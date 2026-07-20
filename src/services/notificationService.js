import db from "../config/supabase.js"


async function CreateNotificationService(id_user, data) {

    try {


        const { data: existingNotification, error: findError } = await db
            .from("notifications")
            .select("*")
            .eq("user_id", id_user)
            .gt(
                "expires_at",
                new Date().toISOString()
            )
            .maybeSingle();



        if (findError) {
            throw new Error(findError.message);
        }



        if (existingNotification) {

            throw new Error(
                "Já existe uma notificação ativa para este usuário"
            );

        }



        const expiresAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();



        const { data: notification, error } = await db
            .from("notifications")
            .insert({

                user_id: id_user,
                link: data.link,
                message: data.message,
                expires_at: expiresAt

            })
            .select()
            .single();



        if (error) {

            throw new Error(error.message);

        }



        return notification;



    } catch(error) {


        console.error(
            "Erro ao criar notificação:",
            error
        );


        throw error;

    }

}

async function GetNotificationsByFilterService(filters) {

    try {

        let query = db
            .from("notifications")
            .select("*")
            .order("created_at", {
                ascending: false
            });



        if (filters.id !== undefined) {
            query = query.eq("id", filters.id);
        }


        if (filters.userId !== undefined) {
            query = query.eq("user_id", filters.userId);
        }


        if (filters.link !== undefined) {
            query = query.eq("link", filters.link);
        }


        if (filters.message !== undefined) {

            query = query.ilike(
                "message",
                `%${filters.message}%`
            );

        }



        const { data, error } = await query;



        if (error) {
            throw new Error(error.message);
        }



        return data;


    } catch (error) {

        console.error(
            "Erro ao buscar notificações:",
            error
        );

        throw error;

    }

}

async function DeleteNotificationService(id_notification) {

    try {

        const { data, error } = await db
            .from("notifications")
            .delete()
            .eq("id", id_notification)
            .select()
            .single();



        if (error) {
            throw new Error(error.message);
        }



        return data;


    } catch (error) {

        console.error(
            "Erro ao deletar notificação:",
            error
        );

        throw error;

    }

}

async function UpdateNotificationService(id_notification, data) {

    try {

        const { data: notification, error } = await db
            .from("notifications")
            .update({
                link: data.link,
                message: data.message
            })
            .eq("id", id_notification)
            .select()
            .single();



        if (error) {
            throw new Error(error.message);
        }



        return notification;


    } catch (error) {

        console.error(
            "Erro ao atualizar notificação:",
            error
        );

        throw error;

    }

}



export default {
    GetNotificationsByFilterService,
    DeleteNotificationService,
    UpdateNotificationService,
    CreateNotificationService
}