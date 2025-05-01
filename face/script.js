let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let faceCascadeFile = 'haarcascade_frontalface_default.xml';
let lastTriggerTime = 0;
const triggerCooldown = 5000; // milliseconds
let startTime = new Date().getTime();

function onOpenCvReady() {
    console.log('OpenCV.js is ready');
    loadFaceCascade();
    listCameras();
}

function loadFaceCascade() {
    let url = 'https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml';
    fetch(url)
        .then(response => response.text())
        .then(data => {
            let faceCascade = new cv.CascadeClassifier();
            faceCascade.read(data);
            console.log('Face cascade loaded');
        })
        .catch(err => console.error('Failed to load face cascade: ', err));
}

function listCameras() {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            let cameraSelect = document.getElementById('cameraSelect');
            devices.forEach(device => {
                if (device.kind === 'videoinput') {
                    let option = document.createElement('option');
                    option.value = device.deviceId;
                    option.text = device.label || `Camera ${cameraSelect.length + 1}`;
                    cameraSelect.appendChild(option);
                }
            });
            if (cameraSelect.options.length > 0) {
                cameraSelect.onchange = () => {
                    startWebcam(cameraSelect.value);
                };
                cameraSelect.onchange(); // Start with the first camera
            }
        })
        .catch(err => console.error('Error listing cameras: ', err));
}

function startWebcam(deviceId) {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    navigator.mediaDevices.getUserMedia({ video: { deviceId: deviceId } })
        .then(function(stream) {
            video.srcObject = stream;
            video.onloadeddata = processVideo;
        })
        .catch(function(err) {
            console.error('Error accessing the webcam: ', err);
        });
}

function processVideo() {
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let gray = new cv.Mat();
    let faces = new cv.RectVector();
    let faceCascade = new cv.CascadeClassifier();
    faceCascade.read(faceCascadeFile);

    function processFrame() {
        if (!video.srcObject) return; // Ensure the video stream is active

        let begin = Date.now();
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        src.data.set(imageData.data);
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
        cv.equalizeHist(gray, gray);
        faceCascade.detectMultiScale(gray, faces, 1.1, 5);

        let timer = new Date().getTime();

        if (faces.size().width === 2 && (timer - lastTriggerTime > triggerCooldown)) {
            let ntimer = (timer - startTime) / 1000;
            console.log(`Teacher detected at: ${ntimer.toFixed(2)} seconds`);
            lastTriggerTime = timer;

            // Extract the coordinates of the second face
            let x = faces.data32F[4];
            let y = faces.data32F[5];
            let w = faces.data32F[6];
            let h = faces.data32F[7];

            // Crop the second face from the frame
            let secondFace = context.getImageData(x, y, w, h);
            let secondFaceCanvas = document.createElement('canvas');
            secondFaceCanvas.width = w;
            secondFaceCanvas.height = h;
            let secondFaceContext = secondFaceCanvas.getContext('2d');
            secondFaceContext.putImageData(secondFace, 0, 0);

            // Save the screenshot of the second face
            let link = document.createElement('a');
            link.download = 'second_face_screenshot.png';
            link.href = secondFaceCanvas.toDataURL();
            link.click();

            // Display the screenshot
            let img = new Image();
            img.src = secondFaceCanvas.toDataURL();
            img.classList.add('screenshot');
            document.getElementById('screenshotContainer').appendChild(img);
        }

        if (faces.size().width === 0) {
            video.pause();
            return;
        }

        let delay = 1000 / 60 - (Date.now() - begin);
        setTimeout(processFrame, delay);
    }

    setTimeout(processFrame, 0);
}
