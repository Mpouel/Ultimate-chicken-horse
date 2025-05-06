const video = document.getElementById('video');
const box = document.getElementById('box');
const cameraSelect = document.getElementById('cameraSelect');
let currentStream;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'),
  faceapi.nets.ageGenderNet.loadFromUri('models')
]).then(getCameras);

async function getCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');

  cameraSelect.innerHTML = '';
  videoDevices.forEach((device, index) => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.text = device.label || `Camera ${index + 1}`;
    cameraSelect.appendChild(option);
  });

  cameraSelect.onchange = () => startVideo(cameraSelect.value);
  if (videoDevices.length > 0) startVideo(videoDevices[0].deviceId);
}

async function startVideo(deviceId) {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = { video: { deviceId: { exact: deviceId } } };
  currentStream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = currentStream;

  video.onloadedmetadata = () => {
    video.play();
    runDetection();
  };
}

function runDetection() {
  video.addEventListener('play', () => {
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withAgeAndGender();

      if (detections.length >= 2 && detections.filter(d => d.age > 25).length >= 1) {
        box.style.backgroundColor = 'red';
      } else {
        box.style.backgroundColor = 'green';
      }
    }, 1000);
  });
}

getCameras()