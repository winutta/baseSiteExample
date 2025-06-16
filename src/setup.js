import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'


export class Setup {
    constructor(){

        
        // DISABLE RIGHT CLICK

        document.addEventListener('contextmenu', event => event.preventDefault(), false);

        // SCENE SETUP

        var scene = new THREE.Scene({ antialias: true });
        scene.background = new THREE.Color(0xDAD3FF);

        // CAMERA SETUP

        let baseFOV = 39;

        var camera = new THREE.PerspectiveCamera(baseFOV, window.innerWidth / window.innerHeight, 0.25, 2000);
        camera.position.set(0,8,16);

        camera.baseFOV = baseFOV;

        // RENDERER SETUP
        var targetCanvas = document.querySelector(".webgl");
        var renderer = new THREE.WebGLRenderer({canvas: targetCanvas,antialias: true});

        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // MOUSE SETUP

        var mouse = new THREE.Vector2();

        //ORBIT CONTROL SETUP

        const controls2 = new FirstPersonControls( camera, renderer.domElement );
        controls2.movementSpeed = 0;
        controls2.lookSpeed = 0.1;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();

        camera.controls = controls;
        // Add to instance

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.mouse = mouse;

        // RESIZE

        function updateCameraFOV() {

            if (camera.aspect < 1) {
                var vFOVC = camera.baseFOV * Math.PI / 180;
                var vFOVC2 = 2. * Math.atan(Math.tan(vFOVC / 2.) / camera.aspect);
                camera.fov = vFOVC2 * 180. / Math.PI;
            } else {
                camera.fov = camera.baseFOV;
            }
        }

        window.addEventListener('resize', onWindowResize, false);

        function onWindowResize() {
            var width = window.innerWidth;
            var height = window.innerHeight;
            camera.aspect = width / height;
            updateCameraFOV();
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }

        onWindowResize()
    }
    
}

var setup = new Setup();

function getWorldDimensions(depth = 8){
    var vFOVC = setup.camera.fov * Math.PI / 180;
    var h = 2 * Math.tan(vFOVC / 2) * (depth);
    var w = h * setup.camera.aspect;
    return {w:w,h:h};
}

export {setup, getWorldDimensions}











