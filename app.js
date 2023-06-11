//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

main().catch(err => console.log(err));

async function main() {
    const mongoDB = "mongodb://127.0.0.1:27017/userDB";
    const flag = { useNewUrlParser: true }; 
    
    await mongoose.connect(mongoDB, flag);

    const userSchema = new mongoose.Schema({
        email: String,
        password: String
    });

    userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

    const User = new mongoose.model("User", userSchema);

    app.get("/", async (req, res) => {
        res.render("home");
    });

    // Login

    app.get("/login", async (req, res) => {
        res.render("login");
    });

    app.post("/login", async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        const foundUser = await User.findOne({email: username})
            .catch(err => console.log(err));
        
        if (foundUser.password === password) {
            res.render("secrets");
        }
    });

    // Register

    app.get("/register", async (req, res) => {
        res.render("register");
    });

    app.post("/register", async (req, res) => {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });

        await newUser.save().catch(err => console.log(err));
        
        res.render("secrets");
    });

    app.listen(3000, () => {
        console.log("Server started on port 3000.");
    });
}