// Events for all the things

let reloadConfig = async function() {
    let config = JSON.parse(await Comms.get("method=get_config", {}));
    a.config = Object.assign(a.config, config);
};

Socket.on("reload", async (_data) => {
    // Do reload here
    for (let name in alertStash) {
        alertStash[name].remove();
    }

    alertStash = {};
    let list = JSON.parse(await Comms.get("method=get_list", {}));

    for (let name in list) {
        let work = document.createElement("video");
        work.className = "redeem video";
        work.src = Comms.connection + ((Comms.connection.slice(-1) == "/") ? "res/" : "/res/") + list[name];
        work.preload = "auto";

        document.getElementById("video-dump").append(work);
        
        alertStash[name.toLowerCase()] = work;
    }

    reloadConfig();
});

Socket.on("config", reloadConfig);

Socket.on("redeem", (obj) => {
    UIEls.cueAlert("redeem", JSON.parse(obj));
});

Socket.on("stop", () => {
    UIEls.stopAlert(false);
});

Socket.on("flush", () => {
    UIEls.stopAlert(true);
});