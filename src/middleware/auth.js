const jwt = require("jsonwebtoken");
const Register = require("../models/schema");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token, process.env.SECRETE_KEY);
    // console.log(`${verifyUser}`);
    const verifiedUser = await Register.findOne({ _id: verifyUser._id });
    console.log(`${verifiedUser.first_name} is a verified user.`);

    req.token = token;
    req.user = verifiedUser;

    next();
  } catch (error) {
    console.log(`Unverified user tried to access this section!!!`);
    res.status(401).send(error);
  }
};

module.exports = auth;
