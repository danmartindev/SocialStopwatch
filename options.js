/* options.js created for Social Media Stopwatch
* Updated 3/24/2019
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
      urls={};
    } else {
      urls = result.urls;
    }
    init();
  });

  $("#set-urls").on("click", ".delete-btn", function(){
    var removeId = $(this).parent().attr('id');
    delete urls[removeId];
    $(this).parent().remove();
    chrome.storage.sync.set({'urls': urls}, function(){
      //console.log("deleted url");
    });

  });

  $( "form" ).submit(function(event){
    var fields = $( this ).serializeArray(); //serialize values into an array
    var hasNan = false;
    for(var i = 1; i < fields.length; i++){
      //sets value to 0 for emty input
      if(fields[i].value == ""){
        fields[i].value = 0;
      }
      //checks values for NaN
      else if(isNaN(parseInt(fields[i].value))){
        hasNan = true;
      } 
    }

    var totalTime = fields[1].value + fields[2].value + fields[3].value;

    if(!hasNan && totalTime > 0){
      urls[fields[0].value] = [fields[1].value, fields[2].value, fields[3].value];
      chrome.storage.sync.set({'urls': urls}, function(){
        //console.log("Set urls");
      });
    } else {
      alert("Alarm not created! Please make sure all the numbers are valid and you have a time greater than 0!");
    }
    $( this ).trigger("reset"); //reset the form values
  });
});

function init(){
  for(var key in urls){
    $('#set-urls').append("<li id='" + key +"'><i class='delete-btn fas fa-times fa'></i> URL: " + key + " H: " + urls[key][0]+ " M: " + urls[key][1]+ " S: " + urls[key][2]+ "</li>"); //updating paused alarm info
  };
}