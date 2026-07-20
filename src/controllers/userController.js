import service from "../services/userService.js"
import cache from "../cache/cache.js"


async function RegisterPdiController(req, res) {
    try {

        const result = await service.RegisterPDIService(
            req.user.sub,
            req.body
        )
        await cache.del(`pdi:${req.user.sub}`);

        return res.status(201).json({
            success: true,
            data: result
        })

    } catch (error) {
        console.error(error)

        switch (error.message) {

            case "USER_NOT_FOUND":
                return res.status(404).json({
                    success: false,
                    error: "Usuário não encontrado."
                })

            default:
                return res.status(error.statusCode || 500).json({
                    success: false,
                    error: error.message || "Erro interno do servidor."
                })
        }
    }
}

async function UpdatePdiController(req, res) {
    try {

        const result = await service.UpdatePDIService(
            req.user.sub,
            req.body
        )
        await cache.del(`pdi:${req.user.sub}`);

        return res.status(200).json({
            success: true,
            data: result
        })

    } catch (error) {
        console.error(error)

        switch (error.message) {

            case "PDI_NOT_FOUND":
                return res.status(404).json({
                    success: false,
                    error: "PDI não encontrado."
                })

            default:
                return res.status(error.statusCode || 500).json({
                    success: false,
                    error: error.message || "Erro interno do servidor."
                })
        }
    }
}

async function GetPdisController(req, res) {
    try {

        const result = await cache.remember(
            `users:pdi:${req.user.sub}`,
            300,
            () => service.GetPDIService(req.user.sub)
        );

        return res.status(200).json({
            success: true,
            data: result
        })

    } catch (error) {
        console.error(error)

        switch (error.message) {

            case "USER_NOT_FOUND":
                return res.status(404).json({
                    success: false,
                    error: "Usuário não encontrado."
                })

            default:
                return res.status(error.statusCode || 500).json({
                    success: false,
                    error: error.message || "Erro interno do servidor."
                })
        }
    }
}

export default {
    RegisterPdiController,
    UpdatePdiController,
    GetPdisController
}