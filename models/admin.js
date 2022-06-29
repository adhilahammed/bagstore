const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema= new Schema({
    name:String,
    // address:String,
    // phonenumber:String,
    email:String,
    password:String
})
const admin=mongoose.model('admin',UserSchema)
module.exports=admin