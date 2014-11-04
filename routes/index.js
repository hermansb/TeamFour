var express = require('express');
var router = express.Router();
var client = require('twilio')('AC3c2fa9b2734379e8254c2b4e938b7c6e', '36a402403a5cb246162bcb4b22a50f2f'); 

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/users', function(req, res) {
	res.render('index', {title: 'USERS'});
});

router.get('/user/:userId', function(req, res) {
	var userId = req.params.userId;
	res.render('index', {title: 'USER ' + userId});
});

router.get('/requests', function(req, res) {
	res.render('index', {title: 'REQUESTS'});
});

router.get('/request/:requestId', function(req, res) {
	var requestId = req.params.requestId;
	res.render('index', {title: 'REQUEST ' + requestId});
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

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;
