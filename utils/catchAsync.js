//we crate a higher function catchAsync to wrap async catch try block from router operations.
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};