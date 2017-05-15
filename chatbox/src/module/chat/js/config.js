var QBApp = {
    appId: 56609,
    authKey: 'GufnKDkQM3RZHsn',
    authSecret: 'SwnRpB4Fe6VtJrS'
};
var hide_identity = 0;
var hide_dialog_id = 0;
var config = {
    chatProtocol: {
        active: 2
    },
    streamManagement: {
        enable: true
    },
    debug: {
        mode: 1,
        file: null
    },
    stickerpipe: {
        elId: 'stickers_btn',
        apiKey: '847b82c49db21ecec88c510e377b452c',
        enableEmojiTab: false,
        enableHistoryTab: true,
        enableStoreTab: true,

        userId: null,

        priceB: '0.99 $',
        priceC: '1.99 $'
    }
};
var user_login =  sessionStorage.getItem("login");
   var user_pass =  sessionStorage.getItem("pass");
//var QBUser1 = {
//     //   id: 26518312,
//        name: 'Twinkle',
//        login: user_login,
//        pass: user_pass
//    },
//    QBUser2 = {
//    //   id: 26522045,
//        name: 'akansha ddddddddd',
//        //full_name:'Akanahsaaaaaaa',
//        login: 'akansha',
//        pass: 'hrhk@1234'
//    },
//    QBUser3 = {
//       // id: 26525279,
//        name: 'preetikllllll',
//        login: 'Preeti',
//        pass: 'hrhk@1234'
//    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);

$('.j-version').text('v.' + QB.version + '.' + QB.buildNumber);
