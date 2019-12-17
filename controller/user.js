const User = require('../models/User')


const create = async (req,res)=>{
    const {body} = req
    const response = await db.create(body, User)    
    res.send(response)
}
const get = async (req,res)=>{
    const {query} = req
    const response = await db.get(query, User)    
    res.send(response)
}
const deleteUser = async (req,res)=>{
    const {query} = req
    const response = await db.delete(query, User)    
    res.send(response)
}
const update = async (req,res)=>{
    const {query} = req
    const {body} = req
    const data = {
        query:{"_id": query._id },
        options:body
    }
    const response = await db.update(data, User)    
    res.send(response)
}

module.exports={
    create,
    get,
    deleteUser,
    update
}