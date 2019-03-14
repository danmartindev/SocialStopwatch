var bg;
var popUrls;
var popAlarms;

//opening port to communicate with background page
var port = chrome.runtime.connect({name: "timer"});

$( document ).ready(function() {
  //reference to background.js/variable declaration
  bg = chrome.extension.getBackgroundPage();
  //get the urls and alarms already in bg
  popUrls = bg.urls;
  popAlarms = bg.bgAlarms;

  console.log("popup alarms: " + JSON.stringify(popAlarms));

  
  //port responses
  port.onMessage.addListener(function(msg) {
    console.log("bg " + bg.bgAlarms);
    //popAlarms = bg.bgAlarms;
    console.log("pop " + popAlarms);
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
      for(var key in popUrls){
        //creates a list of urls for the user to choose from, 
        //tab id(key) is stored in id property for use in alarm creation 
        $('#url-list').append("<li class='add-li' id = " + key + ">" + urlTrunc(popUrls[key]) + "</li>");
      }  
    } 
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
    port.postMessage({hours: fields[0].value, minutes: fields[1].value, seconds: fields[2].value, id: fields[3].value}); //post message to background page with alarm info
    //console.log( $( this ).serializeArray() ); //log the serialized array of values
    event.preventDefault(); //prevents submission if something is wrong
    $( "#newalarm-div" ).toggle(); //hide the div
    $( this ).trigger("reset"); //reset the form values
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

function updateAlarmList(){
  var diff;
  var hours;
  var minutes;
  var seconds;
  var now = new Date().getTime();
  console.log("updating alarms");
  popAlarms.forEach(alarm => {
    diff = alarm.scheduledTime - now;
    console.log("st: " + alarm.scheduledTime);
    console.log("dt: " + new Date().getTime());
    hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((diff % (1000 * 60)) / 1000);
    $( "#alarm-list" ).append("<li>" + hours + "h, " + minutes + "m, " + seconds + "s</li>");
  });
}



  // window.setInterval( function(){
  //   $( "#alarm-list" ).text(popAlarms[0].scheduledTime - new Date().getTime());
  // },100)

  //$( "#alarm-list" ).text(popAlarms[0].scheduledTime - new Date().getTime());