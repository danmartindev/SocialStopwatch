//add timer div to DOM
$( "body").prepend(
    `
        <div id='socstop-div'>
            hello there
        </div>
    `
);

//is the timer paused/is the user on a different tab
var isPaused = false;
//time remaining in timer
var timeLeft;

//set the moment to the time when the timer is set + the time the user chooses

$( document ).ready(function() {
    looper(0, 0, 5);
});

//the timer loop
function looper(h, mm, ss){
    //setup the time to countdown to
    var then = moment().add({hours: h, minutes: mm, seconds: ss});
    
    //the loop to update the timer
    (function timerLoop() {
        $(".difference").text(moment().to(then));
        $("#socstop-div").text(countdown(then).toString());
        if(countdown(then) > 0){
            requestAnimationFrame(timerLoop);
        } else {
            $( "#socstop-div").append("<button id='socstop-reset'>Reset</button>");
            alert("GET OFF TWITTER");
        }
    })();
};

//selector for restart button
$( "#socstop-div" ).on("click", "#socstop-reset",function(){ 
    //alert("whatever");
    looper(0, 0, 5);
});

