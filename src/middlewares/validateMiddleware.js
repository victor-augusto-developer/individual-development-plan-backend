export default function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                error: "Dados inválidos",
                details: result.error.issues.map(
                    err => ({
                        field: err.path[0],
                        message: err.message
                    })
                )
            })
        }
        req.body = result.data
        next()
    }
}
