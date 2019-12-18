var mongoose = require("mongoose");
var chat_schema=mongoose.Schema({
    senderid:{
            type:String           
         },
    message:{
            type:String           
        }, 
    conversationid:{
            type:Number           
        }, 
    time :{
        type:String,
        default:Date.now()
    },   
    createdAt:{
         type:Date
     }
    
});


var chat_schema = mongoose.model('chatdb',chat_schema);

module.exports = chat_schema;