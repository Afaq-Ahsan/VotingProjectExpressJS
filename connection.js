const mongoose = require("mongoose");

function connectMongoDB(url) {
  mongoose
    .connect(url)
    .then(() => console.log("DB conneected :)"))
    .catch((error) => console.log("here is the error : ", error));
}

module.exports = connectMongoDB;
