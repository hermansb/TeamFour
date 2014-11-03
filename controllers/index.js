'use strict';


var IndexModel = require('../models/index');


module.exports = function (router) {

    var model = new IndexModel();


    router.get('/', function (req, res) {
        res.render('login', model);
    });

    router.get('/user', function (req, res) {
        res.render('user', model);
    });

};
