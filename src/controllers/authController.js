import services from "../services/authService.js";
import cache from "../cache/cache.js"

async function RegisterController(req, res) {
    try {
        const result = await services.RegisterService(req.body);
        cache.delByPrefix("users:");
        return res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error(error);

        switch (error.message) {
            case "EMAIL_EXISTS":
                return res.status(409).json({
                    success: false,
                    error: "Email já cadastrado.",
                });

            default:
                return res.status(500).json({
                    success: false,
                    error: "Erro interno do servidor.",
                });
        }
    }
}

async function LoginController(req, res) {
    try {
        const result = await services.LoginService(req.body);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        switch (error.message) {
            case "INVALID_CREDENTIALS":
                return res.status(401).json({
                    success: false,
                    error: "Email ou senha inválidos.",
                });

            default:
                console.error(error);
                return res.status(500).json({
                    success: false,
                    error: "Erro interno do servidor.",
                });
        }
    }
}

export default {
    RegisterController,
    LoginController,
};