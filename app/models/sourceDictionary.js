var mongoose=require("mongoose");
var FormatDate=mongoose.Schema.Types.FormatDate=require('../../node_modules/mongoose-schema-formatdate/formatdate');
var mongoosePaginate = require('mongoose-paginate');

/*module.exports=mongoose.model('sourceDictionary',{
 sentenceId:{type:String},
 word:{type:String},
 countryCode:{type:String},
 firstRoleCode:{type:String},
 secondRoleCode:{type:String},
 dateStart:{type:FormatDate,format:'YYYY-MM-DD'},
 dateEnd:{type:FormatDate,format:'YYYY-MM-DD'},
 confidenceFlag:{type:Boolean},
 userId:{type:String},
 userName:{type:String},
 taggingTime:{type:Date,default:Date.now}
});*/

var schema = new mongoose.Schema({
 sentenceId:{type:String},
 word:{type:String},
 countryCode:{type:String},
 firstRoleCode:{type:String},
 secondRoleCode:{type:String},
 dateStart:{type:FormatDate,format:'YYYY-MM-DD'},
 dateEnd:{type:FormatDate,format:'YYYY-MM-DD'},
 confidenceFlag:{type:Boolean},
 userId:{type:String},
 userName:{type:String},
 taggingTime:{type:Date,default:Date.now}
});
schema.plugin(mongoosePaginate);

module.exports = mongoose.model('sourceDictionary',  schema); 