
$( document ).ready(function() {
  //reference to background.js/variable declaration
  var bg = chrome.extension.getBackgroundPage();
  //get the urls and alarms already in bg
  var popUrls = bg.urls;
  var popAlarms = bg.bgAlarms;

  console.log("popup alarms: " + JSON.stringify(popAlarms));
  //opening port to communicate with background page
  var port = chrome.runtime.connect({name: "timer"});

  //creates the alarm then hides the add popup
  $( "#newalarm-btn" ).click(function(){
    port.postMessage({name: "", hours: "0", minutes: "0", seconds: "5"});
    $(this).parent().toggle();
  });

  //button to open url list for adding an alarm
  $( "#add-btn" ).click(function(){
    if($('#url-list').is(":hidden")){
      for(var key in popUrls){
        //creates a list of urls for the user to choose from, 
        //tab id(key) is stored in id property for use in alarm creation 
        $('#url-list').append("<li class='add-li' id = 'key'>" + urlTrunc(popUrls[key]) + "</li>");
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

});

//function called to pass info to popup and show popup
function showPopup(url, id){
  $( "newalarm-div" ).toggle();
  $( "#newalarm-url" ).html(url);
  $( "#input-id" ).value(id);
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



  // window.setInterval( function(){
  //   $( "#alarm-list" ).text(popAlarms[0].scheduledTime - new Date().getTime());
  // },100)

  //$( "#alarm-list" ).text(popAlarms[0].scheduledTime - new Date().getTime());