let UIEls = {};

UIEls.alertELs = [];
let alertCue = [];

UIEls.Redeem = function(prop) {
    let element = document.createElement("div");
    element.className = "content alert redeem";

    element.append(alertStash[prop.name.toLowerCase()]);

    alertStash[prop.name.toLowerCase()].currentTime = 0;

    window.setTimeout(() => {element.setAttribute("data-vis", true); alertStash[prop.name.toLowerCase()].play()}, 100);

    UIEls.alertELs.push(element);
    document.body.append(element);

    window.setTimeout(UIEls.removeAlert, (alertStash[prop.name.toLowerCase()].duration * 1000) - 400);
};

UIEls.NextAlert = function() {
    if (alertCue.length > 0) {
        if (alertCue[0].type == "redeem") {
            UIEls.Redeem(alertCue.shift());
        } else {
            alertCue.shift();
        }
    }
};

UIEls.cueAlert = function(type, obj) {
    alertCue.push(Object.assign({ type }, obj));
    if (UIEls.alertELs.length < 1) {
        UIEls.NextAlert();
    }
};

UIEls.removeAlert = function() {
    for (let el of UIEls.alertELs) {
        el.removeAttribute("data-vis");
        window.setTimeout(() => {
            let banana = el.querySelectorAll("video");
            for (let i = banana.length - 1; i >= 0; i--) {
                document.getElementById("video-dump").append(banana[i]);
            }
            el.remove();
        }, 500);
    }

    window.setTimeout(() => {
        UIEls.alertELs = [];

        if (alertCue.length > 0) {
            UIEls.NextAlert();
        }
    }, 500);
};

