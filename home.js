require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
//const encrypt = require('mongoose-encryption'); // encryption
const md5 = require('md5');

const bodyParser = require('body-parser'); // used to parse information from post requests.
const keys = require(__dirname + '/config/keys.js');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public')); // tell app to use static files - images, css etc

// using ejs:
// 1. create a view folder called views
app.set('view engine', 'ejs'); // sets the view engine as embedded js for templating.

mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// userSchema.plugin(encrypt, { secret: keys.SECRETEKEY, encryptedFields: ['password'] }); // simple encryption
// userSchema.plugin(encrypt, { secret: process.env.SECRETEKEY, encryptedFields: ['password'] }); // simple encryption using env variables

const User = new mongoose.model('User', userSchema);

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

app.post('/register', (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password) // hashing using md5
  });
  newUser.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render('secrets');
    }
  })
});

app.post('/login', (req, res) => {
  const password = req.body.password

  User.findOne({email: req.body.username}, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (user) {
        if (md5(user.password) === password) {
          res.render('secrets');
        }
      }
    }
  })
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
