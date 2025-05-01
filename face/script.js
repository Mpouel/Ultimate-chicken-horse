let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let faceCascadeFile = 'haarcascade_frontalface_default.xml';
let lastTriggerTime = 0;
const triggerCooldown = 5000; // milliseconds
let startTime = new Date().getTime();

function onOpenCvReady() {
    console.log('OpenCV.js is ready');
    cv['fs'].root().createReader().readEntries(function(entries) {
        if (entries.indexOf('haarcascade_frontalface_default.xml') === -1) {
            loadFaceCascade();
        } else {
            startWebcam();
        }
    });
}

function loadFaceCascade() {
    let utils = new Utils('errorMessage');
    let url = faceCascadeFile;
    utils.createFileFromUrl(url, url, function() {
        document.writeln('Face cascade loaded');
        startWebcam();
    });
}

function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
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

// Utility class for loading files
class Utils {
    constructor() {
        this.fileEntry = null;
    }

    createFileFromUrl(path, url, callback) {
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = (ev) => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    let data = new Uint8Array(request.response);
                    cv['fs'].root().createWriter(path, data, true);
                    callback();
                } else {
                    console.error('Failed to load ' + url + ' status: ' + request.status);
                }
            }
        };
        request.send();
    }
}
