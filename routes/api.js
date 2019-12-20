const passport = require('passport')
var express = require('express');
var router = express.Router();
var { user, room } = require('../controller')
const User = require('../models/User')
    // Users database CRUD
router.post('/create', user.create);
router.get('/get', user.get);
router.delete('/delete', user.deleteUser);
router.put('/update', user.update);



module.exports = router;