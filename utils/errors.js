module.exports.createError = (status, message) => {
  if (message === null) {
    const err = { message: message, status: status };
    return err;
  }
  const err = new Error(message);
  err.status = status;
  return err;
};
