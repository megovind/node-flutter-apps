const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "secretkey");
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "AUTHERROR",
      message: "Authorization Failed"
    });
  }
};
