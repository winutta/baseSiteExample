//  Loaders

import * as THREE from 'three'
import { setup } from "./setup"
import vertShader from "./shaders/vertShader.glsl"
import fragShader from "./shaders/fragShader.glsl"
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js' 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import {
    computeBoundsTree, disposeBoundsTree,
    computeBatchedBoundsTree, disposeBatchedBoundsTree, acceleratedRaycast,
} from 'three-mesh-bvh';

// Add the extension functions
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

THREE.BatchedMesh.prototype.computeBoundsTree = computeBatchedBoundsTree;
THREE.BatchedMesh.prototype.disposeBoundsTree = disposeBatchedBoundsTree;
THREE.BatchedMesh.prototype.raycast = acceleratedRaycast;

var { scene, renderer, camera } = setup;

export function loadAssets(timeObject) {

    const manager = new THREE.LoadingManager();

    manager.onStart = function (url, itemsLoaded, itemsTotal) {

        console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

    };

    manager.onLoad = function () {

        console.log('Loading complete!');

        // remove preloader cover.

        // const curtain = document.getElementById("curtain");

        // curtain.style.visibility = "hidden";
        // curtain.classList.add("hidden");

    };


    manager.onProgress = function (url, itemsLoaded, itemsTotal) {

        console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        var pct = itemsLoaded / itemsTotal;

        //scale loading bar

        // const loader = document.getElementById("loader");

        // var pxs = pct*180;
        // loader.style.width = pxs.toString() + "px";


    };

    manager.onError = function (url) {

        console.log('There was an error loading ' + url);

    };


    const gltfLoader = new GLTFLoader(manager);
    const textureLoader = new THREE.TextureLoader(manager);
    const rgbeLoader = new RGBELoader(manager);


    //load assets, create geometry,material -> mesh as needed, add meshes to the scene

    let raycaster = new THREE.Raycaster();
    raycaster.firstHitOnly = true;

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set(5,5,5);
    directionalLight.castShadow = true;
    scene.add( directionalLight );

    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = - 10;
    directionalLight.shadow.camera.left = - 10;
    directionalLight.shadow.camera.right = 10;

    // load in the terrain and character.

    let updateFunctions = [];
    function updateFunction(time){
        updateFunctions.forEach((uf)=>{
            uf(time);
        })
    }

    gltfLoader.load("terrain.glb",(gltf)=>{

        scene.add(gltf.scene)

        let sceneObjects = gltf.scene.children;

        let terrainMesh = null;
        let playerMesh = null;

        sceneObjects.forEach((mesh)=>{
            if(mesh.name == "terrain"){
                mesh.material.side = THREE.DoubleSide;
                mesh.geometry.computeBoundsTree();
                terrainMesh = mesh;
                mesh.receiveShadow = true;
            }

            if(mesh.name == "player"){
                mesh.castShadow = true;
                playerMesh = mesh;
                
            }

            
            
        });

        let keyPresses = {}
        let validPresses = ["w","a","s","d","arrowleft","arrowright","arrowup","arrowdown"," "]
        let direction = new THREE.Vector3();
        let speed = 0.1;
        let currentFallVelocity= 0;
        // set movement direction based on input.. 
        function setDirection(){
            let left = 0
            let forward = 0;
            let up = 0;
            if(keyPresses["w"] == true || keyPresses["arrowup"] == true ){
                forward -= 1;
            }
            if(keyPresses["a"] == true || keyPresses["arrowleft"] == true ){
                left -= 1;
            }
            if(keyPresses["s"] == true || keyPresses["arrowdown"] == true ){
                forward += 1;
            }
            if(keyPresses["d"] == true || keyPresses["arrowright"] == true ){
                left += 1;
            }
            if(keyPresses[" "] == true){
                currentFallVelocity = 0.5;
            }

            direction.x = left*speed;
            direction.z = forward*speed;
        }

        document.addEventListener("keydown",(event)=>{
            // console.log(event.key); 
            let key = event.key.toLowerCase();
            if(validPresses.includes(key)){
                // console.log(key);
                keyPresses[key] = true;
                setDirection();  
            }
        },false)

        document.addEventListener("keyup",(event)=>{
            let key = event.key.toLowerCase();
            if(validPresses.includes(key)){
                keyPresses[key] = false;
                setDirection();
            }
        },false)


        let currentNormal = new THREE.Vector3(0,1,0);
        let currentHeight = -1;

        function updatePlayer(time){

            // set player rotation 
            let axis = new THREE.Vector3(0,1,0);
            let xDiff = camera.position.x - playerMesh.position.x;
            let yDiff = camera.position.z - playerMesh.position.z;
            let angle = Math.atan2(xDiff,yDiff);

            playerMesh.quaternion.setFromAxisAngle(axis, angle);

            
            // damp current velocity, add velocity from gravity
            direction.y = currentFallVelocity*0.9 + (-9.81*0.02)*0.1;
           
            currentFallVelocity = direction.y;
            let directionClone = direction.clone();
            directionClone.applyAxisAngle(axis,angle);

            // slow or speed up terrain movement based on surface normal direction
            // multiplier should be 1 or higher if in the air/jumping

            let minMultiplier = 0.1;
            let multValue = 1.0 - minMultiplier;
            if(currentHeight<0){
                let DirdNorm = directionClone.dot(currentNormal)
                let slopeFriction = 1 + Math.min(Math.max(DirdNorm*10.,-multValue),multValue);

                directionClone.x *= slopeFriction;
                directionClone.z *= slopeFriction;
            }

            // move the player
            playerMesh.position.add(directionClone);

            //raycast up and down from the player to see distance to the ground. 
            // reset the player height if below ground, 
            // and record the current normal and height (to see if on the ground)

            if(terrainMesh){
                let down = new THREE.Vector3(0,-1,0);
                let up = new THREE.Vector3(0,1,0);

                raycaster.set(playerMesh.position,down)

                const intersectDown = raycaster.intersectObject(terrainMesh);
                
                for ( let i = 0; i < intersectDown.length; i ++ ) {
                    let intersection = intersectDown[ i ];

                    currentHeight = intersection.distance;
                    currentNormal = intersection.normal
                }

                raycaster.set(playerMesh.position,up)

                const intersectUp = raycaster.intersectObject(terrainMesh);

                for ( let i = 0; i < intersectUp.length; i ++ ) {
                    let intersection = intersectUp[ i ];

                    // update directionClone to reflect this y change..
                    directionClone.y += intersection.point.y - playerMesh.position.y;
                    playerMesh.position.y +=  intersection.point.y - playerMesh.position.y;

                    currentFallVelocity = 0;
                    currentHeight = -1;
                    currentNormal = intersection.normal.multiplyScalar(-1);
                }
            }

            // adjust the camera based on the player movement

            camera.position.add(directionClone);
            camera.controls.target.copy(playerMesh.position);

        }

        updateFunctions.push(updatePlayer);
        

    });

    return updateFunction;

}
