const mongoose = require('mongoose')
const User = require('../models/User')
const Room = require('../models/Room')
const firebase = require('../database/firebase')

const crtl = {}

/// ROOM ROUTER
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
    console.log(room.data[0].users);
    res.render('room', { title: room.data[0].name, room: room.data[0], user: req.user })
}

crtl.getPublicEnter = async (req, res) => {

    const { username, code } = req.body
    res.redirect(`/@${username}/${code}`)

}

crtl.getPublic = async (req, res) => {
    const { username, code } = req.params
    const user = await db.get({ "username": username.toLowerCase() }, User)

    if (user.data.length) {
        const query = {
            code: parseInt(req.params.code),
            userId: user.data[0].id
        }
        const room = await db.get(query, Room)

        if (room.data.length) {
            const response = room.data[0]
            console.log(response);
            res.render('room', { title: response.title, room: response })
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
    query.users = {
        member: [{ name: req.user.username, pos: 0, password: "" }],
        mix: []
    }
    const room = await db.create(query, Room)
    console.log(room);
    if(!room.error){
        const data = room.data
        firebase.set(data._id,JSON.stringify(data.users))
    }
    res.redirect('/rooms')
}

crtl.delete = async (req, res) => {
    const _id = req.params.id
    const { id } = req.user
    console.log("delete room with id", _id, id);
    const deleteRoom = await db.delete({ "userId": id, "_id": _id }, Room)
    firebase.del(_id)
    console.log(deleteRoom);
    res.redirect('/rooms')
}


//MEMBER ROUTER
crtl.addMember = async (req, res) => {
    const { id } = req.params
    const { name, password } = req.body

    const room = await db.get({ "_id": id }, Room)
    if (room.data.length) {
        const { users } = room.data[0]
        users.member.push({ name, password, pos: users.member.length })
        console.log(users)
        const query = {
            query: { '_id': id },
            options: { "users": users }
        }
        const update = await db.update(query, Room)
        firebase.set(id,JSON.stringify(users))
        console.log(update);
        res.redirect(req.headers.referer)
    }
}
crtl.deleteMember = async (req, res) => {
    const { id, pos } = req.params
    const room = await db.get({ "_id": id }, Room)
    if (room.data.length) {
        const { users } = room.data[0]
        users.member.splice(parseInt(pos), 1)
        for (let i = 0; i < users.member.length; i++) {
            users.member[i].pos = i
        }
        console.log(users)
        const query = {
            query: { '_id': id },
            options: { "users": users }
        }
        const update = await db.update(query, Room)
        console.log(update);
    }
    res.redirect(req.headers.referer)
}

crtl.editMember = async (req, res) => {
    const { id, pos } = req.params
    const { name, password } = req.body
    const room = await db.get({ "_id": id }, Room)
    if (room.data.length) {
        const { users } = room.data[0]
        users.member[pos].name = name
        users.member[pos].password = password
        console.log(users);        
        const query = {
            query: { '_id': id },
            options: { "users": users }
        }
        firebase.set(id,JSON.stringify(users))
        const update = await db.update(query, Room)
    }
    res.redirect(req.headers.referer)
}

module.exports = crtl