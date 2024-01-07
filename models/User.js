const mongoose = require('mongoose')
const { Schema } = mongoose;

const userSchema = new Schema({
  firstname : {type:String,required:true},
  lastname : {type:String,required:true},
  email : {type:String,unique:true},
  password : {type:String,required:true},
  creation : {type:Date,default : new Date().toDateString()},
  views : {type:Number,default:0},
  search_appereances : {type:Number,default:0},
  stars : {type:Number,default:0},
  profile_image : {type:String,default:""}
});

const User = mongoose.model("users",userSchema)
module.exports = User 