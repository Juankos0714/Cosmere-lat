export const STAR_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aBright;
  attribute vec3 aColor;
  varying float vB;
  varying vec3 vC;
  uniform float uTime;

  void main() {
    vC = aColor;
    vB = aBright * (0.78 + 0.22 * sin(uTime * 1.7 + aBright * 51.3));
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * (180.0 / -mv.z), 0.3, 5.0);
    gl_Position = projectionMatrix * mv;
  }
`

export const STAR_FRAG = /* glsl */ `
  varying float vB;
  varying vec3 vC;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vC, smoothstep(0.5, 0.0, d) * vB);
  }
`

export const MKR_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vC;
  uniform float uTime;

  void main() {
    vC = aColor;
    float p = 1.0 + 0.18 * sin(uTime * 2.2);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * p;
    gl_Position = projectionMatrix * mv;
  }
`

export const MKR_FRAG = /* glsl */ `
  varying vec3 vC;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float g = pow(smoothstep(0.5, 0.0, d), 1.3);
    float c = smoothstep(0.12, 0.0, d);
    gl_FragColor = vec4(vC, clamp(g * 0.65 + c * 0.9, 0.0, 1.0));
  }
`
