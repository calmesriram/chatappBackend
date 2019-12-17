var mongoose = require("mongoose");
var conversation_schema=mongoose.Schema({
    id:{
          type:String           
       },
  participants:[]
});

var conversation_schema = mongoose.model('conversation',conversation_schema);

module.exports =conversation_schema


