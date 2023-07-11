const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/skribblr")
  .then(() => {
    console.log(`Connection to DB is successful`);
  })
  .catch((error) => {
    console.log(`No connection with DB`);
  });
