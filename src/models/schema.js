const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  dob: {
    type: Date,
  },
  password: {
    type: String,
  },
  confirm_password: {
    type: String,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// Hashing the user entered password before saving it into the DB for safety reasons
userSchema.methods.hashPassword = async function () {
  try {
    console.log(`This is the user entered password = ${this.password}`);
    this.password = await bcrypt.hash(this.password, 10);
    console.log(`This is the hashed password = ${this.password}`);
    this.confirm_password = undefined;
  } catch (error) {
    res.send(`The error ${error}`);
    console.log(`The error ${error}`);
  }
};

// Generating the JWT token
userSchema.methods.generateAuthToken = async function () {
  try {
    console.log(`User _id : ${this._id}`);
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRETE_KEY
    );
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    console.log(`This is the JWT generated token : ${token}`);
    return token;
  } catch (error) {
    res.send(`The error ${error}`);
    console.log(`The error ${error}`);
  }
};

// Creating a new collection
const Register = new mongoose.model("Register", userSchema);

module.exports = Register;
