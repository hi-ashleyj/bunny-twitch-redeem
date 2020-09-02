// Events for all the things

Socket.on("reload", async (_data) => {
    // Do reload here
    for (let name in alertStash) {
        alertStash[name].remove();
    }

    alertStash = {};
    let list = JSON.parse(await Comms.get("get_list", {}));

    for (let name in list) {
        let work = document.createElement("video");
        work.className = "redeem video";
        work.src = Comms.connection + ((Comms.connection.slice(-1) == "/") ? "res/" : "/res/") + list[name];
        work.preload = "auto";
        work.volume = 0.6;

        document.getElementById("video-dump").append(work);
        
        alertStash[name.toLowerCase()] = work;
    }
});

Socket.on("redeem", (obj) => {
    UIEls.cueAlert("redeem", JSON.parse(obj));
});