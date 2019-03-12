//dictionary for storing urls with tab id
var urls = { };

//list of timers with name of timer and how much time has passed
var timers = { }

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

//listener to grab information on timers from popup
// chrome.runtime.onConnect.addListener(function(port) {
//     console.assert(port.name == "timer");
//     port.onMessage.addListener(function(msg) {
//         console.log("it listened: " + msg.hours + ", " + msg.minutes + ", " + msg.seconds);

//         //getting inital date object to add to
//         var date = new Date();
//         //setting date for limit
//         date.setSeconds(date.getSeconds() + msg.seconds);
//         date.setMinutes(date.getMinutes() + msg.minutes);
//         date.setHours(date.getHours() + msg.hours);

//         //chrome.alarms.create("testAlarm", {when: date1.getTime()});
//         chrome.alarms.create("testAlarm", {periodInMinutes: 2});

//     });
// });


// chrome.alarms.onAlarm.addListener(function( alarm ) {
//     console.log("Got an alarm!", alarm);
// });