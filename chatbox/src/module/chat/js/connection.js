'use strict';

var currentUser,
    token;

$(function() {
   var user_login =  sessionStorage.getItem("login");
   var user_pass =  sessionStorage.getItem("pass");
   var last_msg_time ='';
    var QBUser= {

        login: user_login,
        pass: user_pass,
        hide:''
    };
        currentUser = QBUser; 
        connectToChat(QBUser);
    
  
//    $('#loginForm').modal('show');
    $('#loginForm .progress').hide();
//    $('#myuser').on('click', function() {
//       alert('here');
//       QBUser= {
//       // id: 26525279,
//        name: 'preetikllllll',
//        login: 'preetik',
//        pass: 'hrhk@1234'
//    };
//        currentUser = QBUser;
//        connectToChat(QBUser);
//    });
//    $('#user1').on('click', function() {
//        currentUser = QBUser1;
//        connectToChat(QBUser1);
//    });
//    
//
//    $('#user2').on('click', function() {
//        currentUser = QBUser2;
//        connectToChat(QBUser2);
//    });
//    
//    $('#user3').on('click', function() {
//        currentUser = QBUser3;
//        connectToChat(QBUser3);
//    });

    var niceScrollSettings = {
        cursorcolor:'#02B923',
        cursorwidth:'7',
        zindex:'99999'
    };

    $('html').niceScroll(niceScrollSettings);
    $('.nice-scroll').niceScroll(niceScrollSettings);
});

function connectToChat(user) {
    $('#loginForm button').hide();
    $('#loginForm .progress').show();

    QB.createSession({login: user.login, password: user.pass}, function(err, res) {
        if (res) {
            token = res.token;
            user.id = res.user_id;

            mergeUsers([{user: user}]);

            QB.chat.connect({userId: user.id, password: user.pass}, function(err, roster) {
                if (err) {
                    console.log(err);
                } else {
                    // setup scroll stickerpipe module
                    setupStickerPipe();

                    retrieveChatDialogs();

                    // setup message listeners
                    setupAllListeners();

                    // setup scroll events handler
                    setupMsgScrollHandler();

                    setupStreamManagementListeners();
                }
            });
        }
    });
}

function setupAllListeners() {
  QB.chat.onMessageListener         = onMessage;
  QB.chat.onSystemMessageListener   = onSystemMessageListener;
  QB.chat.onDeliveredStatusListener = onDeliveredStatusListener;
  QB.chat.onReadStatusListener      = onReadStatusListener;

  setupIsTypingHandler();
}
// reconnection listeners
function onDisconnectedListener(){
  console.log("onDisconnectedListener");
}

function onReconnectListener(){
  console.log("onReconnectListener");
}


// niceScroll() - ON
$(document).ready(
    function() {
        
    }
);
