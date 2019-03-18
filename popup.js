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

  //port responses
  port.onMessage.addListener(function(msg) {
    //calls alarm list to reduce time lag?????????????????????
    updateAlarmList();
  });

  //creates the alarm from inputs then hides the add popup
  $( "#newalarm-btn" ).click(function(){
    $(this).parent().toggle();
  });

  //button to open url list for adding an alarm
  $( "#url-header" ).click(function(){
    if($('#url-list').is(":hidden")){
      //popUrls = bg.urls; //re-populate list of urls
      //creates a list of urls for the user to choose from, 
      for(var key in popUrls){
        //tab id(key) is stored in id property for use in alarm creation 
        if($("#" + key).length) {
          $('#url-list').children("#" + key).text(urlTrunc(popUrls[key]));
        } else {
          $('#url-list').append("<li class='add-li' id = " + key + ">" + urlTrunc(popUrls[key]) + "</li>");
        }
      }  
    } 
    $(this).children().toggleClass("fa-minus fa-plus");
    $('.url-info').slideToggle(500);
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
      $( "#newalarm-div" ).slideToggle(400); //hide the div
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
    $("#alarm-list").remove($(this).parent().attr('id'));
    $(this).toggleClass("pause-btn resume-btn");
    $(this).toggleClass("fa-pause-circle fa-play-circle");
  });

  //listener for pause btns in alarm list
  $( "#alarm-list" ).on( "click", ".resume-btn",function() {
    console.log("clicked resume");
    var alarmName = $(this).parent().attr('id');  
    resumeAlarm(alarmName);
    $(this).toggleClass("pause-btn resume-btn");
    $(this).toggleClass("fa-pause-circle fa-play-circle");
  });
});

//function called to pass info to popup and show popup
function showPopup(url, id){
  $( "#newalarm-div" ).slideToggle(400);
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

function updateAlarmList(){
  updateActiveAlarms(); //active alarms updating
  updatePausedAlarms(); //paused alarms updating
}

function updateActiveAlarms(){
   //variables for updates
   var diff;
   var hours;
   var minutes;
   var seconds;
   var now = new Date().getTime();
 
   popAlarms.forEach(alarm => {
     //calculating time for each alarm
     diff = alarm.scheduledTime - now;
     hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
     minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
     seconds = Math.floor((diff % (1000 * 60)) / 1000);
     //update time info, or create new element for new alarm
     if($("#" + alarm.name).length) {
       $('#alarm-list').children("#" + alarm.name).children("span").text( urlTrunc(popUrls[alarm.name]) + "  "+ hours + "h, " + minutes + "m, " + seconds);
     } else {
       $( "#alarm-list" ).append("<li id='" + alarm.name + "'><span>" + urlTrunc(popUrls[alarm.name]) + "  "+ hours + "h, " + minutes + "m, " + seconds + "s</span><i class='pause-btn fas fa-pause-circle fa-lg'></i></li>");
     }
   });
}

function updatePausedAlarms(){
  for(var key in pausedAlarms){
      $('#alarm-list').children("#" + key).children("span").text(urlTrunc(popUrls[key])); //updating paused alarm info
  } 
}

//interval timer for displaying time left in alarm
window.setInterval( function(){
  if(popAlarms.length > 0){
    updateAlarmList();
  }
},1000)
