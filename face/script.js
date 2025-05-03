const video = document.getElementById('video');
const box = document.getElementById('statusBox');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error('Error accessing camera:', err));
}

video.addEventListener('play', () => {
  const interval = setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withAgeAndGender();

    if (detections.length >= 2) {
      const secondFace = detections[1];
      if (secondFace.age > 25) {
        box.style.backgroundColor = 'red';
      } else {
        box.style.backgroundColor = 'green';
      }
    } else {
      box.style.backgroundColor = 'green';
    }
  }, 1000);
});
