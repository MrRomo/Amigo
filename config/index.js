require("dotenv").config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    clientId: process.env.clientId,
    secret: process.env.secret,
    callback: process.env.callback
}