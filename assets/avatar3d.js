(() => {
  const shell = document.querySelector('.avatar3d-shell');
  const canvas = document.getElementById('avatar-3d');
  if (!shell || !canvas) return;

  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) {
    document.body.classList.add('avatar3d-failed');
    return;
  }

  const vertexSource = `#version 300 es
    precision highp float;
    in vec3 aPosition;
    in vec3 aNormal;
    uniform mat4 uModel;
    uniform mat4 uViewProjection;
    out vec3 vNormal;
    out vec3 vWorld;
    void main() {
      vec4 world = uModel * vec4(aPosition, 1.0);
      vWorld = world.xyz;
      vNormal = normalize(transpose(inverse(mat3(uModel))) * aNormal);
      gl_Position = uViewProjection * world;
    }`;
  const fragmentSource = `#version 300 es
    precision highp float;
    in vec3 vNormal;
    in vec3 vWorld;
    uniform vec4 uColor;
    uniform float uRoughness;
    out vec4 outColor;
    void main() {
      vec3 n = normalize(vNormal);
      vec3 key = normalize(vec3(-0.6, 0.85, 1.0));
      vec3 fill = normalize(vec3(0.75, 0.25, 0.7));
      float diffuse = max(dot(n, key), 0.0);
      float secondary = max(dot(n, fill), 0.0);
      float rim = pow(1.0 - max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0), 2.4);
      vec3 view = normalize(vec3(0.0, 0.0, 5.0) - vWorld);
      vec3 halfway = normalize(key + view);
      float specular = pow(max(dot(n, halfway), 0.0), mix(110.0, 12.0, uRoughness));
      vec3 color = uColor.rgb * (0.44 + diffuse * 0.52 + secondary * 0.15);
      color += vec3(1.0, 0.94, 0.87) * specular * (1.0 - uRoughness) * 0.16;
      color += vec3(0.18, 0.24, 0.32) * rim * 0.18;
      outColor = vec4(pow(color, vec3(0.92)), uColor.a);
    }`;

  function shader(type, source) {
    const value = gl.createShader(type);
    gl.shaderSource(value, source);
    gl.compileShader(value);
    if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(value));
    return value;
  }
  function program() {
    const value = gl.createProgram();
    gl.attachShader(value, shader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(value, shader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(value);
    if (!gl.getProgramParameter(value, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(value));
    return value;
  }

  const mat4 = {
    identity() { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); },
    multiply(a, b) {
      const out = new Float32Array(16);
      for (let col = 0; col < 4; col++) for (let row = 0; row < 4; row++) {
        out[col * 4 + row] = a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];
      }
      return out;
    },
    perspective(fov, aspect, near, far) {
      const f = 1 / Math.tan(fov / 2), out = new Float32Array(16);
      out[0] = f / aspect; out[5] = f; out[10] = (far + near) / (near - far); out[11] = -1; out[14] = (2 * far * near) / (near - far);
      return out;
    },
    trs(translation, quaternion, scale) {
      const [x, y, z, w] = quaternion;
      const [sx, sy, sz] = scale;
      const out = new Float32Array(16);
      out[0] = (1 - 2 * y * y - 2 * z * z) * sx; out[1] = (2 * x * y + 2 * w * z) * sx; out[2] = (2 * x * z - 2 * w * y) * sx;
      out[4] = (2 * x * y - 2 * w * z) * sy; out[5] = (1 - 2 * x * x - 2 * z * z) * sy; out[6] = (2 * y * z + 2 * w * x) * sy;
      out[8] = (2 * x * z + 2 * w * y) * sz; out[9] = (2 * y * z - 2 * w * x) * sz; out[10] = (1 - 2 * x * x - 2 * y * y) * sz;
      out[12] = translation[0]; out[13] = translation[1]; out[14] = translation[2]; out[15] = 1;
      return out;
    },
    global(position, rotation, scale) {
      const cx = Math.cos(rotation[0] / 2), sx = Math.sin(rotation[0] / 2);
      const cy = Math.cos(rotation[1] / 2), sy = Math.sin(rotation[1] / 2);
      const cz = Math.cos(rotation[2] / 2), sz = Math.sin(rotation[2] / 2);
      const quaternion = [sx * cy * cz - cx * sy * sz, cx * sy * cz + sx * cy * sz, cx * cy * sz - sx * sy * cz, cx * cy * cz + sx * sy * sz];
      return mat4.trs(position, quaternion, [scale, scale, scale]);
    }
  };

  const state = {
    pointerX: 0, pointerY: 0, smoothX: 0, smoothY: 0,
    paused: matchMedia('(prefers-reduced-motion:reduce)').matches,
    hoverEntry: false, blinkStart: performance.now() + 3000, blinking: false,
    meshes: [], nodes: [], materials: [], ready: false
  };

  function smoothstep(value) { value = Math.max(0, Math.min(1, value)); return value * value * (3 - 2 * value); }
  function mix(a, b, amount) { return a + (b - a) * amount; }

  async function loadModel() {
    const response = await fetch('/assets/avatar.glb?v=portrait-2');
    if (!response.ok) throw new Error('No se pudo cargar avatar.glb');
    const buffer = await response.arrayBuffer();
    const view = new DataView(buffer);
    if (view.getUint32(0, true) !== 0x46546c67) throw new Error('GLB no válido');
    const jsonLength = view.getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLength)));
    const binaryStart = 20 + jsonLength + 8;
    const accessorBuffers = new Map();
    function accessor(index) {
      if (accessorBuffers.has(index)) return accessorBuffers.get(index);
      const item = json.accessors[index];
      const source = json.bufferViews[item.bufferView];
      const offset = binaryStart + (source.byteOffset || 0) + (item.byteOffset || 0);
      const components = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[item.type];
      const constructors = { 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
      const data = new constructors[item.componentType](buffer, offset, item.count * components);
      const result = { item, data };
      accessorBuffers.set(index, result);
      return result;
    }
    const gpuAccessors = new Map();
    function gpuAccessor(index, target) {
      if (gpuAccessors.has(index)) return gpuAccessors.get(index);
      const value = accessor(index);
      const gpu = gl.createBuffer();
      gl.bindBuffer(target, gpu);
      gl.bufferData(target, value.data, gl.STATIC_DRAW);
      const result = { ...value, gpu };
      gpuAccessors.set(index, result);
      return result;
    }
    state.materials = json.materials.map(material => ({
      color: material.pbrMetallicRoughness.baseColorFactor,
      roughness: material.pbrMetallicRoughness.roughnessFactor ?? .65
    }));
    state.meshes = json.meshes.map(mesh => {
      const primitive = mesh.primitives[0];
      const position = gpuAccessor(primitive.attributes.POSITION, gl.ARRAY_BUFFER);
      const normal = gpuAccessor(primitive.attributes.NORMAL, gl.ARRAY_BUFFER);
      const indices = gpuAccessor(primitive.indices, gl.ELEMENT_ARRAY_BUFFER);
      return { position, normal, indices, material: primitive.material };
    });
    state.nodes = json.nodes.map(node => ({
      name: node.name, mesh: node.mesh,
      translation: node.translation || [0, 0, 0],
      rotation: node.rotation || [0, 0, 0, 1],
      scale: node.scale || [1, 1, 1]
    }));
  }

  const renderer = program();
  const locations = {
    position: gl.getAttribLocation(renderer, 'aPosition'), normal: gl.getAttribLocation(renderer, 'aNormal'),
    model: gl.getUniformLocation(renderer, 'uModel'), viewProjection: gl.getUniformLocation(renderer, 'uViewProjection'), color: gl.getUniformLocation(renderer, 'uColor'),
    roughness: gl.getUniformLocation(renderer, 'uRoughness')
  };
  gl.useProgram(renderer);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 1.6);
    const width = Math.round(innerWidth * ratio), height = Math.round(innerHeight * ratio);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    gl.viewport(0, 0, width, height);
  }

  function layout() {
    const hero = document.querySelector('.hero');
    const stage = document.querySelector('.entry-stage');
    const credits = document.querySelector('.credits');
    const height = innerHeight;
    const aspect = innerWidth / height;
    const halfHeight = Math.tan(35 * Math.PI / 360) * 5;
    const halfWidth = halfHeight * aspect;
    const heroProgress = smoothstep(scrollY / Math.max(1, hero.offsetHeight * .78));
    let x = mix(0, halfWidth - .25, heroProgress);
    let y = mix(-.05, -halfHeight + .27, heroProgress);
    let scale = mix(Math.min(1.04, halfHeight * .72, halfWidth * .94), .22, heroProgress);
    let stageWeight = 0;
    if (stage) {
      const rect = stage.getBoundingClientRect();
      stageWeight = smoothstep(1 - Math.abs(rect.top + rect.height * .5 - height * .52) / (height * .76));
    }
    if (innerWidth > 650) {
      x = mix(x, halfWidth * .58, stageWeight);
      y = mix(y, -.08, stageWeight);
      scale = mix(scale, .72, stageWeight);
    }
    const creditsRect = credits?.getBoundingClientRect();
    const opacity = creditsRect ? 1 - smoothstep((height * .9 - creditsRect.top) / (height * .24)) : 1;
    return { x, y, scale, opacity, stageWeight, halfHeight, halfWidth };
  }

  function draw(time) {
    resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (!state.ready) { requestAnimationFrame(draw); return; }

    const current = layout();
    shell.style.opacity = String(current.opacity);
    shell.style.visibility = current.opacity > .01 ? 'visible' : 'hidden';
    if (!state.paused) {
      state.smoothX += (state.pointerX - state.smoothX) * .075;
      state.smoothY += (state.pointerY - state.smoothY) * .075;
      if (!state.blinking && time >= state.blinkStart) state.blinking = true;
      if (state.blinking && time - state.blinkStart > 180) {
        state.blinking = false;
        state.blinkStart = time + 3400 + Math.random() * 2600;
      }
    }
    const blinkProgress = state.blinking ? Math.min(1, Math.max(0, (time - state.blinkStart) / 180)) : 0;
    const blink = state.paused ? 0 : Math.sin(blinkProgress * Math.PI);
    const gazeX = state.hoverEntry ? -.8 : state.smoothX;
    const gazeY = state.hoverEntry ? .05 : state.smoothY;
    const rotation = state.paused ? [0, 0, 0] : [-state.smoothY * .11, state.smoothX * .16 - current.stageWeight * .12, state.smoothX * .025];
    const global = mat4.global([current.x, current.y, 0], rotation, current.scale);
    const projection = mat4.perspective(35 * Math.PI / 180, innerWidth / innerHeight, .1, 100);
    const view = mat4.identity(); view[14] = -5;
    const viewProjection = mat4.multiply(projection, view);
    gl.uniformMatrix4fv(locations.viewProjection, false, viewProjection);

    let lastMesh = -1;
    state.nodes.forEach(node => {
      const translation = node.translation.slice();
      const scale = node.scale.slice();
      if (/^(IrisEdge|Iris|Pupil|Glint)\./.test(node.name)) {
        translation[0] += gazeX * .020;
        translation[1] -= gazeY * .015;
      }
      if (/^(Eye|IrisEdge|Iris|Pupil|Glint)\./.test(node.name)) {
        scale[1] *= 1 - blink * .91;
      }
      if (/^Lid(Upper|Lower)\./.test(node.name)) {
        scale[1] *= 1 - blink * .91;
        translation[1] += .196 * blink * .91;
      }
      const model = mat4.multiply(global, mat4.trs(translation, node.rotation, scale));
      gl.uniformMatrix4fv(locations.model, false, model);
      const mesh = state.meshes[node.mesh];
      gl.uniform4fv(locations.color, state.materials[mesh.material].color);
      gl.uniform1f(locations.roughness, state.materials[mesh.material].roughness);
      if (lastMesh !== node.mesh) {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.position.gpu);
        gl.enableVertexAttribArray(locations.position);
        gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normal.gpu);
        gl.enableVertexAttribArray(locations.normal);
        gl.vertexAttribPointer(locations.normal, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indices.gpu);
        lastMesh = node.mesh;
      }
      gl.drawElements(gl.TRIANGLES, mesh.indices.item.count, mesh.indices.item.componentType === 5125 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
    });
    requestAnimationFrame(draw);
  }

  addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    state.pointerX = Math.max(-1, Math.min(1, event.clientX / innerWidth * 2 - 1));
    state.pointerY = Math.max(-1, Math.min(1, event.clientY / innerHeight * 2 - 1));
  }, { passive: true });
  document.querySelectorAll('.entry-choice').forEach(choice => {
    choice.addEventListener('pointerenter', () => { state.hoverEntry = true; });
    choice.addEventListener('pointerleave', () => { state.hoverEntry = false; });
    choice.addEventListener('focus', () => { state.hoverEntry = true; });
    choice.addEventListener('blur', () => { state.hoverEntry = false; });
  });
  addEventListener('avatar-motion', event => { state.paused = event.detail.paused; });
  addEventListener('visibilitychange', () => { if (!document.hidden) state.blinkStart = performance.now() + 1800; });

  loadModel().then(() => {
    state.ready = true;
    document.body.classList.add('avatar3d-ready');
  }).catch(() => document.body.classList.add('avatar3d-failed'));
  requestAnimationFrame(draw);
})();
