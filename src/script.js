import './style.css'
import * as THREE from 'three'
// import * as dat from 'dat.gui'

//////////////////

import { loadAssets } from "./loaders.js"
import {setup} from "./setup"


function main() {

// BASIC SETUP

var {scene,camera,renderer} = setup;

var timeObject = { value: 0 };
let updateFunction = loadAssets(timeObject);

// RENDER LOOP
// might need delta time.. 

function render(time)
{   
    timeObject.value = time*0.001;
    camera.controls.update();
    updateFunction(time);
    renderer.render(scene,camera);
    requestAnimationFrame ( render );
}

requestAnimationFrame ( render );

}

main();




