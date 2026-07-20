import { z } from "zod"

const registerSchema = z.object({
    name: z.string().min(8, "Nome deve ter no mínimo 8 caracteres"),
    email: z.string().email("Email inválido"),
    turma: z.string().min(1, "Turma é obrigatória"),
    password: z.string().min(3, "Senha deve ter no minímo 3 caracteres")
})

const loginSchema = z.object({
    email: z.string() 
    .email("Email inválido"),
    password: z.string().min(3, "Senha deve ter no mínimo 3 caracteres")
})


export default {registerSchema, loginSchema};