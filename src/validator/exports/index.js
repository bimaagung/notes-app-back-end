const InvariantError = require('../../exceptions/InvariantError');
const { ExportNotesPayloadScheme } = require('./schema');

const ExportsValidator = {
  validateExportNotesPayload: (payload) => {
    const validationResult = ExportNotesPayloadScheme.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
