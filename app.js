//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//Requiring the mongoose encryption
const encrypt = require("mongoose-encryption")

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//Defining a secret using a long string
//viewing the secret keys
userSchema.plugin(encrypt, {secret: process.env.SECRETE, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema)

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save().then(() =>
      res.render("secrets")
    ).catch((err) => {res.send(err);});
});

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    async function findUser(){
        try{
            const foundUser = await User.findOne({email: username},);
            if(foundUser.password === password){
                res.render("secrets");
            }else {
               console.log(err)
            }
        } catch(error){
            res.json({message: "Internal server error"})
            res.send("Internal server error: ", error);
        }
    }
    findUser();
})




app.listen(3000, function(){
    console.log("Server started on port 3000")
});