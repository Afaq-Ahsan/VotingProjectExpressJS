const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required : true
    },
    age:{
        type: Number
    },
    email: {
        type: String,
        unique: true
    },
    mobile : {
        type: String
    },
    address : {
        type :String,
        required:true
    },
    aadharCardNumber: {
        type: String,
        required: true,
        unique : true
    },
    password: {
        type: String,
        required: true,
        unique : true
    },
    role:{
        type:String,
        enum : ["voter","admin"],
        defalut : "voter"
    },
    isVoted : {
        type : Boolean,
        default : false
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;