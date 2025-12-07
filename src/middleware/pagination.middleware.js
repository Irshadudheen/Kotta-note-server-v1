export const paginationMiddleware = (req, res, next) => {
  // Parse page and limit from query parameters, defaults: page=1, limit=10, max limit=50
  const page = parseInt(req.query.page, 10) || 1;
  let limit = parseInt(req.query.limit, 10) || 10;
  
  // Enforce maximum limit of 50
  if (limit > 50) {
    limit = 50;
  }

  // Calculate skip value
  const skip = (page - 1) * limit;

  // Attach pagination info to request object
  req.pagination = { page, limit, skip };

  next();
};