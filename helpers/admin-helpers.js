
let db=require('../config/connection')   
const adminData=require('../models/admin')
const userData=require('../models/user')
const brands=require('../models/brands')
const bcrypt = require('bcrypt')
const category = require('../models/category')
const productData=require('../models/products')
const product = require('../models/products')
let orderData=require('../models/order')
const couponModel=require('../models/coupon')


module.exports={
//    adminLogin:(adminDat)=>{         
//      return new Promise(async(resolve,reject)=>{
//        let response={}

//        let admin=await adminData.findOne({email:adminDat.email})
//      console.log(admin);
//      if(admin){
//        console.log('admin');
//          bcrypt.compare(adminDat.password,admin.password).then((result)=>{
//             if(result){
//              console.log('login success');
//                 response.admin=admin
//                 response.status=true
//                 resolve(response)
//             }
//             else{
//                 console.log('login failed');
//                 response.status=false
//                 resolve(response)
//             }
//   })
//  }
//  else{
//     console.log('login failed 2');
//     resolve({status:false})
//  }
//      })
    
//     },
    getAllUsers:()=>{
      return new Promise(async(resolve,reject)=>{
        let users=await userData.find().lean()
        resolve(users)
      })
    },
    getOneUser:(userId)=>{
      return new Promise(async(resolve,reject)=>{
        let users=await userData.findOne({_id:userId}).lean()
        resolve(users)
      })
    },
    blockUser:(userId)=>{
      return new Promise(async(resolve,reject)=>{
        const user=await userData.findByIdAndUpdate({_id:userId},{$set:{block:true}},{upsert:true})
        resolve(user)
      })
    },

    unBlockUser:(userId)=>{
       return new Promise(async(resolve,reject)=>{
         const users=await userData.findByIdAndUpdate({_id:userId},{$set:{block:false}},{upsert:true})
         resolve(users)
       })
    },

    addBrandName:(data,image1)=>{
       return new Promise(async(resolve,reject)=>{
         console.log(data);
         const brandnames=data.BrandName
         console.log(brandnames);
         const brand=await brands.findOne({BrandName:brandnames})           
         if(brand){      
           console.log(brand);
           reject({status:false,msg:'Brand already taken'})
         }
         else{
           const addbrand=await new brands({
             BrandName:brandnames,
             Image:{image1}
           })
           await addbrand.save(async(err,result)=>{
             if(err){
               reject({msg:'Brand not added'})
             }else{
               resolve({result,msg:'Brand added'})
             }
           })
         }
       })

    },
    getBrand:()=>{
      return new Promise(async(resolve,reject)=>{
        let brand=await brands.find().lean()
        resolve(brand)
      })
    },
    
    deleteBrand:(id)=>{
      return new Promise(async(resolve,reject)=>{
        let bradds=await brands.findByIdAndDelete({_id:id})
        resolve(bradds)
      })
    },

    addCategory:(data)=>{
      return new Promise(async(resolve,reject)=>{
        const categoryname=data.CategoryName
        console.log(categoryname);
        const categ=await category.findOne({CategoryName:categoryname})
        if(categ){
          reject({status:false,msg:'category already taken'})

        }
        else{
          const addcategory=await new category({
            CategoryName:categoryname
          })
          await addcategory.save()
          resolve(addcategory)
        }
      })
    },
    getCategory:()=>{
      return new Promise(async(resolve,reject)=>{
        let categorys=await category.find().lean()
        resolve(categorys)
      })
    },
    deleteCategory:(id)=>{
      return new Promise(async(resolve,reject)=>{
        let cattags=await brands.findByIdAndDelete({_id:id})
        resolve(cattags)
      })
    },
    
   addProduct:(data,image1,image2,image3,image4)=>{
     return new Promise(async(resolve,reject)=>{

      Mrp = parseInt(data.Mrp)
      Prize = (Mrp) - (Mrp*data.discount*0.01).toFixed(0)
      console.log(Prize);
        console.log(data);
        console.log(data.brand);
      const branddata=await brands.findOne({BrandName:data.brand})
      console.log(data.category);
      
      console.log(data);
      const categorydata=await category.findOne({CategoryName:data.category})
      console.log(categorydata);
        console.log(branddata);
      // if(!image2){
      //   reject({msg:'upload image'}) 
      // }
      // else{
        const newproduct=await productData({              
          Name:data.productName,
          Discount:data.discount, 
          Color:data.colour,
          mrp: data.Mrp,
          Price:Prize,
          stock:data.stock,
          Category:categorydata._id,
          Brand:branddata._id,
          Image:{image1,image2,image3,image4}
        })
        await newproduct.save(async(err,res)=>{
          if(err){

          }
          resolve({data:res,msg:'success'})
        })
      // }
     })
   },
   getAllProducts:()=>{
     return new Promise(async(resolve,reject)=>{              
       let products=await product.find().lean()      
       resolve(products)
     })
   },
  
   getAllProductslimit:()=>{
    return new Promise(async(resolve,reject)=>{
      let products=await product.find().limit(4).lean()        
      resolve(products)     
    })
  },
   deleteProduct:(proId)=>{
     return new Promise(async(resolve,reject)=>{
       let productId=proId
       const removedProduct=await productData.findByIdAndDelete({_id:productId})
       resolve(removedProduct)
     })
   },
   getProductDetails:(proId)=>{
     return new Promise(async(resolve,reject)=>{
       const getproductdetails=await productData.findOne({_id:proId}).lean().then((getproductdetails)=>{
         resolve(getproductdetails)
       })
     })
   },
   updateProduct:(data,proId,image1,image2,image3,image4)=>{
      return new Promise(async(resolve,reject)=>{

        Mrp = parseInt(data.Mrp)
        Prize = (Mrp) - (Mrp*data.discount*0.01).toFixed(0)

           console.log(data.brand);
        const branddata=await brands.findOne({BrandName:data.brand})
       
        const categorydata=await category.findOne({CategoryName:data.category})
        const update=await productData.findByIdAndUpdate({_id:proId},
          {$set:{
            Name:data.productName,
            Discount:data.discount,
            Color:data.colour,
            mrp: data.Mrp,
            Price:Prize,
            stock:data.stock,
            Category:categorydata._id,
            Brand:branddata._id,
            Image:{image1,image2,image3,image4}             

          }}
          
          )
          
          resolve({update,msg:'success'})

      })
   },
   getOrders:()=>{
     return new Promise(async(resolve,reject)=>{

      let orders=await orderData.find().lean()
      resolve(orders)
     })
    
   },

   getAllOrders:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
    
      let orderdetails=await orderData.findOne({_id:orderId}).populate('products.pro_id').lean()
      resolve(orderdetails)
    })
   },

   changeOrderStatus:(data)=>{        

    console.log(data);
    return new Promise(async(resolve,reject)=>{

      let orders=await orderData.findOneAndUpdate({_id:data.orderId,'products._id':data.proId},
          
      {
        $set:{'products.$.status':data.orderStatus}
      }
      
      )
        resolve(orders)
        console.log(orders);
        console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
   
     

    })

   },
   addCoupon:(data)=>{
    console.log(data);
    return new Promise(async(resolve,reject)=>{
      console.log('aaaaaaaa');      
      const newcoupen=await couponModel({
          couponName:data.couponName,
          couponCode:data.couponCode,
          limit:data.Limit,
          discount:data.discount,
          expirationTime:data.ExpireDate       
      })
      await newcoupen.save(async(err,res)=>{
        console.log(newcoupen);
       if(err){
console.log('111111111111');
       }
       else{
      resolve({data:res,msg:'success'})
       }
      })
      
    })
   },
   getCoupon:()=>{
    return new Promise(async(resolve,reject)=>{
      let coupon=await couponModel.find().lean()
      resolve(coupon)
    })
   },
   removeCoupon:(couponId)=>{
    return new Promise(async(resolve,reject)=>{
    console.log(couponId);
    let coupon=await couponModel.findOneAndUpdate({_id:couponId},
      {
        $pull:{}
      }
      
      )
    })
   }

    
}

