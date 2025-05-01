let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let faceCascadeFile = 'haarcascade_frontalface_default.xml';
let lastTriggerTime = 0;
const triggerCooldown = 5000; // milliseconds
let startTime = new Date().getTime();

function onOpenCvReady() {
    cv['fs'].root().createReader().readEntries(function(entries) {
        if (entries.indexOf('haarcascade_frontalface_default.xml') === -1) {
            loadFaceCascade();
        } else {
            startVideo();
        }
    });
}

function loadFaceCascade() {
    let utils = new Utils('errorMessage');
    let url = faceCascadeFile;
    utils.createFileFromUrl(url, url, function() {
        startVideo();
    });
}

function startVideo() {
    video.src = 'faces3.mp4'; // Replace with your video file path
    video.onloadeddata = processVideo;
}

function processVideo() {
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let gray = new cv.Mat();
    let faces = new cv.RectVector();
    let faceCascade = new cv.CascadeClassifier();
    faceCascade.read(faceCascadeFile);

    function processFrame() {
        let begin = Date.now();
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        src.data.set(imageData.data);
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
        cv.equalizeHist(gray, gray);
        faceCascade.detectMultiScale(gray, faces, 1.1, 5);

        let timer = new Date().getTime();

        if (faces.size().height === 2 && (timer - lastTriggerTime > triggerCooldown)) {
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
            document.body.appendChild(img);
        }

        if (faces.size().height === 0) {
            video.pause();
            return;
        }

        let delay = 1000 / 60 - (Date.now() - begin);
        setTimeout(processFrame, delay);
    }

    setTimeout(processFrame, 0);
}
