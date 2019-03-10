
$( document ).ready(function() {
  //reference to background page/variable declation
  var bg = chrome.extension.getBackgroundPage();
  var testUrls = bg.urls;

  $( "#debutton" ).click(function(){
    for(var key in testUrls){
      $('#url-list').append("<li>" + testUrls[key] + "</li>");
    }  
  });
  
});

