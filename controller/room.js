const mongoose = require('mongoose')
const User = require('../models/User')
const Room = require('../models/Room')


const crtl = {}

crtl.index = async (req, res) => {
    const rooms = await db.get({ "userId": req.user.id }, Room, { limit: 100 })
    console.log(rooms);
    res.render('rooms', { title: 'Rooms', user: req.user, rooms: rooms.data })
}

crtl.get = async (req, res) => {
    const query = {
        code: req.params.code,
        userId: req.user.id
    }
    console.log(query);
    const room = await db.get(query, Room)
    console.log(room);
    res.json(room)
}

crtl.getPublicEnter = async (req, res) => {

    const { username, code } = req.body
    res.redirect(`/@${username}/${code}`)

}

crtl.getPublic = async (req, res) => {
    const { username, code } = req.params
    const user = await db.get({ "username": username.toLowerCase() }, User)
    console.log(user);
    console.log(user.data.length);
    
    if (user.data.length) {
        const query = {
            code: parseInt(req.params.code),
            userId: user.data[0].id
        }
        console.log(query);
        const room = await db.get(query, Room)
        console.log(room);
        
        if (room.data.length) {
            console.log(room);
            res.json(room)
        } else {
            res.send('sala no encontrada')
        }
    } else {
        res.send('Usuario no encontrado')
    }
}

crtl.create = async (req, res) => {
    console.log('Creando una sala');
    let code = Math.floor(100000 + Math.random() * 900000)
    const query = {
        userId: req.user.id,
        code
    }
    let lastRoom
    do {
        lastRoom = await db.get(query, Room)
        if (lastRoom.error) {
            query.code = Math.floor(100000 + Math.random() * 900000)
        }
    } while (lastRoom.error);

    query.name = req.body.name

    const room = await db.create(query, Room)
    console.log(room);
    res.redirect('/rooms')
}

crtl.delete = async (req, res) => {
    const _id = req.params.id
    const { id } = req.user
    console.log("delete room with id", _id, id);
    const deleteRoom = await db.delete({ "userId": id, "_id": _id }, Room)
    console.log(deleteRoom);
    res.redirect('/rooms')
}



module.exports = crtl