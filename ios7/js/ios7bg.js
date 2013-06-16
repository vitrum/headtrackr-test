/**
* We wrap all our code in the jQuery "DOM-ready" function to make sure the script runs only
* after all the DOM elements are rendered and ready to take action
*/
$(document).ready(function () {

	var videoInput = document.getElementById('vid');
	var canvasInput = document.getElementById('compare');
	var canvasOverlay = document.getElementById('overlay')
	var debugOverlay = document.getElementById('debug');
	var overlayContext = canvasOverlay.getContext('2d');
	canvasOverlay.style.position = "absolute";
	canvasOverlay.style.top = '0px';
	canvasOverlay.style.zIndex = '100001';
	canvasOverlay.style.display = 'block';
	debugOverlay.style.position = "absolute";
	debugOverlay.style.top = '0px';
	debugOverlay.style.zIndex = '100002';
	debugOverlay.style.display = 'none';
	
	// add some custom messaging
	
	statusMessages = {
		"whitebalance" : "checking for stability of camera whitebalance",
		"detecting" : "Detecting face",
		"hints" : "Hmm. Detecting the face is taking a long time",
		"redetecting" : "Lost track of face, redetecting",
		"lost" : "Lost track of face",
		"found" : "Tracking face"
	};
	
	supportMessages = {
		"no getUserMedia" : "Unfortunately, <a href='http://dev.w3.org/2011/webrtc/editor/getusermedia.html'>getUserMedia</a> is not supported in your browser. Try <a href='http://www.opera.com/browser/'>downloading Opera 12</a> or <a href='http://caniuse.com/stream'>another browser that supports getUserMedia</a>. Now using fallback video for facedetection.",
		"no camera" : "No camera found. Using fallback video for facedetection."
	};
	
	document.addEventListener("headtrackrStatus", function(event) {
		if (event.status in supportMessages) {
			var messagep = document.getElementById('gUMMessage');
			messagep.innerHTML = supportMessages[event.status];
		} else if (event.status in statusMessages) {
			var messagep = document.getElementById('headtrackerMessage');
			messagep.innerHTML = statusMessages[event.status];
		}
	}, true);
	
	// the face tracking setup
	
	var htracker = new headtrackr.Tracker({altVideo : {ogv : "./media/capture5.ogv", mp4 : "./media/capture5.mp4"}, calcAngles : true, ui : false, headPosition : false, debug : debugOverlay});
	htracker.init(videoInput, canvasInput);
	htracker.start();
	var BgimgSize = new Array();
	getPhoneBgimgSize();
	// for each facetracking event received draw rectangle around tracked face on canvas
	
	document.addEventListener("facetrackingEvent", function( event ) {
		// clear canvas
		overlayContext.clearRect(0,0,320,240);
		// once we have stable tracking, draw rectangle
		if (event.detection == "CS") {
			overlayContext.translate(event.x, event.y)
			overlayContext.rotate(event.angle-(Math.PI/2));
			overlayContext.strokeStyle = "#00CC00";
			overlayContext.strokeRect((-(event.width/2)) >> 0, (-(event.height/2)) >> 0, event.width, event.height);
			overlayContext.rotate((Math.PI/2)-event.angle);
			overlayContext.translate(-event.x, -event.y);
			var messagep = document.getElementById('gUMMessage');
			var picChangeNo = 30;
			var imgBox = document.getElementById('imagebox');
			var imgName = '.img' + (Math.floor((event.x/320)*picChangeNo));
			var bgBox = jQuery(".screen");
			var newPositionX = -(Number(BgimgSize['width'])/2-160 + Number(event.x/2) - 130) ,
			newPositionY =  (-40 - Number(event.y/3));

			newPositionX = Math.max(Math.min(0,newPositionX),-119);
			newPositionY = Math.max(Math.min(0,newPositionY),-200);
			bgBox.css("background-position",newPositionX+"px "+ newPositionY+"px")
			//messagep.innerHTML = "evnet.x=" + event.x + ",newPositionX=" + newPositionX;

			//imgBox.innerHTML = "<img src='imgtest/" + (Math.floor((event.x/320)*picChangeNo)) + "-.JPG' />"
			//var imgName = (Math.floor((event.x/320)*picChangeNo));
			//$('#imagebox img').hide();
			//$(imgName).show();

		}
	});
	
	// turn off or on the canvas showing probability
	function showProbabilityCanvas() {
		var debugCanvas = document.getElementById('debug');
		if (debugCanvas.style.display == 'none') {
			debugCanvas.style.display = 'block';
		} else {
			debugCanvas.style.display = 'none';
		}
	}
	function getPhoneBgimgSize() {
		var li = document.createElement("li")
		, imageName = jQuery(".screen").css('background-image');
        imageName = imageName.replace('url(','').replace(')','');
		//alert(imageName);
		var image = $('<img>').attr('src', imageName).appendTo(li);
		jQuery("#load_images").append(li);
		jQuery(image).load(function() {
			BgimgSize['width'] = image.width();
			BgimgSize['height'] = image.height();
		});
	}
});