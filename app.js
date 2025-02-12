//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
///////USING PASSPORT TO ADD COOKIES & SESSIONS ////////
// Install and require three packages viz: passport, passport-local, passport-local-mongoose, express-session
const session = require('express-session');
const passport = require('passport');
const passportlocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//Set up session to have a secret
app.use(session({
    secret: "OUr little secret.",
    resave: false,
    saveUninitialized: false
}));

// Initialize passport and use passprot to manage sessions
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//Set up user schema to use passportlocalmongoose as a plugin
userSchema.plugin(passportlocalMongoose);


const User = new mongoose.model("User", userSchema);

//Use passportlocalMongoose to set up a local login strategy
passport.use(User.createStrategy());

//Set up passport to serialize and deserialize
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("login")
    }
});

app.get("/logout", function(req, res, next){
    req.logout(function(err){
        if(err){return next(err); }
        res.redirect("/");
    });
});

app.post("/register", function(req, res){
   
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err)
            res.redirect("/register")
        }else{
            passport.authenticate("local")(req, res, function(){
               res.redirect("/secrets")
            })
        }
    })
});

app.post("/login", function(req, res){

    const user = new User({
        username: req.body.username, 
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    });
   
})




app.listen(3000, function(){
    console.log("Server started on port 3000")
});

