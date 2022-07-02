// let db=require('../config/connection')


let db = require('../config/connection')
const userData=require('../models/user')
// const userData = require('../models/user')
const user=require('../models/user')
const cartmodel=require('../models/cart')
let productData=require('../models/products')
let wishlistmodel=require('../models/wishlist')
let nodeMailer=require('nodemailer')
let orderData=require('../models/order')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
const { response } = require('../app')
const { default: mongoose } = require('mongoose')
const couponModel=require('../models/coupon')
require('dotenv').config()
const Razorpay = require('razorpay');
const { CANCELLED } = require('dns')
const { findOneAndUpdate } = require('../models/user')
const product = require('../models/products')

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_KEY ,
});




module.exports = {
    doSignup: (userDataa) => {
        // console.log(userData);
        return new Promise(async (resolve, reject) => {
            // if(userData.password==userData.newpassword){
                const user=await userData.findOne({email:userDataa.email})
                if(user){
                    reject({status:false,msg:'email already taken'})
                }
                else{
                    if(userDataa.password==userDataa.newpassword){
            userDataa.password = await bcrypt.hash(userDataa.password, 10)
            // console.log(userData);
            const otpGenerator = await Math.floor(1000+Math.random()*9000)
            const newUser = await ({
                name: userDataa.name,
                // phonenumber: userData.Phone,
                email: userDataa.email,
                password: userDataa.password,
                otp:otpGenerator

            })
            console.log(newUser);
            if(newUser){
                try {
                    const mailTransporter = nodeMailer.createTransport({
                        host: 'smtp.gmail.com',
                        service: "gmail",
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.NODEMAILER_USER,
                                pass: process.env.NODEMAILER_PASS
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
            
                    });
                    const mailDetails = {
                        from: "adhilahammed0@gmail.com",
                        to: userDataa.email,
                        subject: "just testing nodemailer",
                        text: "just random texts ",
                        html: '<p>hi ' + userDataa.name + 'your otp ' + otpGenerator + ''
                    }
                    mailTransporter.sendMail(mailDetails, (err, Info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("email has been sent ", Info.response);
                        }
                    })
                } catch (error) {
                    console.log(error.message);
                }
            
            }
            // console.log(newUser+'fksefr');
            resolve(newUser)
        }
          else{
            console.log('different passwords'); 
          }
            

        }
            // }
            // await newUser.save().then((data) => {
            //     resolve(data)
            // })
            // }
            // else{
            //    console.log('different passwords'); 
            // }
        })
    },
    doLogin:(userDat)=>{
        return new Promise(async (resolve,reject)=>{
        //   let loginStatus=false
          let response={}
          console.log(userDat.email);
        //    let user=await db.get().collection(collection.USER_COLLECTION).findOne({your_email:userData.email})
            let user=await userData.findOne({email:userDat.email})     
           console.log(user)
           if(user){
            if(user.block){
                reject()
            }else{
            
               bcrypt.compare(userDat.password,user.password).then((result)=>{
                  if(result){
                    console.log("login success")
                    response.user=user
                    response.status=true
                    resolve(response)
                  }else{
                    console.log("login failed")
                    response.status=false
                    resolve(response)
                  }
               })
            }
           }else{
             console.log("login failed 2")
             resolve({status:false})
           }
        })
      },
      doEmailVerify:(userDataa)=>{
      return new Promise(async(resolve,reject)=>{
          const user=await userData.findOne({email:userDataa.email})

          if(user){

            const otpGenerator=await Math.floor(1000+Math.random()*9000)
            const newUser=await ({
                 email:user.email,
                 _id:user._id,
                 otp:otpGenerator

            })
            try {
                const mailTransporter = nodeMailer.createTransport({
                    host: 'smtp.gmail.com',
                    service: "gmail",
                    port: 465,
                    secure: true,
                    auth: {
                        user: "adhilahammed0@gmail.com",
                            pass: "kwicqvjeipyzfgmy"
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
        
                });
                const mailDetails = {
                    from: "adhilahammed0@gmail.com",
                    to: userDataa.email,
                    subject: "just testing nodemailer",
                    text: "just random texts ",
                    html: '<p>hi ' + user.name + 'your otp ' + otpGenerator + ''
                    
                }
                mailTransporter.sendMail(mailDetails, (err, Info) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("email has been sent ", Info.response);
                    }
                })
            } catch (error) {
                console.log(error.message);
            }
        
            resolve(newUser)
        }else{
            reject({status:false,msg:"email not rajisterd,Please sign up!"})
        }
          })
        },
        resetPassword:(newp,userId1)=>{
          return new Promise(async(resolve,reject)=>{

            let response={}
            newp.passwordnew=await bcrypt.hash(newp.passwordnew,10)

            let userId=userId1

            let resetUser=await userData.findByIdAndUpdate(
                   {_id:userId},
                   {$set:{password:newp.passwordnew}}

            )
              resolve(resetUser)
          })
        },
        addToCart:(proId,userId)=>{
            return new Promise(async(resolve,reject)=>{
                const product=await productData.findOne({_id:proId})
                // console.log(product);
                  const usercart=await cartmodel.findOne({user:userId})
                 
                    if(usercart){
                        
                       const proExist=usercart.products.findIndex(
                           (products)=> products.pro_id == proId
                           
                       )
                      
                    //    console.log(proExist);  
                       if(proExist!=-1){
                        //    console.log(proId);
                           cartmodel
                           
                           .updateOne(
                               {'products.pro_id':proId,'products.Name':product.Name,user:userId},
                               {
                                   $inc:{'products.$.quantity':1},
                                   
                               },
                           )
                           .then((response)=>{
                               resolve()
                           })
                              
                       }
                       else{
                          console.log('aaaaaaaaaaaaaaa');
                          await cartmodel
                           .findOneAndUpdate(  
                               {user:userId},
                               {
                                   $push:{
                                       products:{
                                        pro_id:proId,
                                        price:product.Price,
                                        Name:product.Name
                                       
                                       }}
                               }
                               
                           ).then(()=>{
                            resolve({msg:"'Added,count:res.products.length+1"})
                        })
                          
                             
                       }
                    }
                    else{
                        console.log('bbbbbbbbbbbbbbbbbb')  
                        console.log(product.Price);   
                        const cartObj=new cartmodel({
                            user:userId,
                            
                            products:{
                                pro_id:proId,
                                        price:product.Price,
                                        Name:product.Name
                            }
                        })
                       await cartObj
                        .save(async(err,result)=>{
                            
                            if(err){
                               resolve({error:'cart not created'})
                            }
                            else{
                                // console.log('hallo');
                                resolve({
                                    msg:'cart is added',count:1
                                    
                                })
                            }
                        })
                        
                           
                       
                    }
            })
        },
        getCartCount:(userId)=>{
           return new Promise(async(resolve,reject)=>{
              
               const user=await  cartmodel.findOne({user:userId})
              
              
            if(user){
                count=user.products.length
                // console.log(user);
                resolve(count)
                // console.log(count);  
            }else{
                let count=0
                resolve(count)    
            }

           })
        },
        cartItems:(userId)=>{
            return new Promise(async(resolve,reject)=>{
                console.log('jhgjhfghjfgfghgfh');
                const cartDetails=await cartmodel.findOne({user:userId}).populate('products.pro_id').lean()
                resolve(cartDetails)
            })
        },
        changeProductQuantity:(data,user)=>{       
            console.log(data);    
                // console.log(data.count);
                cart=data.cartid
                proId=data.product
                quantity=data.quantity
                count==data.count
                // console.log(count);
                const procount=parseInt(count)
                console.log(procount);
                // console.log(data.count);
                console.log(data.quantity);
            return new Promise(async(resolve,reject)=>{       
                 
                   
             
               console.log(data.count);

                if(data.count==-1&&quantity==1){    
                    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa');
                    await cartmodel.findOneAndUpdate({user:user._id},
                        {$pull:{products:{_id:cart}}}
                        ).then((response)=>{
                            resolve({removeProduct:true})
                        })
                       
                }else{
                    await cartmodel.findOneAndUpdate(
                        {user:user._id,'products.pro_id':data.product},
                        {$inc:{'products.$.quantity':data.count}}
                    ).then((response)=>{
                        resolve(true)    
                    })
                    
                }
             
            })
        },
        subTotal:(user)=>{
            let id=mongoose.Types.ObjectId(user)
            
            return new Promise(async(resolve,reject)=>{        
               
                const amount=await cartmodel.aggregate([
                  
                 {$match:{user:id}},
                {$unwind:"$products"},
                 {$project:{
                    id:"$products.pro_id",
                    total:{$multiply:["$products.price","$products.quantity"]}     
                 }}

                ])
                console.log('aaaaaaaaaaaaaaaaaaaaaa');
                console.log(amount);
                 
                let cartdata=await cartmodel.findOne({user:id})
               
                if(cartdata){
                    amount.forEach(async(amt)=>{
                        await cartmodel.updateMany({"products.pro_id":amt.id},
                        {$set:{"products.$.subtotal":amt.total}}
                        )

                    })
                   
                    console.log(cartdata);
                    resolve(cartdata)
                }
            })
        },
        totalAmount:(userData)=>{
            const id=mongoose.Types.ObjectId(userData)
            
               
            return new Promise(async(resolve,reject)=>{
                const total=await cartmodel.aggregate([
                    {$match:{user:id}},
                    {$unwind:'$products'},
                    {$project:{
                        quantity:'$products.quantity',
                        price: '$products.price'
                    }},
                    {
                        $project:{
                            Name:1,
                            price:1,
                            quantity:1
                        }  
                    },
                    {
                        $group:{
                            _id:null,
                            total:{$sum:{$multiply:['$quantity','$price']}}
                        }
                    }

                ])
                if(total.length==0){
                    resolve({status:true})
                }
                else{
                    let grandTotal=total.pop()
                    resolve({grandTotal,status:true})
                    
                }
            })
        },
        deliveryCharge:(nettotal)=>{
            return new Promise(async(resolve,reject)=>{
                if(nettotal>1000){
                    resolve(40)
                }else{
                    resolve(0)
                }
            })
        },
        grandTotal:(total,deliverycharge)=>{
           return new Promise(async(resolve,reject)=>{
            let grandtotal=total+deliverycharge
            resolve(grandtotal)
           })
        },
        removeFromCart:(data,user)=>{
            return new Promise(async(resolve,reject)=>{
                await cartmodel.findOneAndUpdate({user:user._id},
                   {
                       $pull:{products:{_id:data.cart}}
                   } 
                    ).then((response)=>{
                        resolve({removeProduct:true})               
                    })
            })
        },
        addToWishlist:(proId,userId)=>{
            return new Promise(async(resolve,reject)=>{
                const userdt=await wishlistmodel.findOne({user_id:userId})
                if(userdt){
                    const proExist=userdt.products.findIndex(
                        (products)=> products.pro_Id==proId
                    )
                    if(proExist!=-1){
                        // resolve({error:'product already in the wishlist'})
                        reject()
                        console.log('aaaaaaaaaaaaaaa');
                        
                    }
                    else{
                        await wishlistmodel
                        .findOneAndUpdate(
                            {user_id:userId},
                            {$push:{products:{pro_Id:proId}}}
                        )
                        resolve({msg:'added'})
                    }
                }
                else{
                    const newwishlist=new wishlistmodel({     
                        user_id:userId,
                        products:{pro_Id:proId}
                    })
                    await newwishlist.save((err,result)=>{
                        if(err){
                            resolve({msg:'not added to wishlist'})
                        }
                        else{
                            resolve({msg:'new wishlist is created'})
                        }
                    })
                }
            })
        },
        showWishlist:(userId)=>{
            console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
            console.log(userId);
            return new Promise(async(resolve,reject)=>{             
                const wishlist=await wishlistmodel.
                findOne({user_id:userId._id})
                .populate('products.pro_Id')
                .lean()
               
                resolve(wishlist)
            })
        },
        getWishlistCount:(userId)=>{
            return new Promise(async(resolve,reject)=>{             
               
                const user=await  wishlistmodel.findOne({user_id:userId})      
               
               
             if(user){
                 count=user.products.length
                //  console.log(user);
                 resolve(count)
                //  console.log(count);  
             }else{
                 let count=0
                 resolve(count)    
             }
 
            })
         },
         deleteFromWishlist:(data,userId)=>{   
            console.log(data); 
            console.log(userId);       
             return new Promise(async(resolve,reject)=>{
             let product=await wishlistmodel.findOneAndUpdate({user_id:userId},             
                {
                    $pull:{products:{_id:data.cart}}

                    
                }
                
                ).then((response)=>{
                    resolve({removefromwishlist:true})
                })
            })
         },
        addAddress:(userId,data)=>{
            return new Promise(async(resolve,reject)=>{
              const user=userData.findOne({_id:userId})
              await userData.findOneAndUpdate(
                {_id:userId},
                {
                  $push: { 
                    address: {
                      fullname:data.fname,
                      lastname:data.lname,
                      house:data.house,
                      town:data.towncity,
                      district:data.district,
                      state:data.state,
                      pin:data.pincode, 
                      email:data.email,
                      phone:data.mobile
                    },
                  },
        
                })   
                resolve();
             })
        
            },
        
            getAddresses:(user)=>{        
            return new Promise(async(resolve,response)=>{
              const Addresses=await userData.findOne({_id:user}).lean()
              // console.log(Addresses.address);
              resolve(Addresses)
            })
            }, 

            deleteAddress:(adressId,userId)=>{
               
              return new Promise(async(resolve,reject)=>{
                console.log('kkkkkkkkkkkkkkkkkkkk');
              let addressdlt=await userData.findOneAndUpdate({_id:userId},
                
                {
                    $pull:{address:{_id:adressId}}
                }
                ).then((response)=>{
                    resolve({removeaddress:true})
                })
             
             
                })
            },
            Editprofile: (data, userId) => {
                return new Promise(async (resolve, reject) => {
                  const Editproflie = await userData.findByIdAndUpdate(
                    { _id: userId },
                    { $set: { name: data.name,  email: data.email } }
                  );
                  resolve(Editproflie);
                });
              },
            placeOrder:(order,items,gratotal,DeliveryCharges,net,user)=>{
                return new Promise(async(resolve,reject)=>{
                  // console.log(net);
                  let id=mongoose.Types.ObjectId(user._id);
                  const status=order.paymentMethod==='cod'?'placed':'pending'    
                  // console.log(order.paymentMethod);
                  // console.log(items.products);
                  const newobj=await orderData({
  
                     
                    address:{ fullname:order.fname,     
                      phone:order.number,
                      email:order.email,
                      house:order.house,
                      locality:order.localplace,
                      town:order.town,
                      district:order.district,    
                      state:order.state,
                      pin:order.pincode    
                    },
                    grandTotal:order.mainTotal, 
                    ShippingCharge:DeliveryCharges,     
                    coupondiscountedPrice:order.discountedPrice,   
                    couponPercent:order.discoAmountpercentage,
                    couponName:order.couponName,
                    total:order.total,
                    userId:user._id,
                     products:items.products,
                     paymentmethod:order.paymentMethod,     
                    
                     status:status,
                     ordered_on:new Date(),        
                  })
                  await newobj.save(async(err,res)=>{
                      const data=await cartmodel.aggregate([
                        {
                          $match:{user:id}
                        },
                        {  
                          $unwind:'$products',
                        },
                        { 
                          $project:{
                            quantity:'$products.quantity',  
                            id:'$products.pro_id'
                          }, 
                        },
                      ]);
                      console.log("======================================");
                      console.log(data+'');
                      data.forEach(async(amt)=>{
                        await productData.findOneAndUpdate({
                          _id:amt.id
                        },{$inc:{stock:-(amt.quantity)}})
                      })
                     await cartmodel.remove({user:order.userId})   
                
                      resolve(newobj);     
                    })
                  })
                  }, 
            validateCoupon: (data, userId) => {
                console.log(data);
              return new Promise(async (resolve, reject) => {
                // console.log(data.coupon);
                obj = {};
                
      
      
               const coupon =await couponModel.findOne({ couponCode: data.coupon });
                if (coupon) {
                  if (coupon.limit > 0) {
                    checkUserUsed = await  couponModel.findOne({        
                      couponCode: data.coupon,
                      usedUsers: { $in: [userId] },
                    });
                    if (checkUserUsed) {
                      obj.couponUsed = true;
                      obj.msg = " You Already Used A Coupon";
                      console.log(" You Already Used A Coupon");
                      resolve(obj);
                    } else {
                      let nowDate = new Date();
                          date = new Date(nowDate);
                          console.log(date)
                      if (date <= coupon.expirationTime) {
                        
                        await couponModel.updateOne(
                          { couponCode: data.coupon },
                          { $push: { usedUsers: userId } }
                      );
      
                      await couponModel.findOneAndUpdate(
                          { couponCode: data.coupon },
                          { $inc: { limit: -1 } }
                      );
                        let total = parseInt(data.total);
                        let percentage = parseInt(coupon.discount);
                        let discoAmount = ((total * percentage) / 100).toFixed()
                        // console.log();
                        obj.discoAmountpercentage=percentage;
                        obj.total = total - discoAmount;
                        obj.success = true;
                        resolve(obj);
                      } else {
                        obj.couponExpired = true;
                        console.log("This Coupon Is Expired");
                        resolve(obj)
                      }
                    } 
                  }else{
                    obj.couponMaxLimit = true;
                    console.log("Used Maximum Limit");
                    resolve(obj)
                  }
                } else {
                  obj.invalidCoupon = true;
                  console.log("This Coupon Is Invalid");
                  resolve(obj)
                }
              });
            },

            

            // getOrders:(user)=>{
                
            //     return new Promise(async(resolve,reject)=>{
            //       const allorders=await orderData.find().lean()
            //       console.log(allorders);
            //     resolve(allorders)
          
            //     })
            //   },

              getOrders:(user)=>{
                
                return new Promise(async(resolve,reject)=>{
                  const allorders=await orderData.find({userId:user}).populate("products.pro_id").lean()
                //   console.log(allorders);
                resolve(allorders)
          
                })
              },

            getAllOrders:(orderid)=>{
                console.log(orderid);
                return new Promise(async(resolve,reject)=>{    
                    const orderdetails=await orderData.findOne({_id:orderid}).populate("products.pro_id").lean()
                   console.log(orderdetails);
                    resolve(orderdetails)           
               })
            },

            cancelOrder:(data)=>{
                console.log(data);
    order=mongoose.Types.ObjectId(data.orderId);
    let quantity = parseInt(data.quantity);
    console.log(parseInt(data.couponPercent));

    discountPrice =
    parseInt(data.subtotal) -((parseInt(data.couponPercent) * parseInt(data.subtotal)) /100).toFixed(0);

    // console.log("==============================");
    console.log(discountPrice);
    const status='Cancelled'
    return new Promise (async(resolve,reject)=>{
      const cancelorder=await orderData.updateMany({_id:data.orderId,'products.pro_id':data.proId},
      {
       $set:{
        "products.$.status":status, 
        "products.$.orderCancelled":true,   
        
      },
    
      $inc:{
        grandTotal: -discountPrice,  
        "products.$.subtotal":-(parseInt(data.subtotal)),  
        // totalAmountToBePaid: -discountPrice,
        reFund: discountPrice,
        
      }
    },
    // { upsert: true }
    )

    await productData.findOneAndUpdate({_id:data.proId}, 
      {
        $inc:{
            stock:quantity
        }
      });

      let products = await orderData.aggregate([
        {
          $match: { _id:order },    
        },

        {
          $project: {
            _id: 0,
            products: 1,
          },
        },
        {
          $unwind: "$products",
          //   $unwind:'$deliveryDetails'
        },
        // {
        //   $project: {
        //     item: "$products.item",
        //     quantity: "$products.quantity",
        //     orderStatus: "$products.orderStatus",
        //   },
        // },
        {
          $match: { "products.orderCancelled": false },
        },
      ])
  console.log(products);
  if (products.length == 0) {
    // console.log(
    //   "agbDDDDDDDDDDDDDDDDDDDDDDDDDDDGGGGGGGGGGGGGGGGGGGGGGGGGGG"
    // );
    await orderData.updateMany(
        { _id: data.orderId},
        {
          $inc: { reFund: 40, grandTotal: -40 },
        }
      );
    resolve({ status: true });
  } else {
    resolve({ status: true });
  }
  
  // resolve() 
    })
  }, 
            razorpayPayment:(orderId,amount)=>{                 
                return new Promise((resolve,reject)=>{
                    console.log('3333333333333333333333333');
                    console.log(amount);
                    console.log(orderId);
                 var options={
                    amount:amount*100,
                    currency:"INR",
                    receipt:""+orderId
                 }
                 instance.orders.create(options,function(err,order){
                    resolve(order)
                    console.log(order);
                 })
                })
            },

            verifyPayment:(details)=>{
                //  
                return new Promise((resolve,reject)=>{
                    let crypto = require("crypto");
                    let hmac = crypto.createHmac('sha256','IYQ7DAuK4AvQMrj2TopM2geC')
            
                    hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
                    hmac=hmac.digest('hex')
                    if(hmac==details['payment[razorpay_signature]']){
                      resolve()
                    }else{
                      reject()
                    }
                  })
            },
            changePaymentstatus:(orderId)=>{
                console.log(orderId);
                return new Promise(async(resolve,reject)=>{
                   
                    let payment=await orderData.findOneAndUpdate({_id:orderId},
                        
                        {
                            $set:{status:'placed'}
                        }
                        ).then((payment)=>{
                           
                            resolve(payment)
                        })
                })
            },
            getSearchProducts: (key) => {
                return new Promise(async (resolve, reject) => {
                  let products = await productData
                   
                    .find({
                      $or: [
                        { Name: { $regex: new RegExp("^" + key + ".*", "i") } },
                        // { Brand: { $regex: new RegExp("^" + key + ".*", "i") } },
                        // { Category: { $regex: new RegExp("^" + key + ".*", "i") } },
                      ],
                    })
                    .lean();
                  resolve(products);
                });
              },
              searchFilter :(brandFilter,categoryFilter,price) => {
      

                return new Promise(async (resolve, reject) => {
                    let result
            
                    if(brandFilter && categoryFilter  ){
                      let brandid=mongoose.Types.ObjectId(brandFilter);
                      let categoryid=mongoose.Types.ObjectId(categoryFilter)
                      console.log(brandid);
                      console.log(categoryid);
                         result = await productData.aggregate([
                            {
                                $match:{Brand:brandid}
                                
                            },
            
                            {
                                $match:{Category:categoryid}
                                
                            },
                            {
                                $match:{Price:{$lt:price}}
                            }
                        ])
                        console.log("1");
                    } 
            
                    else if(brandFilter  ){
                      let brandid=mongoose.Types.ObjectId(brandFilter);
                        result = await productData.aggregate([
                          {
                            $match:{Brand:brandid}
                            
                          },
                          {
                            $match:{Price:{$lt:price}}
                          }
                        ])
                        console.log("2");
                        console.log(result);
                        
                      }
                      else if(categoryFilter){
                        let categoryid=mongoose.Types.ObjectId(categoryFilter)
                    result = await productData.aggregate([
                      
                       
                        {  
                            $match:{Category:categoryid}
                            
                        },
                        {
                            $match:{Price:{$lt:price}}
                        }
                    ])
                    console.log("3");
                  }
                
                    else{
                         result = await productData.aggregate([
                            
                            {
                                $match:{Price:{$lt:price}}
                            }
                        ])
                        console.log("4");
                    }
                    resolve(result)
                })
              }, 
              singleProduct:(proId)=>{          
                return new Promise(async(resolve,reject)=>{
                    const product=await productData.findOne({_id:proId}).lean()
                    resolve(product)
                })
              },
              getProductBrand:(brandId)=>{
                console.log(brandId);
                
                return new Promise(async(resolve,reject)=>{

                   let result
            
                    
                      let brandid=mongoose.Types.ObjectId(brandId);
                    //   let categoryid=mongoose.Types.ObjectId(categoryFilter)
                    //   console.log(brandid);
                    //   console.log(categoryid);
                         result = await productData.aggregate([
                            {
                                $match:{Brand:brandid}
                                
                            },
            
                            // {
                            //     $match:{Category:categoryid}
                                
                            // },
                            // {
                            //     $match:{Price:{$lt:price}}
                            // }
                        ])
                       
                        resolve(result)
                        console.log(result);
                   
            
                })
              },
              getOneProduct:()=>{
                return new Promise(async(resolve,reject)=>{
                    let products=await productData.find().limit(1).sort({_id:1}).lean()    
                    resolve(products)
                })
              }
             

    }



      
    
