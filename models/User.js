const { Schema, model } = require('mongoose')
const { ObjectId } = Schema

const UserSchema = new Schema({
    id: { type: String, unique: true, required: true },
    name: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    location: {},
    date: { type: Date },
    image: { type: String, default: 'default.png' },
    lastSign: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

module.exports = model('User', UserSchema)