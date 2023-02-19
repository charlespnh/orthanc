const Joi = require('joi')
const httpStatus = require('http-status')
const { boolean } = require('joi')

const locationSchema = Joi.object({
    address: Joi.string().required(),
    longitude: Joi.string().required(),
    latitude: Joi.string().required(),
    type: Joi.string().required(),
    // extensions on roadmap: id, name, city, country, postal code 
})

const solveTSPRequest = {
    body: Joi.object({
        locations: Joi.array()
            .min(3)
            .items(Joi.string())
            .required(),
        mode: Joi.string(),
        metric: Joi.string(),
        real_time: Joi.boolean(),
    })
}

const solveConstraintRequest = {
    body: Joi.object({
        locations: Joi.array()
            .min(3)
            .items(Joi.string())
            .required(),
        metric: Joi.string(),
    })
}


const validate = (schema) => (req, res, next) => {
    const {error} = schema.validate(req.body)
    const valid = error == null
    if (!valid) {
        const errMessage = error.details.map((detail) => detail.message).join(',')
        console.log("ERROR ", message)
        res.status(httpStatus.BAD_REQUEST).json({ error : errMessage })
    } else {
        next()
    }
}


module.exports = {
    locationSchema,
    solveTSPRequest,
    solveConstraintRequest,
    validate
}
