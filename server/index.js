
const read_opt = require('./read_opt');
const { sql_crea, sql_load, sql_msg } = require('./sql_function');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const server = app.listen(3000);
const ioCookieParser = require("socket.io-cookie");
const io = require("socket.io")(server, { cookie: true }).use(ioCookieParser);
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'chryseis',
    password: 'random'
});
const db_name = 'ircnet';
let users = {};
let channels = {};
let id = 0;
app.use(express.static(__dirname))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

connection.connect();
sql_crea(db_name, connection);
sql_load(db_name, connection, id, users, channels);

io.on('connection', (socket) => {
    let cond = true, userId;
    if (typeof socket.handshake.headers.cookie !== 'undefined')
    if(socket.handshake.headers.cookie.hasOwnProperty('userId')) {
        userId = socket.handshake.headers.cookie.userId;
        cond = false;
    }     

    if (cond) {
        userId = id++;
    }

    socket.emit('set-cookie', `userId=${userId};`);
    cond = true;
     Object.values(users).forEach(usr => {
        if (usr.uid == userId)
            cond = false;
     });
    
    if (cond) {
        users[userId] = {
            uid: userId,
            nickname: "pandanonyme",
            channel: "",
            socket: socket
        };
        sql = "INSERT INTO " +  db_name + ".users (uid, nickname, channel) VALUES (?, ?, ?)";
        connection.query(sql, [users[userId].uid, users[userId].nickname, users[userId].channel], function (err, result) {
            if (err) throw err;
            console.log("User inserted into DB");
        });
    } else {
        console.log(`User with uid ${userId} already exists in users`);
        users[userId].socket = socket;
        sql_msg(db_name, connection, users[userId]);
    }
    socket.emit('nick', users[userId].nickname); 
    console.log(users[userId].nickname + ' connected');
    socket.on('disconnect', () => {
        console.log(users[userId].nickname + ' disconnected');
    });
    
    socket.on('chat message', (msg) => {
        let user = users[userId];
        read_opt(msg, user, channels, users, connection);
    });
});

//connection.end();


///**************************************************************************************/
///*	mysql username :  	chryseis						*/
///*											*/
///*	mysql password :  	random							*/
///**************************************************************************************/
