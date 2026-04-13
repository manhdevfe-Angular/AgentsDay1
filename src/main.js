import './style.css'
import * as THREE from 'three'

// Typing Animation
const strings = ["UI/UX Designer", "React & Angular Expert", "AI Tools Enthusiast"];
let stringIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingEl = document.getElementById("typing-text");

function type() {
  if(!typingEl) return;
  const currentString = strings[stringIndex];

  if (isDeleting) {
    typingEl.textContent = currentString.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typingEl.textContent = currentString.substring(0, charIndex + 1);
    charIndex++;
  }

  let typingSpeed = isDeleting ? 40 : 100;

  if (!isDeleting && charIndex === currentString.length) {
    typingSpeed = 2000; // pause at end
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    stringIndex = (stringIndex + 1) % strings.length;
    typingSpeed = 500; // pause before start
  }

  setTimeout(type, typingSpeed);
}
setTimeout(type, 1000);

// THREE.JS SETUP
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 40; // Zoom out a little bit

const canvas = document.querySelector('#bg');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true, // transparent background
  antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Particles System
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i=0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 120; // spread
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Create a simple circular texture programmatically to avoid loading image
const texCanvas = document.createElement('canvas');
texCanvas.width = 16;
texCanvas.height = 16;
const ctx = texCanvas.getContext('2d');
ctx.beginPath();
ctx.arc(8, 8, 8, 0, Math.PI * 2);
ctx.fillStyle = '#ffffff';
ctx.fill();
const texture = new THREE.CanvasTexture(texCanvas);

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.3,
  map: texture,
  transparent: true,
  opacity: 0.7,
  color: 0x00e5ff,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX / window.innerWidth - 0.5;
  mouseY = event.clientY / window.innerHeight - 0.5;
});

// Scroll Interaction to move camera mapped to sections
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  
  // As user scrolls down (t is negative), rotate the mesh and slightly move camera
  particlesMesh.rotation.y = t * -0.0005;
  particlesMesh.rotation.x = t * -0.0002;
  
  // Camera moves slightly forward
  camera.position.z = 40 + t * -0.01;
}
document.body.onscroll = moveCamera;
moveCamera(); // Initialize based on current scroll

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Slow continuous rotation
  particlesMesh.rotation.y += 0.001;
  particlesMesh.rotation.z = Math.sin(elapsedTime * 0.1) * 0.1;
  
  // Smoothed mouse follow
  const targetX = mouseX * 8;
  const targetY = -mouseY * 8;
  
  particlesMesh.position.x += (targetX - particlesMesh.position.x) * 0.05;
  particlesMesh.position.y += (targetY - particlesMesh.position.y) * 0.05;

  renderer.render(scene, camera);
}

animate();

// Handle Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
