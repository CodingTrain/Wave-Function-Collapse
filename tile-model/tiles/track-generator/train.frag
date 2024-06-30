// Frag shader creates train tiles for wave function collapse
// Basic 2D sdf functions from Inigo Quilez
// https://iquilezles.org/articles/distfunctions2d/

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float colorAr;
uniform float colorAg;
uniform float colorAb;
uniform float colorBr;
uniform float colorBg;
uniform float colorBb;
uniform float colorCr;
uniform float colorCg;
uniform float colorCb;
uniform float tileChoice;

#define S smoothstep
#define CG colorGradient
#define PI 3.14159

// Define choosen colors
#define colA vec3(colorAr, colorAg, colorAb)/255.
#define colB vec3(colorBr, colorBg, colorBb)/255.
#define colC vec3(colorCr, colorCg, colorCb)/255.

// Coding Train Colors
#define AQUA vec3(160,223,247)/255.
#define RASPBERRY vec3(253,96,182)/255.
#define PURPLE vec3(196,103,236)/255.

vec3 colorGradient(vec2 uv, vec3 col1, vec3 col2, float m) {
  float k = uv.y*m + m;
  vec3 col = mix(col1, col2, k);
  return col;
}  

// Rotation matrix
mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

// From Inigo Quilez
float sdSegment( vec2 uv, vec2 a, vec2 b) {
  vec2 pa = uv-a, ba = b-a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa-ba*h );
}

//From Inigo Quilez
float sdCircle( vec2 uv, float r) {
  return length(uv) - r;
} 

//From Inigo Quilez
float sdBox( vec2 uv, vec2 b )
{
    vec2 d = abs(uv)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

// From Inigo Quilez
float sdRoundedBox( vec2 uv, vec2 b, vec4 r) {
  r.xy = (uv.x>0.0) ? r.xy : r.zw;
  r.x = (uv.y>0.0) ? r.x : r.y;
  vec2 q = abs(uv) - b + r.x;
  return min( max(q.x, q.y), 0.0) + length(max(q, 0.0) ) - r.x;
}

float sdTrack( vec2 uv, float r) {
  vec2 gv = uv;
  vec2 st = uv;
  vec2 md = uv;
  uv.y = abs(uv.y);
  float s1 =  abs(sdRoundedBox( uv - vec2(.4, .4), vec2(.3, .3), vec4(.175, .175, .175, .25)) ) -  r;
  float m1 = S(.008, .0, s1);
  float s2 =  abs(sdRoundedBox( uv - vec2(.45, .45), vec2(.3, .3), vec4(.175, .175, .175, .22)) ) -  r;
  float m2 = S(.008, .0, s2);
  float s3 = sdBox((Rot(PI* 3./4.)*(md - vec2(.195, .195)) - vec2(.0, .0)), vec2(.01, .05) );
  float m3 = S(.008, .0, s3);
  float s4 = sdBox((Rot(PI* 13./16.)*(uv - vec2(.25, .15)) - vec2(.0, .0)), vec2(.01, .05) );
  float m4 = S(.008, .0, s4);
   float s5 = sdBox((Rot(PI* 15./16.)*(uv - vec2(.32, .13)) - vec2(.0, .0)), vec2(.01, .05) );
  float m5 = S(.008, .0, s5);
   gv.x = abs(gv.x);
  float s6 = sdBox((uv - vec2(.46, .125)), vec2(.01, .05) );
  float m6 = S(.008, .0, s6);
  float s7 = sdBox((uv - vec2(.39, .125)), vec2(.01, .05) );
  float m7 = S(.008, .0, s7);
   float s8 = sdBox((Rot(PI* 1./4.)*(md - vec2(.195, -.195)) - vec2(.0, .0)), vec2(.01, .05) );
  float m8 = S(.008, .0, s8);
  float s9 = sdBox((Rot(PI* 11./16.)*(uv - vec2(.15, .25)) - vec2(.0, .0)), vec2(.01, .05) );
  float m9 = S(.008, .0, s9);
   float s10 = sdBox((Rot(PI* 9.5/16.)*(uv - vec2(.13, .32)) - vec2(.0, .0)), vec2(.01, .05) );
  float m10 = S(.008, .0, s10);
  float s11 = sdBox((vec2(gv.x, uv.y) - vec2(.125, .46)), vec2(.05, .01) );
  float m11 = S(.008, .0, s11);
  float s12 = sdBox((vec2(gv.x, uv.y) - vec2(.125, .39)), vec2(.05, .01) );
  float m12 = S(.008, .0, s12);
  st.y = abs(st.y);
  // Straight train tracks
  float s13 = sdBox(uv - vec2(-.15, 0.), vec2(.001, 1.));
  float m13 = S(.008, .0, s13);
  float s14 = sdBox(uv - vec2(-.10, 0.), vec2(.001, 1.));
  float m14 = S(.008, .0, s14);
  float s15 = sdBox((st - vec2(-.125, .04)), vec2(.05, .01) );
  float m15 = S(.008, .0, s15);
  float s16 = sdBox((st - vec2(-.125, .11)), vec2(.05, .01) );
  float m16 = S(.008, .0, s16);
  float s17 = sdBox((st - vec2(-.125, .18)), vec2(.05, .01) );
  float m17 = S(.008, .0, s17);
  float s18 = sdBox((st - vec2(-.125, .25)), vec2(.05, .01) );
  float m18 = S(.008, .0, s18);
  float s19 = sdBox((st - vec2(-.125, .32)), vec2(.05, .01) );
  float m19 = S(.008, .0, s19);
  float m =  m1 + m2 + m3 + m4 + m5 + m6 + m7 + m8 + m9 + m10 
        + m11 + m12 + m13 + m14 + m15 + m16 + m17 + m18 + m19;
  return m ;;
}


// Function to choose tile
vec3 chooseTile( float tileChoice, vec2 uv, vec3 col1, vec3 col2, vec3 col3 ) {
  vec3 col = vec3(0.0);
  if (tileChoice == 0.0) {
     col = col1;
   }
   else if (tileChoice == 1.0) {
    float s = sdCircle(uv, .25);
    float  m = S(0.008, 0.0, s);
    col += (1. - m) * col1 + m * col2;
   }
  else if (tileChoice == 2.0) {
     // Smaller train tracks
     float t = sdTrack(uv, .001);
     col += (1. - t) * col1 + t * col3;
  }
  return col;
}

void main()
{
  vec2 uv = (gl_FragCoord.xy - .5*u_resolution.xy)/u_resolution.y;
	
  vec3 col = vec3(0.0);

  col += chooseTile( tileChoice, uv, colA, colB, colC );

  gl_FragColor = vec4(col,1.0);
}
