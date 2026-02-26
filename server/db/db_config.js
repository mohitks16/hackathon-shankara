// db_config.js
import mongoose from "mongoose";

const { DBNAME, ATLASUSERNAME, ATLASPASSWORD } = process.env;

export default function db() {
  mongoose.connect(
    `mongodb+srv://${ATLASUSERNAME}:${ATLASPASSWORD}@cluster0.jwekdme.mongodb.net/${DBNAME}?appName=Cluster0`
  )
    .then(() => {
      console.log("Atlas connection successfully 👍");
    })
    .catch((err) => {
      console.error("Atlas connection error:", err);
    });
}

