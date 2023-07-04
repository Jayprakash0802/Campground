// const Joi = require('joi');
// const { number } = require('joi');
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// module.exports.campgroundSchema = Joi.object({
//     campground: Joi.object({
//         title: Joi.string().required(),
//         price: Joi.number().required().min(0),
//         // image: Joi.string().required(),
//         location: Joi.string().required(),
//         description: Joi.string().required()
//     }).required(),
//     deleteImages: Joi.array()
// });

// module.exports.reviewSchema = Joi.object({
//     review: Joi.object({
//         rating: Joi.number().required().min(1).max(5),
//         body: Joi.string().required()
//     }).required()
// })


// after sanitizing html input
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [], // along with sanitize, it says nothing is allowed except empty arrays of tags and attributes
                    allowedAttributes: {},
                });

                if (clean !== value) return helpers.error('string.escapeHTML', { value }) // this will check if there is any difference between sanitized output and input
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})