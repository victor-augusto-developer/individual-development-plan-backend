import jwt from "jsonwebtoken"

export default function generateToken(user){

    if(!process.env.JWT_SECRET){
        throw new Error(
            "JWT_SECRET não definido"
        )
    }

    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"2h"
        }
    )
}