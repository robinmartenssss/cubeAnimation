import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";

import umbrellaVertexShader from "./shaders/umbrella/vertex.glsl?raw";
import umbrellaFragmentShader from "./shaders/umbrella/fragment.glsl?raw";

const canvas = document.querySelector("#c");

const renderer = new THREE.WebGLRenderer({ canvas });

const loadManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadManager);

const fov = 75;
const aspect = 2; // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 4;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x68c3c0);
const raycaster = new THREE.Raycaster();

const colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xf5986e,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
};

const intensity = 1;

const light = new THREE.DirectionalLight(colors.pink, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
const nameFirst = { name: "BigCube" };
const nameSecond = { name: "SmallCubes" };

const geometry2 = new THREE.BoxGeometry(
  boxWidth / 1.8,
  boxHeight / 1.8,
  boxDepth / 1.8
);

const monitorPlaneMaterial = new THREE.ShaderMaterial({
  uniforms: {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2(1, 1) },
    iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
    uUvScale: { value: new THREE.Vector2(1, 1) },
    adjustVec3: { value: new THREE.Vector3(1.2, 1.4, 1.6) },
    sunUV: { value: new THREE.Vector2(0, 0) },
  },
  vertexShader: umbrellaVertexShader,
  fragmentShader: umbrellaFragmentShader,
});
const material = new THREE.MeshPhongMaterial(colors);

function makeInstance(geometry, colors, x, y) {
  const cube = new THREE.Mesh(geometry2, material, nameSecond);
  scene.add(cube);

  cube.position.x = x;
  cube.position.y = y;

  return cube;
}

function makeInstanceCenter(geometry, x, y) {
  const cube = new THREE.Mesh(geometry, monitorPlaneMaterial, nameFirst);
  scene.add(cube);
  cube.position.x = x;
  cube.position.y = y;

  return cube;
}

const cubes = [
  makeInstance(geometry, colors.red, 0, -1.5),
  makeInstance(geometry, colors.blue, -2, -1.5),
  makeInstance(geometry, colors.white, 2, -1.5),
  makeInstanceCenter(geometry, 0, 0.8),
];

const clock = new THREE.Clock();

const mouse = new THREE.Vector2(1, 1);

const init = () => {
  requestAnimationFrame(render);
  document.addEventListener("mousemove", onDocumentMouseMove, false);
};

function onDocumentMouseMove(event) {
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  event.preventDefault();

  // update the mouse variable
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
  requestAnimationFrame(render);

  render();
}

const render = (time) => {
  time *= 0.001; // convert time to seconds

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * 0.1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.id === 16) {
      intersects[i].object.material.uniforms.iTime.value = 10;
      intersects[i].object.material.uniforms.uUvScale.value = new THREE.Vector2(
        1.4,
        1.4
      );

      intersects[i].object.material.uniforms.adjustVec3.value =
        new THREE.Vector3(1.9, 2.4, 0.6);
      console.log(intersects[i].object);
      intersects[i].object.parameters = new THREE.BoxGeometry(2, 2, 2);
      console.log(intersects[i].object.material);
    } else if (intersects[i].object.id === 15) {
      intersects[i].object.material.color.set(0xf5986e);
      scene.background = new THREE.Color(0x68c3c0);
    } else if (intersects[i].object.id === 14) {
      intersects[i].object.material.color.set(0x68c3c0);
      scene.background = new THREE.Color(0xf25346);
    } else if (intersects[i].object.id === 13) {
      intersects[i].object.material.color.set(0xf25346);
      scene.background = new THREE.Color(0xf5986e);
    }
  }

  renderer.render(scene, camera);

  const elapsedTime = clock.getElapsedTime();
  monitorPlaneMaterial.uniforms.iTime.value = elapsedTime;
  monitorPlaneMaterial.uniforms.uUvScale.value = new THREE.Vector2(1, 1);
  monitorPlaneMaterial.uniforms.adjustVec3.value = new THREE.Vector3(
    1.2,
    1.4,
    1.6
  );

  requestAnimationFrame(render);
};

const resizeRendererToDisplaySize = (renderer) => {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = (canvas.clientWidth * pixelRatio) | 0;
  const height = (canvas.clientHeight * pixelRatio) | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
};

init();
// animate(); gives lagg once implemented could be my PC or general
