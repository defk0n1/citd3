import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import SplitType from 'split-type'




import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { RoughEase, ExpoScaleEase, SlowMo } from "gsap/EasePack";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(ScrollTrigger);

const clock = new THREE.Clock();
// INSTANTIATE SCENE
const scene = new THREE.Scene();



const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
  };


  //CAMERA SETTINGS
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.01,
	20
  );

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 0.1;


// RENDERER
const renderer = new THREE.WebGLRenderer({antialias: false, alpha:false});
renderer.setSize( sizes.width, sizes.height);
const landingWrapper = document.getElementsByClassName('landing-wrapper')[0];
landingWrapper.appendChild( renderer.domElement );


// ORBITCONTROLS IMPORT

// const controls = new  OrbitControls( camera,renderer.domElement );
// controls.enableDamping = true;
// // to disable zoom
// controls.enableZoom = true;

// // to disable rotation
// controls.enableRotate = true;

// // to disable pan
// controls.enablePan = true;


// Post Processing
// Add the effectComposer
const effectComposer = new EffectComposer(renderer);
effectComposer.setSize(sizes.width, sizes.height);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Add the render path to the composer
 * This pass will take care of rendering the final scene
 */
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);


const filmPass = new FilmPass(2,false);
effectComposer.addPass( filmPass );


/**
 * Add the rgbShift pass to the composer
 * This pass will be responsible for handling the rgbShift effect
 */
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms["amount"].value = 0.0001;

effectComposer.addPass(rgbShiftPass);

// const glitchPass = new GlitchPass(0.002);
// glitchPass.uniforms['amount'].value = 0.0005;
// effectComposer.addPass( glitchPass );





/**
 * Add the gammaCorrection pass to the composer to fix
 * the color issues
 */ 
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionPass);

const outputPass = new OutputPass();
effectComposer.addPass( outputPass );



// Instantiate the texture loader
const textureLoader = new THREE.TextureLoader();
// Load a texture from a given path using the texture loader
const gridTexture = textureLoader.load("assets/grid.png");
const terrainTexture = textureLoader.load("assets/displacement (1).png");
const metalnessTexture = textureLoader.load("assets/metalness.png") ;



// adding fog at the back of the scene

const fog = new THREE.FogExp2("#000000",4);
scene.fog = fog;

const particlesGeometry = new THREE.BufferGeometry;
const particlesCnt = 15000;

const posArray = new Float32Array(particlesCnt * 3);

for(let i = 0; i < particlesCnt * 3; i++) {
    // posArray[i] = Math.random() - 0.5
    posArray[i] = (Math.random() - 0.5) * (Math.random() * 5)
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

// Materials

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.001,
    color: 0x5B1D76
    // color: 0xffffff

})
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particlesMesh)



// LOADING CITD MODEL
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
dracoLoader.setDecoderConfig({ type: 'js' });
loader.setDRACOLoader(dracoLoader);
let root;
loader.load('assets/finalpink.glb', function(glb){
	// console.log(glb);
	root = glb.scene;
	root.scale.set(1,1,1);
	root.position.set(0,0.01,-0.4);
    root.children.forEach((child)=>{child.material.color = new THREE.Color(0xffffff);
        child.castShadow = false;
        child.receiveShadow = false;
        child.material.emissive = new THREE.Color( 0xFFFFFF);
        // child.material.emissiveIntensity = new THREE.Intensity( 1000.0 );
        child.material.metalness = 0;
        child.material.roughness = 0.2;
        })
	root.rotateX(Math.PI /2);
	scene.add(root);
}, function(xhr){
	console.log((xhr.loaded/xhr.total * 100)+ "% loaded")
}, function(error){
	console.log('an error occured')
})

//making droid material

const droidmaterial =  new THREE.MeshStandardMaterial({
    // Uncomment the following if you wish to visualize the wireframe of our mesh
    wireframe: true,
    color: 0x5B1D76,
    displacementScale: 0,
	metalness: 0,


});
    // loading droid model
// const fbxLoader = new FBXLoader()
// fbxLoader.load(
//     'assets/Adjutant/HOLOGRAM.FBX',
//     (object) => {
//         object.children.forEach((mesh, i) => {
//             mesh.material = droidmaterial;
//           });
//         object.scale.set(.2, .2, .2);
//         // object.position.set(0,-0.4,3);
//         object.position.set(0.07,-0.1,1.505);
//         // object.rotateX(Math.PI /8);
        



//         scene.add(object)
//     },
//     (xhr) => {
//         console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
//     },
//     (error) => {
//         console.log(error)
//     }
// )

const textLoader = new FontLoader()
var textMesh2 = new THREE.Mesh();
textLoader.load('assets/fonts/Roboto Light_Regular.json', function (font) {
    const tgeometry = new TextGeometry("</>", {
        font: font,
        size: 0.03,
        height: 0.01,
        curveSegments: 10,
        bevelEnabled: false,
        bevelOffset: 0,
        bevelSegments: 1,
        bevelSize: 0.3,
        bevelThickness: 0.001
    });
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0x5B1D76 }), // front
        new THREE.MeshBasicMaterial({ color: 0x5B1D76 }) // side
    ];
    textMesh2 = new THREE.Mesh(tgeometry, materials);
    textMesh2.castShadow = false;
	textMesh2.position.x=-0.029;
    
    textMesh2.position.y = -0.01;
    textMesh2.position.z =  1.2;
    // console.log(textMesh2);
    scene.add(textMesh2);
});


let video = document.getElementById("video");
let videoTexture = new THREE.VideoTexture(video);

videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

const movieMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side:THREE.FrontSide,
    toneMapped: false,
    transparent: true

})

let movieGeometry =  new THREE.PlaneGeometry(1, .5, 1);
let movieScreen = new THREE.Mesh(movieGeometry, movieMaterial);


movieScreen.position.x = 0
movieScreen.position.y = 0.;
movieScreen.position.z =  0.3;
movieScreen.scale.set(0.09,0.1,0,1);
scene.add(movieScreen);
video.controls = true



// AXES HELPER
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );


// MAKING THE GRID PLANE 
const geometry = new THREE.PlaneGeometry(1, 4, 24, 24);
const material = new THREE.MeshStandardMaterial({
    // Uncomment the following if you wish to visualize the wireframe of our mesh
    // wireframe: true,
    color: 0xffffff,
	map: gridTexture,
	displacementMap: terrainTexture,
    displacementScale: 0.4,
	metalnessMap:  metalnessTexture,
	metalness: 1,
    roughness: 6


});

const plane = new THREE.Mesh(geometry, material);

// Here we position our plane flat in front of the camera
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.1;
plane.position.z = 0.15;



// ADDING SECOND PLANE FOR ANIMATION (INFINITE FEEL)
const plane2 = new THREE.Mesh(geometry, material);
plane2.rotation.x = -Math.PI * 0.5;
plane2.position.y = -0.1;
plane2.position.z = -1.85; // 0.15 - 2 (the length of the first plane)

scene.add(plane);
scene.add(plane2);



// ADDED AMBIENT LIGHT
const ambientLight = new THREE.AmbientLight("#5B1D76", 1000);
scene.add(ambientLight);

const pointLight = new THREE.PointLight("#5B1D76",1000);
pointLight.position.set( 0, 3, 3);

scene.add(pointLight);

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


//RENDER
// renderer.render( scene, camera );

let mouseX = 0
let mouseY = 0

//ANIMATE TICK FUNC
function animate() {
	const elapsedTime = clock.getElapsedTime();
  	// controls.update();
	  particlesMesh.rotation.y = -.1 * elapsedTime
	  textMesh2.position.y =  Math.sin(elapsedTime*3) * 0.003 -0.01
    //   textMesh2.rotateY(0.02);
      
	  if (mouseX > 0) {
		  particlesMesh.rotation.x = -mouseY * (elapsedTime * 0.00005)
		  particlesMesh.rotation.y = mouseX * (elapsedTime * 0.00005)    
	  };

			
	  
  	// plane.position.z = (elapsedTime * 0.015) % 2;
  	// plane2.position.z = ((elapsedTime * 0.015) % 2) - 2;
    effectComposer.render();
    videoTexture.needsUpdate = true;

	requestAnimationFrame( animate ); 
	
}

animate();

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
	
    renderer.setSize(window.innerWidth, window.innerHeight)


    effectComposer.render()
}




const vidButton = document.getElementsByClassName('vidbutton');

let o ={a:0};
gsap.to(o,{
	a:1,
	scrollTrigger:{
		trigger:".landing-wrapper",
		markers: false,
		start:"top top",
		end:"500.5%  bottom",
        pin:true,
        pinSpacing: false,
        scrub:5,
        
		onUpdate: (self) =>{
			console.log(self.progress);
			camera.position.z = (self.progress+0.001) *1.7;
            if(camera.position.z > 0.25 && camera.position.z <0.35 && self.direction>0 ){
                video.play();
            };
            if(camera.position.z > 0.25 && camera.position.z <0.35 && self.direction<0 ){
                video.pause();
            };

            if(camera.position.z >0.301 && camera.position.z<0.94){
                Array.from(vidButton).forEach(function(btn) {
                    btn.classList.add("vidbutton-shown");
                 });
                
            }else{
                Array.from(vidButton).forEach(function(btn) {
                    btn.classList.remove("vidbutton-shown");
                 });
			}
			if(camera.position.z >=1.27){
				camera.position.z = 1.27;
                
			}
        
          
		}
	}

})



const text = new SplitType('.description-section', { types: 'words, chars' });
// console.log(text.chars);
const chars = text.chars;





gsap.from(chars,{
    // yPercent:130,
    opacity:0,
    stagger:0.05,
    ease: "back.out",
    duration: 5,
   
    scrollTrigger: {
        trigger: '.description-section',
        start:"top top",
        end:"100% top",
        markers: false,
        scrub:true,
        pin: true,
        anticipatePin: 1,
        
		
		
		onUpdate: (self) =>{
			// camera.position.z = 0.83;
			// var cameraWorldPos = new THREE.Vector3();
			// camera.getWorldPosition(cameraWorldPos);
			// console.log(cameraWorldPos);
            // video.play();
			
		}

    }




})





