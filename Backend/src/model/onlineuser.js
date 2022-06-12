const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://userone:userone@cluster0.elmop.mongodb.net/chatapp?retryWrites=true&w=majority',()=>{console.log("connected to onlineuser")});
const Schema=mongoose.Schema;
var NewonlineUserSchema = new Schema({
     id:String,
    username:String,
    online:Boolean
    
    
})

var onlineuser=mongoose.model('onlineuser',NewonlineUserSchema);
module.exports=onlineuser;