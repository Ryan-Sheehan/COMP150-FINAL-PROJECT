  
(function () {

	"use strict";


var reward = 0;
var episode_reward = 0;
var episode_rewards = new Array();
var episode_num = 0;
var total_reward = 0;
var avg_reward = 0;
var interval_counter = 0;


function Agent() {

	if (Agent.instance_) {
        return Agent.instance_;
    }

    Agent.instance_ = this;

    this.state = "BORN";
    this.m_state = {"vertical_distance": 0, "horizontal_distance": 0, "speed": 0};
	this.m_state_dash = {"vertical_distance": 0, "horizontal_distance": 0, "speed": 0};
    this.action = "do_nothing";
    this.explore= 0.0;
    this.alpha = 0.7;
    this.resolution = 4;

	this.vertical_dist_range = null
	this.horizontal_dist_range = null

    this.Q = new Array();


}

var myAgent = new Agent();

setTimeout(() => {



	myAgent.vertical_dist_range = [0, 50]
	myAgent.horizontal_dist_range = [0, Runner.instance_.canvas.width]

	for (var vert_dist = 0; vert_dist < (myAgent.vertical_dist_range[1] - myAgent.vertical_dist_range[0])/myAgent.resolution; vert_dist++) {
				myAgent.Q[vert_dist] = new Array();

				// Horizontal Distance
				for (var hori_dist = 0; hori_dist < (myAgent.horizontal_dist_range[1] - myAgent.horizontal_dist_range[0])/myAgent.resolution; hori_dist++) {
					myAgent.Q[vert_dist][hori_dist] = {"click": 0, "duck": 0, "do_nothing": 0};
				}
			}

}, 10)



var run = setInterval(function() {


	console.log(Runner.instance_.currentSpeed.toFixed(3))


	//console.log(myAgent.horizontal_dist_range)
	//console.log(myAgent.vertical_dist_range)

	//console.log("RUNNER X: " + Runner.instance_.tRex.xPos)
	//console.log("RUNNER Y: " + Runner.instance_.tRex.yPos)






	if (Runner.instance_.playing) {
		myAgent.state = "RUNNING";
	}
		

	if (Runner.instance_.crashed) {
		myAgent.state = "DYING";
	}

	var valid = false;


	switch (myAgent.state) {
		case "BORN":
			myAgent.state = "RUNNING";
			break;


		case "RUNNING":

		// Step 2: Observe Reward R
		valid = true;
		reward = 1;
		episode_reward = episode_reward + reward
		break;


		case "DYING":
			myAgent.state = "GAMEOVER";

			// Step 2: Observe Reward R
			valid = true;
			reward = -1000;

			myAgent.state = "BORN"
			
			console.log("EPISODE REWARD: " + episode_reward)
			episode_rewards.push(episode_reward)
			episode_num++;
			if (episode_num == 100) {
				console.log("FINAL EPISODE REWARD: " + episode_reward)
				download(JSON.stringify(myAgent.Q), 'q', 'txt')
				download(JSON.stringify(myAgent.Q), 'rewards', 'txt')
				clearInterval(run);
			}
			episode_reward = 0
			Runner.instance_.restart();
			break;


			case "GAMEOVER":

				//if (myAgent.state.first()) {
				//	if (myAgent.score > window.game.best) {
				//		window.game.best = myAgent.score;
				//	}
				//}
				//

				//set("BORN");
				//break;
			}

			//console.log("REWARD: " + reward)

			// Step 2: Observe State S'
			var horizontal_distance = 9999;
			var vertical_distance = 9999;

			if (Runner.instance_.horizon.obstacles.length > 0){
				horizontal_distance = Math.abs(Runner.instance_.tRex.xPos - Runner.instance_.horizon.obstacles[0].xPos)
				//console.log("X distance from next obstacle: " + horizontal_distance)
				vertical_distance = Math.abs(Runner.instance_.tRex.yPos - Runner.instance_.horizon.obstacles[0].yPos)
				//console.log("Y distance from next obstacle: " + vertical_distance)
			}


			myAgent.m_state_dash.vertical_distance = vertical_distance;
			myAgent.m_state_dash.horizontal_distance = horizontal_distance;

			


			// Step 3: Update Q(S, A)
			var state_bin_v = 
			Math.max( 
				Math.min ( 
					Math.floor((myAgent.vertical_dist_range[1]-myAgent.vertical_dist_range[0]-1)/myAgent.resolution), 
					Math.floor( (myAgent.m_state.vertical_distance - myAgent.vertical_dist_range[0])/myAgent.resolution )
				), 
				0
			);

			
			var state_bin_h = 
			Math.max( 
				Math.min ( 
					Math.floor((myAgent.horizontal_dist_range[1]-myAgent.horizontal_dist_range[0]-1)/myAgent.resolution), 
					Math.floor( (myAgent.m_state.horizontal_distance - myAgent.horizontal_dist_range[0])/myAgent.resolution )
				), 
				0
			);




			var state_dash_bin_v = 
			Math.max( 
				Math.min ( 
					Math.floor((myAgent.vertical_dist_range[1]-myAgent.vertical_dist_range[0]-1)/myAgent.resolution), 
					Math.floor( (myAgent.m_state_dash.vertical_distance - myAgent.vertical_dist_range[0])/myAgent.resolution )
				), 
				0
			);
			
			var state_dash_bin_h =
			Math.max( 
				Math.min ( 
					Math.floor((myAgent.horizontal_dist_range[1]-myAgent.horizontal_dist_range[0]-1)/myAgent.resolution), 
					Math.floor( (myAgent.m_state_dash.horizontal_distance - myAgent.horizontal_dist_range[0])/myAgent.resolution )
				), 
				0
			);

			//console.log("S: V - " + state_bin_v + ", H - " + state_bin_h);
			//console.log("S' V - " + state_dash_bin_v + ", H - " + state_dash_bin_h);
			//console.log("V: " + state_bin_v)
			//console.log("H: " + state_bin_h)
			//console.log("V-dash: " + state_dash_bin_v)
			//console.log("H-dash: " + state_dash_bin_h)

			var click_v = myAgent.Q[state_dash_bin_v][state_dash_bin_h]["click"];

			var do_nothing_v = myAgent.Q[state_dash_bin_v][state_dash_bin_h]["do_nothing"]
			//console.log("NOTHING: " + do_nothing_v)
			var V_s_dash_a_dash = Math.max(click_v, do_nothing_v);
			

			

			var Q_s_a = myAgent.Q[state_bin_v][state_bin_h][myAgent.action];

			//console.log(myAgent.action)
			//console.log(myAgent.Q[12][299]);
			//console.log("Q_s_a_nothing: " + myAgent.Q[12][299]);
			//console.log(myAgent.Q[state_bin_v][state_bin_h][myAgent.action])
			myAgent.Q[state_bin_v][state_bin_h][myAgent.action] = 
					Q_s_a + myAgent.alpha * (reward + V_s_dash_a_dash - Q_s_a);

			var print = Q_s_a + myAgent.alpha * (reward + V_s_dash_a_dash - Q_s_a);
			//console.log("Update: " + print);
			//console.log(myAgent.Q);
			//console.log(myAgent.m_state);
			//console.log(myAgent.m_state_dash);

			
			myAgent.m_state = clone(myAgent.m_state_dash);
			

			if (Math.random() < myAgent.explore) {
					myAgent.action = Math.floor(Math.random() * 2) == 0 ? "click" : "do_nothing";
			}
			else {
					var state_bin_v = 
					Math.max( 
						Math.min ( 
							Math.floor((myAgent.vertical_dist_range[1]-myAgent.vertical_dist_range[0]-1)/myAgent.resolution), 
							Math.floor( (myAgent.m_state.vertical_distance - myAgent.vertical_dist_range[0])/myAgent.resolution )
						), 
						0
					);
					
					var state_bin_h = 
					Math.max( 
						Math.min ( 
							Math.floor((myAgent.horizontal_dist_range[1]-myAgent.horizontal_dist_range[0]-1)/myAgent.resolution), 
							Math.floor( (myAgent.m_state.horizontal_distance - myAgent.horizontal_dist_range[0])/myAgent.resolution )
						), 
						0
					);

					var click_v = myAgent.Q[state_bin_v][state_bin_h]["click"];
					var do_nothing_v = myAgent.Q[state_bin_v][state_bin_h]["do_nothing"]
					myAgent.action = click_v > do_nothing_v ? "click" : "do_nothing";
			}

			//console.log(myAgent.Q)
			if (myAgent.action == "click") {
					keyDown(32)
			}
			
			

			interval_counter++;
			//console.log("INTERVAL: " + interval_counter)
			total_reward = reward + total_reward
			//console.log("TOTAL REWARD: " + total_reward)
			avg_reward = total_reward / interval_counter;
			//console.log("Avg reward: " + avg_reward)

			

			//myAgent.m_state = clone(myAgent.m_state_dash);


	//if (Runner.instance_.horizon.obstacles.length > 0){
	//console.log("obstacles ahead") 
	//console.log(Runner.instance_.horizon.obstacles) 
	//} 
	//console.log("current speed: " + Runner.instance_.currentSpeed)
	


	//console.log("reward: " + myAgent.reward)

}, 10);







function keyDown(codeKey){
	// Simulate a key press

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


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function download(strData, strFileName, strMimeType) {
    var D = document,
        A = arguments,
        a = D.createElement("a"),
        d = A[0],
        n = A[1],
        t = A[2] || "text/plain";

    //build download link:
    a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);


    if (window.MSBlobBuilder) { // IE10
        var bb = new MSBlobBuilder();
        bb.append(strData);
        return navigator.msSaveBlob(bb, strFileName);
    } /* end if(window.MSBlobBuilder) */



    if ('download' in a) { //FF20, CH19
        a.setAttribute("download", n);
        a.innerHTML = "downloading...";
        D.body.appendChild(a);
        setTimeout(function() {
            var e = D.createEvent("MouseEvents");
            e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
            D.body.removeChild(a);
        }, 66);
        return true;
    }; /* end if('download' in a) */



    //do iframe dataURL download: (older W3)
    var f = D.createElement("iframe");
    D.body.appendChild(f);
    f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
    setTimeout(function() {
        D.body.removeChild(f);
    }, 333);
    return true;
}