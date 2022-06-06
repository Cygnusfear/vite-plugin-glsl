// Note that if you want to use the integer hash functions outside of shadertoy, you must include 'precision highp int' at the top of your shader or the hash will overflow. (It seems shadertoy uses high precision by default.)
  // https://www.shadertoy.com/view/XlGcRh

  // commonly used constants
  #define c1 0xcc9e2d51u
  #define c2 0x1b873593u
  #define PHI 1.61803398874989484820459  // Φ = Golden Ratio   

#include 'noiseCommon'
  // A single iteration of Bob Jenkins' One-At-A-Time hashing algorithm.
uint hash(uint x) {
  x += (x << 10u);
  x ^= (x >> 6u);
  x += (x << 3u);
  x ^= (x >> 11u);
  x += (x << 15u);
  return x;
}

  // Compound versions of the hashing algorithm I whipped together.
uint hash(uvec2 v) {
  return hash(v.x ^ hash(v.y));
}
uint hash(uvec3 v) {
  return hash(v.x ^ hash(v.y) ^ hash(v.z));
}
uint hash(uvec4 v) {
  return hash(v.x ^ hash(v.y) ^ hash(v.z) ^ hash(v.w));
}

  // Construct a float with half-open range [0:1] using low 23 bits.
  // All zeroes yields 0.0, all ones yields the next smallest representable value below 1.0.
float floatConstruct(uint m) {
  const uint ieeeMantissa = 0x007FFFFFu; // binary32 mantissa bitmask
  const uint ieeeOne = 0x3F800000u; // 1.0 in IEEE binary32

  m &= ieeeMantissa;                     // Keep only mantissa bits (fractional part)
  m |= ieeeOne;                          // Add fractional part to 1.0

  float f = uintBitsToFloat(m);       // Range [1:2]
  return f - 1.0;                        // Range [0:1]
}

  // Pseudo-random value in half-open range [0:1].
float random(float x) {
  return floatConstruct(hash(floatBitsToUint(x)));
}
float random(vec2 v) {
  return floatConstruct(hash(floatBitsToUint(v)));
}
float random(vec3 v) {
  return floatConstruct(hash(floatBitsToUint(v)));
}
float random(vec4 v) {
  return floatConstruct(hash(floatBitsToUint(v)));
}

  // http://www.jcgt.org/published/0009/03/02/
uvec3 pcg3d(uvec3 v) {

  v = v * 1664525u + 1013904223u;

  v.x += v.y * v.z;
  v.y += v.z * v.x;
  v.z += v.x * v.y;

  v ^= v >> 16u;

  v.x += v.y * v.z;
  v.y += v.z * v.x;
  v.z += v.x * v.y;

  return v;
}

  // The famous Stackoverflow Noise
highp float rand(vec2 co) {
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt = dot(co.xy, vec2(a, b));
  highp float sn = mod(dt, 3.14);
  return fract(sin(sn) * c);
}

  // UE4's RandFast function
  // https://github.com/EpicGames/UnrealEngine/blob/release/Engine/Shaders/Private/Random.ush
float fast(vec2 v) {
  v = (1. / 4320.) * v + vec2(0.25, 0.);
  float state = fract(dot(v * v, vec2(3571)));
  return fract(state * state * (3571. * 2.));
}

  // SuperFastHash, adapated from http://www.azillionmonkeys.com/qed/hash.html
uint superfast(uvec2 data) {
  uint hash = 8u, tmp;

  hash += data.x & 0xffffu;
  tmp = (((data.x >> 16) & 0xffffu) << 11) ^ hash;
  hash = (hash << 16) ^ tmp;
  hash += hash >> 11;

  hash += data.y & 0xffffu;
  tmp = (((data.y >> 16) & 0xffffu) << 11) ^ hash;
  hash = (hash << 16) ^ tmp;
  hash += hash >> 11;

      /* Force "avalanching" of final 127 bits */
  hash ^= hash << 3;
  hash += hash >> 5;
  hash ^= hash << 4;
  hash += hash >> 17;
  hash ^= hash << 25;
  hash += hash >> 6;

  return hash;
}

  // Fractional random
float fractRand(float n) {
  return fract(sin(n) * 43758.5453123);
}

  // Golden ratio random
float goldNoise(in vec2 xy, in float seed) {
  return fract(tan(distance(xy * PHI, xy) * seed) * xy.x);
}

  // Classic Perlin noise, periodic variant
float perlinNoise(vec3 P, vec3 rep) {
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}