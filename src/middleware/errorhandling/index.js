const logger = require("../../utils/logger");

const censor = /(?<=authKey=)[a-zA-Z0-9]+/gm;
const asteriks = "*".repeat(20);

async function handleError(ctx, next) {
  try {
    await next(ctx);
  } catch (error) {
    if (!error.code) {
      logger.log("error", error + "\n" + error.stack);
      return;
    }

    logger.log(
      "warn",
      `Rejected ${ctx.method} ${ctx.url.replace(censor, asteriks)} | ${
        error.details || error.message
      }`
    );

    ctx.status = error.code;
    ctx.body = {
      message: error.message,
      details: error.details,
    };
  }
}

module.exports = handleError;
