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
	var imageLoadList = [
			 "images/bg001.jpg"
			,"images/bg002.jpg"
			,"images/bg003.jpg"
			,"images/bg004.jpg"
		]
	
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
			var newPositionX = -((Number(BgimgSize['width'])/2-160) - (Number(event.x) - 150))/2 ,
			newPositionY =  -((Number(BgimgSize['height'])/2-220) - (Number(event.y) - 100))/2 ;

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
	if (!Array.prototype.indexOf) { 
	    Array.prototype.indexOf = function(obj, start) {
	         for (var i = (start || 0), j = this.length; i < j; i++) {
	             if (this[i] === obj) { return i; }
	         }
	         return -1;
	    }
	}


	function phoneBgSwitch(i) {
		var imageBox = jQuery(".screen")
		, imageName = jQuery(".screen").css('background-image');
        imageName = imageName.replace('url(','').replace(')','');
        var arr = imageName.substring(1).split("/");
        imageName = "images/"+arr.pop();
        var imageIndex = imageLoadList.indexOf(imageName);
        //console.log(imageName +"\n"+ imageLoadList.indexOf(imageName) +"\n"+ imageLoadList);
		if(i===0){
			imageIndex = Math.max(Math.min((imageLoadList.length - 1),(imageIndex-1)),0);
			
		}else{
			imageIndex = Math.max(Math.min((imageLoadList.length - 1),(imageIndex+1)),0);
		}
		//console.log(Number(imageIndex));
		switch(Number(imageIndex)){
			case 0:
			{
				jQuery('.navbar a.prev').hide();
			}
			break;
			case (imageLoadList.length - 1):
			{
				jQuery('.navbar a.next').hide();
			}
			break;
			default:
			{
				jQuery('.navbar a').show();
			}
		}
		imageName = "url(" +imageLoadList[Number(imageIndex)] + ")";
		//console.log("new index:" + imageLoadList[Number(imageIndex)]);
		jQuery(".screen").css('background-image',imageName);

	}

	jQuery('.navbar a').live('click', function(event) {
		var $this = $(this);
		if($this.hasClass("next")){
			phoneBgSwitch(1);
		}else{
			phoneBgSwitch(0)
		}
	});
	/* for mobile browser */


	if (window.DeviceMotionEvent != undefined) {
		var x = 0, y = 0,
		    vx = 0, vy = 0,
			ax = 0, ay = 0;
		var bgBox = jQuery(".screen");

		function boundingBoxCheck(){
			if (x<0) { x = 0; vx = -vx; }
			if (y<0) { y = 0; vy = -vy; }
			if (x>document.documentElement.clientWidth-20) { x = document.documentElement.clientWidth-20; vx = -vx; }
			if (y>document.documentElement.clientHeight-20) { y = document.documentElement.clientHeight-20; vy = -vy; }
		}
		window.ondevicemotion = function(e) {
			ax = event.accelerationIncludingGravity.x * 5;
			ay = event.accelerationIncludingGravity.y * 5;
		
		}
		setInterval( function() {
			var landscapeOrientation = window.innerWidth/window.innerHeight > 1;

			if ( landscapeOrientation) {
				vx = vx + ay;
				vy = vy + ax;
			} else {
				vy = vy - ay;
				vx = vx + ax;
			}
			vx = vx * 0.98;
			vy = vy * 0.98;
			y = parseInt(y + vy / 50);
			x = parseInt(x + vx / 50);
			
			boundingBoxCheck();
			var newPositionX = -((Number(BgimgSize['width'])/2-160) - (Number(x) - 150))/2 ,
			newPositionY =  -((Number(BgimgSize['height'])/2-220) - (Number(y) - 100))/2 ;
			newPositionX = Math.max(Math.min(0,newPositionX),-119);
			newPositionY = Math.max(Math.min(0,newPositionY),-200);
			bgBox.css("background-position",newPositionX+"px "+ newPositionY+"px")
			//sphere.style.top = y + "px";
			//sphere.style.left = x + "px";
			
		}, 50);
	}
});