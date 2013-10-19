var url = require('url');
var fs = require('fs');
var path = require('path');
var persistent_server = require('./persistent_server.js')
var Sequelize = require('sequelize');
var seqMysql = require('sequelize-mysql');

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

var headers = defaultCorsHeaders;

var serverResponse = function(response, statusCode) {
    response.writeHead(statusCode, headers);
    response.end();
};

exports.grabDbMessages = grabDbMessages = function(request, response){
  persistent_server.Messages.find().success(function(messages){
    console.log('this is that', messages);
  });
  //persistent_server.dbConnection.query('select * from messages', function(error, rows){
    // if (error) {
    //   console.log('this is your ', error);
    //   serverResponse(response, 400);
    // } else {
    //   var messages = [];
    //   console.log("all rows:", rows);
    //   for (var i = 0; i < rows.length; i++){
    //     messages.push(rows[i]);
    //     console.log("a row is", rows[i]);
    //   }
    //   response.end(JSON.stringify(messages));
  //   }
  // });
};

var addToMessagesTable = function(request, response, obj, userid) {
  persistent_server.dbConnection.query('insert into messages (message, userid, username, time, room) values (?, ?, ?, NOW(), ?)', [obj.text, Number(userid), obj.username, obj.roomName], function(error, rows) {
    if (error) {
      console.log('suerid', userid);
      console.log('heres the ', error);
      serverResponse(response, 400);
    } else {
      statusCode = 201;
      console.log('still cool');
      response.writeHead(statusCode, headers);
      response.end();
    }
  });
};

exports.insertDbMessage = insertDbMessage = function(request, response, obj){
  var objUser = obj.username;
  var userid;
  persistent_server.Users.sync().success(function(){
    console.log('arrive');
    var newUser = persistent_server.Users.findOrCreate({username: objUser});
    newUser.save().success(function(user, created){
      userid = user.id;
      console.log('heres the userResponse:', user.id);
    }).error(function(error){
      console.log('this is error, ', error);
    });
  });

  persistent_server.Messages.sync().success(function(){
    var newMessage = persistent_server.Messages.build({userid: userid, username: obj.username, message: obj.message, room: obj.room});
    newMessage.save().success(function(){
      console.log('success');
    })
  });
  
  // persistent_server.dbConnection.query('select userid from users where username=?', [obj.username], function(error, rows) {
  //   if (error) {
  //     serverResponse(response, 400);
  //   } else {
  //     if (rows.length === 0) {
  //       persistent_server.dbConnection.query('insert into users (username) values (?)', [obj.username], function(error, rows) {
  //         if (error) {
  //           console.log('error here 60: ', error);
  //           console.log('rows:', rows);
  //           serverResponse(response, 400);
  //         } else {
  //           persistent_server.dbConnection.query('select userid from users where username=?', [obj.username], function(error, rows){
              
  //             if (error) {
  //               console.log('error selecting username from users table after adding');
  //               serverResponse(400);
  //             } else {
  //               console.log('rows after inserting a user and then selecting it', rows);
  //               var userid = rows[0].userid;
  //               addToMessagesTable(request, response, obj, userid);
  //             }
  //           });
  //         }
  //       });
  //     } else {
  //       var userid = rows[0].userid;
  //       addToMessagesTable(request, response, obj, userid);
  //     }
  //   }
  // });
};

exports.handleRequest = function(request, response) {

  console.log("Serving request type " + request.method + " for url " + request.url);

  var url_parts = url.parse(request.url);
  var statusCode;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";

  var filePath = url_parts.pathname;
  var extname = path.extname(filePath);

  if(url_parts.pathname === '/'){
    filePath = url_parts.pathname + 'index.html';
  }

  if (url_parts.pathname === '/1/classes/messages' || url_parts.pathname.slice(0,url_parts.pathname.length-1) === '/1/classes/room') {
    if (request.method === 'GET') {
      //TODO use find
      statusCode = 200;
      response.writeHead(statusCode, headers);
      grabDbMessages(request, response);
    } else if (request.method === 'POST') {
      //TODO use findOrCreate here
      var requestBody = '';
      request.on('data', function(data){
        requestBody += data;
      });
      request.on('end', function(data) {
        var obj = JSON.parse(requestBody);
        insertDbMessage(request, response, obj);
      });
    } else if (request.method === 'OPTIONS') {
      serverResponse(response, 200);     
    } else {
      serverResponse(response, 400);
    }
  } else {
    fs.exists(path.resolve(__dirname,'../SQL/2013-09-chatterbox-server/client' + filePath), function(exists) {
      if (exists) {
        fs.readFile(path.resolve(__dirname,'../SQL/2013-09-chatterbox-server/client' + filePath), function(error, content) {
          if (error) {
            serverResponse(500);
          } else {
            if (extname === '.js') {
              headers['Content-Type'] = "text/javascript";
            } else if (extname === '.css') {
              headers['Content-Type'] = "text/css";
            } else {
              headers['Content-Type'] = "text/html";
            }
            response.writeHead(200, headers);
            response.end(content, 'utf-8');
          }
        });
      } else {
        console.log('filePath is:', filePath);
        console.log('not finding the index.html file');

        response.writeHead(404);
        response.end();
      }
    });
  }
};
