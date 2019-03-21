/* options.js created for Social Media Stopwatch
* Updated 3/21/2019
* Author: Daniel Martin
* website: www.dmartin.me
* Github: github.com/danmartindev
*/

var urls;

$( document ).ready(function() {
  //get the local saved version of the urls array
  chrome.storage.sync.get(['urls'], function(result){
    console.log(result.urls);
    if(!result.urls){
      //if null return an empty dictionary
      console.log("null");
      urls={};
    } else {
      urls = result.urls;
      console.log("Get urls 1: " + JSON.stringify(urls));
    }
    init();
  });

  $("#lBtn").click(function(){
    chrome.storage.sync.get(['urls'], function(result){
      console.log("Get res: " + JSON.stringify(result));
      console.log("Get res: " + JSON.stringify(result.urls));
    });
    chrome.storage.sync.get(['urls'], function(result){
      urls = {};
   });
  });

  $("#clearBtn").click(function(){
    chrome.storage.sync.clear(function(){
      var error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      }
    });
  });

  $( "form" ).submit(function(event){
    var fields = $( this ).serializeArray(); //serialize values into an array
    urls[fields[0].value] = [fields[1].value, fields[2].value, fields[3].value];

    chrome.storage.sync.set({'urls': urls}, function(){
      console.log("Set urls");
    });
    $( this ).trigger("reset"); //reset the form values
  });
});

function init(){
  console.log("key");

  for(var key in urls){
    $('#set-urls').append("<li> URL: " + key + " H: " + urls[key][0]+ " M: " + urls[key][1]+ " S: " + urls[key][2]+ "</li>"); //updating paused alarm info
  };
}