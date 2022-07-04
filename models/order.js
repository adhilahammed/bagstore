const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const orderSchema= new Schema({  
   products:[{
    pro_id:{
        type:Schema.Types.ObjectId,          
        ref:'product'
    },
    
    price: { type: Number },
    quantity: { type: Number, default: 1 },
    subtotal: { type: Number, default: 0 },
    status:{type:String,default:'Order placed'} , 
    orderCancelled:{type:Boolean,default:false},
    Name:{type:String},       
   }],
    userId:String,
    paymentmethod:String,
    cartItem:Array,
    
    status:String,
   
    
    total:{type:Number,default:0},
    ShippingCharge:{type:Number},
  grandTotal: { type: Number, default: 0 },
    coupondiscountedPrice:{type:Number,default:0},          
    couponPercent:{type:Number,default:0},
    couponName:{type:String},
    reFund:{type:Number,default:0},           
   address:[{
 
    fullname:String,                       
    phone:Number,
    email:String,
    house:String,
    locality:String,
    town:String,
    district:String,
    state:String,
    pin:Number

   }],
   ordered_on: { type: Date },
})
const order=mongoose.model('order4',orderSchema)      
module.exports=order