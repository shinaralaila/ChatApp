const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
var cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
var http = require("http").createServer(app)
const io = require("socket.io")(http, {
  cors: {
    origin: '*',
  }
});

const userdata = require('./src/model/userdata');
const chatroom = require('./src/model/chatroom');
const messagedata = require('./src/model/messagedata');
const onlineuser = require('./src/model/onlineuser');
const relateuser = require('./src/model/relateuser');

app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/register', (req, res) => {
  console.log(req.body);

  var user = {
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),

  }
  var user = new userdata(user);
  console.log(user)
  user.save((error, registeredUser) => {
    if (error) {
      console.log(error);
      res.json({ msg: "some error!" });
    }
    else {
      var login = {
        username: req.body.username,
        online: false
      }
      var login = new onlineuser(login);
      console.log(login);
      login.save((error, activeuser) => {
        if (error) {
          console.log(error);
          res.json({ msg: "some error!" })
        }

      })
      let payload = { subject: registeredUser._id }
      let token = jwt.sign(payload, 'secretkey')
      res.status(200).json({ token: token })
    }
  });
})



app.post('/login', (req, res) => {
  // console.log(req.body.email);
  userdata.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      console.log(err)
      res.json({ msg: "Something went wrong" });
    }
    else {
      if (!user) {
        console.log("Invalid login!!")

        res.json({ msg: 'Please Register!!' })
      }
      else {
        // console.log(req.body.password)
        // console.log(user.password)

        bcrypt.compare(req.body.password, user.password).then(match => {
          if (match) {
            console.log("login success");

            onlineuser.findOneAndUpdate({ "username": req.body.username },
              { $set: { "online": true } },
              { new: true }, (err, doc) => {
                if (err) {
                  console.log("Something wrong when updating data!");
                }
              })
            //console.log(onlineuser)

            let payload = { subject: user._id, email: user.email }
            let token = jwt.sign(payload, 'secretkey')
            res.status(200).json({ token: token, role: user.role, blocked: user.blocked, email: user.email })

          }
          else {
            console.log("Incorrect password");
            res.json({ msg: 'Incorrect password!!' })
          }
        }).catch(err => {
          console.log("Something wrong -" + err);
          res.json({ msg: 'Something wrong - ' + err })
        })
      }
    }
  })
});

app.get('/users/:usrl', (req, res, next) => {
  // called this.url which is passed along with url as a param
  const loggedinuser = req.params.usrl;
  //console.log("Params");console.log(loggedinuser);
  onlineuser.find({ username: { $ne: loggedinuser }, online: { $eq: true } },
    { username: 1, email: 1 },
    (err, users) => {
      if (err) {
        console.log(err);
      }
      res.send(users);
      //console.log(users);
    });
});

app.get('/chatuser/:usrl/:usrc', (req, res, next) => {
  relateuser.findOneAndUpdate({ loggedinuser: { $eq: req.params.usrl }, relateuser: { $eq: req.params.usrc } },
    { $set: { ischat: true } },
    { upsert: true },
    (err, _users) => {
      if (err) {
        console.log(err);
        res.json({ msg: "some error!" });
      }
    });
});

app.get('/blockuser/:usrl/:usrb', (req, res, next) => {
  relateuser.findOneAndUpdate({ loggedinuser: { $eq: req.params.usrl }, relateuser: { $eq: req.params.usrb } },
    { $set: { isblock: true } },
    { upsert: true },
    (err, _users) => {
      if (err) {
        console.log(err);
        res.json({ msg: "some error!" });
      }
    });
});

app.get('/unblockuser/:usrl/:usrb', (req, res, next) => {
  relateuser.findOneAndUpdate({ loggedinuser: { $eq: req.params.usrl }, relateuser: { $eq: req.params.usrb } },
    { $set: { isblock: false } },
    { upsert: true },
    (err, _users) => {
      if (err) {
        console.log(err);
        res.json({ msg: "some error!" });
      }
    });
});

app.get('/hideuser/:usrl/:usrh', (req, res, next) => {
  relateuser.findOneAndUpdate({ loggedinuser: { $eq: req.params.usrl }, relateuser: { $eq: req.params.usrh } },
    { $set: { ishide: true } },
    { upsert: true },
    (err, _users) => {
      if (err) {
        console.log(err);
        res.json({ msg: "some error!" });
      }
    });
});

app.get('/unhideuser/:usrl/:usrh', (req, res, next) => {
  relateuser.findOneAndUpdate({ loggedinuser: { $eq: req.params.usrl }, relateuser: { $eq: req.params.usrh } },
    { $set: { ishide: false } },
    { upsert: true },
    (err, _users) => {
      if (err) {
        console.log(err);
        res.json({ msg: "some error!" });
      }
    });
});

app.get('/createroom/:usrl/:room', (req, res) => {
  console.log("app req.params.room:"); console.log(req.params.room);

  var room = {
    chatroom: req.params.room,
    created: req.params.usrl,
    updatedat: Date.now(),
  }
  var room = new chatroom(room);
  console.log("app room:"); console.log(room);
  room.save((err, _users) => {
    if (err) {
      console.log(err);
      res.json({ msg: "some error!" });
    }
  });
});

app.get('/roomuser/:usrl/:room', (req, res, next) => {
  relateuser.findOneAndUpdate({ loggedinuser: { $eq: req.params.usrl }, relateuser: { $eq: req.params.room } },
    { $set: { ischat: true } },
    { upsert: true },
    (err, _users) => {
      if (err) {
        console.log(err);
        res.json({ msg: "some error!" });
      }
    });
});

app.get('/getrooms/:usrl', (req, res) => {
  // console.log("req.params.usrl");console.log(req.params.usrl);
  chatroom.find({},
    { chatroom: 1 },
    (err, rooms) => {
      if (err) {
        console.log(err);
      }
      // console.log("app rooms");console.log(rooms);
      res.send(rooms);
    });
});

app.post('/chatinbox', (req, res) => {
  console.log(req.queryparams);
  username = req.queryparams;
  console.log("1" + req.queryparams);
  usrname = new activeuser(username);
  usrname.save();
  console.log("active user" + username);
  res.send(username);

})

app.get('/blocked/:usrl', (req, res) => {
  relateuser.find({ isblock: { $eq: true }, loggedinuser: { $eq: req.params.usrl } },
    { relateuser },
    (err, relateuser) => {
      if (err) {
        console.log(err);
      }
      console.log("app relateuser"); console.log(relateuser);
      res.send(relateuser);
    });
});
app.get('/hidden/:usrl', (req, res) => {
  relateuser.find({ ishide: { $eq: true }, loggedinuser: { $eq: req.params.usrl } },
    { relateuser },
    (err, relateuser) => {
      if (err) {
        console.log(err);
      }
      console.log("app relateuser"); console.log(relateuser);
      res.send(relateuser);
    });
});

//=-------------------------------------------------------------------------------
// io.on('connection', (socket) => {
//   console.log('user connected');

//   socket.on('new-message', (message) => {
//     console.log("io on message");console.log(message);
    
//       io.emit(message);
  
//   });
// });

let userList = new Map();


io.on('connection', (socket) => {
  console.log('new user connected');

  let userName = socket.handshake.query.userName;
  addUser(userName, socket.id);

  
  
  socket.on('disconnect', (reason) => {
    removeUser(userName, socket.id);
  })

  socket.on('new-message', (message) => {
    const msg = new messagedata({ message })
    console.log("socket on new-message:");console.log(message);
    msg.save().then(() => {
      socket.broadcast.emit('message-broadcast', message)
      console.log("socket on save:");console.log(message)
    });
  });
  });
  io.to("lyana").emit('privateMessage', (message)=>{
    console.log("socket on private-message:");console.log(message);
  });


// io.use((socket, next) => {
//   const username = socket.handshake.auth.username;
//   if (!username) {
//     return next(new Error("invalid username"));
//   }
//   socket.username = username;
//   console.log("io.use"); console.log(username)
//   next();
// });

function addUser(userName, id) {
  if (!userList.has(userName)) {
    userList.set(userName, new Set(id));
  } else {
    userList.get(userName).add(id);

  }
}

function removeUser(userName, id) {
  if (userList.has(userName)) {
    let userIds = userList.get(userName);
    if (userIds.size == 0) {
      userList.delete(userName);
    }
  }
}


const PORT = 3000 || process.env.PORT

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})