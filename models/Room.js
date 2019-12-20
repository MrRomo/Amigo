const { Schema, model } = require('mongoose')
const { ObjectId } = Schema

const RoomSchema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: Number, required: true },
    isOpen: {type: Boolean, default:true},
    users: {},
    number: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

module.exports = model('Room', RoomSchema)