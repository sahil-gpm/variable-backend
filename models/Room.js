const mongoose = require('mongoose')
const { Schema } = mongoose;

const roomSchema = new Schema({
  hostemail : {type:String,unique:true,required:true},
  hostsocketId : {type:String,unique:true,required:true},
  hostname : {type:String,required:true},
  creation : {type:String,default : new Date().toDateString()},
  roomchats : {type:Array,default : []},
  members : {type:Array,default : []},
  roomcode : {type:String,required:true},
  blacklist : {type:Array,default:[]},
});

const Room = mongoose.model("rooms",roomSchema)
module.exports = Room 