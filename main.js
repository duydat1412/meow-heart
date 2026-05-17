import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import * as dat from "dat.gui";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(0, 0, 1000).setLength(150);
renderer.setPixelRatio(window.devicePixelRatio);

// Post Processing
const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

// Bloom Pass
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.6,
  0.1,
  0.1
);

composer.addPass(bloomPass);

renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.outputEncoding = THREE.sRGBEncoding;

function createEmojiTexture(emoji) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "92px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, canvas.width / 2, canvas.height / 2 + 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

let burstEmoji = "🌻";
let burstTexture = createEmojiTexture(burstEmoji);

// Create Text
const fontLoader = new FontLoader();
const textMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: {
      value: 0,
    },
    tapPulse: {
      value: 0,
    },
    color1: {
      value: new THREE.Color(0xFFF8C5),
    },
    color2: {
      value: new THREE.Color(0xF6DD6B),
    },
    color3: {
      value: new THREE.Color(0xEACB48),
    },
    textPos: {
      value: -10,
    },
  },
  vertexShader: `
  #define PI 3.1415926535897932384626433832795
  uniform float time;
  varying vec3 vC;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  uniform float textPos;
  uniform float tapPulse;

  void main() {
    vec3 pos = position;

    float pLimit = 0.675;
    float nLimit = -pLimit;
    float nullPoint = 0.5;
    float scaledT = time * 1.25;
    float dt = scaledT - pLimit * ( 2. * floor( scaledT / (pLimit* 2.)) + 1.);

    float r = 15. + 1.2 * pow(sin(2. * PI * dt), 4.);
    if (dt < -nullPoint || dt > nullPoint) {
        r = 15.;
    }
    r += tapPulse * 3.2;

    // color
    float gradientFactor = sin( pos.x * 0.01 + pos.y * 0.01); 
    gradientFactor = smoothstep(0.0, 1.2, (gradientFactor + 1.0) / 2.0);

    if (gradientFactor < 0.5) {
      vC = mix(color1, color2, gradientFactor * 2.0);
    } else {
      vC = mix(color2, color3, (gradientFactor - 0.5) * 2.0);
    }

    // Heartbeat
    float scale = r / 15.0;
    pos *= scale;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`,
  fragmentShader: `
  varying vec3 vC;
  void main() {
    gl_FragColor = vec4(vC, 1.0); // Red color
  }
`,
});

fontLoader.load("droid_serif_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("dmy", {
    font: font,
    size: 3,
    height: 1,
    curveSegments: 12,
  });
  textGeometry.computeBoundingBox();
  const boundingBox = textGeometry.boundingBox;

  const centerOffsetX = (boundingBox.max.x - boundingBox.min.x) / 2;
  const centerOffsetY = (boundingBox.max.y - boundingBox.min.y) / 2;
  const centerOffsetZ = (boundingBox.max.z - boundingBox.min.z) / 2;

  textGeometry.translate(-centerOffsetX, -centerOffsetY, -centerOffsetZ);
  const text = new THREE.Mesh(textGeometry, textMaterial);

  scene.add(text);
});

// Orbit Controls
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableZoom = false;
orbit.enablePan = false;

// Axes
/* const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
 */

orbit.update();

const xSize = 50;
const ySize = 50;
const zSize = 50;
const density = 2;
const nParticles = xSize * ySize * zSize * density;
const positions = [];
const speed = [];

for (let i = 0; i < nParticles; i++) {
  positions.push(
    new THREE.Vector3(
      Math.random(),
      Math.random(),
      Math.random()
    ).multiplyScalar(100)
  );
  speed.push(Math.random() * 10 + 2);
}

const pointsGeometry = new THREE.BufferGeometry().setFromPoints(positions);
pointsGeometry.setAttribute(
  "speed",
  new THREE.BufferAttribute(new Float32Array(speed), 1)
);

pointsGeometry.center();
const points = new THREE.Points(
  pointsGeometry,
  new THREE.ShaderMaterial({
    uniforms: {
      time: {
        value: 0,
      },
      tapPulse: {
        value: 0,
      },
      size: {
        value: 0.9,
      },
      ratio: {
        value: window.devicePixelRatio,
      },
      scaleEntry: { value: 0.7 },
      step1control: { value: 1 },
      step2control: { value: 1 },
      step3control: { value: 1 },
      step4control: { value: 1 },
      step5control: { value: 1 },
      step6control: { value: 1 },
      color1: { value: new THREE.Color(0xFFF8C5) },
      color2: { value: new THREE.Color(0xF6DD6B) },
      color3: { value: new THREE.Color(0xEACB48) },
    },
  vertexShader: `
      #define PI 3.1415926535897932384626433832795
      varying vec2 vUv;
      uniform float time;
      uniform float scaleEntry;
      uniform float size;
      uniform float ratio;
      attribute float speed;
      varying vec3 vC;
      varying float vDiscard;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      uniform float tapPulse;

      void main() {
        vec3 pos = position;
        vec3 h = pos / 2.5;

        h.y = 4. + 1.2 * h.y - abs(h.x) * sqrt(max((20. - abs(h.x)) / 15., 0.));
        h.z = h.z * ((2. - h.y / 15.));
        float pLimit = 0.675;
        float nLimit = -pLimit;
        float nullPoint = 0.5;
        float scaledT = time * 1.25;
        float dt = scaledT - pLimit * ( 2. * floor( scaledT / (pLimit* 2.)) + 1.);
        float r = 15. + 1.2 * pow(sin(2. * PI * dt), 4.);
        if (dt < -nullPoint || dt > nullPoint) {
            r = 15.;
        }
        r += tapPulse * 3.2;
        float dDyn = length(h) - r;  
        float dConst = length(h) - 15.;      

        float gradientFactor = sin( pos.x * 0.01 + pos.y * 0.01); 
        gradientFactor = smoothstep(0.0, 1.2, (gradientFactor + 1.0) / 2.0);

        if (gradientFactor < 0.5) {
          vC = mix(color1, color2, gradientFactor * 2.0);
        } else {
          vC = mix(color2, color3, (gradientFactor - 0.5) * 2.0);
        }

        pos = pos - pos / length(pos) * (dDyn) * 2.5;

        vec3 vPos = pos;
        vDiscard = dConst > 0. || dConst < -1.0 ? 1. : 0.;

        vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
        gl_PointSize = sqrt(length(pos)/30.) * size * ( 300.0 / -mvPosition.z ) * ratio;
        gl_Position = projectionMatrix * mvPosition;
      }
  `,
  fragmentShader: `

    varying vec3 vC;
    varying float vDiscard;
    varying vec2 vUv;
    void main(){

      if ( vDiscard >= 0.5 ) {discard;}
      if (length(gl_PointCoord - 0.5) > 0.5) {discard;}
      gl_FragColor = vec4( vC, 1.0);
    }
  `,
  })
);

scene.add(points);

const heartHitArea = new THREE.Mesh(
  new THREE.SphereGeometry(42, 32, 32),
  new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })
);
scene.add(heartHitArea);

const clock = new THREE.Clock();
let time = 0;
let clickCount = 0;
let clickPulseStartedAt = -Infinity;
let lastHeartClickAt = -Infinity;
const clickPulseDuration = 0.7;
const clickCooldown = 850;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
raycaster.params.Points.threshold = 3;
const sunflowerBursts = [];

const heartEffects = document.getElementById("heartEffects");

function getHeartScreenPosition() {
  const projected = new THREE.Vector3(0, 0, 0).project(camera);
  const rect = renderer.domElement.getBoundingClientRect();

  return {
    x: rect.left + (projected.x * 0.5 + 0.5) * rect.width,
    y: rect.top + (-projected.y * 0.5 + 0.5) * rect.height,
  };
}

function showClickToast(x, y) {
  const toast = document.createElement("div");
  toast.className = "click-count-toast";
  toast.style.left = `${x}px`;
  toast.style.top = `${y}px`;
  toast.textContent = `click count: ${clickCount}`;
  heartEffects.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 1400);
}

function setHeartPalette(colors) {
  const next = {
    color1: new THREE.Color(colors.color1),
    color2: new THREE.Color(colors.color2),
    color3: new THREE.Color(colors.color3),
  };

  textMaterial.uniforms.color1.value.copy(next.color1);
  textMaterial.uniforms.color2.value.copy(next.color2);
  textMaterial.uniforms.color3.value.copy(next.color3);
  points.material.uniforms.color1.value.copy(next.color1);
  points.material.uniforms.color2.value.copy(next.color2);
  points.material.uniforms.color3.value.copy(next.color3);
}

function setBurstEmoji(emoji) {
  if (!emoji) {
    return;
  }

  burstEmoji = emoji;
  const nextTexture = createEmojiTexture(emoji);
  burstTexture.dispose();
  burstTexture = nextTexture;
}

function spawnSunflowers() {
  const total = 18;

  for (let i = 0; i < total; i += 1) {
    const material = new THREE.SpriteMaterial({
      map: burstTexture,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const sprite = new THREE.Sprite(material);
    const direction = new THREE.Vector3(
      (Math.random() - 0.5) * 1.1,
      (Math.random() - 0.5) * 0.95,
      (Math.random() - 0.5) * 1.1
    ).normalize();
    const speed = 14 + Math.random() * 10;
    const startScale = 1.2 + Math.random() * 0.85;

    sprite.position.set(0, 0, 0);
    sprite.scale.setScalar(startScale);
    sprite.renderOrder = 10;
    scene.add(sprite);

    sunflowerBursts.push({
      sprite,
      velocity: direction.multiplyScalar(speed),
      age: 0,
      lifetime: 1.1 + Math.random() * 0.3,
      spin: (Math.random() - 0.5) * 4,
      startScale,
    });
  }
}

function triggerHeartInteraction(clientX, clientY) {
  clickCount += 1;
  clickPulseStartedAt = time;
  lastHeartClickAt = performance.now();
  showClickToast(clientX, clientY);
  spawnSunflowers();
}

window.heartCustomizer = {
  setHeartPalette,
  setBurstEmoji,
  getState() {
    return {
      burstEmoji,
      color1: `#${textMaterial.uniforms.color1.value.getHexString()}`,
      color2: `#${textMaterial.uniforms.color2.value.getHexString()}`,
      color3: `#${textMaterial.uniforms.color3.value.getHexString()}`,
    };
  },
};

renderer.domElement.addEventListener("pointerdown", (event) => {
  const now = performance.now();
  if (now - lastHeartClickAt < clickCooldown) {
    return;
  }

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObject(heartHitArea, false);

  if (intersects.length > 0) {
    triggerHeartInteraction(event.clientX, event.clientY);
  }
});

function animate() {
  if (resize(renderer, composer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  const delta = clock.getDelta();
  time += delta;
  scene.rotation.y = time * 0.25;

  const pulseProgress = (time - clickPulseStartedAt) / clickPulseDuration;
  const tapPulse =
    pulseProgress >= 0 && pulseProgress <= 1
      ? Math.pow(Math.sin(pulseProgress * Math.PI), 2.6)
      : 0;

  for (let i = sunflowerBursts.length - 1; i >= 0; i -= 1) {
    const burst = sunflowerBursts[i];
    burst.age += delta;

    const lifeProgress = burst.age / burst.lifetime;
    if (lifeProgress >= 1) {
      scene.remove(burst.sprite);
      burst.sprite.material.dispose();
      sunflowerBursts.splice(i, 1);
      continue;
    }

    burst.velocity.multiplyScalar(0.985);
    burst.velocity.y += 2.8 * delta;
    burst.sprite.position.addScaledVector(burst.velocity, delta);
    burst.sprite.material.opacity = 1 - lifeProgress;

    const scale =
      burst.startScale * (0.82 + Math.sin(lifeProgress * Math.PI) * 0.55);
    burst.sprite.scale.setScalar(scale);
    burst.sprite.material.rotation += burst.spin * delta;
  }

  points.material.uniforms.time.value = time;
  points.material.uniforms.tapPulse.value = tapPulse;
  textMaterial.uniforms.time.value = time;
  textMaterial.uniforms.tapPulse.value = tapPulse;

  composer.render();
  requestAnimationFrame(animate);
}

animate();

// Resize function
function resize(renderer, composer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    composer.setSize(width, height); // Update composer size
  }
  return needResize;
}

// Handle window resize
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  composer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
