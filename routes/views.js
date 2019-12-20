var express = require('express');
var router = express.Router();
var express = require('express');
var router = express.Router();
var { user, room } = require('../controller')
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth')

    /* GET home page. */
router.get('/', isNotLoggedIn,(req,res)=>{
    res.render('index', { title: 'Express' });
})

// user rooms
router.get('/rooms', isLoggedIn,room.index) //obtiene todas las rooms del usuario
router.get('/room/:code', isLoggedIn, room.get) //entra al admin de la room
router.post('/room/create', isLoggedIn, room.create) //crea una room a partir de un nombre
router.get('/room/delete/:id', isLoggedIn, room.delete) //elimina una room a partir de un id

// public rooms
router.post('/enter', room.getPublicEnter) //entra a la room publica de un usuario
router.get('/@:username/:code', room.getPublic) //entra a la room publica de un usuario





module.exports = router;