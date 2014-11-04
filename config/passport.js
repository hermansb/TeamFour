var LocalStrategy = require('passport-local').Strategy;

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
        // var body = req.body;

        // var db = Cloudant.use(dbname);
        // db.find({selector:{username:username}}, function(err, result) {
        //     if (err){
        //         console.log("There was an error finding the user: " + err);
        //         return done(null, false, { message : "There was an error connecting to the database" } );
        //     } 
        //     if (result.docs.length == 0){
        //         console.log("Username was not found");
        //         return done(null, false, { message : "Username was not found" } );
        //     }

        //     // user was found, now determine if password matches
        //     var user = result.docs[0];
        //     if (bcrypt.compareSync(password, user.password)) {
        //         console.log("Password matches");
        //         // all is well, return successful user
        //          return done(null, user);
        //     } else {
        //         console.log("Password is not correct");
        //         //err = {"reason":"Password is incorrect"};
        //         return done(null, false, { message :"Password is incorrect"} );
        //     }                
        // });

        console.log('checking credentials...');

		if (email !== 'admin@skyisthelimit.com') {
			return done(null, false, { message: "Incorrect username or password" });
		}

		if (password !== 'admin') {
			return done(null, false, { message: "Incorrect username or password" });
		}

        console.log("done checking credentials...");

        return done(null, true);
	}));
}