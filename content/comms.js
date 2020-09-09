let Comms = {};
Comms.connection = window.location.href.split("/").slice(0, 3).join("/");

Comms.get = function(query, body) {
    return new Promise(async (resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open("GET", Comms.connection + "?" + query);
        request.addEventListener("load", () => {
            resolve(request.responseText)
        });
        request.addEventListener("error", () => {
            reject(request.status);
        });
        if (body) {
            request.send(body);
        } else {
            request.send();
        }
    });
};

Comms.post = function(query, body) {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open("POST", Comms.connection + "?" + query);
        request.addEventListener("load", () => {
            resolve(request.responseText);
        });
        request.addEventListener("error", () => {
            reject(request.status);
        });
        if (body) {
            request.send(body);
        } else {
            request.send();
        }
    });
};

