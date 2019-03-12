


// $( "#debutton" ).click(function(){ 
//     port.postMessage({hours: "0", minutes: "0", seconds: "5"});
//   });

$( "body").prepend("<div id='test-timer'>hello there</div>");

var now = moment(); // new Date().getTime();  
var then = moment().add(5, 'seconds'); // new Date(now + 60 * 1000);


(function timerLoop() {
  $(".difference").text(moment().to(then));
  $("#test-timer").text(countdown(then).toString());
  if(countdown(then).toString() != 0){
    requestAnimationFrame(timerLoop);
  } else {
    alert("ZERO");
  }
})();
