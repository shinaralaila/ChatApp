const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://userone:userone@cluster0.elmop.mongodb.net/chatapp?retryWrites=true&w=majority',()=>{console.log("connected to messages")});
const Schema=mongoose.Schema;

var messageSchema = new mongoose.Schema({
    //room: String,
    //user: String,
    message: String,
    message_status:{type: Boolean, default: false},
    created_at: { type: Date, default: Date.now },
});

var messagedata=mongoose.model('message',messageSchema);
module.exports=messagedata;