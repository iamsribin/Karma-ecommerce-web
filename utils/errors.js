
module.exports.createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
} 
 