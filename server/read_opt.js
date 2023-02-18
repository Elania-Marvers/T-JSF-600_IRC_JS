const db_name = 'ircnet';
const { list, users_list, nick, mp, quit, create, join, delete_channel } = require('./opts');

function read_opt(msg, user, channels, users, connection) {
    let command = msg.split(" ")[0];
    let channelName = "";
    let sql = "";
    switch (command) {
        case '/nick':
        nick(users, connection, msg.split(" ")[1], user);
        break;
        
        case '/list':
        list(channels, user);
        break;
        
        case '/create':
        create(msg, user, channels, connection);
        break;
        
        case '/delete':
        delete_channel(user, channels, msg, connection);
        break;
        
        case '/join':
        join (msg, user, channels, connection);
        break;
        
        case '/quit':
        quit(user, channels, connection);
        break;
        
        case '/users':
        users_list(user, channels);
        break;
        
        case '/msg':
        mp(users, connection, user, msg);
        break;
        
        case '/pokemon' :
        user.socket.emit('chat message', "pika, pika !");
        break;

        case '/clear' :
        user.socket.emit('clear', " THIS IS EMPTY BITCH !");
        break;
        
        default:
        if (typeof channels[user.channel] !== 'undefined')
        if (typeof channels[user.channel].users !== 'undefined')
        channels[user.channel].users.forEach(usr => {
            usr.socket.emit('chat message', user.nickname + ' : ' + msg);
        });
        connection.query('INSERT INTO ' + db_name + '.messages (receiver, sender, message, type) VALUES (?, ?, ?, ?)', [user.channel, user.nickname, msg, "channel"], function (error, results, fields) {
            if (error) throw error;
            });
        break;
        
    }
}

module.exports = read_opt;

/*
** delete users user in disconnection 
** create persistance with mysql2
** 
*/
