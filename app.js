const http =require('http');
const path = require('path');
const express=require('express');

require("dotenv").config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf=require('csurf');
const flash=require('connect-flash');

const app=express();
const port = process.env.PORT || 3000;
const errorController = require('./controllers/error');
const User = require('./models/user');

// const shopRoutes = require('./routes/shop');

const MONGODB_URI =
  'mongodb+srv://Aniket1506:15062001@cluster0.0fzn1.mongodb.net/Cloud?retryWrites=true&w=majority';

  const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
  });
  
  const csrfProtection=csrf();
  
  app.set('view engine', 'ejs');
  app.set('views', 'views');
  
  const adminRoutes = require('./routes/admin');
  const shopRoutes = require('./routes/shop');
  const authRoutes = require('./routes/auth');
  const { request } = require('https');
  
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(
    session({
      secret: 'my secret',
      resave: false,
      saveUninitialized: false,
      store: store
    })
  );
  app.use(csrfProtection);
  app.use(flash());
  
  app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        req.user = user;
        res.locals.isAdmin=req.user.isAdmin;
        next();
      })
      .catch(err => console.log(err));
  });
  
  app.use((req,res,next)=>{
    res.locals.isAuthenticated=req.session.isLoggedIn;
    res.locals.csrfToken=req.csrfToken();
    next();
  });
  
  app.use('/admin', adminRoutes);
  app.use(shopRoutes);
  app.use(authRoutes);
  
  app.use(errorController.get404);
  
  mongoose
    .connect("mongodb://"+process.env.COSMOSDB_HOST+":"+process.env.COSMOSDB_PORT+"/"+process.env.COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb", {
      auth: {
        username: process.env.COSMOSDB_USER,
        password: process.env.COSMOSDB_PASSWORD
      },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: false
    })
    .then(result => {
      app.listen(port);
    })
    .catch(err => {
      console.log(err);
    });
  