/* background.js created for Social Media Stopwatch
* Updated 3/22/2019
* Author: Daniel Martin
* website: www.dmartin.me
* Github: github.com/danmartindev
*/

var urls = { }; //dictionary for storing urls with tab id
var bgAlarms = { }; //dictionary of all alarms
var paused = { }; //dictionary of paused alarms
var defaultAlarms = { }; //dictionary of alarms created on url creation

var queryInfo = { }; //placeholder for query info to get tabs


chrome.runtime.onInstalled.addListener(function() {
    //clear all previous built up alarms
    chrome.alarms.clearAll();

    initTabs();
    //update url for tab changed
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        //only fires when the change is complete
        if(changeInfo.status == "complete"){
            console.log("change info: " + changeInfo.status.discarded);
            urls[tabId] = tab.url;
            //convert tabId to string to prevent error
            compareURLs(tabId.toString());
        }
    });

    //update urls for newly created tabs
    chrome.tabs.onCreated.addListener(function(tab) {    
        urls[tab.id] = tab.url;
    });

    //remove deleted tabs from urls
    chrome.tabs.onRemoved.addListener(function(tabId) { 
        //delete alarms/paused that match tab when tab is closed
        if(bgAlarms[tabId]){
            deleteAlarm(tabId);
        }
        if(paused[tabId]){
            delete paused[tabId];
        }
        delete urls[tabId]; //remove from urls list   
    });

    //get the default alarm urls/times from local storage
    chrome.storage.sync.get(['urls'], function(result){
        defaultAlarms = result.urls;
        console.log(defaultAlarms);
        for(var url in urls){
            compareURLs(url);
        }
    });
});

//grabs tabs each time the popup is opened
function initTabs(){
    //grab open tabs
    chrome.tabs.query(queryInfo, function (tabs) {
        tabs.forEach(tab => {
            urls[tab.id] = tab.url;
        });
    });
}

//connecting port for communication with popup
chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "timer"); //alert for port name
    port.onMessage.addListener(function(msg) {
        switch(msg.func){
            case "init":
                initTabs();
                break;
            case "create":
                createAlarm(msg.hours, msg.minutes, msg.seconds, msg.id);
                port.postMessage("message from background");
                break;
            case "delete":
                console.log("delete: " + msg.name);
                deleteAlarm(msg.name);
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

//listens for change in local storage
chrome.storage.onChanged.addListener(function(changes, sync){
    //console.log("change detected: " + JSON.stringify(changes.urls.newValue));
    defaultAlarms = changes.urls.newValue; //update default alarms to newly set values
    //console.log("D Alarms: " + JSON.stringify(defaultAlarms));
});

function compareURLs(id){
    //check if alarm already exists
    var exists = false;
    if(bgAlarms[id]){
        exists = true;
    }
    //if not
    if(exists == false){
        for(var durl in defaultAlarms){
            //console.log("URL: " + urls[url] + ", DURL: " + durl);
            //console.log(bgAlarms.includes(id));
            if(urls[id].match(durl)){
                console.log("matched");
                console.log("creating: " + defaultAlarms[durl][0] + ", " + defaultAlarms[durl][1] + ", " + defaultAlarms[durl][2] + ", " + id);
                createAlarm(defaultAlarms[durl][0], defaultAlarms[durl][1], defaultAlarms[durl][2], id);
            } 
        }
    }
}

function resumeAlarm(name){
    var seconds = paused[name] / 1000; //get value of time left and convert to seconds
    delete paused[name];
    console.log(Object.keys(paused).length);
    createAlarm(0, 0, seconds, name); //recreate alarm with 
};

function createAlarm(h, mm, ss, id){
    var date = new Date(); //create date object 
    //add the set time to date time
    date.setHours(date.getHours() + parseInt(h));
    date.setMinutes(date.getMinutes() + parseInt(mm));
    date.setSeconds(date.getSeconds() + parseInt(ss));

    chrome.alarms.create(id, {when: date.getTime()}); //create the alarm with the name and time
    chrome.alarms.get(id, function(alarm){
        bgAlarms[alarm.name] = alarm.scheduledTime; //get the alarm and add it to the array
    });
}

function deleteAlarm(alarmName){
    delete bgAlarms[alarmName];
    chrome.alarms.clear(alarmName.toString()); //remove from chrome alarms
}

/*
*   pauses alarm by deleting the alarm and replacing
*   must be done as changing the scheduled time does
*   not stop the alarm from firing at the original declared time  
*/  
function pauseAlarm(name, time){
    deleteAlarm(name);
    //paused.push({name: name, time: time}); //save time remaining to later reinstate alarm
    paused[name] = time;
    console.log(Object.keys(paused).length);
    console.log("paused: " + JSON.stringify(paused));
}

 // chrome.alarms.getAll(function(alarms){
    //     alarms.forEach(alarm => {
    //         console.log("alarms: " + JSON.stringify(alarm));
    //     });
    // });