const video = document.getElementById('video');
const box = document.getElementById('box');
const cameraSelect = document.createElement('select');
document.body.insertBefore(cameraSelect, video);

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(getCameras).catch(err => console.error('Error loading models:', err));

let currentStream = null;

async function getCameras() {
  try {
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
    } else {
      console.warn('No video devices found.');
    }
  } catch (err) {
    console.error('Error getting cameras:', err);
  }
}

async function startVideo(deviceId) {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: { deviceId: { exact: deviceId } }
  };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
  } catch (err) {
    console.error('Error accessing the camera:', err);
  }
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

// Initial call to get cameras
getCameras();
