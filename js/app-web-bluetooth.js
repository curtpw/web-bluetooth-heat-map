
window.onload = function(){

    // Initialize Firebase
    // TODO: Replace with your project's customized code snippet
 /*   var config = {
        apiKey: "AIzaSyAux0Ye2jrc5E-xHa5h0-xJqGOnXZ1vZw4",
        authDomain: "absolutedb-ac8fb.firebaseapp.com",
        databaseURL: "https://absolutedb-ac8fb.firebaseio.com",
        storageBucket: "absolutedb-ac8fb.appspot.com",
    };
    firebase.initializeApp(config); 
    // Get a reference to the database service
    var database = firebase.database(); */

  /*******************************************************************************************************************
  *********************************************** WEB BLUETOOTH ******************************************************
  ********************************************************************************************************************/

  let button = document.getElementById("connect");
  let message = document.getElementById("message");

  if ( 'bluetooth' in navigator === false ) {
      button.style.display = 'none';
      message.innerHTML = 'This browser doesn\'t support the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API" target="_blank">Web Bluetooth API</a> :(';
  }

  //Absolute position 3D coordinate global var
  var xCoordinate = 0;
  var yCoordinate = 0; 
  var zCoordinate = 0;

  let accelerometerData, objectTempData, ambientTempData, poseData, emgData,
  orientationData, batteryLevel, armType, armSynced, myoDirection, myoLocked;

  var modelArmPosition = { shoulder: {x: 0, y: 0, z: 0}, elbow: {y: 0}, hand: {x: 0, y: 0, z: 0}}; 

  //3D model arm position sample data
  var poseDataArray = []; 
  //sensor array sample data
  var sensorDataArray = new Array(19).fill(0); 

  //number of samples per pose
  var sensorSamplesPerPose = new Array(21).fill(0);

  //master session data array of arrays
  var sensorDataSession = [];
  var poseDataSession = [];

  //which samples in the session data array are part of a particular sample set
  var sessionSampleSetIndex = [];

  //track number of sets
  var numSets = 0; 

  var getSamplesFlag = 0;

  //do we have a trained NN to apply to live sensor data?
  var haveNNFlag = false;

  var trainNNFlag = false;

  var activeNNFlag = false;

  //NN scores
  var scoreArray = new Array(21).fill(0);

/*
  var axis = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();
	var quaternionHome = new THREE.Quaternion();   */
	var initialised = false;
	var timeout = null;

  button.onclick = function(e){
    var sensorController = new ControllerWebBluetooth("ChildMind");
    sensorController.connect();

    sensorController.onStateChange(function(state){

   /*   if(state.batteryLevel){
        batteryLevel = state.batteryLevel + '%';
      } */

      accelerometerData = state.accelerometer;
      objectTempData = state.objectTemp;
      ambientTempData = state.ambientTemp;


      //if data sample collection has been flagged
      if(getSamplesFlag > 0){
          collectData();
      } else if (trainNNFlag){
          //don't do anything
      }else if(haveNNFlag && activeNNFlag){  //we have a NN and we want to apply to current sensor data
          getNNScore();
      }

      displayData();

      //***
      // Orientation data coming back from the Myo is very sensitive.
      // Not very useful to display on 3D cube as it is, but tried anyway.
      //***

      // if(mesh !== undefined){
      //   var angle = Math.sqrt( orientationData.x * orientationData.x + orientationData.y * orientationData.y + orientationData.z * orientationData.z );
      //
			// 	if ( angle > 0 ) {
			// 		axis.set( orientationData.x, orientationData.y, orientationData.z )
			// 		axis.multiplyScalar( 1 / angle );
			// 		quaternion.setFromAxisAngle( axis, angle );
      //
			// 		// if ( initialised === false ) {
			// 		// 	quaternionHome.copy( quaternion );
			// 		// 	quaternionHome.inverse();
			// 		// 	initialised = true;
			// 		// }
			// 	} else {
			// 		quaternion.set( 0, 0, 0, 1 );
			// 	}
      //
      //   // mesh.quaternion.copy( quaternionHome );
			// 	mesh.quaternion.multiply( quaternion );
      // }
    });
  }

  

  function displayData(){

    if(accelerometerData){
      var accelerometerXDiv = document.getElementsByClassName('accelerometer-x-data')[0];
      accelerometerXDiv.innerHTML = accelerometerData.x.toFixed(1);

      var accelerometerYDiv = document.getElementsByClassName('accelerometer-y-data')[0];
      accelerometerYDiv.innerHTML = accelerometerData.y.toFixed(1);

      var accelerometerZDiv = document.getElementsByClassName('accelerometer-z-data')[0];
      accelerometerZDiv.innerHTML = accelerometerData.z.toFixed(1);
    }

    if(objectTempData){
      var objectTempElement1 = document.getElementsByClassName('object-temp-1-data')[0];
      objectTempElement1.innerHTML = objectTempData.a.toFixed(1);

      var objectTempElement2 = document.getElementsByClassName('object-temp-2-data')[0];
      objectTempElement2.innerHTML = objectTempData.b.toFixed(1);

      var objectTempElement3 = document.getElementsByClassName('object-temp-3-data')[0];
      objectTempElement3.innerHTML = objectTempData.c.toFixed(1);

      var objectTempElement4 = document.getElementsByClassName('object-temp-4-data')[0];
      objectTempElement4.innerHTML = objectTempData.d.toFixed(1);

      var objectTempElement5 = document.getElementsByClassName('object-temp-5-data')[0];
      objectTempElement5.innerHTML = objectTempData.e.toFixed(1);

      var objectTempElement6 = document.getElementsByClassName('object-temp-6-data')[0];
      objectTempElement6.innerHTML = objectTempData.f.toFixed(1);

      var objectTempElement7 = document.getElementsByClassName('object-temp-7-data')[0];
      objectTempElement7.innerHTML = objectTempData.g.toFixed(1);

      var objectTempElement8 = document.getElementsByClassName('object-temp-8-data')[0];
      objectTempElement8.innerHTML = objectTempData.h.toFixed(1);

      var objectTempElement9 = document.getElementsByClassName('object-temp-9-data')[0];
      objectTempElement9.innerHTML = objectTempData.i.toFixed(1);

      var objectTempElement10 = document.getElementsByClassName('object-temp-10-data')[0];
      objectTempElement10.innerHTML = objectTempData.j.toFixed(1);

      var objectTempElement11 = document.getElementsByClassName('object-temp-11-data')[0];
      objectTempElement11.innerHTML = objectTempData.k.toFixed(1);

      var objectTempElement12 = document.getElementsByClassName('object-temp-12-data')[0];
      objectTempElement12.innerHTML = objectTempData.l.toFixed(1);

      var objectTempElement13 = document.getElementsByClassName('object-temp-13-data')[0];
      objectTempElement13.innerHTML = objectTempData.m.toFixed(1);

      var objectTempElement14 = document.getElementsByClassName('object-temp-14-data')[0];
      objectTempElement14.innerHTML = objectTempData.n.toFixed(1);

      var objectTempElement15 = document.getElementsByClassName('object-temp-15-data')[0];
      objectTempElement15.innerHTML = objectTempData.o.toFixed(1);

    }

    if(ambientTempData){
      var ambientTempAverageElement = document.getElementsByClassName('ambient-temp-average-data')[0];
      ambientTempAverageElement.innerHTML = ambientTempData.a;
    }

  }

  function getSensorData(){

    if(accelerometerData){
      sensorDataArray[0] = accelerometerData.x.toFixed(1);
      sensorDataArray[1] = accelerometerData.y.toFixed(1);
      sensorDataArray[2] = accelerometerData.z.toFixed(1);
    }

    if(objectTempData){
      sensorDataArray[3] = objectTempData.a.toFixed(1);
      sensorDataArray[4] = objectTempData.b.toFixed(1);
      sensorDataArray[5] = objectTempData.c.toFixed(1);
      sensorDataArray[6] = objectTempData.d.toFixed(1);
      sensorDataArray[7] = objectTempData.e.toFixed(1);
      sensorDataArray[8] = objectTempData.f.toFixed(1);
      sensorDataArray[9] = objectTempData.g.toFixed(1);
      sensorDataArray[10] = objectTempData.h.toFixed(1);
      sensorDataArray[11] = objectTempData.i.toFixed(1);
      sensorDataArray[12] = objectTempData.j.toFixed(1);
      sensorDataArray[13] = objectTempData.k.toFixed(1);
      sensorDataArray[14] = objectTempData.l.toFixed(1);
      sensorDataArray[15] = objectTempData.m.toFixed(1);
      sensorDataArray[16] = objectTempData.n.toFixed(1);
      sensorDataArray[17] = objectTempData.o.toFixed(1);
  //    sensorDataArray[18] = objectTempData.p.toFixed(1);
    }

    if(ambientTempData){
      sensorDataArray[18] = ambientTempData.a.toFixed(1);
    }

  }

  /*******************************************************************************************************************
  ********************************************* 3D MODEL POSE DATA ***************************************************
  ********************************************************************************************************************/

  /************************************ GET MODEL POSITION DATA FROM MODEL UI VALUES **************************************/
  function getModelData(){
      modelArmPosition.shoulder.x = $('.shoulder.x-angle').val();
      poseDataArray[0] = modelArmPosition.shoulder.x;

      modelArmPosition.shoulder.y = $('.shoulder.y-angle').val();
      poseDataArray[1] = modelArmPosition.shoulder.y;

      modelArmPosition.shoulder.z = $('.shoulder.z-angle').val();
      poseDataArray[2] = modelArmPosition.shoulder.z;

      modelArmPosition.elbow.y = $('.elbow.y-angle').val();
      poseDataArray[3] = modelArmPosition.elbow.y;

      modelArmPosition.hand.x = $('.hand.x-angle').val();
      poseDataArray[4] = modelArmPosition.hand.x;

      modelArmPosition.hand.y = $('.hand.y-angle').val();
      poseDataArray[5] = modelArmPosition.hand.y;

      modelArmPosition.hand.z = $('.hand.z-angle').val();
      poseDataArray[6] = modelArmPosition.hand.z;
  }

  /*******************************************************************************************************************
  ********************************** COLLECT, PRINT, LOAD BUTTON ACTIONS *********************************************
  ********************************************************************************************************************/

  /*************** COLLECT SAMPLE - SONSOR AND MODEL DATA - STORE IN GSHEET AND ADD TO NN TRAINING OBJECT *****************/
  $('#collect').click(function() {
      console.log("collect button"); 
      
      //how many samples for this set?
      //this flag is applied in the bluetooth data notification function
      getSamplesFlag = $('input.sample-size').val();
      console.log("Collect btn #samples flag: " + getSamplesFlag);
      
      numSets = numSets + 1;
  }); 

  //print sensor data to browser at bottom of app screen
  $('#print-btn').click(function() {
      console.log("print button"); 

      $("#dump-print").html( JSON.stringify(sensorDataSession) );
      console.log("SENSOR SESSIONS DATA: " + sensorDataSession);
  }); 

  //load data from js file (JSON or JS object) into sensor session data
  $('#load-btn').click(function() {
      console.log("load button"); 
      sensorDataSession = exportedSensorData;

  }); 

  function collectData(){

  	  sensorDataArray = new Array(19).fill(0); 
      getSensorData();

      var collectedDataArray =  new Array(20).fill(0);  
      collectedDataArray = sensorDataArray;
      var poseNumber = $('#master-pose-input').val() -1;

      //add pose # to first element of sensor data array
      collectedDataArray.unshift( poseNumber );

      console.log("web bluetooth sensor data:");

      console.dir(collectedDataArray);

      //add to samples per pose count array
      sensorSamplesPerPose[poseNumber] = sensorSamplesPerPose[poseNumber] + 1;

      $("div.console .pose" + poseNumber).html("P" + poseNumber + ":" + sensorSamplesPerPose[poseNumber]);

    //  getModelData();
   //   console.log("Model data: "); 
   //   console.dir(poseDataArray);

      //add sample to set
      sensorDataSession.push(collectedDataArray);
     // poseDataSession.push(sensorDataArray);



      sessionSampleSetIndex.push(numSets);

      console.log("Set Index: "); 
      console.dir(sessionSampleSetIndex);

      getSamplesFlag = getSamplesFlag - 1;

      if(getSamplesFlag == 0){
          //console messages
          var consoleSamples = document.getElementsByClassName('console-samples')[0];
          consoleSamples.innerHTML = sensorDataSession.length;

          var consoleSamples = document.getElementsByClassName('console-sets')[0];
          consoleSamples.innerHTML = numSets;
      }

  }


  /*******************************************************************************************************************
  *********************************************** NEURAL NETWORK *****************************************************
  ********************************************************************************************************************/
    /**
   * Attach synaptic neural net components to app object
   */
  var Neuron = synaptic.Neuron;
  var Layer = synaptic.Layer;
  var Network = synaptic.Network;
  var Trainer = synaptic.Trainer;
  var Architect = synaptic.Architect;
  //var neuralNet = new Architect.LSTM(19, 75, 75);
  var neuralNet = new Architect.LSTM(19, 21, 21);
  var trainer = new Trainer(neuralNet);
  var trainingData;

  $('#train-btn').click(function() {
      console.log("train button"); 
      trainNNFlag = true;
      trainNN();
  });

  $('#activate-btn').click(function() {
    console.log("activate button"); 
    activeNNFlag = true;
    $('#activate-btn').toggleClass("activatedNN");
  });

function getNNScore(){
//	scoreArray = new Array(75).fill(0);

  var firstPlace = {position: 0, score: 0}; 
  var secondPlace = {position: 0, score: 0};  
  var thirdPlace = {position: 0, score: 0}; 

  scoreArray = new Array(19).fill(0);

  getSensorData();

	var feedArray = new Array(19).fill(0);
		    feedArray[0] = sensorDataArray[0];
        feedArray[1] = sensorDataArray[1];
        feedArray[2] = sensorDataArray[2];
        feedArray[3] = sensorDataArray[3] / 101;
        feedArray[4] = sensorDataArray[4] / 101;
        feedArray[5] = sensorDataArray[5] / 101;
        feedArray[6] = sensorDataArray[6] / 101;
        feedArray[7] = sensorDataArray[7] / 101;
        feedArray[8] = sensorDataArray[8] / 101;
        feedArray[9] = sensorDataArray[9] / 101;
        feedArray[10] = sensorDataArray[10] / 101;
        feedArray[11] = sensorDataArray[11] / 101;
        feedArray[12] = sensorDataArray[12] / 101;
        feedArray[13] = sensorDataArray[13] / 101;
        feedArray[14] = sensorDataArray[14] / 101;
        feedArray[15] = sensorDataArray[15] / 101;
        feedArray[16] = sensorDataArray[16] / 101;
        feedArray[17] = sensorDataArray[17] / 101;
        feedArray[18] = sensorDataArray[18] / 101;

    scoreArray = neuralNet.activate(feedArray);
    console.log("FEED ARRAY: " + feedArray);
    console.log("SCORE ARRAY: " + scoreArray);


    for(var i=0; i<21;i++){

        var scoreForColor = scoreArray[i];
        var $theSpot;

        if(scoreForColor > firstPlace.score  ){
          thirdPlace.position = secondPlace.position;
          thirdPlace.score = secondPlace.score;
          secondPlace.position = firstPlace.position;
          secondPlace.score = firstPlace.score;
          firstPlace.position = i + 1;
          firstPlace.score = scoreForColor;
        } else if(scoreForColor > secondPlace.score && firstPlace.position != (i + 1) ){
          thirdPlace.position = secondPlace.position;
          thirdPlace.score = secondPlace.score;
          secondPlace.score = scoreForColor;
          secondPlace.position = i + 1;
        } else if(scoreForColor > thirdPlace.score && firstPlace.position != (i + 1) && secondPlace.position != (i + 1) ){
          thirdPlace.score = scoreForColor;
          thirdPlace.position = i + 1;
        }

        if(i==0){
          $theSpot = $("div.heat-index1");
        } else if(i==1){
          $theSpot = $("div.heat-index2");
        } else if(i==2){
          $theSpot = $("div.heat-index3");
        } else if(i==3){
          $theSpot = $("div.heat-index4");
        } else if(i==4){
          $theSpot = $("div.heat-index5");
        } else if(i==5){
          $theSpot = $("div.heat-index6");
        } else if(i==6){
          $theSpot = $("div.heat-index7");
        } else if(i==7){
          $theSpot = $("div.heat-index8");
        } else if(i==8){
          $theSpot = $("div.heat-index9");
        } else if(i==9){
          $theSpot = $("div.heat-index10");
        } else if(i==10){
          $theSpot = $("div.heat-index11");
        } else if(i==11){
          $theSpot = $("div.heat-index12");
        } else if(i==12){
          $theSpot = $("div.heat-index13");
        } else if(i==13){
          $theSpot = $("div.heat-index14");
        } else if(i==14){
          $theSpot = $("div.heat-index15");
        } else if(i==15){
          $theSpot = $("div.heat-index16");
        } else if(i==16){
          $theSpot = $("div.heat-index17");
        } else if(i==17){
          $theSpot = $("div.heat-index18");
        } else if(i==18){
          $theSpot = $("div.heat-index19");
        } else if(i==19){
          $theSpot = $("div.heat-index20");
        } else if(i==20){
          $theSpot = $("div.heat-index21");
        }



        if(scoreForColor > 0.95){
          $theSpot.css("color", "rgb(255,0,0)");
        } else if(scoreForColor > 0.9){
          $theSpot.css("color",  "rgb(255,64,0)");
        } else if(scoreForColor > 0.85){
          $theSpot.css("color", "rgb(255,126,0)");
        } else if(scoreForColor > 0.8){
          $theSpot.css("color", "rgb(255,191,0)");
        } else if(scoreForColor > 0.75){
          $theSpot.css("color",  "rgb(255,255,0)");
        } else if(scoreForColor > 0.7){
          $theSpot.css("color", "rgb(191,255,0)");
        } else if(scoreForColor > 0.6){
          $theSpot.css("color", "rgb(126,255,0)");
        } else if(scoreForColor > 0.55){
          $theSpot.css("color", "rgb(64,255,0)");
        } else if(scoreForColor > 0.5){
          $theSpot.css("color", "rgb(0,255,0)");
        } else if(scoreForColor > 0.45){
          $theSpot.css("color", "rgb(0,255,64)");
        } else if(scoreForColor > 0.4){
          $theSpot.css("color", "rgb(0,255,126)");
        } else if(scoreForColor > 0.35){
          $theSpot.css("color", "rgb(0,255,191)");
        } else if(scoreForColor > 0.3){
          $theSpot.css("color", "rgb(0,255,255)");
        } else if(scoreForColor > 0.25){
          $theSpot.css("color", "rgb(0,191,255)");
        } else if(scoreForColor > 0.2){
          $theSpot.css("color", "rgb(0,126,255)");
        } else if(scoreForColor > 0.15){
          $theSpot.css("color", "rgb(0,64,255)");
        } else if(scoreForColor > 0.1){
          $theSpot.css("color", "rgb(0,0,255)");
        } else if(scoreForColor > 0.05){
          $theSpot.css("color", "rgb(0,0,126)");
        } else if(scoreForColor > 0.01){
          $theSpot.css("color", "rgb(0,0,64)");
        } else {
          $theSpot.css("color", "#6b6b6b");
        } 
    }
    getCoordinates(firstPlace, secondPlace, thirdPlace);
}

  function getCoordinates(firstPlace, secondPlace, thirdPlace){
      var positionCoordinates = [
        {x: 0,   y: 100, z: 100}, //1
        {x: 0,   y: 100, z: 0},   //2
        {x: 50,  y: 100, z: 100}, //3
        {x: 50,  y: 100, z: 0},
        {x: 100, y: 100, z: 100}, //5
        {x: 100, y: 100, z: 0},
        {x: 0,   y: 50,  z: 100}, //7
        {x: 0,   y: 50,  z: 50},
        {x: 0,   y: 50,  z: 0},
        {x: 50,  y: 50,  z: 100}, //10
        {x: 50,  y: 50,  z: 50},
        {x: 50,  y: 50,  z: 0},
        {x: 100, y: 50,  z: 100}, //13
        {x: 100, y: 50,  z: 50},
        {x: 100, y: 50,  z: 0},   //15
        {x: 0,   y: 0,   z: 100},
        {x: 0,   y: 0,   z: 0},
        {x: 50,  y: 0,   z: 100}, //18
        {x: 50,  y: 0,   z: 0},
        {x: 100, y: 0,   z: 100}, //20
        {x: 100, y: 0,   z: 0}
      ];
      var xCoordinateNew = ((firstPlace.score * positionCoordinates[firstPlace.position-1].x)*2 + (secondPlace.score * positionCoordinates[secondPlace.position-1].x) + (thirdPlace.score * positionCoordinates[thirdPlace.position-1].x)) / (firstPlace.score*2 + secondPlace.score + thirdPlace.score);
      var yCoordinateNew = ((firstPlace.score * positionCoordinates[firstPlace.position-1].y)*2 + (secondPlace.score * positionCoordinates[secondPlace.position-1].y) + (thirdPlace.score * positionCoordinates[thirdPlace.position-1].y)) / (firstPlace.score*2 + secondPlace.score + thirdPlace.score);
      var zCoordinateNew = ((firstPlace.score * positionCoordinates[firstPlace.position-1].z)*2 + (secondPlace.score * positionCoordinates[secondPlace.position-1].z) + (thirdPlace.score * positionCoordinates[thirdPlace.position-1].z)) / (firstPlace.score*2 + secondPlace.score + thirdPlace.score);

      //smooth by averaging with last coordinate
      xCoordinate = (xCoordinate*3 + xCoordinateNew)/4;
      yCoordinate = (yCoordinate*3 + yCoordinateNew)/4;
      zCoordinate = (zCoordinate*3 + zCoordinateNew)/4;

      $("#coordinates").html("X: " + xCoordinate.toFixed(1) + "   Y: " + yCoordinate.toFixed(1) + "   Z: " + zCoordinate.toFixed(1));
      $("#absolute-position").css({"top": (100 - yCoordinate) + "%", "left": xCoordinate + "%", "font-size": ((100 - zCoordinate) / 6 + 5) + "rem"});
      console.log("FIRST: " + firstPlace.position + " SECOND: " + secondPlace.position + " THIRD: " + thirdPlace.position);
  }

  $('#export-btn').click(function() {
      console.log("export NN button"); 
      //clear everything but key values from stored NN
      neuralNet.clear();

      //export optimized weights and activation function
      var standalone = neuralNet.standalone();

      //convert to string for parsing
      standalone = standalone.toString();

      console.log(standalone);
  });


/**************************** TRAIN NN ******************************/
function trainNN(){

  var trainingData = [];

    for(var i=0; i<sensorDataSession.length; i++){

        var currentSample = sensorDataSession[i];
        var currentPosition = currentSample[0];

        //all positions are false except for the position sample sensor data relates to
     //   var outputArray = new Array(75).fill(0);

        var outputArray = new Array(21).fill(0);

        //the position at which sample was taken is true
        outputArray[currentPosition] = 1; 

        var inputArray = new Array(19).fill(0);
            inputArray[0] = currentSample[1]; 
            inputArray[1] = currentSample[2]; 
            inputArray[2] = currentSample[3]; 
            inputArray[3] = currentSample[4] / 101; 
            inputArray[4] = currentSample[5] / 101; 
            inputArray[5] = currentSample[6] / 101;  
            inputArray[6] = currentSample[7] / 101; 
            inputArray[7] = currentSample[8] / 101; 
            inputArray[8] = currentSample[9] / 101; 
            inputArray[9] = currentSample[10] / 101; 
            inputArray[10] = currentSample[11] / 101; 
            inputArray[11] = currentSample[12] / 101; 
            inputArray[12] = currentSample[13] / 101; 
            inputArray[13] = currentSample[14] / 101; 
            inputArray[14] = currentSample[15] / 101; 
			      inputArray[15] = currentSample[16] / 101; 
            inputArray[16] = currentSample[17] / 101; 
            inputArray[17] = currentSample[18] / 101;
            inputArray[18] = currentSample[19] / 101;

        trainingData.push({
            input:  inputArray, 
            output: outputArray
        });

        console.log(currentSample + " TRAINING INPUT: " + inputArray);
        console.log(currentSample + " TRAINING OUTPUT: " + outputArray);
    }


    trainer.train(trainingData, {
        rate: 0.05,
     //   iterations: 15000,
        iterations: 5,
        error: 0.04,
        shuffle: true,
     //   log: 1000,
        log: 5,
        cost: Trainer.cost.CROSS_ENTROPY
    });

    //we have a trained NN to use
    haveNNFlag = true;
    trainNNFlag = false;
    $('#activate-btn').addClass("haveNN");
    $('#export-btn').addClass("haveNN");
}




//end window on load
}
