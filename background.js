//dictionary for storing urls with tab id
var urls = { };

//dictionary of all alarms
var bgAlarms = [];
//dictionary of paused alarms
var paused = { };

chrome.runtime.onInstalled.addListener(function() {
    //placeholder for query info to get tabs
    var queryInfo = { };
    //clear all previous built up alarms
    chrome.alarms.clearAll();

    //grab tabs already opened
    chrome.tabs.query(queryInfo, function (tabs) {
        tabs.forEach(tab => {
            urls[tab.id] = tab.url;
        });
    });

    //update url for tab changed
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        //only fires when the change is complete
        if(changeInfo.status == "complete"){
            urls[tabId] = tab.url;
        }
    });

    //update urls for newly created tabs
    chrome.tabs.onCreated.addListener(function(tab) {    
        urls[tab.id] = tab.url;
    });

    //remove deleted tabs from urls
    chrome.tabs.onRemoved.addListener(function(tabId) { 
        delete urls[tabId];   
    });
});


//connecting port for communication with popup
chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "timer"); //alert for port name
    port.onMessage.addListener(function(msg) {
        switch(msg.func){
            case "create":
                createAlarm(msg.hours, msg.minutes, msg.seconds, msg.id);
                port.postMessage("message from background");
                break;
            case "delete":
                console.log("delete");
                break;
            case "pause":
                console.log("pausing: " + JSON.stringify(msg.name));
                pauseAlarm(msg.name, msg.addTime);
                break;
            case "resume":
                //console.log("resuming: " + msg.name);
                resumeAlarm(msg.name);
                break;
        }
    });
});

//function for alarm trigger
chrome.alarms.onAlarm.addListener(function( alarm ){
    console.log("Alarm: " + alarm.name);
    alert("Times Up!");
    deleteAlarm(alarm);
});

function resumeAlarm(name){
    var seconds = paused[name] / 1000; //get value of time left and convert to seconds
    delete paused[name];
    createAlarm(0, 0, seconds, name); //recreate alarm with 
};

function createAlarm(h, mm, ss, id){
    var date = new Date(); //create date object 
    //add the set time to date time
    date.setHours(date.getHours() + parseInt(h));
    date.setMinutes(date.getMinutes() + parseInt(mm));
    date.setSeconds(date.getSeconds() + parseInt(ss));
    console.log("date time: " + date.getTime());
    //create the alarm with the name and time
    chrome.alarms.create(id, {when: date.getTime()});
    //get the alarm and add it to the array
    chrome.alarms.get(id, function(alarm){
        bgAlarms[id] = alarm;
    });
}

function deleteAlarm(al){
    var index = bgAlarms.indexOf(al);
    bgAlarms.splice(index, 1);     //remove from bg array
    chrome.alarms.clear(al.name); //remove from chrome alarms
}

/*
*   pauses alarm by deleting the alarm and replacing
*   must be done as changing the scheduled time does
*   not stop the alarm from firing at the original declared time  
*/  
function pauseAlarm(name, time){
    chrome.alarms.get(name, function(alarm){
        deleteAlarm(alarm);
    });
    //paused.push({name: name, time: time}); //save time remaining to later reinstate alarm
    paused[name] = time;
    console.log("paused: " + JSON.stringify(paused));
}

 // chrome.alarms.getAll(function(alarms){
    //     alarms.forEach(alarm => {
    //         console.log("alarms: " + JSON.stringify(alarm));
    //     });
    // });