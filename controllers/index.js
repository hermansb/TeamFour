'use strict';



var IndexModel = require('../models/index');
var client = require('twilio')('AC3c2fa9b2734379e8254c2b4e938b7c6e', '36a402403a5cb246162bcb4b22a50f2f'); 


module.exports = function (router) {

    var model = new IndexModel();


    router.get('/', function (req, res) {
        res.render('login', model);
    });

    router.get('/user', function (req, res) {
        res.render('user', model);
    });
	
	
	router.get('/sendtext', function (req, res) {
		client.messages.create({ 
			to: "6479091174", 
			from: "+16475600524", 
			body: "Did you get this?",   
		}, function(err, message) { 
			if (err) {
				console.log('there was an err' + JSON.stringify(err));
			}
			else {
				console.log(message); 
				res.send('Text sent! Congratz');
			}
		});
		
	});


};
