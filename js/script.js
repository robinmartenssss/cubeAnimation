import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";

import umbrellaVertexShader from "./shaders/umbrella/vertex.glsl";
import umbrellaFragmentShader from "./shaders/umbrella/fragment.glsl";

// Import other modules and dependencies

const shaderFiles = {
  vertexShader: "./shaders/umbrella/vertex.glsl",
  fragmentShader: "./shaders/umbrella/fragment.glsl",
};

let vertexShaderSource, fragmentShaderSource;

// Fetch the vertex shader
fetch(shaderFiles.vertexShader)
  .then((response) => response.text())
  .then((data) => {
    vertexShaderSource = data;

    // Fetch the fragment shader
    return fetch(shaderFiles.fragmentShader);
  })
  .then((response) => response.text())
  .then((data) => {
    fragmentShaderSource = data;

    // Now you have the shader source code, create shader objects and use them in your code
    const vertexShader = new THREE.Shader(vertexShaderSource, shaderType);
    const fragmentShader = new THREE.Shader(fragmentShaderSource, shaderType);

    // Use the shaders in your materials or other parts of your code
    // ...

    // Continue with the rest of your code
  })
  .catch((error) => {
    console.error("Error loading shaders:", error);
  });

const canvas = document.querySelector("#c");

const renderer = new THREE.WebGLRenderer({ canvas });

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

function makeInstance(geometry, colors, x, y, name) {
  const smallCube = new THREE.Mesh(geometry2, material);
  smallCube.userData.name = name;

  smallCube.userData.action1 = () => {
    console.log("Action 1 executed");
    smallCube.material.color = new THREE.Color(0xf5986e);
    scene.background = new THREE.Color(0x68c3c0);
  };

  smallCube.userData.action2 = () => {
    console.log("Action 2 executed");
    smallCube.material.color = new THREE.Color(0x68c3c0);
    scene.background = new THREE.Color(0xf25346);
  };

  smallCube.userData.action3 = () => {
    console.log("Action 3 executed");
    smallCube.material.color = new THREE.Color(0xf25346);
    scene.background = new THREE.Color(0xf5986e);
  };

  scene.add(smallCube);

  smallCube.position.x = x;
  smallCube.position.y = y;

  return smallCube;
}

function makeInstanceCenter(geometry, x, y) {
  const cube = new THREE.Mesh(geometry, monitorPlaneMaterial);
  cube.userData.name = "BigCube";
  scene.add(cube);
  cube.position.x = x;
  cube.position.y = y;

  return cube;
}
const cubes = [
  makeInstance(geometry, colors.red, 0, -1.5, "SmallCube1"),
  makeInstance(geometry, colors.blue, -2, -1.5, "SmallCube2"),
  makeInstance(geometry, colors.white, 2, -1.5, "SmallCube3"),
];

// Later in your code, when you have 'intersects' available, you can execute the actions like this:

const centerCube = makeInstanceCenter(geometry, 0, 0.8);

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
    if (cube) {
      const speed = 1 + ndx * 0.1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    }
  });

  const speed = 1 + 1 * 0.1;
  const rot = time * speed;
  centerCube.rotation.x = rot;
  centerCube.rotation.y = rot;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    const object = intersects[i].object;
    const customName = object.userData.name;

    switch (customName) {
      case "SmallCube1":
        object.userData.action1(); // Execute the first action

        break;
      case "SmallCube2":
        object.userData.action2(); // Execute the second action

        break;
      case "SmallCube3":
        object.userData.action3();
        break;

      case "BigCube":
        console.log(intersects);
        intersects[0].object.material.uniforms.iTime.value = 10;
        intersects[0].object.material.uniforms.uUvScale.value =
          new THREE.Vector2(1.4, 1.4);
        intersects[0].object.material.uniforms.adjustVec3.value =
          new THREE.Vector3(1.9, 2.4, 0.6);
        intersects[0].object.parameters = new THREE.BoxGeometry(2, 2, 2);
        break;
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
