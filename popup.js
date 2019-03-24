/* popup.js created for Social Media Stopwatch
* Updated 3/24/2019
* Author: Daniel Martin
* website: www.dmartin.me
* Github: github.com/danmartindev
*/

var bg; //rederence to background.js
var popUrls; //background.js urls
var popAlarms; //popAlarms.js urls

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
  showPaused(); //update list with inital paused alarms

  //port responses
  port.onMessage.addListener(function(msg) {
    updateAlarmList();  //calls alarm list to show before the next tick of interval timer
  });

  //creates the alarm from inputs then hides the add popup
  $( "#newalarm-btn" ).click(function(){
    $(this).parent().toggle();
  });

  //button to open url list for adding an alarm
  $( "#add-btn" ).click(function(){
    if($('#url-list').is(":hidden")){
      //creates a list of urls for the user to choose from, 
      for(var key in popUrls){
        //tab id(key) is stored in id property for use in alarm creation 
        if($("#" + key).length) {
          $('#url-list').children("#" + key).text(urlTrunc(popUrls[key], 35));
        } else {
          $('#url-list').append("<li class='add-li' id = " + key + ">" + urlTrunc(popUrls[key], 35) + "</li>");
        }
      }  
    } 
    $(this).toggleClass("fa-minus fa-plus");
    $('#url-list').slideToggle(500);
  });

  //listener for urls in the add timer section
  $( "#url-list" ).on( "click", ".add-li",function() {
    //shows the add timer popup with the url of the desired site
    showAlarmPopup($( this ).text(), $(this).attr('id'));
    //removes the url from list of urls 
    $(this).remove();
    $("#add-btn").toggleClass("fa-minus fa-plus");
    $("#add-btn").toggle();
    $('#url-list').slideToggle(200);
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
      event.preventDefault(); //prevents submission if something is wrong
      $( "#newalarm-div" ).slideToggle(400); //hide the div
      $("#add-btn").slideToggle(400); //show the add btn
    } else {
      alert("Please enter a valid number value for the timer");
    }
    $( this ).trigger("reset"); //reset the form values
  });

  $("#close-btn").click(function(){
    $( "#newalarm-div" ).slideToggle(400); //hide the div
    $("#add-btn").slideToggle(400); //show the add btn
    $( this ).trigger("reset"); //reset the form values
  });

  //listener for alarm options in alarm list
  $( "#alarm-list" ).on( "click", "i",function() {
    var alarmName = $(this).parent().attr('id'); //alarm identifier from li id
    var funcName; //name of function for background.js to run
    if($(this).hasClass("delete-btn")){
      funcName = "delete";
      $(this).parent().remove();
    } else if($(this).hasClass("pause-btn")){
      funcName = "pause";
      $("#alarm-list").remove($(this).parent().attr('id'));
      $(this).toggleClass("pause-btn resume-btn");
      $(this).toggleClass("fa-pause fa-play");
    } else {
      funcName = "resume";
      $(this).toggleClass("pause-btn resume-btn");
      $(this).toggleClass("fa-pause fa-play");
    }
    alarmOptionHandler(alarmName, funcName);
  });
});

//shows alarms that are paused as the popup opens
function showPaused(){
  for(var alarm in pausedAlarms){
    $( "#alarm-list" ).append("<li id='" + alarm + "'><span class='alarm-url'>" + urlTrunc(popUrls[alarm], 25) + " </span><i class='resume-btn soc-btn fas fa-play fa-lg'></i><i class='delete-btn soc-btn fas fa-times fa-lg'></i></li>");
  }
}

//function to truncate url length
urlTrunc = function(url, limit) {
  if(url.length > limit){
    return url.substring(0, limit) + '...';
  } else {
    return url;
  }
};

//function called to pass info to and show new-alarm popup
function showAlarmPopup(url, id){
  $( "#newalarm-div" ).slideToggle(400);
  $( "#newalarm-url" ).html(url);
  $( "#input-id" ).val(id);
}

//alarm options handled here
function alarmOptionHandler(alarmName, func){
  var diff = 0;
  if(func == "pause"){
    var now = new Date().getTime();
    diff = popAlarms[alarmName] - now;
  }
  port.postMessage({func: func, name: alarmName, addTime: diff});
}

function updateAlarmList(){
   //variables for updates
   var diff;
   var hours;
   var minutes;
   var seconds;
   var now = new Date().getTime();

   for(var alarm in popAlarms){
    diff = popAlarms[alarm]- now;
    hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((diff % (1000 * 60)) / 1000);
    //update time info, or create new element for new alarm
    if($("#" + alarm).length) {
      $('#alarm-list').children("#" + alarm).children(".alarm-url").text( urlTrunc(popUrls[alarm], 25) + "  "+ hours + "h, " + minutes + "m, " + seconds);
    } else {
      $( "#alarm-list" ).append("<li id='" + alarm + "'><span class='alarm-url'>" + urlTrunc(popUrls[alarm], 25) + "  "+ hours + "h, " + minutes + "m, " + seconds + "s</span><i class='pause-btn soc-btn fas fa-pause fa-lg'></i><i class='delete-btn soc-btn fas fa-times fa-lg'></i></li>");
    }
   }
}

//interval timer for displaying time left in alarm
window.setInterval( function(){
  if(Object.keys(popAlarms).length > 0){
    updateAlarmList();
  }
},1000)
