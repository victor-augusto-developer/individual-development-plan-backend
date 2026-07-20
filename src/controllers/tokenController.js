import service from "../services/tokenService.js"


async function RegisterTokenController(req, res) {

    try {

        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: "Token é obrigatório."
            });
        }


        const userId = req.user.sub;
        const userAgent = req.headers["user-agent"];


        const result = await service.SavePushToken(
            userId,
            token,
            userAgent
        );


        return res.status(201).json({
            success: true,
            data: result
        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message || "Erro interno do servidor."
        });

    }

}

async function RemoveTokenController(req, res) {

    try {

        const { token } = req.body;


        if (!token) {
            return res.status(400).json({
                success:false,
                error:"Token é obrigatório."
            });
        }



        const result = await service.RemovePushToken(token);



        return res.status(200).json({

            success:true,
            data:result

        });



    } catch(error) {


        console.error(error);



        switch(error.message){

            case "TOKEN_INVALID":

                return res.status(400).json({
                    success:false,
                    error:"Token inválido."
                });



            default:

                return res.status(500).json({
                    success:false,
                    error:"Erro interno do servidor."
                });

        }

    }

}

async function SendMessageController(req, res) {

    try {

        const data = req.body;


        const result = await service.sendPushToUser(
            req.user.sub,
            data
        );


        return res.status(200).json({
            success: true,
            data: result
        });


    } catch(error) {

        console.error(error);


        return res.status(500).json({
            success:false,
            error:error.message || "Erro interno do servidor."
        });

    }

}


export default {
    RegisterTokenController,
    RemoveTokenController,
    SendMessageController
}