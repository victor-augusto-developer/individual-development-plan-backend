import db from "../config/supabase.js";
import bcrypt from "bcryptjs";
import PdiSchemas from "../validators/PDIValidator.js";

const PDI_THEMES = [
    "PROGRAMACAO",
    "MATEMATICA",
    "INGLES",
    "SOFT_SKILLS",
    "OPORTUNIDADES_ACADEMICAS"
];

function buildFullPdiItems(items, userId) {
    const itemMap = new Map(items.map(item => [item.theme, item]));

    return PDI_THEMES.map(theme => {
        const item = itemMap.get(theme)

        return {
            id: item?.id ?? null,
            user_id: item?.user_id ?? userId,
            theme,
            objective: item?.objective ?? "",
            why: item?.why ?? "",
            how: item?.how ?? "",
            period: item?.period ?? null,
            who: item?.who ?? ""
        }
    });
}

async function RegisterPDIService(id_user, data) {

    const parsed = PdiSchemas.registerPDISchema.safeParse(data);

    if (!parsed.success) {
        const messages = parsed.error.issues
            .map(e => `${e.path.join(".")}: ${e.message}`)
            .join(" | ")

        const validationError = new Error(`Dados inválidos: ${messages}`);
        validationError.statusCode = 400;
        throw validationError;
    }

    const created = [];
    const errors = [];

    for (const item of parsed.data.pdiItems) {

        try {

            const { data: res, error } = await db
                .from("pdi_item")
                .upsert(
                    {
                        user_id: id_user,
                        theme: item.theme,
                        objective: item.objective,
                        why: item.why,
                        how: item.how,
                        period: item.period,
                        who: item.who
                    },
                    {
                        onConflict: "user_id,theme"
                    }
                )
                .select()
                .single()

            if (error) throw error;

            created.push(res);

        } catch (err) {

            errors.push({
                theme: item.theme,
                message: err.message
            });

        }

    }

    return {
        success: errors.length === 0,
        created,
        errors: errors.length ? errors : undefined
    }

}

async function UpdatePDIService(id_user, items) {

    const updated = [];
    const errors = [];

    for (const item of items) {

        try {

            const parsed = PdiSchemas.updatePDISchema.safeParse(item.data);

            if (!parsed.success) {

                const messages = parsed.error.issues
                    .map(e => `${e.path.join(".")}: ${e.message}`)
                    .join(" | ")

                throw new Error(`Dados inválidos: ${messages}`);
            }

            const { data: existing, error: findError } = await db
                .from("pdi_item")
                .select("id")
                .eq("user_id", id_user)
                .eq("theme", item.theme)
                .maybeSingle()

            if (findError) throw findError;

            if (!existing) {
                throw new Error("PDI não encontrado para este usuário e tema");
            }

            const { data: res, error } = await db
                .from("pdi_item")
                .update(parsed.data)
                .eq("id", existing.id)
                .select()
                .single()

            if (error) throw error;

            updated.push(res);

        } catch (err) {

            errors.push({
                theme: item.theme,
                message: err.message
            })

        }

    }

    return {
        success: errors.length === 0,
        updated,
        errors
    }

}

async function GetPDIService(id_user) {

    try {

        const { data, error } = await db
            .from("pdi_item")
            .select("*")
            .eq("user_id", id_user)

        if (error) throw error;

        return {
            success: true,
            pdiItems: buildFullPdiItems(data, id_user)
        }

    } catch (err) {
        throw new Error(err.message);
    }

}

async function ResetPasswordService(id_user, password) {
    const hash = await bcrypt.hash(password, 10);

    const { data, error } = await db
        .from("users")
        .update({ password: hash })
        .eq("id", id_user)
        .eq("role", "user")
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}



export default {
    RegisterPDIService,
    UpdatePDIService,
    GetPDIService,
    ResetPasswordService
}