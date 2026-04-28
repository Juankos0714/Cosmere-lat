export const CLOUD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const CLOUD_FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec4 t = texture2D(uTex, vUv);
    gl_FragColor = vec4(uColor * 1.1, t.a * 0.7);
  }
`
