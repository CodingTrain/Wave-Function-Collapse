// Frag shader creates train tiles for wave function collapse

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;
uniform vec2 iMouse;


#define S smoothstep
#define CG colorGradient
#define PI 3.14159
#define AQUA vec3(160,223,247)/255.
#define RASPBERRY vec3(253,96,182)/255.
#define PURPLE vec3(196,103,236)/255.
#define ORANGE  vec3(255,160,78)/255.
#define YELLOW vec3(254,241,9)/255.
#define RED vec3(255,77, 28)/255.

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

// Copied from Inigo Quilez
float sdSegment( vec2 uv, vec2 a, vec2 b) {
  vec2 pa = uv-a, ba = b-a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa-ba*h );
}

//From Inigo Quilez
float sdBox( vec2 uv, vec2 b )
{
    vec2 d = abs(uv)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float sdCircle( vec2 uv, float r) {
  return length(uv) - r;
} 

// From Inigo Quilez
float sdRoundedBox( vec2 uv, vec2 b, vec4 r) {
  r.xy = (uv.x>0.0) ? r.xy : r.zw;
  r.x = (uv.y>0.0) ? r.x : r.y;
  vec2 q = abs(uv) - b + r.x;
  return min( max(q.x, q.y), 0.0) + length(max(q, 0.0) ) - r.x;
}

vec3 sdTrack( vec2 uv, float r, vec3 col) {
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
  return m * col;
}

// Code for straight tracks
// x1 = -.42, x2=  -.275 for side tracks
float biggerRails( vec2 uv, float x1, float x2 ) {
  float s1 = sdBox(uv - vec2(x1, 0.), vec2(.04, 1.));
  float m1 = S(.008, .0, s1);
  float s2 = sdBox(uv - vec2(x2, 0.), vec2(.04, 1.));
  float m2= S(.008, .0, s2);
  return m1 + m2;
}

// straight tracks
// x = -.35 for side tracks
float stracks( vec2 uv, float x) {
  float s1 = sdBox(uv - vec2(x, 0.), vec2(.16, .075));
  float m1 = S(.008, .0, s1);
  float s2 = sdBox(vec2(uv.x, abs(uv.y)) - vec2(x, .5), vec2(.16, .075));
  float m2 = S(.008, .0, s2);
  return m1 + m2;
}

// Code for curved rails
// Tracks are separate functions to preserve color
float biggerCurvedRails( vec2 uv) {
   float s1 = abs(sdCircle(uv- vec2(.475, .475), .9)) - .04;
   float m1 = S(.008, .0, s1);
   float s2 = abs(sdCircle(uv- vec2(.475, .475), .75)) - .04;
   float m2 = S(.008, .0, s2);
   return m1 + m2;
}

// curved tracks
float ctracks( vec2 uv) {
   float s1 = sdBox(Rot(PI*1./4.)*uv - vec2(-.16, .0), vec2(.16, .075));
   float m1 = S(.008, .0, s1);
   float s2 = sdBox(uv - vec2(.5, -.345), vec2(.075, .16));
   float m2 = S(.008, .0, s2);
   float s3 = sdBox(uv - vec2(-.345, .5), vec2(.16, .075));
   float m3 = S(.008, .0, s3);
   return m1 + m2 + m3;
}

float sdCorner( vec2 uv) {
  vec2 gv = uv - vec2(-0., .0);
   float s1 =  abs(sdRoundedBox( uv - vec2(-.525, .975), vec2(.6, .7), vec4(.25, .25, .25, .25)) ) -  .04;
    float m1 = S(.008, .0, s1);
    // float s2 =  abs(sdRoundedBox( gv - vec2(-.475, 1.01), vec2(.4, .6), vec4(.25, .15, .25, .35)) ) -  .04;
  float s2 =  abs(sdRoundedBox( gv - vec2(-.48, .66), vec2(.42, .25), vec4(.25, .15, .25, .45)) ) -  .04;
    float m2 = S(.008, .0, s2);
  return m1 + m2;
}

float corntracks( vec2 uv) {
    float s1 = sdBox(uv - vec2(.0, .5), vec2(.16, .075));
    float m1 = S(.008, .0, s1);
    float s2 = sdBox(uv - vec2(-.5, .35), vec2(.075, .16));
    float m2 = S(.008, .0, s2);
    // float s3 = sdBox(uv - vec2(-.2, .4), vec2(.04, .16));
    // float m3 = S(.008, .0, s3);
    return m1 + m2 ;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - .5*u_resolution.xy)/u_resolution.y;
	
    vec3 col = vec3(0);
  
    // Uncomment to check for symmetry
    float d1 = sdSegment(uv, vec2(-.5, 0.), vec2(.5, 0.));
    float s1 = S(.008, .0, d1); // horizontal center line
    float d2 = sdSegment(uv, vec2(-.5/3., -.5), vec2(-.5/3., .5));
    float s2 = S(.008, .0, d2); // vertical thirds line
    float d3 = sdSegment(uv, vec2(.5/3., -.5), vec2(.5/3., .5));
    float s3 = S(.008, .0, d3); // 
    float d4 = sdSegment(uv, vec2(.0, -.5), vec2(.0, .5));
     float s4 = S(.008, .0, d4); //  line
   
  // col += s1 + s2 + s3 + s4 ;

   // Smaller train tracks
     vec3 t = sdTrack(uv, .001, RASPBERRY);
     //col += t;
  
    // Bigger train tracks
    // x1 = -.42, x2=  -.275 for side tracks
    // x1 = -.075, x2=  .075 for side tracks
    float b = biggerRails(uv, -0.42, -0.275);
  
    // x = 0. for center tracks; -.35 for side tracks
    float str = stracks(uv, -.35); 
    //col += (1. - b - str) * AQUA + b * RASPBERRY + str*PURPLE ;
  
    float bc = biggerCurvedRails(uv);
    float ctr = ctracks(uv); 
    //col += (1. - bc - ctr) * AQUA + bc * RASPBERRY  + ctr*PURPLE;
  
  
    // Connector tracks in corner
    float cn = sdCorner(uv);
    float cntr = corntracks(uv);
    col += (1. - cn  - cntr) * AQUA + cn * RASPBERRY  + cntr * PURPLE;
  
      
   //col += AQUA;
  
    gl_FragColor = vec4(col,1.0);
}
