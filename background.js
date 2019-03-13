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

// var date = new Date();
// date.setSeconds(date.getSeconds() + 5);
// chrome.alarms.create("myAlarm", {when: date.getTime()});
// chrome.alarms.getAll(function(alarms){
//     alarms.forEach(alarm => {
//         bgAlarms.push(alarm);
//     });
// });

chrome.alarms.onAlarm.addListener(function( alarm ){
    console.log("Alarm: " + alarm.name);
});

chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "timer");
    port.onMessage.addListener(function(msg) {
     
    });
});

function createAlarm(){
    chrome.alarms.create("myAlarm", {when: date.getTime()});
}