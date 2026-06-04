import { ApiError } from "../utils/apiHelpers.js";


const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const seen = new Map();

    for (const issue of result.error.issues) {
      const field = issue.path.join(".");
      const messages = seen.get(field) || [];
      messages.push(issue.message);
      seen.set(field, messages);
    }

    const errors = Array.from(seen, ([field, messages]) => ({
      field,
      messages,
      message: messages[0],
    }));
    return next(new ApiError(422, "Validation failed", errors));
  }

  req.body = result.data; // use the parsed/coerced data
  next();
};

export default validate;
