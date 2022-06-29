const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const productSchema= new Schema({           
  Name:String,
  Discount:Number,
  Color:String,
  mrp:Number,
  Price:Number,
  stock:Number,

  Category:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'category',
      require:true
  },
  Brand:{
      type:mongoose.Schema.Types.ObjectId,        
      ref:'brand',
      require:true
  },
  Image:{
      type:Array
  }
})
const product=mongoose.model('product',productSchema)
module.exports=product