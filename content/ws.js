wsc = new WebSocket("ws://localhost:6969");

wsc.addEventListener('open', function(_e) {
    Socket.send('HELLO|Hi!');
});

Socket.fire = function(type, msg) {
    for (var i in Socket.events) {
        if (Socket.events[i].type == type) {
            Socket.events[i].call((msg) ? msg : "");
        }
    }
};

// Listen for messages
wsc.addEventListener('message', function (event) {
    let res = event.data.split("|");
    let type = res[0].toLowerCase();
    let msg = res[1];
    Socket.fire(type, msg);
});

Socket.send = function(msg) {
    wsc.send(msg);
};