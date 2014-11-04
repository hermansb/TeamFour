var express = require('express');
var router = express.Router();
var client = require('twilio')('AC35793279f02cec99521ee00cbcc95a45', '729cc5f50620ea888bc922691066192c'); 
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

	//registration
	if (req.query && req.query.registration) {
		res.render('registerProfile', {title: "Update Profile"});

	}
	else {
	 if (req.query && req.query.unauthenticated) {
		unauthenticated = req.query.unauthenticated;
	}
	else if (req.query && req.query.forbidden) {
		forbidden = req.query.forbidden;
	}

	var privilege = "noauth";
	if (req.isAuthenticated()) {
		if (req.user.isAdmin == 'true') {
			privilege = 'admin';
		} else {
			privilege = 'user';
		}
	}

	if (req.isAuthenticated()) {
		res.redirect('/requests');
	} else {
		res.render('index', { title: 'Express', fail: fail, unauthenticated: unauthenticated, forbidden: forbidden, privilege: privilege });
	}
}
});

router.get('/dbtrial', function(req, res) {

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

	var data = [];
	base.view('dbdesign', 'listAll', function(err, body) {
	  if (!err) {
		body.rows.forEach(function(doc) {
		  data.push(doc);
		});
	  }

	var privilege = "noauth";
	if (req.isAuthenticated()) {
		if (req.user.isAdmin == 'true') {
			privilege = 'admin';
		} else {
			privilege = 'user';
		}
	}
	  
	  res.render('dashboard', {title: 'Users' , data: data, privilege: privilege});  
	});
});

router.get('/pendingrequests', function(req, res) {
	var data = [];
	base.view('dbdesign', 'listAll', function(err, body) {
	  if (!err) {
		body.rows.forEach(function(doc) {
  			if(doc.value.request != null && doc.value.request.status == "pending"){
		  		data.push(doc);
			}
		});
	  }
	  
	var privilege = "noauth";
	if (req.isAuthenticated()) {
		if (req.user.isAdmin == 'true') {
			privilege = 'admin';
		} else {
			privilege = 'user';
		}
	}

	  res.render('dashboard', {privilege: privilege, title: 'Pending' , data: data});  
	});
});

router.get('/dbtest', isLoggedIn,  
	function(req, res) {
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
                }
            if (result.account != null) {
            	var a = doc.value.organization;

					var privilege = "noauth";
					if (req.isAuthenticated()) {
						if (req.user.isAdmin == 'true') {
							privilege = 'admin';
						} else {
							privilege = 'user';
						}
					}

            	res.render('viewUser', {
            		privilege: privilege,
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

        		var privilege = "noauth";
				if (req.isAuthenticated()) {
					if (req.user.isAdmin == 'true') {
						privilege = 'admin';
					} else {
						privilege = 'user';
					}
				}
            	res.render('viewUser', {privilege: privilege} );
            }
	 	} else {
	 		console.log(err);
	 	}
	 });
});

router.get('/register', function (req, res) {
	res.render('registerProfile', {title: "Update Profile"});
});

router.post('/register', function(req, res)	{

	var a = req.body;

	sendText(a.mobilePhoneNumber, "Thank you for registering your organization with Sky's the Limit!");
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

	base.insert(object, null, function(err, body) {
		if(!err)
			res.send("Organization " + a.organizationName + " created");
		else
			res.send("Error adding to db");
	});
});

router.get('/requests', isLoggedIn, function(req, res) {

	var data = [];
	base.view('dbdesign', 'listAll', function(err, body) {
	  if (!err) {
		body.rows.forEach(function(doc) {
			if(doc.value.request != null && doc.value.request.status != "pending"){
		  data.push(doc);
		}
		});
	  }

	var privilege = "noauth";
	if (req.isAuthenticated()) {
		if (req.user.isAdmin == 'true') {
			privilege = 'admin';
		} else {
			privilege = 'user';
		}
	}
	  console.log(privilege);
	  res.render('dashboard', {title: 'Requests' , data: data, privilege: privilege});  
	});
});

router.get('/request', isLoggedIn, function(req, res) {

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
            }
            if (result.account != null) {
            	var a = doc.value.organization;

				var privilege = "noauth";
				if (req.isAuthenticated()) {
					if (req.user.isAdmin == 'true') {
						privilege = 'admin';
					} else {
						privilege = 'user';
					}
				}

            	res.render('requestForm', { 
            		privilege: privilege,
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
					accomplishments: a.description.accomplishments
            	});
            } else {

        		var privilege = "noauth";
				if (req.isAuthenticated()) {
					if (req.user.isAdmin == 'true') {
						privilege = 'admin';
					} else {
						privilege = 'user';
					}
				}
            	res.render('requestForm', { privilege: privilege, title: 'Create a request' });
            }
	 	} else {
	 		console.log(err);
	 	}
	 });
});

router.post('/request', isLoggedIn, function(req, res) {
	
	var a = req.body;
	var object = {};
	var result = {};
	
	//base get document based on profile fields in /request
	base.view('dbdesign', 'listAll', function(err, body) {
	 	if (!err) {
	 		for(var i = 0; i < body.rows.length; i++)   {

	 			if (body.rows[i].value.organization != null && a.charityNumber == body.rows[i].value.organization.charityNumber)
	 				result = body.rows[i];
            }
        }
   
    object = result;

	object.value.organization.requests[2014] = {
		"requestedAmount": a.numberOfLaptops,
		"alternateSupply": a.justification,
		"strengtheningInformation": a.additionalInfo
	};


		//insert new document on old, overwriting request by year if needed
		base.insert(object, result._id, function(err, body) {
			if(!err)
				res.send("Updated organization request");
			else
				res.send("Error adding to db");
		});

		var orgEmail = object.value.organization.account.email;
		var firstDate = new Date();
		var initialMessage = "Request created by " +  + " on " + firstDate;

		var requestDoc = {
			"request": {
				status: "pending",
				requestingOrg: orgEmail,
				requestedDate: firstDate,
				lastUpdated: firstDate,
				amount: a.numberOfLaptops,
				messages: [{
					"user": orgEmail,
					"date": firstDate,
					"message": initialMessage
				}]
			}
		};

		base.insert(requestDoc, null, function(err, body) {
			if(!err)
				console.log("Request document created");
			else
				console.log("Error adding request document")
		});
   });

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

	/*
	var requestId = req.params.id;

	//Pull the request object from database
	//Pull the org email from the request document
	//Get the org information from org email with another query

	var result;
	var orgResult;

	base.view('dbdesign', 'listAll', function(err, body) {
	 	if (!err) {
	 		for(var i = 0; i < body.rows.length; i++)   {

	 			if (body.rows[i].value.request != null && requestId == body.rows[i].id)
	 				result = body.rows[i].value.request;
            }

            //result is now org email
            for(var i = 0; i < body.rows.length; i++)   {

	 			if (body.rows[i].value.organization != null && result.requestingOrg == body.rows[i].value.organization.account.email)
	 				orgResult = body.rows[i].value.organization;
            }

			//orgResult is now organization document
        }

        var yearString = result.requestedDate.substring(0, 4);
        console.log(JSON.stringify(orgResult));
		res.render('viewRequest',
		{ 
			organizationName: orgResult.name,
			charityNumber: orgResult.charityNumber,
			contactName: orgResult.contact[0].name,
			contactAddress: orgResult.contact[0].address,
			workPhoneNumber: orgResult.contact[0].phoneNumbers.work,
			homePhoneNumber: orgResult.contact[0].phoneNumbers.home,
			mobilePhoneNumber: orgResult.contact[0].phoneNumbers.mobile,
			organizationWebsite: orgResult.website,
			missionStatement: orgResult.description.missionsStatement,
			organizationHistory: orgResult.description.history,
			programsAndServices: orgResult.description.services[0],
			targetPopulations: orgResult.description.targetDemographic[0],
			programDescription: orgResult.description.programDescription,
			accomplishments: orgResult.description.accomplishments[0],
			requestedAmount: orgResult.requests[yearString].requestedAmount,
			justification: orgResult.requests[yearString].strengtheningInformation,
			additionalInfo: orgResult.requests[yearString].alternateSupply
		});

	});*/
});

router.get('/sendtext', isLoggedIn, function (req, res) {
	if (req.user.isAdmin !== 'true') {
		res.redirect('/?forbidden=true');
	}
	else {
		if (sendText("+14165081269", "Whats up from Bluemix!")) {
			res.send('Text sent successfully.');
		}
		else {
			res.send('Text message failed.');
		}
	}
});

router.get('/verifyPhone', function(req, res) {

	client.outgoingCallerIds.list({ phoneNumber: req.query.phoneNumber }, 
		function(err, data) {
			if (data.outgoingCallerIds.length > 0) {
				res.send('Already registered');
			}
			else {
				client.outgoingCallerIds.create({
			    friendlyName: "+16475600524",
			    phoneNumber: req.query.phoneNumber
				}, function(err, callerId) {
					if (err) {
						console.log(JSON.stringify(err));
						res.send('error occurred');
					}
					else {
						console.log(JSON.stringify(callerId));
						res.send(callerId.validation_code);
					}
				});
			}

	});
	

});

router.post('/', passport.authenticate('local-login', {
	successRedirect: '/requests',
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
};

function sendText(phoneNumber, msg) {
	client.messages.create({ 
			to: phoneNumber, 
			from: "+16475600524", 
			body: msg,   
		}, function(err, message) { 
			if (err) {
				console.log('there was an err' + JSON.stringify(err));
				return false;
			}
			else {
				console.log('succeeded'); 
				return true;
			}
		});
};



module.exports = router;
