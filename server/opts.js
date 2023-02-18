const db_name = 'ircnet';

function nick(users, connection, newNick, user) {
    let cond = false;
    Object.values(users).forEach(usr => {
        if (newNick === usr.nickname)
        cond = true;
    });
    if (cond) {
        user.socket.emit('chat message', newNick + ' this nickname is already took');
    }
    else {
        console.log(user.nickname + ' changed their nickname to ' + newNick);
        user.socket.emit('chat message', user.nickname + ' changed their nickname to ' + newNick);
        user.nickname = newNick;
        user.socket.emit('nick', newNick);
        
        let sql = `UPDATE ${db_name}.users SET nickname = '${newNick}' WHERE uid = ${user.uid}`;
        connection.query(sql, function (err, result) {
            if (err) throw err;
        });
        
    }
}


function mp (users, connection, user, msg) {
    let userName = msg.split(" ")[1];
    let newMsg = msg.slice(msg.split(" ", 2).join(" ").length);
    Object.values(users).forEach(usr => {
        if (userName === usr.nickname)
        {
            usr.socket.emit('private messageout', 'MP: ' + user.nickname + ' -> ' + newMsg);
            user.socket.emit('private messagein', 'MP: ' + usr.nickname + ' <- ' + newMsg);  
            let sql = "INSERT INTO " + db_name + ".messages (sender, receiver, message, type) VALUES (?, ?, ?, ?)";
            let values = [user.nickname, usr.nickname, newMsg, "private"];
            connection.query(sql, values, function (err, result) {
                if (err) throw err;
                console.log("Private message added to the database table.");
            });
        }
    });
}

function list (channels, user) {
    if (typeof channels[channelName] !== 'undefined');
    if (typeof channels[channelName] === 'string');
    Object.values(channels).forEach(channel =>
        user.socket.emit('chat message', ': ' + channel.name));
    }
    
    function users_list (user, channels) {
        user.socket.emit('chat message', 'Listing all users of channel: ' + user.channel);
        if (typeof channels[user.channel] !== 'undefined')
        if (typeof channels[user.channel].users !== 'undefined')
        channels[user.channel].users.forEach(usr => {
            user.socket.emit('chat message', usr.uid + ' : ' + usr.nickname);
        });
    }
    
    function quit(user, channels, connection) {
        let currentChannel = user.channel;
        if(!currentChannel) {
            user.socket.emit('chat message', "You are not currently in any channel.");
            return;
        }
        let index = channels[currentChannel].users.indexOf(user);
        channels[currentChannel].users.splice(index, 1);
        user.channel = "";
        user.socket.emit('chat message', "You have quit channel '" + currentChannel + "'.");
        let sql = "UPDATE " + db_name + ".users SET channel = '' WHERE uid = " + user.uid;
        connection.query(sql, function (err, result) {
            if (err) throw err;
        });
    }
    
    
    function create (msg, user, channels, connection) {
        channelName = msg.split(" ")[1];
        if(!channelName) {
            user.socket.emit('chat message', "You must specify a channel name to create");
            return;
        }
        if(channels.hasOwnProperty(channelName)) {
            user.socket.emit('chat message', "This channel already exists.");
            return;
        }
        channels[channelName] = {
            users: [],
            messages: [],
            name: channelName
        };
        user.socket.emit('chat message', "Channel '" + channelName + "' created successfully.");
        let sql = `INSERT INTO ${db_name}.channels (name) VALUES ('${channelName}')`;
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log("channel created in DB");
        });
    }
    
    function join (msg, user, channels, connection) {
        channelName = msg.split(" ")[1];
        if(!channelName) {
            user.socket.emit('chat message', "You must specify a channel name to join");
            return;
        }
        if(!channels.hasOwnProperty(channelName)) {
            user.socket.emit('chat message', "This channel does not exist.");
            return;
        }
        if(channels[channelName].users.includes(user)) {
            user.socket.emit('chat message', "You are already in this channel.");
            return;
        }
        channels[channelName].users.push(user);
        user.channel = channelName;
        
        let sql = `UPDATE ${db_name}.users SET channel = '${channelName}' WHERE uid = ${user.uid}`;
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log("User's channel updated in SQL database");
        });
        
        user.socket.emit('chat message', "You have joined channel '" + channelName + "'.");
    }
    
    
    function delete_channel (user, channels, msg, connection) {
        channelName = msg.split(" ")[1];
        if(!channelName) {
            user.socket.emit('chat message', "You must specify a channel name to delete");
            return;
        }
        if(!channels[channelName]) {
            user.socket.emit('chat message', "This channel does not exists.");
            return;
        }
        connection.query("DELETE FROM " + db_name + ".channels WHERE name = '" + channelName + "'", function (err, result) {
            if (err) throw err;
            console.log("Channel deleted from database");
        });
        delete channels[channelName];
        user.socket.emit('chat message', "Channel '" + channelName + "' deleted successfully.");
    }
    
    module.exports = { list, users_list, nick, mp, quit, create, join, delete_channel };