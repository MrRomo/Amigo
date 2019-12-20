
const User = require('../models/User')
const Room = require('../models/Room')


const crtl = {}


crtl.index = async (req, res, next) => {
    res.render('index', { title: 'Express' });
}

crtl.room = async (req, res) => {
    const rooms = await db.get({"userId":req.user.id},Room,{limit:100})
    console.log(rooms);    
    res.render('rooms', { title: 'Rooms', user: req.user, rooms:rooms.data})
}

crtl.create = async (req, res) => {

    const lastRoom = await db.get({}, Room)
    let code = 1
    console.log(lastRoom);
    if (lastRoom.data.lenght) {
        code += lastRoom.code
    }
    const query = {
        userId: req.user.id,
        name: req.body.name,
        code
    }
    const room = await db.create(query, Room)
    console.log(room);
    
    res.redirect('/rooms')
}

crtl.delete = async (req, res) => {
    const _id = req.params.id
    const {id} = req.user
    console.log("delete with id",_id,id);
    const deleteRoom = await db.delete({"userId": id, "_id": _id},Room)
    console.log(deleteRoom);
    
    res.redirect('/rooms')
}



module.exports = crtl