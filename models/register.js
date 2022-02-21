const mongoose = require("mongoose");

const userregister = new mongoose.Schema({
    sname: {
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true
    }

})


//creating collection

const Register = new mongoose.model("Register",userregister);

module.exports = Register;