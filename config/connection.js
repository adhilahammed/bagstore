const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://adhil:72wC3dYCPhhNpvFY@bagstores.fgdzocv.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser:true
}).then(()=>{
    console.log('connection Successfull')
}).catch((e)=>{
    console.log('No Connection');  
})

//72wC3dYCPhhNpvFY