var express = require('express');
var router = express.Router();
var express = require('express');
var router = express.Router();
var { user, room } = require('../controller')
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth')

    /* GET home page. */
router.get('/', isNotLoggedIn,room.index)
router.get('/rooms', isLoggedIn,room.room)
router.post('/create', isLoggedIn, room.create)
router.get('/delete/:id', isLoggedIn, room.delete)

module.exports = router;