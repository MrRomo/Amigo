var express = require('express');
var router = express.Router();
var express = require('express');
var router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth')
const User = require('../models/User')
    /* GET home page. */
router.get('/', isNotLoggedIn, function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/rooms', isLoggedIn, async(req, res) => {
    console.log(req.user);
    const response = await db.get({ "id": req.user.id }, User)
    console.log('User Found', response);
    res.render('rooms', { title: 'Rooms', user: req.user })
})

module.exports = router;