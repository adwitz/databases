// define a function for iterating through a collection of messages and display them
var firstLoad = function(messages) {
  // need to parse the response sent from the server
  messages = JSON.parse(messages);
  addMessage(messages);
  // enable room selection functionality
  makeRoom();
  $('#all').on('click', function(){
    $('.message').show();
    currentUserInfo.roomName = '';
    $(this).css('background-color', '#FF0000');
  });

};

var addMessage = function(messages) {
  var numMessages = messages.length;
  if(numMessages > 25){
    numMessages = 25;
  }

  // for each message
  $('.message').remove();
  for (var i = 0; i < numMessages; i++) {
    // store info about the message being considered
    var current = {
      text: messages[i].text || messages[i].message, // accommodate text and message keys in the result object
      username: messages[i].username,
      createdAt: messages[i].createdAt,
      roomName: messages[i].roomname || '' // set a default in case a room name isn't provided
    };
    // sanitize all of those values
    for (var key in current){
      current[key] = sanitize(current[key]);
    }
    // if the message has text, add it to the top of the displayed messages
    if (current.text !== undefined) {
      $('.main ul').prepend('<li class="message ' + current.roomName + ' ' +  current.username + '">' +
          current.username + ': ' + current.text + '</li>');
    }

    if (!currentUserInfo.users[current.username]){
      currentUserInfo.users[current.username] = true;
      $('.UserNamesContainer').append('<div class = "username ' + current.username +
            '">' + current.username + '</div>');
      $('.UserNamesContainer .' + current.username).on('click', function(){
         $(this).toggleClass('friend');
         var a = $(this).attr('class');
         var b = a.split(' ');
         $('.messagesContainer .' + b[1]).toggleClass('friend');
      });
    }

    // add to the roomNames list
    if (!currentUserInfo.roomNames[current.roomName]){
      currentUserInfo.roomNames[current.roomName] = true;
      $('.roomsContainer').append('<div class="' + current.roomName + '">' + current.roomName + '</div>');
    }
  }
  // if we're in a particular room, show only the messages for that room
  if (currentUserInfo.roomName){
    $('.messages').hide();
    $('.' + currentUserInfo.roomName).show();
  }
};

var makeRoom = function(){
    $('.roomsContainer div').on('click', function(){
      $('.roomsContainer div').css('background-color', 'white');
      var roomName = $(this).attr('class');
      $('.message').hide();
      $('.' + roomName).show();
      currentUserInfo.roomName = roomName;
      $(this).css('background-color', '#FF0000');
    });
  };

//Sanitize takes any string and takes out all the '<' to make it safe to post to the screen
var sanitize = function(str){
  if (str === undefined || str === null){ return str; }
  if (str.indexOf('<') !== -1) {
      while (str.indexOf('<') !== -1){
        var a = str.indexOf('<');
        str = str.slice(0, a) + str.slice(a + 1);
      }
    }
  return str;
};

// define global info about the current environment
var currentUserInfo = {
  username: 'anonymous',
  roomName: '',
  roomNames: {},
  messagesSeen: 0,
  users: {},
  friends: {}
};

$(document).ready(function(){
  // On page load, display messages currently on server
  var response = $.ajax({
    url: 'http://127.0.0.1:8080/1/classes/messages',
    //url: 'https://api.parse.com/1/classes/chatterbox',
    data: {
      //order: '-createdAt', // get messages in reverse chronological order
      //limit: 25
    },
    success: firstLoad
  });

  // When refresh button clicked, add new messages since last request
  $('.refresh').on('click', function(){
    var response = $.ajax({
      //url: 'https://api.parse.com/1/classes/chatterbox',
      url: 'http://127.0.0.1:8080/1/classes/messages',
      data: {
        //order: '-createdAt',
        //limit: 25
      },
      success: function(messages) {
          messages = JSON.parse(messages);
          addMessage(messages);
        }
    });
  });

  // Define functionality for the username field and button
  $('.username.button').on('click', function(){
    // set the chosen username for use in sending future messages to the server
    currentUserInfo.username = $('.username.input').val();
    // update the h2 element with username
    $('.username').text($('.username.input').val());
  });

  // Set the functionality for message submission
  $('.chat.button').on('click', function(){
    var sendResponse = $.ajax({
      url: 'http://127.0.0.1:8080/1/classes/messages',
      type: 'POST',
      data: JSON.stringify(turnMessageIntoObject()),
      // contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message');
      }
    });
  });


  $('.createRoom.button').on('click', function(){
    alert();
    var roomName = $('.createRoom.input').val();
    if (!currentUserInfo.roomNames[roomName]){
      currentUserInfo.roomNames[roomName] = true;
      $('.roomsContainer').append('<div class="' + roomName + '">' + roomName + '</div>');
      makeRoom();
    }
  });
  // Turn a message into an object to be sent to the server
  var turnMessageIntoObject = function(){
    var message = $('.chat.input').val();
    return {
      username: currentUserInfo.username,
      text: message,
      roomname: currentUserInfo.roomname
    };
  };

});
