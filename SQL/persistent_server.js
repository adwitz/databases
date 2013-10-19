var mysql = require('mysql');
var http = require("http");
/* If the node mysql module is not found on your system, you may
 * need to do an "sudo npm install -g mysql". */

/* You'll need to fill the following out with your mysql username and password.
 * database: "chat" specifies that we're using the database called
 * "chat", which we created by running schema.sql.*/
exports.dbConnection = dbConnection = mysql.createConnection({
  user: "root",
  password: "",
  database: "chat"
});

dbConnection.connect();
/* Now you can make queries to the Mysql database using the
 * dbConnection.query() method.
 * See https://github.com/felixge/node-mysql for more details about
 * using this module.*/

/* You already know how to create an http server from the previous
 * assignment; you can re-use most of that code here. */
/* Import node's http module: */
var handle = require('./2013-09-chatterbox-server/server/request-handler.js');

var port = 8080;

var ip = "127.0.0.1";

var server = http.createServer(handle.handleRequest);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);