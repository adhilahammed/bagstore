const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema= new Schema({
    name:String,
    // address:String,
    // phonenumber:String,
    email:String,
    password:String,
    block:Boolean,

    address:[{
       fullname:String,
       lastname:String,
       phone:Number,
       house:String,
       locality:String,
       town:String,
       district:String,
       state:String,
       pin:Number,
       email:String
    }]
})
const user=mongoose.model('user',UserSchema)
module.exports=user