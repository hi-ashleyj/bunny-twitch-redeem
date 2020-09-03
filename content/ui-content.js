let UIEls = {};

UIEls.alertELs = [];
let alertCue = [];
let alertTimeout;

UIEls.Redeem = function(prop) {
    let element = document.createElement("div");
    element.className = "content alert redeem";

    element.append(alertStash[prop.name.toLowerCase()]);

    alertStash[prop.name.toLowerCase()].currentTime = 0;

    window.setTimeout(() => {element.setAttribute("data-vis", true); alertStash[prop.name.toLowerCase()].play()}, 100);

    UIEls.alertELs.push(element);
    document.body.append(element);

    alertTimeout = window.setTimeout(UIEls.removeAlert, (alertStash[prop.name.toLowerCase()].duration * 1000) - 400);
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

    alertTimeout = undefined;

    window.setTimeout(() => {
        UIEls.alertELs = [];

        if (alertCue.length > 0) {
            UIEls.NextAlert();
        }
    }, 500);
};

UIEls.stopAlert = function(flush) {
    if (alertTimeout) {
        window.clearTimeout(alertTimeout);
        alertTimeout = undefined;
        if (flush) {
            alertCue = [];
        }
        let work = document.querySelectorAll("div.content.alert.redeem[data-vis]");
        for (let i = 0; i < work.length; i++) {
            let videos = work[i].querySelectorAll("video");
            for (let j = 0; j < videos.length; j++) {
                if (videos[j].currentTime + 0.6 < videos[j].duration) {
                    let sevn = videos[j];
                    window.setTimeout(() => {sevn.pause(); }, 500);
                }
            }
        }
        UIEls.removeAlert();
    } 
};

