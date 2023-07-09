require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;
require("../src/db/connection");
const Register = require("../src/models/schema");
const path = require("path");
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const hbs = require("hbs");
const partial_path = path.join(__dirname, "../templates/partials");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("../src/middleware/auth");

app.use(express.json());
app.use(express.static(static_path));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partial_path);
app.use(cookieParser());

// console.log(process.env.SECRETE_KEY);

// Rendering the home page
app.get("/", (req, res) => {
  res.render("index");
});

// Rendering the register and login pages
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});

// Registering new user in the DB
app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const confirm_password = req.body.cnfpassword;
    if (password === confirm_password) {
      const registerUser = new Register({
        first_name: req.body.fname,
        last_name: req.body.lname,
        email: req.body.email,
        dob: req.body.dob,
        password: req.body.password,
        confirm_password: req.body.cnfpassword,
      });
      console.log(`Newly registered user : `);
      console.log(req.body);

      // Hashing the password
      await registerUser.hashPassword();

      // Generating a token
      const token = await registerUser.generateAuthToken();

      // Adding a cookie whenever a new user has registered
      // const expirationDate = new Date();
      // expirationDate.setTime(expirationDate.getTime() + 3 * 60 * 1000); //3 min expiration time
      // res.cookie("jwt", token, { expires: expirationDate });

      await registerUser.save(); //Saving the registered user into the DB
      res.status(201).redirect("/login");
    } else res.send("Password not matching");
  } catch (err) {
    res.status(400).send(err);
  }
});

// Logging in a registered user
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const checkEmail = await Register.findOne({ email });
    const matchPassword = await bcrypt.compare(password, checkEmail.password);

    // Generating a new token for the logged in user
    const token = await checkEmail.generateAuthToken();
    console.log(
      `This is the login generated token which will be also added as a cookie : ${token}`
    );

    // Adding a cookie
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + 10 * 60 * 1000); // Set expiration 3 minutes from now
    res.cookie("jwt", token, { expires: expirationDate });

    if (matchPassword) {
      res.status(201).redirect("/");
      console.log(
        `${checkEmail.first_name} ${checkEmail.last_name} has logged in !`
      );
    } else {
      res.send("Invalid credentials!");
    }
  } catch (err) {
    res.status(400).send("Invalid credentials!");
  }
});

app.get("/logout", auth, async (req, res) => {
  try {
    console.log(req.user);

    req.user.tokens = req.user.tokens.filter((currentToken) => {
      return currentToken.token !== req.token;
    });

    res.clearCookie("jwt");
    console.log(`Logout successful`);

    await req.user.save();
    res.redirect("/login");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/secret", auth, (req, res) => {
  res.render("secret");
  console.log(`a verified user has accessed this secret section.`);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
