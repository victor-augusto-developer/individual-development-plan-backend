import { z } from "zod"

 const pdiItemSchema = z.object({
    
  theme: z.enum(
    ["PROGRAMACAO", "MATEMATICA", "INGLES", "SOFT_SKILLS", "OPORTUNIDADES_ACADEMICAS"],
    {
    errorMap: () => ({ 
        message: "Tema inválido. Temas disponíveis: PROGRAMACAO, MATEMATICA, INGLES, SOFT_SKILLS, OPORTUNIDADES_ACADEMICAS" 
    })
    }),

  objective: z.string().min(5, "Objetivo deve ter no mínimo 5 caracteres"),
  why: z.string().min(5, "Justificativa deve ter no mínimo 5 caracteres"),
  how: z.string().min(5, "Metodologia deve ter no mínimo 5 caracteres"),
  period: z.enum(["SEMANAL", "QUINZENAL", "MENSAL", "BIMESTRAL"], {
    errorMap: () => ({ message: "Período inválido. Períodos disponíveis: SEMANAL, QUINZENAL, MENSAL, BIMESTRAL" })
  }),
  who: z.string().min(3, "Responsável deve ter no mínimo 3 caracteres")
})

const registerPDISchema = z.object({
  pdiItems: z.array(pdiItemSchema).min(1, "Deve haver pelo menos um item PDI")
}).refine(
    (data) => {
        const themes = data.pdiItems.map(item => item.theme)
        return themes.length === new Set(themes).size
    },
    {
        message: "Não é permitido ter temas duplicados no PDI",
        path: ["pdiItems"]
    }
)

 const updatePDISchema = pdiItemSchema
    .omit({ theme: true })
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        { message: "Envie ao menos um campo para atualizar" }
    )


export default {
    pdiItemSchema,
    registerPDISchema,
    updatePDISchema
};