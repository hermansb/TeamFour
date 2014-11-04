var LocalStrategy = require('passport-local').Strategy;
var nano = require('nano')('https://ada12f18-1a96-412b-be06-55caa0cf0d9c-bluemix:bafd91061af5bf97cfb7d76912bfdef5f2bbc22f50ed574137bf8bda5d22a711@ada12f18-1a96-412b-be06-55caa0cf0d9c-bluemix.cloudant.com');

module.exports = function(passport) {

	//var cloudant = require('cloudant')({ account; '1', password; '2' });
	var dbname = 'dbname';

	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		done(null, user);
	});

	passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        var body = req.body;

        var db = nano.db.use('database');

        console.log('checking db for user credentials...');
        db.view('dbdesign', 'listAll', function(err, body) {
            if (!err) {

                for(var i = 0; i < body.rows.length; i++)   {

                    var doc = body.rows[i];
                    if (doc.value.account != null && email == doc.value.account.user && 
                        password == doc.value.account.password) {
                            return done(null, true);
                    }
                }
            }
            return done(null, false, { message: "Incorrect username or password" });
        });
	}));
}