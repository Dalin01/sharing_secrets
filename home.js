require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
//const encrypt = require('mongoose-encryption'); // encryption
//const md5 = require('md5'); // hasing
//const bcrypt = require('bcrypt'); // hasing and salting

// passport auth (cookies and sessions)
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const bodyParser = require('body-parser'); // used to parse information from post requests.
const keys = require(__dirname + '/config/keys.js');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public')); // tell app to use static files - images, css etc

// using ejs:
// 1. create a view folder called views
app.set('view engine', 'ejs'); // sets the view engine as embedded js for templating.

// express-session
app.use(session({
  secret: process.env.SESSIONKEY,
  resave: false,
  saveUninitialized: false
}));
// initialize passport
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true });
mongoose.set('useCreateIndex', true); // deprecation // WARNING:
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// userSchema.plugin(encrypt, { secret: keys.SECRETEKEY, encryptedFields: ['password'] }); // simple encryption
// userSchema.plugin(encrypt, { secret: process.env.SECRETEKEY, encryptedFields: ['password'] }); // simple encryption using env variables
userSchema.plugin(passportLocalMongoose); // plugin for passport for hasing password and saving to local DB

const User = new mongoose.model('User', userSchema);

// creates a local user strategy and pass it on to passport.
// users should also be serialized and deserialized
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => { // home route
  // res.sendFile(__dirname + '/public/index.html') // using html files
  res.render('home');
});

app.get('/login', (req, res) => { // home route
  // res.sendFile(__dirname + '/public/index.html') // using html files
  res.render('login');
});

app.get('/register', (req, res) => { // home route
  // res.sendFile(__dirname + '/public/index.html') // using html files
  res.render('register');
});

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()){
    res.render('secrets');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})

app.post('/register', (req, res) => {
  User.register({username: req.body.username}, req.body.password, function(err, user) {
  if (err) {
    console.log(err);
    res.redirect('/register');
  } else {
    passport.authenticate('local')(req, res,  () => {
      res.redirect('/secrets');
    });
  }
});



  /* const saltRounds = 10;
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      const newUser = new User({
        email: req.body.username,
        password: hash // hashing using bcrypt and 10 rounds of salt
      });
      newUser.save((err) => {
        if (err) {
          console.log(err);
        } else {
          res.render('secrets');
        }
      })
    });
  }); */
});

app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secrets');
      });
    }
  });
/*
  const password = req.body.password
  User.findOne({email: req.body.username}, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (user) {
        bcrypt.compare(password, user.password, function(err, result) {
          if ( result ){
            res.render('secrets');
          }
        });
      }
    }
  }); */
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
