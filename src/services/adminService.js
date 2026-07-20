import db from "../config/supabase.js"
import bcrypt from "bcryptjs";


async function GetAllUsersService(page = 1, limit = 8) {

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: users, error, count } = await db
        .from("users")
        .select(
            `
            id,
            name,
            email,
            turma,
            role
            `,
            { count: "exact" }
        )
        .eq("role", "user")
        .order("id", { ascending: true })
        .range(from, to);

    if (error) {
        throw new Error(error.message);
    }

    return {
        users,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
    };
}

async function GetAllUsersFiltered(filters = {}, page = 1, limit = 8){

    const { id, name, turma } = filters;

    let query = db
        .from("users")
        .select(
            `
            id,
            name,
            email,
            turma,
            role
            `,
            {
                count:"exact"
            }
        )
        .eq("role","user");


    if(id !== undefined){
        query = query.eq("id", id);
    }


    if(name !== undefined){
        query = query.ilike("name", `%${name}%`);
    }


    if(turma !== undefined){
        query = query.ilike("turma", `%${turma}%`);
    }


    const { count, error: countError } = await query;


    if(countError){
        throw new Error(countError.message);
    }


    const totalPages = Math.ceil(count / limit);


    if(page > totalPages && totalPages !== 0){

        return {
            users: [],
            total: count,
            page,
            limit,
            totalPages
        };

    }


    const from = (page - 1) * limit;
    const to = from + limit - 1;


    const {
        data: users,
        error
    } = await query
        .order("id", {ascending:true})
        .range(from,to);


    if(error){
        throw new Error(error.message);
    }


    return {
        users,
        total: count,
        page,
        limit,
        totalPages
    };
}


async function ResetPasswordService(id_user, password) {
    const hash = await bcrypt.hash(password, 10);

    const { data, error } = await db
        .from("users")
        .update({ password: hash })
        .eq("id", id_user)
        .eq("role", "admin")
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}


export default {
    GetAllUsersService,
    GetAllUsersFiltered,
    ResetPasswordService
};