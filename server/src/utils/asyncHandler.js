// Small helper to avoid repetitive try/catch in route handlers.
export function asyncHandler(fn) {
  return function handler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
