class APIError extends Error {
  constructor(code, message, details) {
    super();
    Object.assign(this, { code, message, details });
  }
}

const ErrorCodes = {
  BAD_REQUEST: 400,
};

module.exports = { APIError, ErrorCodes };
