import db from "../config/supabase.js";
import { getMessaging } from "firebase-admin/messaging";
import "../config/firebase.js";


async function sendPushToUser(userId, { title, body, data = {} }) {


    const { data: tokens, error } = await db
        .from("push_tokens")
        .select("token")
        .eq("user_id", userId);



    if (error) {
        throw new Error(error.message);
    }



    if (!tokens || tokens.length === 0) {

        return {
            message: "There is not tokens",
            successCount: 0,
            failureCount: 0
        };

    }



    let successCount = 0;
    let failureCount = 0;



    for (const pushToken of tokens) {

        try {


            await getMessaging().send({

                token: pushToken.token,

                notification: {
                    title,
                    body
                },

                data,

                webpush: {
                    fcmOptions: {
                        link: data.url || "/"
                    }
                }
                //trocar link para o site na parte do usuario que vera a notificação

            });



            successCount++;


        } catch(err) {


            failureCount++;


            const code = err.errorInfo?.code;



            if (
                code === "messaging/registration-token-not-registered" ||
                code === "messaging/invalid-registration-token"
            ) {


                const { error: deleteError } = await db
                    .from("push_tokens")
                    .delete()
                    .eq("token", pushToken.token);



                if(deleteError){
                    console.error(
                        "Erro removendo token:",
                        deleteError.message
                    );
                }


            }

        }

    }



    return {
        successCount,
        failureCount
    };

}

async function SavePushToken(userId, token, userAgent) {

    const { data, error } = await db
        .from("push_tokens")
        .upsert(
            {
                token,
                user_id: userId,
                user_agent: userAgent
            },
            {
                onConflict: "token"
            }
        )
        .select()
        .single();


    if (error) {
        throw new Error(error.message);
    }


    return data;
}

async function RemovePushToken(token) {


    const { data: existing, error: findError } = await db
        .from("push_tokens")
        .select("id")
        .eq("token", token)
        .maybeSingle();



    if (findError) {
        throw new Error(findError.message);
    }



    if (!existing) {
        const error = new Error("TOKEN_INVALID");
        throw error;
    }



    const { error } = await db
        .from("push_tokens")
        .delete()
        .eq("token", token);



    if (error) {
        throw new Error(error.message);
    }



    return {
        message: "Token removido."
    };

}


export default {
    sendPushToUser,
    SavePushToken,
    RemovePushToken
};