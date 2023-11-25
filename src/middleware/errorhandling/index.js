async function handleError(ctx, next) {
  try {
    await next(ctx);
  } catch (error) {
    ctx.status = error.code;
    ctx.body = {
      message: error.message,
      details: error.details,
    };
  }
}

module.exports = handleError;
