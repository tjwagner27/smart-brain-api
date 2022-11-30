const express = require('express');
require('dotenv').config();
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');
const hpp = require('hpp');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  }
});

const app = express();

app.use(cors());
app.options('*', cors());

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use(limiter);

app.use(express.json({ limit: '10kb' }));

app.use(xss())
app.use(hpp())

app.get('/', (req, res) => { res.send('Success') });

// Authorization
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) });
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) });

app.get('/profile', (req, res) => { profile.handleGetAllProfiles(req, res, db)})

app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db)});
app.patch('/profile/:id', (req, res) => { profile.handleProfileUpdate(req, res, db)})
app.patch('/changePassword', (req, res) => { profile.handleProfileChangePassword(req, res, db, bcrypt)});
app.delete('/profile/:id', (req, res) => { profile.handleProfileDelete(req, res, db)})

app.get('/getMe', (req, res) => { profile.handleGetSelf(req, res, db)})
app.delete('/deleteMe', (req, res) => { profile.handleDeleteSelf(req, res, db)})

//Clarifai API Call
app.put('/image', (req, res) => { image.handleImage(req, res, db) });
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) });

app.listen(process.env.PORT || 3000, ()=> {
  console.log(`app is running on port ${process.env.PORT ? process.env.PORT : 3000}`);
})