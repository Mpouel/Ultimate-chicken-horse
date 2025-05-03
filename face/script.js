const video = document.getElementById('video');
const box = document.getElementById('box');
const cameraSelect = document.createElement('select');
document.body.insertBefore(cameraSelect, video);

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(getCameras);

let currentStream;

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

  cameraSelect.addEventListener('change', () => startVideo(cameraSelect.value));

  if (videoDevices.length > 0) {
    startVideo(videoDevices[0].deviceId);
  }
}

async function startVideo(deviceId) {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: { deviceId: { exact: deviceId } }
  };

  currentStream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = currentStream;
}

video.addEventListener('play', () => {
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withAgeAndGender();

    if (detections.length >= 2 && detections[1].age > 25) {
      box.style.background = 'red';
    } else {
      box.style.background = 'green';
    }
  }, 1000);
});

getCameras()