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
loadAssets(timeObject);

// RENDER LOOP

function render(time)
{   
    timeObject.value = time*0.001;

    renderer.render(scene,camera);
    requestAnimationFrame ( render );
}

requestAnimationFrame ( render );

}

main();




