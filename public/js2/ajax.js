function addTocart(proId){
   
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
           

            if (response.status) {
                            
                Swal.fire(
                    'added to Cart!',
                    'product added to Cart.',
                    'success'        
                    )    
                
               //location.reload()
               let count=$('#cart-count').html()
               count=parseInt(count)+1
               $("#cart-count").html(parseInt(count))
               alert(count)
               

           }else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please Login!',
                footer: '<a href="/login">Login</a>'
              })
        }            



            // if(response.status){

            //     const count=$('#cart-count').html()
            //     count=parseInt(count)+1
            //     $('#cart-count').html(count)
               
            // }
            
        }
    })
}
// function addTowishlist(proId){
    
//     $.ajax({
//         url:'/add-to-wishlist/'+proId,
//         method:'get',

//         success:(response)=>{
//            if(response.status){
//             alert('successful')
//            }else{
//             alert('item already added')    
//            }
//         }
//     })
// };



$('#checkoutForm').submit((e)=>{       
    e.preventDefault()
    $.ajax({
        url:'/place-order',
        method:'post',
        data:$('#checkoutForm').serialize(),
        success:(response)=>{
            

            if(response.codstatus){
                alert('success')
                location.href="/view-orders"
            }else {
                alert('hello')
                razorpayPayment(response)                     
            }
        }
    })
  })

  function razorpayPayment(order){        
    var options = {
        "key": "rzp_test_HhNH1YPimeV2Xm", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Acme Corp",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id":order.id , //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)         

            verifyPayment(response,order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
  }

  function verifyPayment(payment,order){
    $.ajax({
        url:'/verify-payment',
        data:{
            payment,
            order
        },
        method:'post',
        success:(response)=>{
           if(response.status){
            alert('success')
            location.href="/view-orders"
           }else{
            alert('payment failed')
           }
        }
    })
  }
  
  function addTowishlist(proId){
   $.ajax({
     url:'/add-to-wishlist/'+proId,
     method:'get',

     success:(response)=>{
        if(response.status){

            Swal.fire(
                'added to Wishlist!',
                'product added to Wishlist.',
                'success'        
                )    
            let count=$('#wish-count').html()
            count=parseInt(count)+1
            $("#wish-count").html(parseInt(count))
            alert(count)
            alert('successful')
        }else if(response.statu){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'item already added!',
                // footer: '<a href="/login">Login</a>'     
              })
            alert('item already added')
        }else{
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'please login!',
                footer: '<a href="/login">Login</a>'     
              })
            alert('please login')
        }
     }
   })




  }

  function cancelOrder(orderId, proId, subtotal,totalAmount,couponPercent, reFund,quantity) {
  alert('hello')
    $.ajax({
      url: '/cancel-order',
      data: {
        orderId: orderId,
        proId: proId,
		subtotal:subtotal,
		totalAmount:totalAmount,
		couponPercent:couponPercent,
		reFund:reFund,
		quantity:quantity,
		
      },
      method: 'post',
      success: (response) => {
        if (response.status) {
          alert(' Product Cancelled from Order')
         location.reload()
        } else {
			alert("all Product Cancelled from Order")
			location.href = '/viewOrderProducts/' + orderId
		}
      }
    })
  }

  