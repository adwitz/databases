var http = require("http");
var mysql = require('mysql');
var seqMysql = require('sequelize-mysql');
var Sequelize = require("sequelize");

/* If the node mysql module is not found on your system, you may
 * need to do an "sudo npm install -g mysql". */
var sequelize = new Sequelize("chat", "root", "", {
	host: 'localhost',
	port: 8080,
  omitNull: true
});

exports.Users = Users = sequelize.define('Users', {
	id: {type: Sequelize.INTEGER, autoIncrement: true },
  username: Sequelize.STRING
});

exports.Messages = Messages = sequelize.define('Messages', {
	userid: Sequelize.INTEGER,
	username: Sequelize.STRING,
	message: Sequelize.STRING,
	time: Sequelize.DATE,
	room: Sequelize.STRING
});

var handle = require('./request-handler.js');

var port = 8080;

var ip = "127.0.0.1";

var server = http.createServer(handle.handleRequest);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);