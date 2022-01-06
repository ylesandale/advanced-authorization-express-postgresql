import apiError from "../exceptions/api-error.js";
import tokenService from "../services/token.service.js";

export default function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(apiError.UnauthorizedError());
    }

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(apiError.UnauthorizedError());
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(apiError.UnauthorizedError());
    }

    req.user = userData;
    next();
  } catch (e) {
    return next(apiError.UnauthorizedError());
  }
}
