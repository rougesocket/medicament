const mongoose = require("mongoose");

const sale = new mongoose.Schema({
    email:{
        type:String
    },
    pname: {
        type:String,
        required:true
    },
    quantity:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    date:{
        type:String,
        required:true
    }

})


//creating collection

const Saleitem = new mongoose.model("sale",sale);

module.exports = Saleitem;