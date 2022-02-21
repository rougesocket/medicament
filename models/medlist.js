const mongoose = require("mongoose");

const medicine = new mongoose.Schema({
    email:{
        type:String
    },
    pname: {
        type:String,
        required:true
    },
    ptype:{
        type:String,
        required:true,
    },
    price:{
        type:String,
        required:true
    },
    quantity:{
        type:String,
        required:true
    },
    expdate:{
        type:String,
        required:true
    }

})


//creating collection

const Medlist = new mongoose.model("Medlist",medicine);

module.exports = Medlist;