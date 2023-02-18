function sql_crea (db_name, connection) {
    connection.query('CREATE DATABASE IF NOT EXISTS ' + db_name, function (error, results, fields) {
        if (error) throw error;
        console.log('Database ' + db_name + ' created');
    });
    
    let sql = "CREATE TABLE IF NOT EXISTS " + db_name + ".channels (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });
    
    sql = "CREATE TABLE IF NOT EXISTS " + db_name + ".users (id INT AUTO_INCREMENT PRIMARY KEY, uid INT, nickname VARCHAR(255), channel VARCHAR(255))";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });
    
    sql = "CREATE TABLE IF NOT EXISTS " + db_name + ".messages (id INT AUTO_INCREMENT PRIMARY KEY, sender VARCHAR(255), receiver VARCHAR(255), message VARCHAR(255), type ENUM('private', 'channel'), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });
    
}

function sql_load (db_name, connection, id, users, channels) {
    connection.query("SELECT * FROM " + db_name + ".channels", function (err, rows) {
        if (err) throw err;
        
        rows.forEach(row => {
            let channelName = row.name;
            channels[channelName] = {
                users: [],
                messages: [],
                name: channelName
            };
        });
    });
    
    connection.query("SELECT * FROM " + db_name + ".users", function (err, result) {
        if (err) throw err;
        result.forEach(function(row) {
            let user = {
                uid: row.uid,
                nickname: row.nickname,
                channel: row.channel,
                socket: null
            }
            if (id < user.uid) id = row.uid;
            users[user.uid] = user;
        });
    });
}

function sql_msg (db_name, connection, user) {
    connection.query("SELECT * FROM " + db_name + ".messages", function (err, result) {
        if (err) throw err;
        result.forEach(function(row) {

            //console.log(row);
            if (row.sender == user.nickname || row.receiver == user.nickname || user.channel == row.receiver && row.type == "channel")
            {

                if (row.sender == user.channel  && row.type == "channel")
                user.socket.emit('chat message', row.receiver + ' : ' + row.message);

                if (row.receiver == user.channel  && row.type == "channel")
                user.socket.emit('chat message', row.sender + ' : ' + row.message);

                if (row.receiver == user.nickname  && row.type == "private")
                user.socket.emit('private messagein', 'MP: ' + row.sender + ' -> ' + row.message);

                if (row.sender == user.nickname  && row.type == "private")
                user.socket.emit('private messageout', 'MP: ' + row.receiver + ' <- ' + row.message);

            }


        });
    });
}

module.exports = { sql_crea, sql_load, sql_msg };