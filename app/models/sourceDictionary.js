var mongoose=require("mongoose");
var FormatDate=mongoose.Schema.Types.FormatDate=require('../../node_modules/mongoose-schema-formatdate/formatdate')

module.exports=mongoose.model('sourceDictionary',{
 word:{type:String},
 countryCode:{type:String},
 firstRoleCode:{type:String},
 secondRoleCode:{type:String},
 dateStart:{type:FormatDate,format:'YYYY-MM-DD',default:'1600-1-1'},
 dateEnd:{type:FormatDate,format:'YYYY-MM-DD',default:'1600-1-1'},
 confidenceFlag:{type:Boolean},
 userId:{type:String},
 taggingTime:{type:Date,default:Date.now}
});