var QBApp = {
    appId: 56609,
    authKey: 'GufnKDkQM3RZHsn',
    authSecret: 'SwnRpB4Fe6VtJrS'
};

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

var QBUser1 = {
        id: 26518312,
        name: 'Twinkle sharma',
        login: 'Twinkle',
        pass: 'hrhk@1234'
    },
    QBUser2 = {
       id: 26522045,
        name: 'akansha sharma',
        login: 'akansha',
        pass: 'hrhk@1234'
    },
    QBUser3 = {
        id: 26525279,
        name: 'preetik',
        login: 'preetik',
        pass: 'hrhk@1234'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);

$('.j-version').text('v.' + QB.version + '.' + QB.buildNumber);
