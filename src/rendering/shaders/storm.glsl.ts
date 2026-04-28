export const STORM_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;

  void main() {
    vUv = uv;
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const STORM_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uFront;
  varying vec2 vUv;
  varying vec3 vN;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i.x + i.y * 57.0);
    float b = hash(i.x + 1.0 + i.y * 57.0);
    float c = hash(i.x + (i.y + 1.0) * 57.0);
    float d = hash(i.x + 1.0 + (i.y + 1.0) * 57.0);
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
    return v;
  }

  void main() {
    float front = mod(uFront, 1.0);
    float dx = vUv.x - front;
    if (dx > 0.5)  dx -= 1.0;
    if (dx < -0.5) dx += 1.0;

    float behindDist = max(0.0, -dx);
    float stormWidth  = 0.20;

    vec2 nc = vec2(vUv.x * 5.0 + uTime * 0.08, vUv.y * 9.0 + uTime * 0.02);
    float turb = fbm(nc);

    float body = smoothstep(0.0, 0.025, behindDist) * smoothstep(stormWidth, stormWidth * 0.25, behindDist);
    body *= (0.4 + 0.6 * turb);

    float edgeDist = abs(dx);
    float edge = smoothstep(0.055, 0.0, edgeDist);

    float l1 = step(0.965, sin(uTime * 41.0 + vUv.y * 31.0 + vUv.x * 17.0));
    float l2 = step(0.982, sin(uTime * 67.0 + vUv.y * 52.0));
    float lightning = max(l1, l2) * edge * 2.5;

    float lat = smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);

    vec3 bodyCol  = vec3(0.12, 0.15, 0.22);
    vec3 edgeCol  = vec3(0.55, 0.75, 1.0);
    vec3 lightCol = vec3(1.0,  0.95, 0.7);

    vec3 col = mix(bodyCol, edgeCol, edge);
    col = mix(col, lightCol, clamp(lightning, 0.0, 1.0));

    float alpha = body * 0.78 + edge * 0.88 + lightning * 0.5;
    alpha *= lat;

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`
