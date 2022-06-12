
const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://userone:userone@cluster0.elmop.mongodb.net/chatapp?retryWrites=true&w=majority',()=>{console.log("connected to activeuser")});
const Schema=mongoose.Schema;

var relateuserSchema = new mongoose.Schema({
    loggedinuser:String,
    relateuser:String,
    ischat: Boolean,
    isblock: Boolean,
    ishide: Boolean,
    updated: { type: Date, default: Date.now },
});

var relateuser=mongoose.model('relateuser',relateuserSchema);
module.exports=relateuser;