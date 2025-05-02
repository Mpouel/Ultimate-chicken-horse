let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let faceCascade;
let lastTriggerTime = 0;
const triggerCooldown = 5000;
let startTime = new Date().getTime();

function loaded() {
  console.log('OpenCV.js is ready');
  loadFaceCascade();
};

function loadFaceCascade() {
  const cascadeFile = 'haarcascade_frontalface_default.xml';
  const url = 'https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/' + cascadeFile;
  fetch(url)
    .then(res => res.arrayBuffer())
    .then(buffer => {
      cv.FS_createDataFile('/', cascadeFile, new Uint8Array(buffer), true, false, false);
      faceCascade = new cv.CascadeClassifier();
      if (!faceCascade.load(cascadeFile)) {
        console.error('Failed to load cascade classifier');
      } else {
        console.log('Face cascade loaded from GitHub');
      }
    })
    .catch(err => document.writeln('Cascade fetch error:', err));
}

function listCameras() {
  navigator.mediaDevices.enumerateDevices().then(devices => {
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
      cameraSelect.onchange = () => startWebcam(cameraSelect.value);
      cameraSelect.onchange();
    }
  });
}

function startWebcam(deviceId) {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
  navigator.mediaDevices.getUserMedia({ video: { deviceId } })
    .then(stream => {
      video.srcObject = stream;
      video.onloadeddata = () => {
        video.play();
        processVideo();
      };
    })
    .catch(err => console.error('Webcam error:', err));
}

function processVideo() {
  const src = new cv.Mat(canvas.height, canvas.width, cv.CV_8UC4);
  const gray = new cv.Mat();
  const faces = new cv.RectVector();

  function processFrame() {
    if (!video.srcObject) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    src.data.set(imageData.data);

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.equalizeHist(gray, gray);
    faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0);

    const now = new Date().getTime();

    if (faces.size() === 2 && now - lastTriggerTime > triggerCooldown) {
      lastTriggerTime = now;
      const t = (now - startTime) / 1000;
      console.log(`2 faces detected at ${t.toFixed(2)}s`);

      const rect = faces.get(1);
      const faceImageData = context.getImageData(rect.x, rect.y, rect.width, rect.height);

      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = rect.width;
      faceCanvas.height = rect.height;
      faceCanvas.getContext('2d').putImageData(faceImageData, 0, 0);

      const link = document.createElement('a');
      link.download = 'second_face_screenshot.png';
      link.href = faceCanvas.toDataURL();
      link.click();

      const img = new Image();
      img.src = faceCanvas.toDataURL();
      img.classList.add('screenshot');
      document.getElementById('screenshotContainer').appendChild(img);
    }

    setTimeout(processFrame, 1000 / 30);
  }

  processFrame();
}

listCameras()