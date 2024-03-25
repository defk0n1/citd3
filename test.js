
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { RoughEase, ExpoScaleEase, SlowMo } from "gsap/EasePack";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger,RoughEase,ExpoScaleEase,SlowMo,CustomEase);




const TEXTURE_PATH = "assets/grid.png"
const DISPLACEMENT_PATH = "https://res.cloudinary.com/dg5nsedzw/image/upload/v1641657200/blog/vaporwave-threejs-textures/displacement.png";
const METALNESS_PATH = "https://res.cloudinary.com/dg5nsedzw/image/upload/v1641657200/blog/vaporwave-threejs-textures/metalness.png";


// Textures
const textureLoader = new THREE.TextureLoader();
const gridTexture = textureLoader.load(TEXTURE_PATH);
const terrainTexture = textureLoader.load(DISPLACEMENT_PATH);
const metalnessTexture = textureLoader.load(METALNESS_PATH);

const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Fog
const fog = new THREE.FogExp2("#000000",3);
scene.fog = fog;

// Objects
const geometry = new THREE.PlaneGeometry(1, 2, 24, 24);
const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
	map: gridTexture,
	displacementMap: terrainTexture,
    displacementScale: 0.4,
	metalnessMap:  metalnessTexture,
	metalness: 1,
    roughness: 6
});
// LOADING CITD MODEL
const loader = new GLTFLoader();
loader.load('assets/finalpink.glb', function(glb){
	console.log(glb);
	const LOGO = glb.scene;
	LOGO.scale.set(1,1,1);
	LOGO.position.set(0,-.01,-.06);
	LOGO.rotateX(Math.PI /2);
	scene.add(LOGO);
}, function(xhr){
	console.log((xhr.loaded/xhr.total * 100)+ "% loaded")
}, function(error){
	console.log('an error occured')
})

// AXES HELPER
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );
//PLANES 
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -.1;
plane.position.z = 0.15;


const plane2 = new THREE.Mesh(geometry, material);
plane2.rotation.x = -Math.PI * 0.5;
plane2.position.y = -.1;
plane2.position.z = -1.85; // 0.15 - 2 (the length of the first plane)

scene.add(plane);
scene.add(plane2);
// ADDING PARTICLES
const particlesGeometry = new THREE.BufferGeometry;
const particlesCnt = 3000;

const posArray = new Float32Array(particlesCnt * 3);

for(let i = 0; i < particlesCnt * 3; i++) {
    // posArray[i] = Math.random() - 0.5
    posArray[i] = (Math.random() - 0.5) * (Math.random() * 5)
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

// Materials

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.001,
    // color: 0x5B1D76
    color: 0xffffff

})
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particlesMesh)

// Light
// Ambient Light
const ambientLight = new THREE.AmbientLight("#ffffff", 10);
scene.add(ambientLight);

// Right Spotlight aiming to the left
const spotlight = new THREE.SpotLight("#5B1D76", 20, 25, Math.PI * 0.1, 0.25);
spotlight.position.set(0.5, 0.75, 2.2);
// Target the spotlight to a specific point to the left of the scene
spotlight.target.position.x = -0.25;
spotlight.target.position.y = 0.25;
spotlight.target.position.z = 0.25;
scene.add(spotlight);
scene.add(spotlight.target);

// Left Spotlight aiming to the right
const spotlight2 = new THREE.SpotLight("#5B1D76", 20, 25, Math.PI * 0.1, 0.25);
spotlight2.position.set(-0.5, 0.75, 2.2);
// Target the spotlight to a specific point to the right side of the scene
spotlight2.target.position.x = 0.25;
spotlight2.target.position.y = 0.25;
spotlight2.target.position.z = 0.25;
scene.add(spotlight2);
scene.add(spotlight2.target);


// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.01,
  20
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 0.3;
// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = false; 

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Post Processing
const effectComposer = new EffectComposer(renderer);
effectComposer.setSize(sizes.width, sizes.height);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);



const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms["amount"].value = 0.0001;

effectComposer.addPass(rgbShiftPass);

//GLITCH EFFECT

// const glitchPass = new GlitchPass();
// console.log(glitchPass);
// console.log(effectComposer);
// effectComposer.addPass(glitchPass);

const filmPass = new FilmPass(6,false);
effectComposer.addPass( filmPass );

const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionPass);

const outputPass = new OutputPass();
effectComposer.addPass( outputPass );

// Event listener to handle screen resize
window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Update effect composer
    effectComposer.setSize(sizes.width, sizes.height);
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();
let yposition= 0;
// let oldYValue = 0;
// window.addEventListener('scroll', function(e){

//     // Get the new Value
//     var newValue = window.scrollY;
//     console.log(camera.position.z);
//     var zoomSpeed = 5* 0.00095;
//     //Subtract the two and conclude
//     if(oldYValue - newValue < 0){
//         console.log("Up");
//         if(camera.position.z >= 0.3){
//         camera.position.z += zoomSpeed;
//     }} else if(oldYValue - newValue > 0){
//         console.log("Down");
//         if(camera.position.z >= 0.3){
//             if ((camera.position.z - zoomSpeed )< 0.3){
//                 camera.position.z = 0.3;
//             }
//             else{
//             camera.position.z -= zoomSpeed;}
//         }
//     }

//     // Update the old value
//     oldYValue = newValue;
// });

// element should be replaced with the actual target element on which you have applied scroll, use window in case of no target element.
// window.addEventListener("scroll", function(){ // or window.addEventListener("scroll"....
//     var st = window.scrollY || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
//    if (st > lastScrollTop) {
//     if(camera.position.z >= 0.3){
//         camera.position.z += 1 * 0.00095;}
       
//    } else if (st < lastScrollTop) {
//     if(camera.position.z > 0.3 ){
//         camera.position.z -= 1* 0.00095; 
  
      
//    } 
//    lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
// }}, false);
// window.addEventListener('wheel', (e) => {
//     // Adjust the camera position based on scroll direction
    
//     if(camera.position.z >= 0.3){
//         camera.position.z += e.deltaY * 0.00095;
//         yposition += e.deltaY;   }
   

//     if(camera.position.z < 0.3 && e.deltaY > 0){
//         camera.position.z += e.deltaY* 0.00095;       
//         yposition += e.deltaY; }

//     console.log(yposition);
    
    

//   });


// document.addEventListener('mousemove', animateParticles)

let mouseX = 0
let mouseY = 0

// function animateParticles(event){
//     mouseX = event.clientX
//     mouseY = event.clientY
// }


// Animate
const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    // Update controls
    controls.update();
    particlesMesh.rotation.y = -.1 * elapsedTime

    if (mouseX > 0) {
        particlesMesh.rotation.x = -mouseY * (elapsedTime * 0.00005)
        particlesMesh.rotation.y = mouseX * (elapsedTime * 0.00005)    
    }

    plane.position.z = (elapsedTime * 0.015) % 2;
    plane2.position.z = ((elapsedTime * 0.015) % 2) - 2;

    // Render
    // renderer.render(scene, camera);
    effectComposer.render();

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();


let o ={a:0};
gsap.to(o,{
	a:1,
	scrollTrigger:{
		trigger:".wrapper",
		markers: true,
		start:"top top",
		end:"bottom bottom",
		onUpdate: (self) =>{
			console.log(self.progress);
			camera.position.z = (self.progress+0.001) *2;
		}
	}

})

