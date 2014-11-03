'use strict';
var IndexModel = require('../models/index');
module.exports = function (app) {
    var model = new IndexModel();
    app.get('/login', function (req, res) {       
        res.render('login', model);    
    });
};