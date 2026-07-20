import bcrypt from "bcryptjs";
import db from "../config/supabase.js";
import generateToken from "../utils/jwt.js";

async function RegisterService(payload) {
    const {
        name,
        email,
        turma,
        password
    } = payload;

    const emailNorm = email.trim().toLowerCase();

    const { data: existingUser, error: findError } = await db
        .from("users")
        .select("id")
        .eq("email", emailNorm)
        .maybeSingle();

    if (findError) {
        throw findError;
    }

    if (existingUser) {
        throw new Error("EMAIL_EXISTS");
    }

    const passHash = await bcrypt.hash(password, 10);

    const { data: user, error: insertError } = await db
        .from("users")
        .insert({
            name,
            email: emailNorm,
            turma,
            password: passHash,
            role: "user"
        })
        .select(`
            id,
            name,
            email,
            turma,
            role,
            created_at
        `)
        .single();

    if (insertError) {
        throw insertError;
    }

    return user;
}

async function LoginService(payload) {
    const {
        email,
        password
    } = payload;

    const emailNorm = email.trim().toLowerCase();

    const { data: user, error } = await db
        .from("users")
        .select("*")
        .eq("email", emailNorm)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatches) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const token = generateToken(user);

    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        turma: user.turma,
        role: user.role,
        created_at: user.created_at
    };

    return {
        safeUser,
        token
    };
}

export default {
    RegisterService,
    LoginService
};