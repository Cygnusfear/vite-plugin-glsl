const fragment = `#include 'noise/random'

uniform vec3 color;
uniform sampler2D tDepth;
uniform float ema;

varying vec3 vColor;
varying float vRnd1;

void main() {
  float n = fast((gl_PointCoord + vec2(vRnd1)) * 20.);
  float depth = texture2D( tDepth, gl_PointCoord.xy ).x;

  if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;

  vec3 activeColor = color * vColor;

  if ( ema < 0. )
  {
    activeColor.r += abs(ema) ;
    activeColor.g *= 0.2 + 0.35 - abs(ema);
    activeColor.b *= 0.2 + 0.1 - abs(ema);
  }

  activeColor.rgb += vRnd1 * (1. - abs(ema)) * 0.002;
  activeColor.rgb *= abs(ema) + 0.5;

  // gl_FragColor = vec4(depth,depth,depth,1.0);//vec4( color * vColor, 1.0 );
  gl_FragColor = vec4( activeColor, 1.0 );
  gl_FragColor.a = 1.;
  if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.375 - n )
  {
    gl_FragColor.a = 0. + min(0.8,max(0.,pow(n,4.)));
    discard;
  }
  else {
    gl_FragColor.rgb *= 2.7;
  }
  gl_FragColor.a += pow(gl_FragColor.a, 2.) * 2.;

}`;

const vertex = `#include 'noise/random';

uniform float react;
uniform float time;
uniform float bounds;
uniform float ema;

attribute float scale;
attribute float index;
attribute float rnd1;
attribute float rnd2;
attribute vec3 customColor;

varying vec3 vColor;
varying float vRnd1;

void main() {
  vColor = customColor;

  vec3 pos = position;

  float max = rnd1 * 100. + 10.;
  float max2 = rnd2 * 100. + 10.;

  float speed = abs(ema) * 4.;

  pos.x = pos.x + sin((time * 0.02 + index) * 10. / max + 0.1) * speed * bounds / 2. + (react * rnd1) * 0.1;
  pos.y = pos.y + cos((time * 0.02 + index) * 10. / max2 + 0.1) * speed * bounds / 2. + (react * rnd2) * 0.1;
  pos.z = pos.z + cos((time * 0.02 + index) * 10. / max + 0.1) * speed * bounds / 2. + (react * rnd1) * 0.1;

  vRnd1 = rnd1 + random(vec3(pos.x, pos.y, index)) * 10.;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = scale * (scale / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}`;

export { fragment, vertex };
