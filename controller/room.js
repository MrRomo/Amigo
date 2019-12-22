const mongoose = require('mongoose')
const User = require('../models/User')
const Room = require('../models/Room')
const firebase = require('../database/firebase')
const { firebaseURL } = process.env
const crtl = {}
const callback = process.env.callback


/// ROOM ROUTER
crtl.index = async (req, res) => {
    let rooms = await db.get({ "userId": req.user.id }, Room, { limit: 100 })
    if (rooms.error) {
        res.render('error', { title: 'error', message: room.message })
    } else {
        res.render('rooms', { title: 'Rooms', user: req.user, rooms: rooms.data })
    }
}

crtl.getPublicEnter = async (req, res) => {
    const { username, code } = req.body
    res.redirect(`/@${username}/${code}`)
}

crtl.get = async (req, res) => {
    const { username, code } = req.params
    const user = await db.get({ username }, User)

    if (user.data.length) {
        console.log(user)
        let room = await db.get({ "userId": user.data[0].id, code }, Room)
        console.log(room)
        room = room.data
        if (room.length) {
            room = room[0]
            res.render('room', { title: room.name, room, user: req.user, firebaseURL })
        } else {
            res.render('customError', { title: 'ERROR', message: `Error sala ${code} no encontrada`, callback })
        }
    } else {
        res.render('customError', { title: 'ERROR', message: `Error usuario ${username} no encontrado`, callback })
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
    if (!room.error) {
        const data = room.data
        firebase.set(data._id, JSON.stringify(data.users))
    }
    res.redirect('/rooms')
}

crtl.delete = async (req, res) => {
    const _id = req.params.id
    const { id } = req.user
    const deleteRoom = await db.delete({ "userId": id, "_id": _id }, Room)
    firebase.del(_id)
    res.status(200).json({
        message: "deleted"
    })
}


//MEMBER ROUTER
crtl.addMember = async (req, res) => {
    const { id } = req.params
    const { name, password } = req.body
    let room = await db.get({ "_id": id }, Room)
    if (room.data.length) {
        room = room.data[0]
        const { users } = room
        users.member.push({ name, password, pos: users.member.length })
        console.log(users)
        const query = {
            query: { '_id': id },
            options: { "users": users }
        }
        const update = await db.update(query, Room)
        firebase.set(id, JSON.stringify(users))
        console.log(update);
        res.status(200).json({
            message: "member added"
        })
    }else{
        res.render('customError', { title: 'ERROR', message: `Error sala ${id} no encontrada`, callback })
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
        firebase.set(id, JSON.stringify(users))

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
        firebase.set(id, JSON.stringify(users))
        const update = await db.update(query, Room)
    }
    res.redirect(req.headers.referer)
}

module.exports = crtl