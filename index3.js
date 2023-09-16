var videoElement;
var labels;
var data;

  async function start() {
     
    // Load the model.
    const tfliteModel = await tf.loadGraphModel(
      "jsmodelv3/model.json",
    );
    // Create an XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // Define the URL of the file you want to request
    fileUrl = 'label.txt'; // Replace with the actual URL of your file

    xhr.onload = function() {
    if (xhr.status === 200) {
        // The request was successful
        const fileContent = xhr.responseText; // Get the file content as a string
        labels = fileContent.split('\n'); // Split the content into lines
    }
    else {
      console.error("Request failed with status", xhr.status);
    }
    }
    xhr.open('GET', fileUrl, true);
    xhr.send();

    const dataxhr = new XMLHttpRequest(); 
    dataxhr.open("GET", "foodkeeper.json", true);
    dataxhr.onload = function() {
      if (this.status == 200) {
        // The request was successful, parse the JSON data
        data = JSON.parse(this.responseText);
      } else {
        // The request failed
        alert("Error loading foodkeeper.json");
      }
    };
    dataxhr.send();

    // Setup the trigger button.
    setupTrigger(tfliteModel);
  }
  
  async function callTfliteModel(tfliteModel) {
    // Prepare the input tensors from the image.
    // const inputTensor = tf.image
    //   .resizeBilinear(tf.browser.fromPixels(document.getElementById("food-image")), [
    //     224,
    //     224
    //   ])
    //   // Normalize.
    //   .expandDims();
    //   //  .div(127.5)
    //   //  .sub(1);
    
    // Run the inference and get the output tensors.
    const tfwebcam = await tf.data.webcam(videoElement, {
      resizeWidth: 224,
      resizeHeight: 224,
    });
    let predictimg = await tfwebcam.capture();
    predictimg = predictimg.expandDims(0);

    const predict2 = tfliteModel.predict(predictimg);
    // let predictions = outputTensor.dataSync();
    // console.log(predictions);
    // function findIndexOfLargest(arr) {
    //   if (arr.length === 0) {
    //       return -1; // Return -1 for an empty array
    //   }
  
    //   let largestIndex = 0; // Initialize the index of the largest element to the first element
  
    //   for (let i = 1; i < arr.length; i++) {
    //       if (arr[i] > arr[largestIndex]) {
    //           largestIndex = i; // Update the index if a larger element is found
    //       }
    //   }
  
    //   return largestIndex;
    // }
    
    // // Example usage:
    // const indexOfLargest = findIndexOfLargest(predictions);
    // console.log(labels[indexOfLargest], predictions[indexOfLargest]);
    //relevant_data = data['sheets'][2]['data'][286];
    // console.log(relevant_data);
    console.log(predict2.arraySync()[0]);
    const predictionArray = predict2.arraySync()[0]; // Convert predictions to a JavaScript array
    const topPredictionIndex = predictionArray.indexOf(Math.max(...predictionArray)); // Find the index of the class with the highest probability
    console.log(labels[topPredictionIndex], predictionArray[topPredictionIndex]);
    console.log(predictionArray);


    // const foodname = document.getElementById("food-name");
    // const shelflife = document.getElementById("shelf-life");
    // const storage = document.getElementById("storage");
    // const freezelife = document.getElementById("freeze-life");
    // storage.innerHTML = relevant_data[8]["Pantry_tips"];
    // foodname.innerHTML = relevant_data[2]["Name"];
    // shelflife.innerHTML = "The shelf life of this food is <strong>7</strong> days.";
    // freezelife.innerHTML = "This food can be stored 2 months if frozen.";
    // Process and draw the result on the canvas.
    //
    // // De-normalize.
    // const data = outputTensor.add(1).mul(127.5);
    // // Convert from RGB to RGBA, and create and return ImageData.
    // const rgb = Array.from(data.dataSync());
    // const rgba = [];
    // for (let i = 0; i < rgb.length / 3; i++) {
    //   for (let c = 0; c < 3; c++) {
    //     rgba.push(rgb[i * 3 + c]);
    //   }
    //   rgba.push(255);
    // }
    // // Draw on canvas.
    // const imageData = new ImageData(Uint8ClampedArray.from(rgba), 224, 224);
    // const canvas = document.querySelector("canvas");
    // const ctx = canvas.getContext("2d");
    // ctx.putImageData(imageData, 0, 0);
    // canvas.classList.remove("hide");
  }
  
  function setupTrigger(tfliteModel) {
    console.log("setupTrigger()");
    const floatingbutton = document.getElementById("floating-button");
    

    document.getElementById("floating-button").addEventListener("click", (e) => {
      // floatingbutton.textContent = "Processing...";
      console.log("Clicked");
      setTimeout(() => {
        // const imgelement = document.getElementById("food-image");
        // const canvas = document.createElement('canvas');
        // const context = canvas.getContext('2d');
        // canvas.width = videoElement.videoWidth;
        // canvas.height = videoElement.videoHeight;
        
        // // // Draw the current video frame onto the canvas
        // context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // // // Convert the canvas content to a data URL (JPG image)
        // //const dataUrl = canvas.toDataURL('image/jpeg');
        // // console.log(dataUrl);
        // // Create an <img> element to display the captured image                    
        // imgelement.src= "https://thumbs.dreamstime.com/b/red-apple-isolated-clipping-path-19130134.jpg";
        callTfliteModel(tfliteModel);
      });
    })
  }

  function requestmobilecamera() {
    
  }
  
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("open-button").addEventListener("click", async function() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            await navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                videoElement = document.getElementById('camera-feed'); // Assign the videoElement here
                videoElement.srcObject = stream;
                videoElement.play();
                document.getElementById("floating-button").style.display = 'block';
            })
            .catch(function (error) {
                console.error('Error accessing the camera:', error);
            })
        }
    });
    document.getElementById("stop-button").addEventListener("click", async function() {
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject;
        const tracks = stream.getTracks();

        tracks.forEach(function (track) {
            track.stop(); // Stop each track in the stream
        });

        videoElement.srcObject = null; // Remove the video stream from the video element
        document.getElementById("floating-button").style.display = 'none';
      }
  });
    start();
});

  