'use strict';

// Twilio Credentials 
var accountSid = 'AC3c2fa9b2734379e8254c2b4e938b7c6e'; 
var authToken = '36a402403a5cb246162bcb4b22a50f2f'; 
 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 
 
var IndexModel = require('../models/index');


module.exports = function (router) {

    var model = new IndexModel();


    router.get('/', function (req, res) {
        
        res.render('login', model);
        
    });
	
	
router.get('/sendtext', function (req, res) {
	client.messages.create({ 
		to: "6479091174", 
		from: "+16475600524", 
		body: "Did you get this?",   
	}, function(err, message) { 
		console.log(message.sid); 
	});

}


};
