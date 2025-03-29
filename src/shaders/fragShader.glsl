
varying vec3 pos;
varying vec2 vUV;
varying vec3 n;

uniform float iTime;


void main() {
  vec3 col = vec3(1.,0.,1.);

  gl_FragColor = vec4(col,1.);
}