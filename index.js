var videoElement;
tflite.setWasmPath(
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.8/dist/'
 );
var labels;
var data;
var image;

const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(image);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}

  async function start() {
     
    // Load the model.
    init();

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
    setupTrigger();
  }
  
  async function callTfliteModel() {
    predict(document.getElementById("food-image"));
  }
  
  function setupTrigger() {
    console.log("setupTrigger()");
    const floatingbutton = document.getElementById("floating-button");
    

    document.getElementById("floating-button").addEventListener("click", (e) => {
      floatingbutton.textContent = "Processing...";
      console.log("Clicked");
      setTimeout(() => {
        const imgelement = document.getElementById("food-image");
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // // Draw the current video frame onto the canvas
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // // Convert the canvas content to a data URL (JPG image)
        const dataUrl = canvas.toDataURL('image/jpeg');
        image = canvas;
        // console.log(dataUrl);
        // Create an <img> element to display the captured image                    
        imgelement.src= dataUrl;
        callTfliteModel();
      });
    })
  }
  
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("open-button").addEventListener("click", async function() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            await navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                videoElement = document.getElementById('camera-feed'); // Assign the videoElement here
                videoElement.srcObject = stream;
                videoElement.play();
            })
            .catch(function (error) {
                console.error('Error accessing the camera:', error);
            })
        }
    });
    start();
});

  