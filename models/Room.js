const { Schema, model } = require('mongoose')
const { ObjectId } = Schema

const RoomSchema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: Number, required: true },
    users: {},
    number: { type: Number, default: 0 },
    lastSign: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

module.exports = model('Room', RoomSchema)