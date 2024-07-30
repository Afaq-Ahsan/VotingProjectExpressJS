const jwt = require("jsonwebtoken");
const createError = require("http-errors");
function verifyToken(req, res, next) {
  try {
    const AuthToken = req.header("Authorization");
    const bearerToken = AuthToken.split(" ");
    const token = bearerToken[1];

    console.log(token);

    if (!token) {
      res.status(404).send({ error: "Access Denied" });
    }

    jwt.verify(token, process.env.JWT_SEECRETKEY, (err, payload) => {
      if (err) {
        return next(createError.Unauthorized("unauthorized"));
      }
      console.log("payload", payload);
      req.user = payload;
      next();
    });
  } catch (error) {
    console.log("here is an error : ", error);
    res.status(404).send({ error: "Invalid Token" });
  }
}

module.exports = verifyToken;
