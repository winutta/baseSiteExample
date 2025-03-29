//  Loaders

import * as THREE from 'three'
import { setup } from "./setup"
import vertShader from "./shaders/vertShader.glsl"
import fragShader from "./shaders/fragShader.glsl"
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js' 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


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




}
