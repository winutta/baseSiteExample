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
    };


    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        var pct = itemsLoaded / itemsTotal;
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
        
        // set movement direction and current fall velocity based on input.. 
        function setDirection(){

        }

        
        // keydown event listener to record keys as pressed
        // set direction whenever a valid key is pressed

        // keyup event listener to record keys as unpressed
        // set direction whenever a valid key is unpressed

        let currentNormal = new THREE.Vector3(0,1,0);
        let currentHeight = -1;

        function updatePlayer(time){

            // set player rotation from camera position

            
            // damp current velocity, add velocity from gravity

            // get directionClone and set it's rotation


            // slow or speed up terrain movement based on surface normal direction
            // multiplier should be 1 or higher if in the air/jumping


            // move the player

            //raycast up and down from the player to see distance to the ground. 
            // reset the player height and fall velocity if below ground, 
            // and record the current normal and height (to see if on the ground)



            // adjust the camera based on the player movement

        }

        updateFunctions.push(updatePlayer);
        

    });

    return updateFunction;

}
