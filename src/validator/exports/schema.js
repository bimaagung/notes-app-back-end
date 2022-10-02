const Joi = require('joi');

const ExportNotesPayloadScheme = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = { ExportNotesPayloadScheme };
