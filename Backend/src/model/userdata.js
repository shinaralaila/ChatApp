const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://userone:userone@cluster0.elmop.mongodb.net/chatapp?retryWrites=true&w=majority',()=>{console.log("connected to user")});
const Schema=mongoose.Schema;
var NewUserSchema = new Schema({
    id:String,
    username:String,
    email:String,
    password:String, 
})

var userdata=mongoose.model('user',NewUserSchema);
module.exports=userdata;