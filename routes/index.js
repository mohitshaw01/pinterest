var express = require("express");
var router = express.Router();
const userModel = require("../routes/users");
const postModel = require("../routes/posts");
const passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
const fs = require("fs");
const path = require("path");
const { error } = require("console");

/* GET home page. */
router.get("/", function (req, res) {
  res.render("index");
});

router.get("/feed", isLoggedIn, function (req, res) {
  res.render("feedPage");
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  try {
    // Assuming the username is stored in the session
    const username = req.user.username;

    // Fetch the user from the database by username
    const user = await userModel.findOne({ username });

    // Check if the user exists
    if (!user) {
      return res.status(404).send("User not found");
    }
    //
    // Get a list of all files in the "images" folder
    const imageFiles = fs.readdirSync(path.join(__dirname, "../public/images"));

    // Choose a random image file
    const randomImage =
      imageFiles[Math.floor(Math.random() * imageFiles.length)];

    // Build the path to the selected image
    const profilePicture = `/images/${randomImage}`;

    // Pass the user's information to the profile view
    res.render("profile", {
      username: user.username,
      email: user.email,
      profilePicture,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/login", function (req, res, next) {
  res.render("login", { error: req.flash("error") });
});

//  passport auth code
router.post("/register", function (req, res) {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
  });

  if (!req.body.password) {
    return res.status(400).send("Password is required");
  }

  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// function is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
module.exports = router;
