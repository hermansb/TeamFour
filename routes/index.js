var express = require('express');
var router = express.Router();
var client = require('twilio')('AC3c2fa9b2734379e8254c2b4e938b7c6e', '36a402403a5cb246162bcb4b22a50f2f'); 
var nano = require('nano')('https://ada12f18-1a96-412b-be06-55caa0cf0d9c-bluemix:bafd91061af5bf97cfb7d76912bfdef5f2bbc22f50ed574137bf8bda5d22a711@ada12f18-1a96-412b-be06-55caa0cf0d9c-bluemix.cloudant.com');
var passport = require('passport');
var passwordCheck = require('password-hash-and-salt');

var base = nano.db.use('database'); // my global nano

/* GET home page. */
router.get('/', function(req, res) {

	var fail = false;
	var unauthenticated = false;
	var forbidden = false;
	if (req.query && req.query.fail) {
		fail = req.query.fail === 'true';
	}
	else if (req.query && req.query.unauthenticated) {
		unauthenticated = req.query.unauthenticated === 'true';
	}
	else if (req.query && req.query.forbidden) {
		forbidden = req.query.forbidden === 'true';
	}
  res.render('index', { title: 'Express', fail: fail, unauthenticated: unauthenticated, forbidden: forbidden });
});

router.get('/dbtrial', function(req, res) {

	var base = nano.db.use('database');
	var data = [];
	base.view('dbdesign', 'listAll', function(err, body) {
	  if (!err) {
		body.rows.forEach(function(doc) {
		  data.push(JSON.stringify(doc, null, "\n"));
		});
	  }
	  
	  res.render('dbtrial', {title: 'Dbtrial' , data: data});  
	});

});


router.get('/dbtrial2', function(req, res) {

	res.render('dbtrial2');
});

router.get('/users', function(req, res) {
	res.render('dashboard', {title: 'USERS'});
});

router.get('/dbtest', isLoggedIn,  
	function(req, res) {
		console.log(JSON.stringify(req.user));
		if (req.user.isAdmin !== 'true') {
			res.redirect('/?forbidden=true');

		}
		else {
			var example = nano.db.use('database');
			// fetch the primary index
			example.list(function(err, body){
			  if (err) {
				// something went wrong!
				throw new Error(err);
			  } else {
				// print all the documents in our database
				console.log(body);
			  }
			});
			res.send('done');
		}
	}
);

router.get('/user', isLoggedIn, function(req, res) {
	//var userId = req.params.userId;
	console.log(JSON.stringify(req.user));
	var email = req.user.email;

	 base.view('dbdesign', 'listAll', function(err, body) {
	 	var result = {};
	 	if (!err) {
	 		for(var i = 0; i < body.rows.length; i++)   {
                    var doc = body.rows[i];
                    if (doc.value.organization != null && email == doc.value.organization.account.email) {
                        result = doc.value.organization;
                        break;
                    }
                    // else if (doc.value.organization != null && email == doc.value.organization.account.email &&
                    //  password == doc.value.organization.account.password) {
                    //     console.log('condition2');
                    // console.log('condition1' + JSON.stringify(doc.value.organization.account));
                    //     return done(null, doc.value.organization.account);
                    // }
                }
            if (result.account != null) {
            	var a = doc.value.organization;
            	res.render('viewUser', {
            		organizationName: a.name,
					charityNumber: a.charityNumber,
					contactName: a.contact[0].name,
					contactAddress: a.contact[0].address,
					workPhoneNumber: a.contact[0].phoneNumbers.work,
					homePhoneNumber: a.contact[0].phoneNumbers.home,
					mobilePhoneNumber: a.contact[0].phoneNumbers.mobile,
					organizationWebsite: a.website,
					missionStatement: a.description.missionStatement,
					organizationHistory: a.description.history,
					programsAndServices: a.description.services,
					targetPopulations: a.description.targetDemographic,
					programDescription: a.description.programDescription,
					accomplishments: a.description.accomplishments,
					requestedAmount: 8,
					justification: 'We have 8 cool kids who need laptops',
					additionalInfo: 'Did we mention we are very cool?'
            	});
            } else {
            	res.render('viewUser', {} );
            }
	 	} else {
	 		console.log(err);
	 	}
	 });
});

router.post('/user', function(req, res)	{

	var a = req.body;

	var object = {
		"organization": {
			"account": {"email": a.InputEmail, "password": a.InputPassword},
			"name": a.organizationName,
			"charityNumber" : a.charityNumber,
			"website": a.website,
			"contact": [{
				"name": a.contactName,
				"address": a.contactAddress,
				"phoneNumbers": {
					"work": a.workPhoneNumber,
					"home": a.homePhoneNumber,
					"mobile": a.mobilePhoneNumber
				}
			}],
			"description": {
				"missionStatement": a.missionStatement,
				"history": a.organizationHistory,
				"services": [
					a.programsAndServices
				],
				"targetDemographic": [
					a.targetPopulations
				],
				"programDescription": a.programDescription,
				"accomplishments": [
					a.accomplishments
				]
			},
			"requests": {},
			"files": {}
		}
	};

	var base = nano.db.use('database');
	base.insert(object, null, function(err, body) {
		if(!err)
			res.send("Organization created");
		else
			res.send("Error adding to db");
	});
});

router.get('/requests', function(req, res) {
	res.render('index', {title: 'REQUESTS'});
});

router.get('/request', function(req, res) {
	res.render('requestForm', { title: 'Create a request' });
});

router.get('/request/view/:id', function(req, res) {
	//Database call, fetch request by id
	//Then populate the fields below
	res.render('viewRequest',
	{ 
		organizationName: 'Cool Organization',
		charityNumber: '123456789',
		contactName: 'Dr. Spaceman',
		contactAddress: '123 Street Street',
		workPhoneNumber: '416-555-5555',
		homePhoneNumber: '416-555-5556',
		mobilePhoneNumber: '416-555-5557',
		organizationWebsite: 'www.coolorganization.com',
		missionStatement: 'To provide cool kids a chance to be cool',
		organizationHistory: 'Weve been cool since being cool was cool',
		programsAndServices: 'We provide cool programs',
		targetPopulations: 'Cool kids',
		programDescription: 'Our program is pretty cool',
		accomplishments: 'We were voted coolest organization by cool people',
		requestedAmount: 8,
		justification: 'We have 8 cool kids who need laptops',
		additionalInfo: 'Did we mention we are very cool?'
	});
});

router.get('/sendtext', isLoggedIn, function (req, res) {
		client.messages.create({ 
			to: "6479091164", 
			from: "+16475600524", 
			body: "Did you get this?",   
		}, function(err, message) { 
			if (err) {
				console.log('there was an err' + JSON.stringify(err));
			}
			else {
				//console.log(message); 
				res.send('Text sent! Congratz');
			}
		});
		
});

router.post('/', passport.authenticate('local-login', {
	successRedirect: '/user',
	failureRedirect: '/?fail=true',
	failureFlash: true
}));

router.get('/logout', function (req, res, next) {
	req.logout();
	res.redirect('/');
});

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
    	console.log('authentication successful');
        return next();
    }
    // if they aren't redirect them to the home page
    res.redirect('/?unauthenticated=true');
}



module.exports = router;
