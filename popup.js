
var timeouts = [];

$( document ).ready(function() {
  //reference to background page/variable declation
  var bg = chrome.extension.getBackgroundPage();
  var testUrls = bg.urls;



  $( "#timeout" ).click(function(){ 

    var now = moment(); // new Date().getTime();  
    var then = moment().add(39, 'seconds'); // new Date(now + 60 * 1000);

    $(".now").text(moment(now).format('h:mm:ss a'));
    $(".then").text(moment(then).format('h:mm:ss a'));
    $(".duration").text(moment(now).to(then));

    (function timerLoop() {
      $(".difference").text(moment().to(then));
      $(".countdown").text(countdown(then).toString());
      requestAnimationFrame(timerLoop);
    })();
  });


  $( "#debutton" ).click(function(){
    for(var key in testUrls){
      $('#add-list').append("<li>" + testUrls[key] + "</li>");
    }  
  });

  //last button to add timer, creates timeout var and hides popup
  $( "#popup-btn" ).click(function(){
    $("#timed-list").append( $(this).siblings('#popup-url'));
    
    timeouts.push();
    $(this).parent().toggle();
  });

  

  //button to open url list for adding a timer
  $( "#add-btn" ).click(function(){
    if($('#add-list').is(":hidden")){
      for(var key in testUrls){
        $('#add-list').append("<li class='add-li'>" + urlTrunc(testUrls[key]) + "</li>");
      }  
    } 
    $('#add-list').toggle();
  });

  //listener for urls in the add timer section
  $( "#add-list" ).on( "click", ".add-li",function() {
    showPopup($( this ).text());
    $(this).remove();
  });

});

//function called to pass info to popup and show popup
function showPopup(url){
  $( "#add-popup" ).toggle();
  $( "#popup-url" ).html(url);
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

