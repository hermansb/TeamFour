var express = require('express');
var router = express.Router();
var client = require('twilio')('AC3c2fa9b2734379e8254c2b4e938b7c6e', '36a402403a5cb246162bcb4b22a50f2f'); 
var nano = require('nano')('https://ada12f18-1a96-412b-be06-55caa0cf0d9c-bluemix:bafd91061af5bf97cfb7d76912bfdef5f2bbc22f50ed574137bf8bda5d22a711@ada12f18-1a96-412b-be06-55caa0cf0d9c-bluemix.cloudant.com');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
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
	  
	  res.render('dbtrial', { title: 'Dbtrial' , data: data});  
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

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;
