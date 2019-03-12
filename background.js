//dictionary for storing urls with tab id
var urls = { };
var timer = { }
//

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
chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "timer");
    port.onMessage.addListener(function(msg) {
        console.log("it listened: " + msg.hours + ", " + msg.minutes + ", " + msg.seconds);
        runTimer(msg.hours, msg.minutes, msg.seconds);
    });
});

var pollInterval = 1000; // 1 minute

function runTimer(h, mm, ss){
    console.log("timer started");
    //get time of now + the timer length
    var endTime = moment().add(h, 'hours').add(mm, 'minutes').add(ss, 'seconds');

    //function that loops until timer reaches 0
    var timerInt = setInterval(timerLoop(endTime), 1000);
    
}

function timerLoop(then) {
    console.log("initial then = " + countdown(then).toString());
    if(countdown(then).toString() == 0){
        alert("ZERO");
        console.log("bg timer hit 0");
    }
};