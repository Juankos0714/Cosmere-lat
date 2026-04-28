export const ATMO_VERT = /* glsl */ `
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const ATMO_FRAG = /* glsl */ `
  varying vec3 vN;
  uniform vec3 uColor;

  void main() {
    float e = 1.0 - abs(dot(vN, vec3(0.0, 0.0, 1.0)));
    gl_FragColor = vec4(uColor, pow(e, 2.0) * 0.9);
  }
`
