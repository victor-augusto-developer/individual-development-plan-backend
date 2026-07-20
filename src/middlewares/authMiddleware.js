import jwt from "jsonwebtoken"

function authMiddleware(req, res, next){
    const authHeader = req.headers.authorization

    if(!authHeader){
        return res.status(401).json({
            error:"Token não encontrado"
        })
    }

    const [ type, token] = authHeader.split(" ")

    if(type !== "Bearer"){
        return res.status(401).json({
            error:"Formato inválido"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded
        next()
    }catch(error){
        return res.status(401).json({
            error: "Token inválido"
        })
    }
}

function onlyUsers(req, res, next){
    
    if(!req.user){
        return res.status(401).json({
            error: "Usuário não autenticado"
        })
    }

    if(req.user.role !== "user"){
        return res.status(403).json({
            error: "Acesso restrito a usuários comuns"
        })
    }
    next();
}

function adminOnly(req, res, next){
    if(!req.user){
        return res.status(401).json({
            error: "Usuário não autenticado"
        })
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Acesso restrito a administradores" });
    }
    next();
};


export default {
    authMiddleware,
    onlyUsers,
    adminOnly
};