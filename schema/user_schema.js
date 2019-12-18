var mongoose = require("mongoose");

var user_schema = mongoose.Schema({
      email:{
            type:String,            
         },
    username:{
        type:String           
        },
    password:{
            type:String           
        },
    profile:{
        type:String
    },
    userfiles:[],
    time :{
        type:String,
        default:Date.now()
    }
    
});

var user_schema = mongoose.model('usertable',user_schema);
module.exports = user_schema;