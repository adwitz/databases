var url = require('url');
var fs = require('fs');
var path = require('path');
var persistent_server = require('../../persistent_server.js')


var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};



exports.grabDbMessages = grabDbMessages = function(request, response){
  persistent_server.dbConnection.query('select * from messages', function(error, rows){
    if (error) {
      console.log('this is your ', error);
      serverResponse(400);
    } else {
      var messages = [];
      console.log("all rows:", rows);
      for (var i = 0; i < rows.length; i++){
        messages.push(rows[i]);
        console.log("a row is", rows[i]);
      }
      response.end(JSON.stringify(messages));
    }
  });
};

var addToMessagesTable = function(request, response, obj, userid) {
  persistent_server.dbConnection.query('insert into message (message, userid, username, time, room) values (?, ?, ?, NOW(), ?)', [obj.text, userid, obj.username, obj.roomName], function(error, rows) {
    if (error) {
      serverResponse(400);
    } else {
      statusCode = 201;
      response.writeHead(statusCode, headers);
      response.end();
    }
  });
};

exports.insertDbMessage = insertDbMessage = function(request, response, obj){
  persistent_server.dbConnection.query('select userid from users where username=?', [obj.username], function(error, rows) {
    if (error) {
      serverResponse(400);
    } else {
      if (rows.length === 0) {
        persistent_server.dbConnection.query('insert into users (username) values (?)', [obj.username], function(error, rows) {
          if (error) {
            serverResponse(400);
          } else {
            console.log('rows after inserting a user', arguments);
            var userid = rows[0].userid;
            addToMessagesTable(request, response, obj, userid);
          }
        });
      } else {
        var userid = rows[0].userid;
        addToMessagesTable(request, response, obj, userid);
      }
    }
  });
};

exports.handleRequest = function(request, response) {

  var serverResponse = function(statuscode) {
    response.writeHead(statuscode, headers);
    response.end();
  };

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
      statusCode = 200;
      response.writeHead(statusCode, headers);
      grabDbMessages(request, response);
    } else if (request.method === 'POST') {
      var requestBody = '';
      request.on('data', function(data){
        requestBody += data;
      });
      request.on('end', function(data) {
        var obj = JSON.parse(requestBody);
        insertDbMessage(request, response, obj);
      });
    } else if (request.method === 'OPTIONS') {
      serverResponse(200);     
    } else {
      serverResponse(400);
    }
  } else {
    fs.exists(path.resolve(__dirname,'../client' + filePath), function(exists) {
      if (exists) {
        fs.readFile(path.resolve(__dirname,'../client' + filePath), function(error, content) {
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
