const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://userone:userone@cluster0.elmop.mongodb.net/chatapp?retryWrites=true&w=majority',()=>{console.log("connected to chatroom")});
const Schema=mongoose.Schema;

var chatroomSchema = new mongoose.Schema({
    chatroom:String,
    created:String,
    updatedat: { type: Date, default: Date.now },
});

var chatroom=mongoose.model('chatroom',chatroomSchema);
module.exports=chatroom;