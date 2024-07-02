// Options
const particleCount = 6000;
		
const particleSize = .3;

const defaultAnimationSpeed = 1,
		morphAnimationSpeed = 1,
	  	color = '#00CCFF';

// Triggers
const triggers = document.getElementsByTagName('span')

// Renderer
var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x000000, 0);
document.body.appendChild( renderer.domElement );

// Ensure Full Screen on Resize
function fullScreen () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('resize', fullScreen, false)

// Scene
var scene = new THREE.Scene();
scene.background = null;

// Camera and position
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

camera.position.y = -45;
camera.position.z = 150;

// Lighting
var light = new THREE.AmbientLight( 0xFFFFFF00, 1 );
scene.add( light );

// Orbit Controls
// var controls = new THREE.OrbitControls( camera );
// controls.update();

// Particle Vars
var particles = new THREE.Geometry();

var texts = [];

var pMaterial = new THREE.PointCloudMaterial({
			size: particleSize,
});

// Texts
var loader = new THREE.FontLoader();
var typeface = 'swiss_black_cond.json?';

loader.load( typeface, ( font ) => {
	Array.from(triggers).forEach((trigger, idx) => {
		
		texts[idx] = {};
		
		texts[idx].geometry = new THREE.TextGeometry( trigger.textContent, {
			font: font,
			size: window.innerWidth * 0.02,
			height: 4,
			curveSegments: 10,
		});
		
		THREE.GeometryUtils.center( texts[idx].geometry )
			

		texts[idx].particles = new THREE.Geometry();

		texts[idx].points = THREE.GeometryUtils.randomPointsInGeometry(texts[idx].geometry, particleCount);

		createVertices(texts[idx].particles, texts[idx].points)

		enableTrigger(trigger, idx);
		
	});
});

// Particles
for (var p = 0; p < particleCount; p++) {
	var vertex = new THREE.Vector3();
			vertex.x = 0;
			vertex.y = 0;
			vertex.z = 0;

	particles.vertices.push(vertex);
}

function createVertices (emptyArray, points) {
	for (var p = 0; p < particleCount; p++) {
		var vertex = new THREE.Vector3();
				vertex.x = points[p]['x'];
				vertex.y = points[p]['y'];
				vertex.z = points[p]['z'];

		emptyArray.vertices.push(vertex);
	}
}

function enableTrigger(trigger, idx){
	
	
	trigger.setAttribute('data-disabled', false);
	
	trigger.addEventListener('click', () => {
		morphTo(texts[idx].particles, trigger.dataset.color);
	})
	
	if (idx == 0) {
		morphTo(texts[idx].particles, trigger.dataset.color);
	}
}

var particleSystem = new THREE.PointCloud(
    particles,
    pMaterial
);

particleSystem.sortParticles = true;

// Add the particles to the scene
scene.add(particleSystem);

// Animate
const normalSpeed = (defaultAnimationSpeed/100),
			fullSpeed = (morphAnimationSpeed/100)

let animationVars = {
	speed: normalSpeed,
	color: color,
	rotation: -45
}


function animate() {
	
	particleSystem.rotation.x += animationVars.speed;
	particles.verticesNeedUpdate = true; 
	
	// camera.position.z = animationVars.rotation;
	// camera.position.y = animationVars.rotation;
	camera.lookAt( scene.position );
	
	particleSystem.material.color = new THREE.Color( animationVars.color );
	
	window.requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

animate();

function scrollAnimation(){
    let t = document.body.getBoundingClientRect().top;
    // console.log(t)
    
    if(Math.abs(t) < (document.querySelector('body').scrollHeight - 600) / 3) {
		morphTo(texts[0].particles, triggers[0].dataset.color);
    } else if(Math.abs(t) < (document.querySelector('body').scrollHeight - 600) / 3 * 2) {
		morphTo(texts[1].particles, triggers[1].dataset.color);
    } else {
		morphTo(texts[2].particles, triggers[2].dataset.color);
    }

    t *= 1;
    // particleSystem.rotation.x = animationVars.speed * t;
    // camera.position.z = animationVars.rotation * t;
	// camera.position.y = animationVars.rotation * t;
	camera.lookAt( scene.position );
}

document.body.onscroll = scrollAnimation;

function morphTo (newParticles, color = '#FFFFFF') {
	
	TweenMax.to(animationVars, .1, {
		ease: Power4.easeIn, 
		speed: fullSpeed, 
		onComplete: slowDown
	});
	
	TweenMax.to(animationVars, 2, {
		ease: Linear.easeNone, 
		color: color
	});
	
	
	// particleSystem.material.color.setHex(color);
	
	for (var i = 0; i < particles.vertices.length; i++){
		TweenMax.to(particles.vertices[i], 2, {
			ease: Elastic.easeOut.config( 0.1, .3), 
			x: newParticles.vertices[i].x,
			y: newParticles.vertices[i].y, 
			z: newParticles.vertices[i].z
		})
	}
	
	// console.log(animationVars.rotation)
	
	TweenMax.to(animationVars, 2, {
		ease: Elastic.easeOut.config( 0.1, .3), 
		rotation: animationVars.rotation == 45 ? -45 : 45,
	})
}
function slowDown () {
	TweenMax.to(animationVars, 0.3, {ease:
Power2.easeOut, speed: normalSpeed, delay: 0.2});
}


// Add light effect with cursor
import { particlesCursor } from 'https://unpkg.com/threejs-toys@0.0.8/build/threejs-toys.module.cdn.min.js'

const pc = particlesCursor({
    el: document.getElementById('app'),
    gpgpuSize: 512,
    colors: [0x00ff00, 0x0000ff],
    color: 0xff0000,
    coordScale: 0.5,
    noiseIntensity: 0.0001,
    noiseTimeCoef: 0.0001,
    pointSize: 3,
    pointDecay: 0.0025,
    sleepRadiusX: 250,
    sleepRadiusY: 250,
    sleepTimeCoefX: 0.001,
    sleepTimeCoefY: 0.002
})

document.body.addEventListener('click', () => {
    pc.uniforms.uColor.value.set(Math.random() * 0xffffff)
    pc.uniforms.uCoordScale.value = 0.001 + Math.random() * 2
    pc.uniforms.uNoiseIntensity.value = 0.0001 + Math.random() * 0.001
    pc.uniforms.uPointSize.value = 1 + Math.random() * 10
})
// End of light effect with cursor