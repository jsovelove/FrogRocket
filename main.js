import './style.css'
import * as THREE from 'three';
import { gsap } from "/node_modules/gsap/gsap-core.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);

camera.position.z = 5;
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
  document.getElementById('loading-screen').style.display = 'flex';
};

manager.onLoad = function () {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('container').style.display = 'block';
  document.getElementById('blast-off-btn').style.display = 'block';
  animate();
};
window.onload = function() {
  gsap.to(camera.position, {
    x: -0.02980453320040305,
    z: 0.36919539079159597,
    y: 0.21101628126584224,
    duration: 3,
    onUpdate: function() {
      camera.lookAt(0, 0, 0);
    }
  });
};
const assetLoader = new GLTFLoader(manager);
const frogURL = new URL('frog.glb', import.meta.url);
let model;
assetLoader.load(frogURL.href, function(gltf) {
  model = gltf.scene;
  scene.add(model);
  model.rotation.y = Math.PI;
}, undefined, function(error) {
  console.error(error);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


function createParticles() {
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 5000; // Number of particles
  const posArray = new Float32Array(particlesCount * 3); // Position for each particle (x, y, z)

  for (let i = 0; i < particlesCount * 3; i++) {
    // Random positions for particles
    posArray[i] = (Math.random() - 0.5) * 100; // Spread particles around
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    color: 0xffffff,
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh); // Add particles to the scene
}

createParticles();


function blastOff() {
  // Rotate the model 90 degrees upwards quickly
  gsap.to(model.rotation, { x: Math.PI / -2, duration: 1 }); // Faster rotation
  
  // Fly off the screen upwards more quickly
  gsap.to(model.position, { y: 50, duration: 15, delay: 1 }); // Shorter duration for faster movement
  
  // Make the camera follow the model more closely and rotate slowly
  gsap.to(camera.position, {
    y: model.position.y - 5, // Keep the camera closer to the model
    z: camera.position.z - 5, // Adjust for a closer and better view
    duration: 20, // Longer duration for slower, smoother follow
    delay: 1,
    onUpdate: function() {
      camera.lookAt(model.position); // Continuously adjust camera focus on the model
    }
  });
}


document.getElementById('blast-off-btn').addEventListener('click', function() {
  blastOff();
  // Optionally hide the button after click
  this.style.display = 'none';
});

