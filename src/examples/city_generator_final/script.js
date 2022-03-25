//Script by MaCAD's Digital Tool for Data-Cloud Management Faculty
//David Andrés León and Hesham Sawqy
//Updates by Irene Martín Lque

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/3DMLoader.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'
import { TransformControls } from "https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/TransformControls.js";


// set up loader for converting the results to threejs
const loader = new Rhino3dmLoader()
loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/' )


const definition = 'city_generator_sliders2.gh'

// setup input change events
const streets1_slider = document.getElementById( 'streets1' )
streets1_slider.addEventListener( 'mouseup', onSliderChange, false )
streets1_slider.addEventListener( 'touchend', onSliderChange, false )


const streets2_slider = document.getElementById( 'streets2' )
streets2_slider.addEventListener( 'mouseup', onSliderChange, false )
streets2_slider.addEventListener( 'touchend', onSliderChange, false )


const distance_slider = document.getElementById( 'distance' )
distance_slider.addEventListener( 'mouseup', onSliderChange, false )
distance_slider.addEventListener( 'touchend', onSliderChange, false )


const width_slider = document.getElementById( 'width' )
width_slider.addEventListener( 'mouseup', onSliderChange, false )
width_slider.addEventListener( 'touchend', onSliderChange, false )


const plots_slider = document.getElementById( 'plots' )
plots_slider.addEventListener( 'mouseup', onSliderChange, false )
plots_slider.addEventListener( 'touchend', onSliderChange, false )


const buildings1_slider = document.getElementById( 'buildings1' )
buildings1_slider.addEventListener( 'mouseup', onSliderChange, false )
buildings1_slider.addEventListener( 'touchend', onSliderChange, false )


const buildings2_slider = document.getElementById( 'buildings2' )
buildings2_slider.addEventListener( 'mouseup', onSliderChange, false )
buildings2_slider.addEventListener( 'touchend', onSliderChange, false )

const terrain_slider = document.getElementById( 'terrain' )
terrain_slider.addEventListener( 'mouseup', onSliderChange, false )
terrain_slider.addEventListener( 'touchend', onSliderChange, false )


let points = [];

// globals
let rhino, doc

const downloadButton = document.getElementById("downloadButton")
downloadButton.onclick = download 

rhino3dm().then(async m => {
    rhino = m

    init()
    rndPts()
    compute()
})


////////POINTS!!!/////////////

function rndPts() {
  // generate initial points

  const startPts = [
    {x: 93.19, y: 793.5436, z: 0},
    {x: 567.66, y: 275.917, z: 0},
    {x: 752, y: 342, z: 0}, 
    {x: 461, y: -27, z: 0}, 
    {x: 6, y: 48, z: 0}, 
    {x: -118.67, y: 458, z: 0}, 
    {x: 185.77, y: 529.72, z: 0}, 
    {x: 247, y: 544.32, z: 0}, 
    {x: 360.344, y: 472, z: 0}, 
    {x: 374, y: 345, z: 0}, 
    {x: 261.31, y: 316, z: 0}, 
    {x: 144.65, y: 430, z: 0}, 

  ]
  
  const cntPts = startPts.length

  for (let i = 0; i < cntPts; i++) {
    const x = startPts[i].x
    const y = startPts[i].y
    const z = startPts[i].z

    const pt = "{\"X\":" + x + ",\"Y\":" + y + ",\"Z\":" + z + "}"

    console.log( `x ${x} y ${y} z ${z}`)

    points.push(pt)
  
    //viz in three
      const icoGeo = new THREE.IcosahedronGeometry(0.1);
      const icoMat = new THREE.MeshNormalMaterial();
      const ico = new THREE.Mesh(icoGeo, icoMat);
      ico.name = "ico";
      ico.position.set(x, y, z);
      scene.add(ico);
  
      let tcontrols = new TransformControls(camera, renderer.domElement);
      tcontrols.enabled = true;
      tcontrols.attach(ico);
      tcontrols.showZ = false;
      tcontrols.addEventListener("dragging-changed", onChange);
      scene.add(tcontrols);

  }
}  
  let dragging = false
  function onChange() {
    dragging = ! dragging
    if ( !dragging ) {
      // update points position
      points = []
      scene.traverse(child => {
        if ( child.name === 'ico' ) {
          const pt = "{\"X\":" + child.position.x + ",\"Y\":" + child.position.y + ",\"Z\":" + child.position.z + "}"
          points.push( pt )
          console.log(pt)
        }
      }, false)
  
      compute();
  
      controls.enabled = true;
      return;
    }
  
    controls.enabled = false;
  }
  /////////////////////////////////////////////////////////////////////////////
 //                            HELPER  FUNCTIONS                            //
/////////////////////////////////////////////////////////////////////////////

/**
 * Gets <input> elements from html and sets handlers
 * (html is generated from the grasshopper definition)
 */
/* function getInputs() {
  const inputs = {}
  for (const input of document.getElementsByTagName('input')) {
    switch (input.type) {
      case 'number':
        inputs[input.id] = input.valueAsNumber
        input.onchange = onSliderChange
        break
      case 'range':
        inputs[input.id] = input.valueAsNumber
        input.onmouseup = onSliderChange
        input.ontouchend = onSliderChange
        break
      case 'checkbox':
        inputs[input.id] = input.checked
        input.onclick = onSliderChange
        break
      default:
        break
    }
  }
  return inputs
} */
/**
 * Call appserver
 */

 async function compute() {
  showSpinner(true);

  // initialise 'data' object that will be used by compute()
  const data = {
    definition: definition,
    inputs: {
      'streets1': streets1_slider.valueAsNumber,
      'streets2': streets2_slider.valueAsNumber,
      'distance': distance_slider.valueAsNumber,
      'width': width_slider.valueAsNumber,
      'plots': plots_slider.valueAsNumber,
      'buildings1': buildings1_slider.valueAsNumber,
      'buildings2': buildings2_slider.valueAsNumber,
      'terrain': terrain_slider.valueAsNumber,
      'points': points
    },
  };

  console.log(data.inputs);

  const request = {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  };

  try {
    const response = await fetch("/solve", request);

    if (!response.ok) throw new Error(response.statusText);

    const responseJson = await response.json();
    collectResults(responseJson);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Parse response
 */
function collectResults(responseJson) {
  const values = responseJson.values;

  console.log(values);

  // clear doc
  try {
    if (doc !== undefined) doc.delete();
  } catch {}

  //console.log(values)
  doc = new rhino.File3dm();

  // for each output (RH_OUT:*)...
  for (let i = 0; i < values.length; i++) {
    // ...iterate through data tree structure...
    for (const path in values[i].InnerTree) {
      const branch = values[i].InnerTree[path];
      // ...and for each branch...
      for (let j = 0; j < branch.length; j++) {
        // ...load rhino geometry into doc
        const rhinoObject = decodeItem(branch[j]);
        if (rhinoObject !== null) {
          // console.log(rhinoObject)
          doc.objects().add(rhinoObject, null);
        }
      }
    }
  }

  if (doc.objects().count < 1) {
    console.error("No rhino objects to load!");
    showSpinner(false);
    return;
  }

  // load rhino doc into three.js scene
  const buffer = new Uint8Array(doc.toByteArray()).buffer;
  loader.parse(buffer, function (object) {
    // clear objects from scene
    scene.traverse(child => {
      if ( child.userData.hasOwnProperty( 'objectType' ) && child.userData.objectType === 'File3dm') {
        scene.remove( child )
      }
    })

    ///////////////////////////////////////////////////////////////////////

    // color mesh
    object.traverse((child) => {
      if (child.isMesh) {
        if (child.userData.attributes.geometry.userStringCount > 0) {
          //console.log(child.userData.attributes.geometry.userStrings[0][1])
          const col = child.userData.attributes.geometry.userStrings[0][1];
          const threeColor = new THREE.Color("rgb(" + col + ")");
          const mat = new THREE.MeshPhysicalMaterial({ color: threeColor });
          child.material = mat;
        }
      }
    })
   
    ///////////////////////////////////////////////////////////////////////
    // add object graph from rhino model to three.js scene
    scene.add(object);

    // hide spinner and enable download button
    showSpinner(false);
    //downloadButton.disabled = false
  })
}

/**
 * Attempt to decode data tree item to rhino geometry
 */
function decodeItem(item) {
  const data = JSON.parse(item.data);
  if (item.type === "System.String") {
    // hack for draco meshes
    try {
      return rhino.DracoCompression.decompressBase64String(data);
    } catch {} // ignore errors (maybe the string was just a string...)
  } else if (typeof data === "object") {
    return rhino.CommonObject.decode(data);
  }
  return null;
}

/**
 * Called when a slider value changes in the UI. Collect all of the
 * slider values and call compute to solve for a new scene
 */
function onSliderChange() {
  // show spinner
  showSpinner(true);
  compute();
}

/**
 * Shows or hides the loading spinner
 */
function showSpinner(enable) {
  if (enable) document.getElementById("loader").style.display = "block";
  else document.getElementById("loader").style.display = "none";
}

// BOILERPLATE //

var scene, camera, renderer, controls;

function init() {
  // Rhino models are z-up, so set this as the default
  THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(1, 1, 1);
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.x = 1000;
  camera.position.y = 1000;
  camera.position.z = 1000;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  // add a directional light
  const directionalLight = new THREE.DirectionalLight( 0xffffff )
  directionalLight.intensity = 1
  scene.add( directionalLight )
  const ambientLight = new THREE.AmbientLight()
  scene.add( ambientLight )
  
  // handle changes in the window size
  window.addEventListener( 'resize', onWindowResize, false )

  animate();
}

var animate = function () {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  animate();
}

//Download button
function download (){
  let buffer = doc.toByteArray()
  let blob = new Blob([ buffer ], { type: "application/octect-stream" })
  let link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = 'Lewis_Final_Iteration 4.3dm'
  link.click()
  }

/**
 * Helper function that behaves like rhino's "zoom to selection", but for three.js!
 */
function zoomCameraToSelection( camera, controls, selection, fitOffset = 1.2 ) {
  
  const box = new THREE.Box3();
  
  for( const object of selection ) {
    if (object.isLight) continue
    box.expandByObject( object );
  }
  
  const size = box.getSize( new THREE.Vector3() );
  const center = box.getCenter( new THREE.Vector3() );
  
  const maxSize = Math.max( size.x, size.y, size.z );
  const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * camera.fov / 360 ) );
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );
  
  const direction = controls.target.clone()
    .sub( camera.position )
    .normalize()
    .multiplyScalar( distance );
  controls.maxDistance = distance * 10;
  controls.target.copy( center );
  
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  camera.position.copy( controls.target ).sub(direction);
  
  controls.update();
  
}

