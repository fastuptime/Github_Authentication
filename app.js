global.express = require('express');
global.app = express();
global.ejs = require('ejs');
global.passport = require('passport');
global.githubStrategy = require('passport-github').Strategy;
global.session = require('express-session');
global.config = require('./config.js');

passport.use(new githubStrategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
},
    function (accessToken, refreshToken, profile, done) {
        console.log(profile); // the data from github
        return done(null, profile);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

const checkAuth = function (req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/github');
};

app.set('views', __dirname + '/www');
app.set('view engine', 'ejs');

app.use(session({ secret: config.secret, resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
    if (req.isAuthenticated()) res.redirect('/profile'); // if logged in, redirect to profile
    res.render('index'); // otherwise, render the index page
});

app.get('/profile', checkAuth, function (req, res) {
    res.render('profile', { user: req.user });
});

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    function (req, res) {
        res.redirect('/profile');
    }
);

app.get("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err);
        res.redirect("/");
    });
});

app.listen(config.port, function () {
    console.log('Listening on port', config.port);
});