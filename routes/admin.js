var express = require('express');
const { response } = require('../app');
var router = express.Router();
const adminHelper=require('../helpers/admin-helpers')
const admin=require('../models/admin')
const userHelper=require('../helpers/user-helpers')
var Storage=require('../middleware/multer')

let verifyLogin = (req, res, next) => {
  if (req.session.adminloggedIn) {
    next();
  } else {
    res.redirect("/admin");
  }
};

router.get('/', function(req, res, next) {
  if(req.session.adminloggedIn){
    res.redirect('/admin/adminhome')
  }else{
    res.render('admin/adminlogin',{layout:false,});     
  }
   
  }); 

  router.get('/adminhome', function(req, res, next) {
    if(req.session.adminloggedIn){
      res.render('admin/home',{layout:false,});
    }else{
      res.redirect('/admin')
    }
    
  });

 


  router.post('/Adminlogin', function(req, res, next) {
    console.log('hello');
    const pass=1234
    const em="adhil@gmail.com"
    console.log(req.body);
    if (em == req.body.email && pass == req.body.password) {
      req.session.adminloggedIn = true
      req.session.admin = req.body
  
      res.redirect('/admin/adminhome')
    } else {
      req.session.adminloggedInErr=true
      res.redirect('/admin')
    }

});

router.get('/Users',verifyLogin, function(req, res, next) {
  adminHelper.getAllUsers().then((users)=>{

    res.render('admin/usermanagement',{layout:false,users});
})
}); 

router.get('/Blockuser/:id', function(req, res, next) {
  adminHelper.blockUser(req.params.id).then((id)=>{
    res.redirect('/admin/Users')
    
  })

  }); 

  router.get('/UnBockuser/:id', function(req, res, next) {                     
    adminHelper.unBlockUser(req.params.id).then((id)=>{
      res.redirect('/admin/Users')
    
    })
  
    }); 


router.get('/Products',verifyLogin,async function(req, res, next) {           
  adminHelper.getAllProducts().then((prods)=>{
    res.render('admin/productmanag',{layout:false,prods});
  })
})

router.get('/addproducts',verifyLogin, async function(req, res, next) {
  const brands=await adminHelper.getBrand()
  const categs=await adminHelper.getCategory()

    res.render('admin/productadd',{layout:false,brands,categs});
  })
 


router.get('/Addbrand',verifyLogin, function(req, res, next) {
  
  res.render('admin/addbrand',{layout:false});   
})

router.post('/brandadd',Storage.fields([{name:'image1',maxCount:1}]),
 function(req, res, next) {
  let img1=req.files.image1[0].filename;
  console.log(req.body)
  adminHelper.addBrandName(req.body,img1).then((response)=>{
    console.log(response);
    res.redirect('/admin/listbrands')  
  })
  .catch((error)=>{
    console.log('fahhhhh');
    res.redirect('/admin/Addbrand')   
  })
})

router.get('/listbrands',verifyLogin,async(req,res)=>{
  const bratts=await adminHelper.getBrand()
  res.render('admin/brandlist',{layout:false,bratts})
})

router.get('/deletebrand/:id',(req,res)=>{
 adminHelper.deleteBrand(req.params.id).then((response)=>{
   res.redirect('/admin/listbrands')
 })
})

router.get('/categoryadd', verifyLogin,function(req, res, next) {
  
  res.render('admin/addcategory',{layout:false});
})

router.post('/categadd', function(req, res, next) {
  
  adminHelper.addCategory(req.body).then((response)=>{
    res.redirect('/admin/Products');
  }).catch((error)=>{
    res.redirect('/admin/listcategs')
  })
  
})

router.get('/listcategs',verifyLogin,async(req,res)=>{
  const cattags=await adminHelper.getCategory()
  res.render('admin/categorylist',{layout:false,cattags})
})

router.get('/deletecategory/:id',(req,res)=>{
  adminHelper.deleteCategory(req.params.id).then((response)=>{    
    res.redirect('/admin/listcategs')
  })
 })

router.post('/productsAdd',Storage.fields([{name:'image1',maxCount:1},    
{name:'image2',maxCount:1},
{name:'image3',maxCount:1},
{name:'image4',maxCount:1}
]),  function(req, res, next) {
  
  let img1=req.files.image1[0].filename;
  let img2=req.files.image2[0].filename;
  let img3=req.files.image3[0].filename;
  let img4=req.files.image4[0].filename; 
  console.log(req.body);
  adminHelper.addProduct(req.body,img1,img2,img3,img4).then((response)=>{
    res.redirect('/admin/Products');
    console.log(response);
  })

    
  })

  router.get('/deleteproduct/:id',(req,res)=>{     
    const proId=req.params.id
    adminHelper.deleteProduct(proId).then((response)=>{
      req.session.removedPro=response
      res.redirect('/admin/products')
    })
    console.log(proId);
  })

  router.get('/editproducts/:id',verifyLogin,async(req,res)=>{
    let product=await adminHelper.getProductDetails(req.params.id)
    console.log(product);

    const brands=await adminHelper.getBrand()
  const categs=await adminHelper.getCategory()

  res.render('admin/editproducts',{brands,categs,product,layout:false})

  })

  router.post('/Editproduct/:id',Storage.fields([{name:'image1',maxCount:1},
{name:'image2',maxCount:1},
{name:'image3',maxCount:1},
{name:'image4',maxCount:1}
]),  function(req, res, next) {   
  
  let img1=req.files.image1?req.files.image1[0].filename:req.body.image1
  let img2=req.files.image2?req.files.image2[0].filename:req.body.image2
  let img3=req.files.image3?req.files.image3[0].filename:req.body.image3
  let img4=req.files.image4?req.files.image4[0].filename:req.body.image4
  console.log(req.body);
  console.log('hai');
  adminHelper.updateProduct(req.body,req.params.id,img1,img2,img3,img4).then((response)=>{
    res.redirect('/admin/Products');
    console.log(response); 
  })

    
  })

  router.get('/order-management',(req,res)=>{
    adminHelper.getOrders().then((response)=>{
      let order=response
      console.log(order);
      res.render('admin/order-management',{layout:false,order})
    })
    
  })

  router.get('/list-order/:id',(req,res)=>{
    adminHelper.getAllOrders(req.params.id).then((response)=>{

      console.log(response);
     let orderdetails=response
      res.render('admin/order-receipt2',{layout:false,orderdetails})        
    })
   
  })

  // router.get('/listorder',(req,res)=>{
  //   res.render('admin/order-receipt2',{layout:false})
  // })

  router.post('/changeOrderStatus',(req,res)=>{

    console.log(req.body);
    adminHelper.changeOrderStatus(req.body).then((orders)=>{
      console.log(orders);
      res.redirect('/admin/order-management')
    })
  })

  router.get('/add-coupon',(req,res)=>{

    res.render('admin/addcoupon',{layout:false})
  })

  router.post('/coupon',(req,res)=>{
    adminHelper.addCoupon(req.body).then(()=>{
      console.log('bbbbbbbbbbbbb');
      res.redirect('/admin/list-coupon')
    })
  })

  router.get('/list-coupon',(req,res)=>{
    adminHelper.getCoupon().then((response)=>{
      console.log(response);
      let coupon=response
      res.render('admin/coupon-management',{layout:false,coupon})          
    })
   
  })

  router.post('/remove-coupon',(req,res)=>{
    console.log(req.body);
    adminHelper.removeCoupon(req.body).then()
  })



  router.get('/logout', function(req, res, next) {
    req.session.adminlogout=true
    req.session.destroy()
    res.redirect('/admin');
  });








  
  module.exports = router;
  