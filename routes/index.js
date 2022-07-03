var express = require('express');
const { redirect } = require('express/lib/response');
const { response, request } = require('../app')
// const{response}=require('../app')
var router = express.Router();
const userHelper = require('../helpers/user-helpers')
const user = require('../models/user')
const products=require('../models/products')
const adminHelper = require('../helpers/admin-helpers')
var filterResult
// const admin=require('../models/admin')
// let db=require('../config/connection')


let verifyLogin = (req, res, next) => {   
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");   
  }
};

/* GET home page. */
router.get('/', async function (req, res, next) {  
  const prods = await adminHelper.getAllProducts()
  const brands=await adminHelper.getBrand()
  const products=await userHelper.getOneProduct()
  console.log(products);
  // console.log(brands);
  // console.log(prods);
  let user = req.session.user
  // console.log( req.session.user);
  let cartCount = null
  let wishlistCount= null
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
    wishlistCount= await  userHelper.getWishlistCount(req.session.user._id)              
    console.log( wishlistCount);
    console.log(cartCount);
  }

  res.render('user/index2', { admin: false, user, prods, cartCount , wishlistCount,brands,products});    
});

// router.get('/user', function(req, res) {
//   res.render('user/index', { admin:false});
// });

router.get('/login', function (req, res, next) {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', { error: req.session.loggedInErr,layout: false });
    req.session.loggedInErr= null
  }
});

router.get('/signup', function (req, res, next) {   

  res.render('user/signin', { err: req.session.loggErr2, layout: false });
  req.session.loggErr2 = null
});

// router.get('/signups', function(req, res, next) {
//   res.render('user/signin', {layout:false});
// });


router.post('/Signup', (req, res) => {
  // console.log(req.body);
  userHelper.doSignup(req.body)
    .then((response) => {
      // req.session.loggedIn = true;
      // console.log(response);
      req.session.userotp = response.otp;
      // console.log(req.session.user);
      console.log('hello');
      req.session.userdetails = response
      res.redirect("/otp");
    })
    .catch((err) => {
      req.session.loggErr2 = err.msg;
      console.log(err);
      res.redirect("/signup");
    });
})

router.get('/otp', (req, res) => {
  let user = req.session.userdetails;
  console.log(user);
  res.render("user/otp", { layout: false })
})

router.post('/otpverify', async (req, res) => {
  if (req.session.userotp == req.body.otpsignup) {
    let userData = req.session.userdetails
    const adduser = await new user({
      name: userData.name,
      // phonenumber: userData.Phone,
      email: userData.email,
      password: userData.password
    })
    await adduser.save()
    res.redirect('/login')
  }
  else {
    res.redirect('/otp')
  }
})

router.post('/login', (req, res) => {

  userHelper.doLogin(req.body).then((response) => {

    if (response.status) {
      req.session.user = response.user
      req.session.loggedIn = true;
      req.session.user = response.user;
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      res.redirect("/");
    } else {
      req.session.loggedInErr = true;
      res.redirect("/login");
    }
  }).catch((err)=>{
    res.redirect("/login")
  })
})

router.get("/logout", (req, res) => {
  req.session.logout = true;
  req.session.destroy();
  res.redirect("/login");
});

router.get("/email", (req, res) => {

  res.render("user/emailform", { layout: false });
});

router.get("/OtpS", (req, res) => {

  res.render("user/otp2", { layout: false });
});

router.get("/passwords", (req, res) => {
  console.log("fghjk");
  res.render("user/passwords", { layout: false });
});

router.post("/Email", (req, res) => {

  userHelper.doEmailVerify(req.body).then((response) => {
    req.session.userotp = response.otp
    req.session.userdetails = response
    req.session.userid = response._id
    console.log(req.session.userotp);
    console.log("shj");
    res.redirect('/OtpS')

  }).catch((err) => {
    req.session.loggErr2 = err.mes;
    res.redirect('/email')

  })
})



router.post("/otpPPP", (req, res) => {
  // res.redirect('/passwords')
  console.log('sdfs');
  console.log(req.body.otpsignup + "===");
  console.log(req.session.userotp + '2');
  if (req.session.userotp == req.body.otpsignup) {
    res.redirect('/passwords')
  }
  res.redirect('/email')
});

router.post("/passwordsconfirm", (req, res) => {

  if (req.body.passwordnew == req.body.passwordnew2) {
    userHelper.resetPassword(req.body, req.session.userid).then((response) => {

      res.redirect('/login')
      console.log('password changed');
    })
  }
  else {
    console.log('passwords mismatch');
  }
});

router.get("/add-to-cart/:id", verifyLogin, (req, res) => {

  userHelper.addToCart(req.params.id, req.session.user).then((response) => {
    
    res.json({ status: true })

  })

});

router.get("/cart",  async (req, res) => {
  let user=req.session.user
  if(!user){
          
  res.render('user/cart-empty')     
  }
  if(user){
    let cartCount = await userHelper.getCartCount(req.session.user._id)
  const wishlistCount=await userHelper.getWishlistCount(req.session.user._id) 
  if(cartCount>0){
    let cartCount = await userHelper.getCartCount(req.session.user._id)
  const wishlistCount=await userHelper.getWishlistCount(req.session.user._id)           
  let cartItem = await userHelper.cartItems(req.session.user._id)
  

  const subtotals = await userHelper.subTotal(req.session.user._id)
  console.log(subtotals);
  const totalAmount = await userHelper.totalAmount(req.session.user._id)             
  const netTotal = totalAmount.grandTotal.total
  
  console.log(netTotal);
  const Delivery = await userHelper.deliveryCharge(netTotal)
  console.log(Delivery);
  const grandtotal = await userHelper.grandTotal(netTotal, Delivery)     
  console.log(grandtotal);
  res.render('user/cart', { user, cartItem, netTotal, cartCount, Delivery, grandtotal, subtotals,wishlistCount })
}else{

  let cartItem = await userHelper.cartItems(req.session.user._id)
  let cartItems = cartItem ? products : [];
  netTotal = 0;
  cartCount = 0; 
  Delivery = 0;
  grandTotal = 0;
    res.render('user/cart-empty', {
      user,
      wishlistCount,
      cartItem,
      netTotal,
      cartCount,
      Delivery,
      grandTotal,
    });
}
}
});

router.post("/change-product-quantity", async (req, res) => {
  // console.log(req.body);

  userHelper.changeProductQuantity(req.body, req.session.user).then(() => {       
    res.json({ status: true })
    console.log('haaaaaaaaaaaaaaaaaaaaaaaa');      
  })


});

router.post("/remove-product-from-cart", async (req, res) => {
  // console.log(req.body);

  userHelper.removeFromCart(req.body, req.session.user).then(() => {
    res.json({ status: true })
    console.log('haaaaaaaaaaaaaaaaaaaaaaaa');
  })


});

router.get("/add-to-wishlist/:id",verifyLogin, async (req, res) => {    
  // console.log(req.body);

  userHelper.addToWishlist(req.params.id, req.session.user._id).then((response)=>{
    res.json({status:true})
  }).catch((err)=>{
    res.json({statu:true})
  
 
 })
 
});

router.get('/show-wishlist', (req,res)=>{      
  let user      = req.session.user  
  if(!user){
          
    res.render('user/wishlist-empty') 
  }   
else{userHelper.showWishlist(req.session.user).then(async(response)=>{                  
    
  const wishlist=response
  console.log(wishlist);
  const wishlistCount=await userHelper.getWishlistCount(req.session.user._id)   
  const cartCount = await userHelper.getCartCount(req.session.user._id)
 
  if(wishlistCount==0){
    res.render('user/wishlist-empty',{user,wishlist,wishlistCount,cartCount})       
  }  else{
    res.render('user/wishlist',{user,wishlist,wishlistCount,cartCount})    
  }         
})
}
 
})

router.post('/delete-from-wishlist',(req,res)=>{
  userHelper.deleteFromWishlist(req.body,req.session.user._id).then(()=>{           
    res.json({status:true})
  })
})


router.get("/checkout-page", verifyLogin, async (req, res) => {
  const Addresses = await userHelper.getAddresses(req.session.user)
  const cartItem = await userHelper.cartItems(req.session.user._id)
  const totalamount = await userHelper.totalAmount(req.session.user._id)
  const netTotal = totalamount.grandTotal.total
  const DeliveryCharges = await userHelper.deliveryCharge(netTotal)
  const grandTotal = await userHelper.grandTotal(netTotal, DeliveryCharges)
  const ALLCOUPONS=await adminHelper.getCoupon()
  console.log(ALLCOUPONS);
  console.log(grandTotal);
  
  res.render('user/checkout', { layout: false, grandTotal,cartItem,DeliveryCharges,Addresses,netTotal,ALLCOUPONS})



});

router.post("/place-order", async (req, res) => {     
  const Addresses = await userHelper.getAddresses(req.session.user)
  const cartItem = await userHelper.cartItems(req.session.user._id)
  const totalamount = await userHelper.totalAmount(req.session.user._id)     
  const netTotal = totalamount.grandTotal.total
  const DeliveryCharges = await userHelper.deliveryCharge(netTotal)
  const grandTotal = await userHelper.grandTotal(netTotal, DeliveryCharges)    
  
  userHelper.placeOrder(req.body,cartItem,grandTotal,DeliveryCharges,netTotal,req.session.user).then((response)=>{    
    //  console.log(response._id);
    //  console.log(req.body);
     if(req.body['paymentMethod']==='cod'){                              
      res.json({codstatus:true}) ;
             
     }
     else if(req.body['paymentMethod']==='online'){
      console.log('222222222222222222222222222');
      userHelper.razorpayPayment(response._id,req.body.mainTotal).then((response)=>{           
        res.json(response)
            
      })
     }
        
     
  })

});

router.post("/couponApply", async(req, res) => {
  let todayDate = new Date().toISOString().slice(0, 10);
  // console.log('hello');
  // let startCoupon=await userHelper.startCouponOffer(todayDate);
  let userId = req.session.user._id;
  userHelper.validateCoupon(req.body, userId).then((response) => {
    // console.log(response);
    req.session.couponTotal = response.total;

    if (response.success) {
      res.json({ couponSuccess: true, total: response.total,discountpers: response.discoAmountpercentage });
    } else if (response.couponUsed) {
      res.json({ couponUsed: true });
    } else if (response.couponExpired) {
      res.json({ couponExpired: true });
    } else if (response.couponMaxLimit) {
      res.json({ couponMaxLimit: true });
    } else {
      res.json({ invalidCoupon: true });
    }
  });
});

router.get("/view-orders",async (req, res) => {
  // console.log(req.body);
  const cartCount = await userHelper.getCartCount(req.session.user._id)
  const wishlistCount=await userHelper.getWishlistCount(req.session.user._id)
  let user=req.session.user
   userHelper.getOrders(req.session.user._id).then((orders)=>{
    // console.log(orders);
  // console.log(orders);
    res.render('user/orderlist',{user,orders,cartCount,wishlistCount})
   })


})
  
router.get("/order-receipt/:id", (req, res) => {
  console.log(req.params.id);
  userHelper.getAllOrders(req.params.id).then((response)=>{
   
    order=response
    console.log(order);
   
    
    res.render("user/receipt",{layout:false,order})                               
  })

 
})

router.post('/cancel-order',(req,res)=>{
  console.log('aaaaaaaaa');
  userHelper.cancelOrder(req.body).then((response)=>{       
      res.json({status:true})
  })
})



router.post("/verify-payment", (req, res) => {
  console.log(req.body);

  userHelper.verifyPayment(req.body).then((response)=>{
    console.log('1111111111111111111111111111111111111111');
    userHelper.changePaymentstatus(req.body['order[receipt]']).then((response)=>{
        res.json({status:true})
        console.log('payment success');
       
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false})
    console.log('payment failed');      
  })


});

router.get('/userprofile',async(req,res)=>{
  let user=req.session.user
  let [cartCount,wishlistCount]=await Promise.all([
    userHelper.getWishlistCount(req.session.user._id),userHelper.getCartCount(req.session.user._id)
   ])  
   adminHelper.getOneUser(req.session.user._id).then((response)=>{  
   
    const User=response
    console.log(User);
    res.render('user/profile',{ User,user,cartCount,wishlistCount})                    

   })
 })


router.get("/address-page", verifyLogin, async (req, res) => {
  const Addresses = await userHelper.getAddresses(req.session.user)
  console.log(Addresses);

  let user = req.session.user;              

  res.render("user/address", { user, layout: false, Addresses })
})

router.get("/addAddress", verifyLogin, (req, res) => {
  let user = req.session.user;
  console.log(user);
  res.render("user/addaddress", { user, layout: false })
})

router.post('/addAddress/:id', (req, res) => {
  userHelper.addAddress(req.params.id, req.body).then((response) => {
    res.redirect('/address-page')
  })

})

router.get('/deleteAddress/:id',(req,res)=>{   
  userHelper.deleteAddress(req.params.id,req.session.user._id).then((response)=>{
    
  })
})

// router.get('/gocheckout',(req,res)=>{
//   res.render('user/checkout2')            
// })

router.get('/cancelorder',(req,res)=>{
  res.render('user/receipt2')            
})

router.get('/single-product/:id',async(req,res)=>{
  let user=req.session.user
 
  userHelper.singleProduct(req.params.id).then(async(response)=>{
    console.log(response);
    let products=response
    console.log(products);
    if(user){
    // const wishlistCount=await userHelper.getWishlistCount(req.session.user._id)
    // const cartCount = await userHelper.getCartCount(req.session.user._id)
    const[wishlistCount,cartCount]=await Promise.all([
      userHelper.getWishlistCount(req.session.user._id),userHelper.getCartCount(req.session.user._id)])
    res.render('user/singleproduct',{user,products,wishlistCount,cartCount})
  }else{
    wishlistCount=0
    cartCount=0
    res.render('user/singleproduct',{products,wishlistCount,cartCount})
  }
  })
  
})


router.post("/searchResults", async (req, res) => {        
  let key = req.body.key;
  userHelper.getSearchProducts(key).then((response)=>{
    let filterresult=response
    res.render('user/products',{filterresult})         
  })
  
});

router.get('/shop', (req, res) => {
  adminHelper.getAllProducts().then(async(products) => {
    filterResult = products
    res.redirect('/get-filter')
  })
})

router.get('/get-filter',async(req,res)=>{       
  const brands=await adminHelper.getBrand()
  const categs=await adminHelper.getCategory()
  let user=req.session.user
  if(req.session.user){
  // let wishlistCount=await userHelper.getWishlistCount(req.session.user._id)         
  // let cartCount = await userHelper.getCartCount(req.session.user._id)
 let [cartCount,wishlistCount]=await Promise.all([
  userHelper.getWishlistCount(req.session.user._id),userHelper.getCartCount(req.session.user._id)
 ])
   res.render('user/filter',{user,brands,categs,filterResult,wishlistCount,cartCount})        
  }else{
    wishlistCount=0
    cartCount=0
    res.render('user/filter',{brands,categs,filterResult,wishlistCount,cartCount})         
  }
  
})

router.post('/search-filter', (req, res) => {
  console.log("gjhdukhjlsd;===================");    
  // console.log(req.body);
  let a = req.body
  let price = parseInt(a.Prize)
  let brandFilter =a.brand
  let categoryFilter = a.category

  // for (let i of a.brand) {
  //   brandFilter.push({ 'brand': i })
  // }
  // for (let i of a.category) {
  //   categoryFilter.push({ 'category': i })
  // }
  userHelper.searchFilter(brandFilter, categoryFilter, price).then((result) => {   
    filterResult = result
    console.log("==============================================");
// console.log(result);
    res.json({ status: true })
  })

})

router.get('/get-products-brandwise/:id',(req,res)=>{     
userHelper.getProductBrand(req.params.id).then((response)=>{
  let products=response
  console.log(products);
  res.render('user/product-brands',{layout:false,products})            
})

})

router.get("/edit-profile",  async (req, res) => {
  const Addresses = await userHelper.getAddresses(req.session.user);
  let user=req.session.user
  let [cartCount,wishlistCount]=await Promise.all([
    userHelper.getWishlistCount(req.session.user._id),userHelper.getCartCount(req.session.user._id)
   ])  
  res.render("user/editprofile", {  user,Addresses,cartCount,wishlistCount });   
});

router.post("/Editprofile", (req, res) => {
  userHelper.Editprofile(req.body, req.session.user._id).then(() => {            
    res.redirect("/userprofile");
  });
});





module.exports = router;
