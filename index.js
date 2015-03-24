
  var speed = 0.15;
  var LINECLR = "rgba(0,0,0,";
  var VISUALS = 1;
window.onload = function(){
  var canvas = document.getElementById('canvas');
      context = canvas.getContext("2d"),
      width = canvas.width = window.innerWidth,
      height = canvas.height = window.innerHeight;

  K = 2;
  F = 2;
  Noise = 0.01;
  ALPHA = 0.8;
  ALPHA2 = 0.01;

  // $(document).snowfall({flakeCount: 80, flakeColor: "black"});
  


  update();
  var phase =0;
  function update(){
    phase = (phase + speed)%(Math.PI *64)
    context.clearRect(0,0,width,height);
//    		this.ctx.globalCompositeOperation = 'destination-out';
//		this.ctx.fillRect(0, 0, this.width, this.height);
//		this.ctx.globalCompositeOperation = 'source-over';

    drawLine(1,LINECLR+"1)", 1.5);
    drawLine(2,LINECLR+"0.4)");
    drawLine(-2,LINECLR+"0.1)");
    drawLine(4,LINECLR+"0.4)");
    drawLine(-6,LINECLR+"0.2)");
    // console.log(LINECLR+"AA");
    requestAnimationFrame(update);
  }


  function drawLine(attenuation, lineColor, lineWidth) {
    context.moveTo(0,0);
    context.beginPath();
    context.strokeStyle = lineColor;
    context.lineWidth = lineWidth || 1;
    var x,y;
    for (var i = -K; i <= K; i+=0.01) {
      x = width * ((i+K)/(K*2));
      y = height/2 + Noise* (1/attenuation)*((height/2) * (Math.sin(F*i - phase))) * globalAttenuationFn(i);
      context.lineTo(x,y);
    // $('#pause').html(height);

    }
    context.stroke();
  }


  function globalAttenuationFn(x) {
    return Math.pow(K*5/(K*5+Math.pow(x,4)),K*2);
  }

}

// create the audio context (chrome only for now)
// create the audio context (chrome only for now)
if (! window.AudioContext) {
  if (! window.webkitAudioContext) {
    alert('no audiocontext found');
  }
  window.AudioContext = window.webkitAudioContext;
}
var contextA = new AudioContext();
var audioBuffer;
var sourceNode;
var splitter;
var analyser;
var javascriptNode;
var gainNode;
// get the context from the canvas to draw on

// create a gradient for the fill. Note the strange
// offset, since the gradient is calculated based on
// the canvas, not the specific element we draw

// load the sound
setupAudioNodes(0);
loadSound('sound.mp3');




function setupAudioNodes(val) {

  // setup a javascript node
  javascriptNode = contextA.createScriptProcessor(2048, 1, 1);
  // connect to destination, else it isn't called
  javascriptNode.connect(contextA.destination);


  // setup a analyzer
  analyser = contextA.createAnalyser();
  analyser.smoothingTimeConstant = 0.1;
  analyser.fftSize = 1024;

  analyser2 = contextA.createAnalyser();
  analyser2.smoothingTimeConstant = 0.0;
  analyser2.fftSize = 1024;

  // create a buffer source node
  sourceNode = contextA.createBufferSource();
  splitter = contextA.createChannelSplitter();
  gainNode = contextA.createGain();
  navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);
if (navigator.getUserMedia == null) {
  $('#micaccess').remove();
  delete $target;
  // alert('removing');
}
if (navigator.getUserMedia == null || val == 0) {
  sourceNode.connect(gainNode);
 // connect the source to the analyser and the splitter
  gainNode.connect(splitter);
  splitter.connect(analyser,0,0);
  analyser.connect(javascriptNode);
  gainNode.connect(contextA.destination);

}
else {
navigator.getUserMedia({audio: true}, function(stream) {
  var microphone = contextA.createMediaStreamSource(stream);
  var filter = contextA.createBiquadFilter();

  // microphone -> filter -> destination.
  microphone.connect(filter);
  filter.connect(gainNode);



}, onError);  
gainNode.connect(splitter);
  splitter.connect(analyser,0,0);
  analyser.connect(javascriptNode);

 
}





  // Connect source to a gain node
  // Connect gain node to destination
  // gainNode.connect(context.destination);

}







// load the specified sound
function loadSound(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // When loaded decode the data
  request.onload = function() {

    // decode the data
    contextA.decodeAudioData(request.response, function(buffer) {
      // when the audio is decoded play the sound
      playSound(buffer);
    }, onError);
  }
  request.send();
}


function playSound(buffer) {
  sourceNode.buffer = buffer;
  sourceNode.start(0);
}
var toggle = 1;
function pausePlaying() {
  if (toggle == 1) {
  sourceNode.stop(0);
  toggle = 0;
  $('#pause').html("Play");
  }
  else {
    setupAudioNodes(0);
  loadSound('sound.mp3');
  toggle = 1;
  $('#pause').html("Pause");

  }
}



function changeVolume() {
  var element = document.getElementById('volume');
  var volume = element.value;
  var fraction = parseInt(element.value) / parseInt(element.max);
  gainNode.gain.value = fraction * fraction;


}








// log if an error occurs
function onError(e) {
  console.log(e);
}

// when the javascript node is called
// we use information from the analyzer node
// to draw the volume
var isLoadingTextShowing = true;
var loaded = 0; 
javascriptNode.onaudioprocess = function() {

  // get the average for the first channel
  var array =  new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(array);
  var average = getAverageVolume(array);
  if (average > 0 || loaded) { 
    loaded = 1;
    changeNoise(average);
    changeFrequence(average);
    if (isLoadingTextShowing) {
      isLoadingTextShowing = false;
      // document.getElementById('hint').style.display = 'none';
    }
   }

}
var id;
function changeNoise(value) {
  var now = Noise;
  Noise = ALPHA * now + (1 - ALPHA) * (value / 100);
}
function changeFrequence(value) {
  F = 1 + (value/100) *3;
  // console.log(F+" Freq");
  changeSpeed(F);
}

function getAverageVolume(array) {
  var values = 0;
  var average;

  var length = array.length;

  // get all the frequency amplitudes
  for (var i = 0; i < length; i++) {
    values += array[i];
  }
  average = values / length;
  // $('#pause').html(average);
  changeColor(average);
  return average;
}
var prevVolume = 0;
var diff=2;
  function changeColor(volume) {
      // console.log(volume+" "+prevVolume);

    var color;
    volume = Math.floor(volume);
    if (volume - prevVolume > diff) {
      // diff = volume - prevVolume;
      // console.log("BEAT");
      // console.log();
      r = 155+Math.floor((Math.random() * 100) + 1);
      g = 155+Math.floor((Math.random() * 100) + 1);
      b = 155+Math.floor((Math.random() * 100) + 1);
      if (VISUALS == 1) {
      LINECLR = "rgba("+r+","+g+","+b+",";
  $('#canvas').animate({backgroundColor:"rgba(0,0,0, 1)"},100);

    }
    else if (VISUALS == 0) {
      LINECLR = "rgba(0,0,0,";
  $('#canvas').animate({backgroundColor:"rgba("+r+", "+g+", "+b+", 0.85)"},100);

    }

  // $('#canvas').animate({backgroundColor:"rgba("+r+", "+g+", "+b+", 0.85)"},100});

    // brightness = (r * 299 + g * 587 + b * 114) / 1000;       ENABLE IF YOU WANT TO CHANGE IT ACCORDING TO BACKGROUND COLOR

    // if (brightness < 125) {
    //   LINECLR = "rgba(255,255,255,";

    // } else {
    //   LINECLR = "rgba(0,0,0,";

    // }
    // console.log(LINECLR);
  // });

    }

    prevVolume = volume;
    // console.log(volume);
    // if (height )


//     if (volume < 25) {
//   $('#canvas').animate({backgroundColor:"blue"},100);

// } 
// else if (volume < 45) {
//   $('#canvas').animate({backgroundColor:"yellow"},100);

// }
// else if (volume < 75) {
//   $('#canvas').animate({backgroundColor:"orange"},100);

// }
// else if (volume > 75 ) {
//   $('#canvas').animate({backgroundColor:"red"},100);

// }
  
  }
  function changeSpeed(value) {
    if (value < 4.5) {
    speed = value/10;
  }
  else {
    speed = 4/10;
  }
  }
setTimeout(function() {
        $('.disappear').fadeOut(1000);

      }, 4000);
  var timeout = 0;
$(document).mousemove(function() {

    clearTimeout(timeout);
    $('.disappear').fadeIn(1000);
    timeout = setTimeout(function() {
        $('.disappear').fadeOut(1000);
    }, 3000);
});
$('.disappear').mouseover(function() {
  clearTimeout(timeout);
  timeout = setTimeout(function() {
        $('.disappear').fadeOut(1000);
    }, 3000);
})
function switchVisuals() {
  if (VISUALS == 1) {
    VISUALS = 0;
  }
  else if (VISUALS == 0) {
    VISUALS = 1;
  }
}
