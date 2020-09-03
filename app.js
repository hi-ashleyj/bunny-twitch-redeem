let http = require("http");
let https = require("https");
let url = require("url");
let path = require("path");
let fsSync = require("fs");
let fs = fsSync.promises;
let ws = require("ws");
let os = require("os");
let opn = require("open");

let twHelixCID = "58luouc78gmhbvvzsbmnkwdkjxjn1h";
let twChannel = "thrashingbunny";

let wss;
let wsPort = 6969;

let PubSub = {};
PubSub.socket;
PubSub.token;
PubSub.ready = false;

let alerts = [];

let documentsFolder = path.resolve(os.homedir(), "twitch-redemption");

let httpsGet = function(url, headers) {
    return new Promise((resolve, reject) => {
        https.get(url, {headers: headers}, (href) => {
            let buffer = Buffer.from([]);

            href.on("data", (data) => {
                buffer = Buffer.concat([buffer, data]);
            });

            href.on("end", () => {
                resolve(buffer.toString());
            });

            href.on("error", (err) => {
                reject(err);
            });
        });
    });
};

let wsReply = async function(cl, msg) {
    if (cl) {
        cl.send(msg);
    } else {
        wss.clients.forEach(function each(client) {
            if (client.readyState === ws.OPEN) {
                client.send(msg);
            }
        });
    }
};

let findAlerts = async function() {
    let files = await fs.readdir(documentsFolder, {encoding: "utf8", withFileTypes: true});

    let output = {};

    for (let dirent of files) {
        let sep = dirent.name.slice(0, dirent.name.lastIndexOf("."));
        output[sep] = dirent.name;
    }

    return output;
};

if (!fsSync.existsSync(documentsFolder)) {
    try {
        fs.mkdir(documentsFolder).then(async function() {
            await findAlerts();
        });
    } catch (_err) {
        
    }
} else {
    findAlerts();
}

let handleHTTPRequest = async function (req, res) {
    let parseIt = url.parse(req.url, true);
    let pathed = path.parse(req.url);

    let needsIndex = "index.html";

    if (pathed.base) {
        needsIndex = "";
    }

    if (req.method == "GET" && !parseIt.search) {
        // This handles sending the pages required.
        
        let pathpath = path.resolve(__dirname, "content", parseIt.pathname.slice(1).split(".html").join(""), needsIndex);

        if (parseIt.pathname.includes("res")) {
            pathpath = path.resolve(documentsFolder, parseIt.pathname.slice(1).split("res/").join(""));
        }

        try {
            if (pathed.ext == ".html") {
                res.setHeader("Content-Type", "text/html");
            } else if (pathed.ext == ".js") {
                res.setHeader("Content-Type", "application/js");
            } else if (pathed.ext == ".css") {
                res.setHeader("Content-Type", "text/css");
            } else if (pathed.ext == ".png") {
                res.setHeader("Content-Type", "image/png");
            } else if (pathed.ext == ".svg") {
                res.setHeader("Content-Type", "image/svg+xml");
            } else if (pathed.ext == ".ttf") {
                res.setHeader("Content-Type", "application/font");
            }
    
            let stream = fsSync.createReadStream(pathpath);
            stream.on("open", () => {
                stream.pipe(res);
            });
    
            stream.on("error", () => {
                res.statusCode = 404;
                console.log("ERR|UNK: HSRV 404");
                res.end("Not Found");
            });
        } catch {
            res.statusCode = 404;
            console.log("ERR|UNK: HSRV 404");
            res.end("Not Found");
        }

    } else if (req.method == "GET" && parseIt.search) {
        let query = parseIt.search.slice(1);
        let slit = query.split("&");
        let params = {};
        for (var str of slit) {
            let slitslit = str.split("=");
            params[slitslit[0]] = slitslit[1];
        }

        if (params.method) {
            if (params.method == "get_list") {
                res.end(JSON.stringify(await findAlerts()));
            }
        }

        if (params.test) {
            wsReply(null, "REDEEM|" + JSON.stringify({name: params.test, input: params.input}));
            res.end("Tested alert " + params.test + ((params.input) ? (" with payload: " + params.input) : "") + "\n");
        }

        if (params.reload) {
            wsReply(null, "RELOAD|user");
            res.end("Sent user reload event to all clients\n");
        }

        if (params.test) {

        }

    } else if (req.method == "POST" && parseIt.search) {
        let query = parseIt.search.slice(1);
        let slit = query.split("&");
        let params = {};
        for (var str of slit) {
            let slitslit = str.split("=");
            params[slitslit[0]] = slitslit[1];
        }

        if (params.method = "token_get") {
            // get data

            let buffer = Buffer.from([]);
            req.on("data", (chunk) => {
                buffer = Buffer.concat([buffer, chunk]);
            });
            req.on("end", (e) => {
                PubSub.token = buffer.toString();

                // then
                httpsGet("https://api.twitch.tv/helix/users?login=" + twChannel, {"Client-ID": twHelixCID, "Authorization": "Bearer " + PubSub.token}).then((user) => {
                    let val = JSON.parse(user);
                    PubSub.uid = val.data[0].id;
                    PubSub.ready = true;
                    PubSub.connect();
                });
            });
        }

        res.statusCode = 200;
        res.end();
    } else {
        res.statusCode = 400;
        res.writeHead(400, http.STATUS_CODES[400]);
        res.end();
    }
}

let handleWSRequest = async function(cl, msg) {
    let res = msg.split("|");
    let type = res[0];
    let raw = res[1];

    if (type == "HELLO") {
        console.log("Website say hi");
        wsReply(cl, "HELLO|Hi!");
        wsReply(cl, "RELOAD|auto");
    }
};

let bitch = http.createServer(handleHTTPRequest);

wss = new ws.Server({server: bitch});

wss.on('connection', function (cl) {
    cl.on('message', function (msg) {
        handleWSRequest(cl, msg)
    });
});

bitch.listen({
    port: wsPort
}, () => {console.log("Listening on port " + wsPort); PubSub.acquireToken()});


PubSub.disconnect = function() {
    if (PubSub.socket) {
        PubSub.socket.terminate();
        clearTimeout(PubSub.timeout);
        PubSub.socket = undefined;
    }
};

PubSub.handler = function(data) {
    let val = JSON.parse(data);

    if (val.type.toLowerCase() == "pong") {
        PubSub.lastPing = null;
    } else if (val.type.toLowerCase() == "reconnect") {
        PubSub.lastPing = null;
        PubSub.connect();
    } else if (val.type.toLowerCase() == "response") {
        if (val.error == "" && val.nonce == PubSub.subscribeNonce) {
            console.log("PubSub connected");
        } else {
            wsReply(null, "CONNECT_ERR|PubSub");
            console.error("PubSub failed");
        }
    } else if (val.type.toLowerCase() == "message") {
        let message = JSON.parse(val.data.message);
        if (message.type == "reward-redeemed") {
            wsReply(null, "REDEEM|" + JSON.stringify({name: message.data.redemption.reward.title, input: null}));
        }
    }

    // console.log(val);
};

PubSub.ping = function() {
    if (PubSub.lastPing) {
        PubSub.connect();
        return;
    }
    PubSub.lastPing = new Date(); 
    PubSub.socket.send(JSON.stringify({type: "PING"}));
    PubSub.timeout = setTimeout(PubSub.ping, (90 * 1000) + Math.floor(Math.random() * 400));
};

PubSub.connect = function() {
    if (PubSub.ready) {
        PubSub.disconnect();
        PubSub.socket = new ws("wss://pubsub-edge.twitch.tv");
        PubSub.timeout = setTimeout(PubSub.ping, (90 * 1000) + Math.floor(Math.random() * 400));
    
        PubSub.socket.on("open", () => {
            PubSub.subscribeNonce = Math.floor(Math.random() * 10e15) + "";
            PubSub.socket.send(JSON.stringify({type: "LISTEN", nonce: PubSub.subscribeNonce, data: {topics: ["channel-points-channel-v1." + PubSub.uid], auth_token: PubSub.token}}));
        });

        PubSub.socket.on("message", PubSub.handler);
    }
};

PubSub.acquireToken = function() {
    opn("http://localhost:6969/auth");
};




