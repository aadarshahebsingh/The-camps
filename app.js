
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi')
const session = require('express-session')
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/user");


const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/review')
const userRoutes=require('./routes/user')

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => { 
    console.log("Database connected");
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

app.engine("ejs", ejsMate);


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

const sessionConfig = {
  secret: "thisisnotgoodsecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  },
};

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session,1);
  res.locals.CurrentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get('/', (req, res) => {
    res.render('home');
})

app.use('/campgrounds', campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use('/', userRoutes);



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh! No , Something went wrong'
    res.status(statusCode).render('error',{err});
})

app.listen(3000, () => {
    console.log("port 3000");
})