var express = require('express');
var router = express.Router();
var {user} = require('../controller')
/* GET home page. */
router.post('/create', user.create);
router.get('/get', user.get);
router.delete('/delete', user.deleteUser);
router.put('/update', user.update);

module.exports = router;
