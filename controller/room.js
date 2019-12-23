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
    let user =  await db.get({ "id": req.user.id },User)
    user = user.data[0]
    if (rooms.error) {
        res.render('error', { title: 'error', message: room.message })
    } else {
        res.render('rooms', { title: 'Rooms', user, rooms: rooms.data })
    }
}

crtl.getPublicEnter = async (req, res) => {
    const {code } = req.body
    let room = await db.get({  code }, Room)
    if(room.data.length){
        const user = await db.get({ 'id':room.data[0].userId }, User)
        const {username} = user.data[0]
        res.redirect(`/@${username.toLowerCase()}/${code}`)
    }else {
        res.render('customError', { title: 'ERROR', message: `Error sala ${code} no encontrada`, callback })
    }
}

crtl.get = async (req, res) => {
    const { username, code } = req.params
    let user = await db.get({ username }, User)

    if (user.data.length) {
        console.log(user)
        let room = await db.get({ "userId": user.data[0].id, code }, Room)
        console.log(room)
        if (room.data.length && !room.error) {
            room = room.data[0]
            if(req.user){
                user = (req.user.id==room.userId)?req.user:null
            }else{
                user = null
            }            
            res.render('room', { title: room.name, room, user, firebaseURL })
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
    const user = await db.get({"id":req.user.id}, User)
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
        mix: false
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
    res.redirect(req.headers.referer)
}


//MEMBER ROUTER
crtl.addMember = async (req, res) => {
    const { id } = req.params
    const { name, password } = req.body
    let room = await db.get({ "_id": id }, Room)
    if (room.data.length) {
        room = room.data[0]
        const { users } = room
        if(!room.isOpen){
            return res.render('customError', { title: 'ERROR', message: `Error sala ${id} esta sala ya esta cerrada`, callback })
        }
        users.member.push({ name, password, pos: users.member.length })
        console.log(users)
        const query = {
            query: { '_id': id },
            options: { "users": users, "number": users.member.length }
        }
        const update = await db.update(query, Room)
        firebase.set(id, JSON.stringify(users))
        console.log(update);
        res.redirect(req.headers.referer)
    } else {
        res.render('customError', { title: 'ERROR', message: `Error sala ${id} no encontrada`, callback })
    }
}

crtl.deleteMember = async (req, res) => {
    const { id, pos } = req.params
    const room = await db.get({ "_id": id }, Room)
    if (room.data.length) {
        const { users } = room.data[0]
        if(!room.data[0].isOpen){
            return res.render('customError', { title: 'ERROR', message: `Error sala ${id} esta sala ya esta cerrada`, callback })
        }
        users.member.splice(parseInt(pos), 1)
        for (let i = 0; i < users.member.length; i++) {
            users.member[i].pos = i
        }
        console.log(users)
        const query = {
            query: { '_id': id },
            options: { "users": users, "number": users.member.length }
        }
        const update = await db.update(query, Room)
        console.log(update);
        firebase.set(id, JSON.stringify(users))
        res.status(200).json({
            message: "deleted"
        })
    } else {
        res.render('customError', { title: 'ERROR', message: `Error sala ${id} no encontrada`, callback })
    }
}

crtl.editMember = async (req, res) => {
    const { id, pos } = req.params
    const { name, password } = req.body
    const room = await db.get({ "_id": id }, Room)
    if (room.data.length) {
        const { users } = room.data[0]
        if(!room.data[0].isOpen){
            return res.render('customError', { title: 'ERROR', message: `Error sala ${id} esta sala ya esta cerrada`, callback })
        }

        users.member[pos].name = name
        users.member[pos].password = password
        console.log(users);
        const query = {
            query: { '_id': id },
            options: { "users": users, "number": users.member.length }
        }
        firebase.set(id, JSON.stringify(users))
        const update = await db.update(query, Room)
        res.status(200).json({
            message: "member updated"
        })
    } else {
        res.render('customError', { title: 'ERROR', message: `Error sala ${id} no encontrada`, callback })
    }
}

crtl.distribute = async (req, res) => {
    const { id } = req.params

    let room = await db.get({ "_id": id }, Room)

    console.log(room);
    if (room.length || !room.error) {
        const { users } = room.data[0]
        const { member } = users
        const temp_member = [...member]
        const mix = []
        const length = member.length
        for (let i = 0; i < length; i++) {

            let select = Math.floor(Math.random() * temp_member.length)
            mix.push(temp_member[select])
            temp_member.splice(select, 1)
        }

        for (let i = 0; i < length - 1; i++) {
            mix[i].match = mix[i + 1].name
            console.log(mix[i])
        }
        mix[length - 1].match = mix[0].name
        const data = {
            query: { '_id': id },
            options: { 'users': { member, mix: true }, isOpen: false }
        }
        users.mix = true
        let distributeRoom = db.update(data, Room)
        firebase.set(id, JSON.stringify(users))
        res.redirect(req.headers.referer)
    } else {
        res.render('customError', { title: 'ERROR', message: `Error sala ${id} no encontrada`, callback })
    }
}
module.exports = crtl