//dictionary for storing urls with tab id
var urls = { };

//list of all alarms
var bgAlarms = [];

chrome.runtime.onInstalled.addListener(function() {
    //placeholder for query info to get tabs
    var queryInfo = { };

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

//function for alarm trigger
chrome.alarms.onAlarm.addListener(function( alarm ){
    console.log("Alarm: " + alarm.name);
});

//connecting port for communication with popup
chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "timer"); //alert for port name
    port.onMessage.addListener(function(msg) {
        console.log("H:" + msg.hours + " M:" + msg.minutes + " S:" + msg.seconds + " ID:" + msg.id);
        createAlarm(msg.hours, msg.minutes, msg.seconds, msg.id);
        port.postMessage("message from background");
    });
});

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
        bgAlarms.push(alarm);
    });
}