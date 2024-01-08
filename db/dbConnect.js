const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const connectToMongo = async() => {
    await mongoose.connect(process.env.MONGO).then(()=>{
        console.log("mongo connected");
    }).catch((e)=>{
        console.log("error");
    })
}

module.exports = connectToMongo