  
(function () {

	"use strict";


var reward = 0


function Agent() {
	if (Agent.instance_) {
        return Agent.instance_;
    }
    Agent.instance_ = this;

    this.reward = 0;
    this.state = {"vertical_distance": 0, "horizontal_distance": 0};
    this.action = "do_nothing";
    this.explore= 0.00;
    this.alpha = 0.7;
    this.resolution = 4;

	this.vertical_dist_range = null
	this.horizontal_dist_range = null

    this.Q = new Array();


}

var myAgent = new Agent();

setInterval(function() {

	myAgent.vertical_dist_range = [0, Runner.instance_.canvas.height]
	myAgent.horizontal_dist_range = [0, Runner.instance_.canvas.width]

	for (var vert_dist = 0; vert_dist < (myAgent.vertical_dist_range[1] - myAgent.vertical_dist_range[0])/myAgent.resolution; vert_dist++) {
				myAgent.Q[vert_dist] = new Array();

				// Horizontal Distance
				for (var hori_dist = 0; hori_dist < (myAgent.horizontal_dist_range[1] - myAgent.horizontal_dist_range[0])/myAgent.resolution; hori_dist++) {
					myAgent.Q[vert_dist][hori_dist] = {"click": 0, "do_nothing": 0};
				}
			}
	//console.log(myAgent.Q)
	//console.log(myAgent.horizontal_dist_range)
	//console.log(myAgent.vertical_dist_range)

	//console.log("RUNNER X: " + Runner.instance_.tRex.xPos)
	//console.log("RUNNER Y: " + Runner.instance_.tRex.yPos)

	if (Runner.instance_.horizon.obstacles.length > 0){
		console.log("X distance from next obstacle: " + Math.abs(Runner.instance_.tRex.xPos - Runner.instance_.horizon.obstacles[0].xPos))
}

	//if (Runner.instance_.horizon.obstacles.length > 0){
	//console.log("obstacles ahead") 
	//console.log(Runner.instance_.horizon.obstacles) 
	//} 
	//console.log("current speed: " + Runner.instance_.currentSpeed)
	

	if (Runner.instance_.playing) {
		myAgent.reward = myAgent.reward + 1;
	}

	if (Runner.instance_.crashed) {
		myAgent.reward = myAgent.reward - 100
		//Runner.instance_.restart();
	}
	//console.log("reward: " + myAgent.reward)

}, 100);


function keyDown(codeKey){
	// Simulate a key press

	Podium = {};

	var oEvent = document.createEvent('KeyboardEvent');

    Object.defineProperty(oEvent, 'keyCode', {
    	get : function() {
    		return this.keyCodeVal;
    	}
    });      

    if (oEvent.initKeyboardEvent) {
    	oEvent.initKeyboardEvent("keydown", true, true, document.defaultView, codeKey, codeKey, "", "", false, "");
    } else {
    	oEvent.initKeyEvent("keydown", true, true, document.defaultView, false, false, false, false, codeKey, 0);
    }

    oEvent.keyCodeVal = codeKey;

    document.body.dispatchEvent(oEvent);

}


function keyUp(codeKey) {
	// Similate a key up

	Podium = {};

	var oEvent = document.createEvent('KeyboardEvent');

    Object.defineProperty(oEvent, 'keyCode', {
    	get : function() {
    		return this.keyCodeVal;
    	}
    });      

    if (oEvent.initKeyboardEvent) {
    	oEvent.initKeyboardEvent("keyup", true, true, document.defaultView, codeKey, codeKey, "", "", false, "");
    } else {
    	oEvent.initKeyEvent("keyup", true, true, document.defaultView, false, false, false, false, codeKey, 0);
    }

    oEvent.keyCodeVal = codeKey;

    document.body.dispatchEvent(oEvent);
}
})();