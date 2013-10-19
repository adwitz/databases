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
      statusCode = 400;
      response.writeHead(statusCode, headers);
      response.end();
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
      statusCode = 200;
      response.writeHead(statusCode, headers);
      grabDbMessages(request, response);
      //   if (error){
      //     console.log("this is your ", error);
      //   } else {
      //     console.log(rows);
      //   }
      // });
      //ORIGINAL PROCESS TO GET MESSAGES FROM TXT FILE
      // if (fs.existsSync('./messageLog.txt')) {
      //   messages = fs.readFileSync('./messageLog.txt');
      //   messages = JSON.parse('[' + messages.slice(0,messages.length-1) + ']');
      // } else {
      //   messages = [];
      // }

    } else if (request.method === 'POST') {
      // if it has all the stuff we need
      requestBody = '';
      var obj;
      request.on('data', function(data){
        requestBody += data;
        var obj = JSON.parse(requestBody);
        if(obj.username && (obj.text || obj.message)){     // original Parse server didn't check if text is formatted correctly
          statusCode = 201;
          // messages.push(obj);
          fs.appendFileSync('./messageLog.txt', JSON.stringify(obj) + ',');
        } else {
          statusCode = 400;
        }
        response.writeHead(statusCode, headers);
        console.log('statusCode after header is written', response.statusCode);
        response.end();
      });
    } else {
      statusCode = 400;
      response.writeHead(statusCode, headers);
      response.end();
    }
  } else {
    fs.exists(path.resolve(__dirname,'../client' + filePath), function(exists) {
      if (exists) {
        fs.readFile(path.resolve(__dirname,'../client' + filePath), function(error, content) {
          if (error) {
            response.writeHead(500);
            response.end();
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
