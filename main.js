import * as THREE from 'https://cdn.skypack.dev/three@0.135.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.135.0/examples/jsm/controls/OrbitControls.js';


const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(95,
    window.innerWidth / window.innerHeight,
    0.1,
    1000);
const scene = new THREE.Scene();

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableZoom = true;
orbit.zoomSpeed = 0.2; // Adjust the value as needed
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional soft shadows


camera.position.set(50, 35, 55);
orbit.update();

// Lighting
const sunLight = new THREE.PointLight(0xFFFFFF, 1.2); // White light with intensity 1
sunLight.position.set(0, 0, 0); // Position at the center (where the sun is)
scene.add(sunLight);

// Ambient light for overall scene illumination
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
scene.add(ambientLight);


const textureLoader = new THREE.TextureLoader();

const spaceTexture = textureLoader.load('8k_stars.jpg');
scene.background = spaceTexture;

// Function to create planets
// Function to create planets
function createPlanet(radius, textureMap, distanceFromSun, orbitalSpeed, name) {
    const planetGeometry = new THREE.SphereGeometry(radius, 50, 50);
    const planetMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load(textureMap)
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.distanceFromSun = distanceFromSun;
    planet.orbitalSpeed = orbitalSpeed;
    planet.name = name; // Assigning a name to the planet
    planet.rotating = true;
    
    // Set initial position along the orbital path
    const angle = Math.random() * Math.PI * 5; // Randomize initial angle
    planet.position.x = Math.cos(angle) * distanceFromSun;
    planet.position.z = Math.sin(angle) * distanceFromSun;

    scene.add(planet);

    // Create orbital path
    const orbitLineGeometry = new THREE.BufferGeometry();
    const orbitLineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    const orbitPoints = [];

    // Generate points for the orbital path
    const segments = 360;
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = distanceFromSun * Math.cos(theta);
        const z = distanceFromSun * Math.sin(theta);
        orbitPoints.push(x, 0, z);
    }

    orbitLineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
    const orbitLine = new THREE.Line(orbitLineGeometry, orbitLineMaterial);
    scene.add(orbitLine);

    return planet;
}


// Sun
const sunGeometry = new THREE.SphereGeometry(64, 64, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load('8k_sun.jpg')
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create Saturn's rings
const saturnRing = new THREE.TorusGeometry(12, 1.8, 2, 200);
const ringMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load('8k_saturn_ring_alpha.png')
})
const ring = new THREE.Mesh(saturnRing, ringMaterial);
scene.add(ring);
ring.rotation.x = -2;
//earth clouds
const cloudpic = textureLoader.load('2k_earth_clouds.jpg')
const clouds = new THREE.SphereGeometry(16.1, 32, 64); // Adjust the cloud geometry size slightly larger than the Earth's geometry
const cloudMaterial = new THREE.MeshStandardMaterial({ map: cloudpic, transparent: true, opacity: 0.5 }); // Set transparency and opacity to make clouds semi-transparent
const earthCloud = new THREE.Mesh(clouds, cloudMaterial);
scene.add(earthCloud);
 

// Define planets data: [radius, textureMap, distanceFromSun, orbitalSpeed, name]
const planetsData = [
    [6, '8k_mercury.jpg', 85, 0.02, 'Mercury'],
    [10, '8k_venus_surface.jpg', 120, 0.015, 'Venus'],
    [16, '2k_earth_daymap.jpg', 160, 0.01, 'Earth'],
    [7, '8k_mars.jpg', 200, 0.008, 'Mars'],
    [20, '8k_jupiter.jpg', 240, 0.005, 'Jupiter'],
    [8, '8k_saturn.jpg', 280, 0.003, 'Saturn'],
    [13, 'Uranus-0.jpg', 320, 0.002, 'Uranus'],
    [13, 'Neptune_dif.jpg', 350, 0.0015, 'Neptune']
];

// Create planets
const planets = planetsData.map(data => createPlanet(data[0], data[1], data[2], data[3], data[4]));

renderer.setAnimationLoop(animate);
planets.forEach(planet => {
    planet.castShadow = true; // Enable shadow casting
    planet.receiveShadow = true; // Enable shadow receiving
});

window.addEventListener('resize', onWindowResize);

function animate() {
    // Rotate the sun around its own axis
    sun.rotation.y += 0.005; // Adjust rotation speed as needed

    planets.forEach(planet => {
        // Check if the planet is rotating
        if (planet.rotating !== false) {
            // Calculate position based on orbital path
            const angle = planet.orbitalSpeed * Date.now() * 0.01; // Adjust speed for smooth animation
            planet.position.x = Math.cos(angle) * planet.distanceFromSun;
            planet.position.z = Math.sin(angle) * planet.distanceFromSun;

            // Rotate the planet around its own axis
            planet.rotation.y += 0.1; // Adjust rotation speed as needed
            earthCloud.rotation.y+=0.01;
        }
    });

    // Update the position of Saturn's ring
    const saturn = planets.find(planet => planet.name === 'Saturn');
    if (saturn) {
        ring.position.x = saturn.position.x;
        ring.position.z = saturn.position.z;
    }
    const earth = planets.find(planet => planet.name === 'Earth');
    if (earth) {
        earthCloud.position.x = earth.position.x;
        earthCloud.position.z = earth.position.z;
        earthCloud.position.y= earth.position.y;
    }

  //  TWEEN.update();
    renderer.render(scene, camera);
}


// Function to update renderer size and camera aspect ratio on window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Add event listener to handle mouse clicks
window.addEventListener('click', onClick, false);

// Function to handle mouse clicks on planets
function onClick(event) {
    // Calculate mouse position in normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycasting
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets, true);

    // If a planet is clicked, open the respective HTML file in a new window
    if (intersects.length > 0) {
        const planet = intersects[0].object;
        const planetName = planet.name.toLowerCase(); // Convert planet name to lowercase

        // Construct the URL for the respective HTML file
        const url = `${planetName}.html`;

        // Open a new window with the constructed URL
        window.open(url, '_blank');
    }
}

// Add event listener to handle mouse clicks on planets
window.addEventListener('click', onClick, false);


function addStar() {
    const geometry = new THREE.SphereGeometry(0.75, 4, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(1000));

    star.position.set(x, y, z);
    scene.add(star);

    // Define blinking animation
    const blinkSpeed = THREE.MathUtils.randFloat(0.00001, 0.1); // Adjust blinking speed
    const minOpacity = THREE.MathUtils.randFloat(0.1, 0.5); // Minimum opacity when blinking
    const maxOpacity = 1; // Maximum opacity when not blinking
    let isBlinking = false;
    let currentOpacity = maxOpacity;

    function blink() {
        if (isBlinking) {
            currentOpacity -= blinkSpeed;
            if (currentOpacity <= minOpacity) {
                isBlinking = false;
            }
        } else {
            currentOpacity += blinkSpeed;
            if (currentOpacity >= maxOpacity) {
                isBlinking = true;
            }
        }
        material.opacity = currentOpacity;
        requestAnimationFrame(blink);
    }

    blink();
}

Array(7500).fill().forEach(addStar);

