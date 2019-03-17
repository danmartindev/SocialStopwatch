/* popup.js created for Social Media Stopwatch
* Updated 3/17/2019
* Author: Daniel Martin
* website: www.dmartin.me
* Github: github.com/danmartindev
*/

var bg;
var popUrls;
var popAlarms;

//opening port to communicate with background page
var port = chrome.runtime.connect({name: "timer"});

$( document ).ready(function() {
  //initial post message to load urls in bg
  port.postMessage({func: "init"});
  //reference to background.js/variable declaration
  bg = chrome.extension.getBackgroundPage();
  //get the urls and alarms already in bg
  popAlarms = bg.bgAlarms;
  pausedAlarms = bg.paused;
  popUrls = bg.urls;

  updateAlarmList(); //update list, otherwise will wait for first load

  console.log("popup alarms: " + JSON.stringify(popAlarms));

  //port responses
  port.onMessage.addListener(function(msg) {
    //console.log("bg " + bg.bgAlarms);
    //popAlarms = bg.bgAlarms;
    //console.log("pop " + popAlarms);
    updateAlarmList();
    //$( "#alarm-list" ).text(popAlarms[0].scheduledTime - new Date().getTime());
  });

  //creates the alarm then hides the add popup
  $( "#newalarm-btn" ).click(function(){
    $(this).parent().toggle();
  });

  //button to open url list for adding an alarm
  $( "#add-btn" ).click(function(){
    if($('#url-list').is(":hidden")){
      //popUrls = bg.urls; //re-populate list of urls
      //creates a list of urls for the user to choose from, 
      for(var key in popUrls){
        //tab id(key) is stored in id property for use in alarm creation 
        if($("#" + key).length) {
          //child exists
          console.log("update url: " + key);
          $('#url-list').children("#" + key).text(urlTrunc(popUrls[key]));
        } else {
          //create new element if new tab
          console.log("create url: " + key);
          $('#url-list').append("<li class='add-li' id = " + key + ">" + urlTrunc(popUrls[key]) + "</li>");
        }
      }  
    } 
    $(this).toggleClass("fa-plus");
    $(this).toggleClass("fa-minus");
    $('#url-list').toggle();
  });

  //listener for urls in the add timer section
  $( "#url-list" ).on( "click", ".add-li",function() {
    //shows the add timer popup with the url of the desired site
    showPopup($( this ).text(), $(this).attr('id'));
    //removes the url from list of urls 
    $(this).remove();
  });

  //code to submit form for new alarm
  $( "form" ).submit(function(event){
    var fields = $( this ).serializeArray(); //serialize values into an array
    var hasNan = false;
    fields.forEach(field => {
      //sets value to 0 for emty input
      if(field.value == ""){
        field.value = 0;
      }
      //checks values for NaN
      else if(isNaN(parseInt(field.value))){
        hasNan = true;
      }
    });
    
    if(!hasNan){
      port.postMessage({func: "create", hours: fields[0].value, minutes: fields[1].value, seconds: fields[2].value, id: fields[3].value}); //post message to background page with alarm info
      //console.log( $( this ).serializeArray() ); //log the serialized array of values
      event.preventDefault(); //prevents submission if something is wrong
      $( "#newalarm-div" ).toggle(); //hide the div
    } else {
      alert("Please enter a valid number value for the timer");
    }
    $( this ).trigger("reset"); //reset the form values
  });

  //listener for pause btns in alarm list
  $( "#alarm-list" ).on( "click", ".pause-btn",function() {
    console.log("clicked pause");
    var alarmName = $(this).parent().attr('id');  
    popAlarms.forEach(alarm => {
      if(alarm.name == alarmName){
        pauseAlarm(alarm);
      }
    });
    // $(this).toggleClass("pause-btn");
    // $(this).toggleClass("resume-btn");
  });

  //listener for pause btns in alarm list
  $( "#alarm-list" ).on( "click", ".resume-btn",function() {
    console.log("clicked resume");
    var alarmName = $(this).parent().attr('id');  
    resumeAlarm(alarmName);
    // $(this).toggleClass("pause-btn");
    // $(this).toggleClass("resume-btn");
  });
});

//function called to pass info to popup and show popup
function showPopup(url, id){
  $( "#newalarm-div" ).toggle();
  $( "#newalarm-url" ).html(url);
  $( "#input-id" ).val(id);
}

//function to truncate url length
urlTrunc = function(url) {
  var limit = 35;
  if(url.length > limit){
    return url.substring(0, limit) + '...';
  } else {
    return url;
  }
};

//manually pause alarm
function pauseAlarm(alarm){
  var now = new Date().getTime();
  var diff = alarm.scheduledTime - now;
  port.postMessage({func: "pause", name: alarm.name, addTime: diff}); //post message to pause specific alarm
}

//manually resume alarm
function resumeAlarm(alarm){
  port.postMessage({func: "resume", name: alarm});
}

//////optimize for adding new li, dont delete and recreate!!
function updateAlarmList(){
  //variables for updates
  var diff;
  var hours;
  var minutes;
  var seconds;
  var now = new Date().getTime();
  //empty list before refreshing
  $( "#alarm-list" ).empty();

  popAlarms.forEach(alarm => {
    diff = alarm.scheduledTime - now;
    hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((diff % (1000 * 60)) / 1000);
    $( "#alarm-list" ).append("<li id='" + alarm.name + "'>" + urlTrunc(popUrls[alarm.name]) + "  "+ hours + "h, " + minutes + "m, " + seconds + "s <i class='pause-btn fas fa-pause-circle fa-lg'></i></li>");
  });

  for(var key in pausedAlarms){
    $( "#alarm-list" ).append("<li id='" + key + "'>"+ urlTrunc(popUrls[key]) +"<i class='resume-btn fas fa-play-circle fa-lg'></i></li>");
  }
}

window.setInterval( function(){
  if(popAlarms.length > 0){
    updateAlarmList();
  }
},1000)


  // window.setInterval( function(){
  //   $( "#alarm-list" ).text(popAlarms[0].scheduledTime - new Date().getTime());
  // },100)

  //$( "#alarm-list" ).text(popAlarms[0].scheduledTime - new Date().getTime());