// Frag shader creates UP, DOWN, RIGHT, LEFT, TILES
#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;
uniform vec2 iMouse;
uniform float iFrame;
uniform sampler2D tex0;

#define S smoothstep
#define CG colorGradient
#define PI 3.14159
#define YELLOW vec3(252,236,82)/255.
#define RASPBERRY vec3(230,40,179)/255.
#define BLUE  vec3(49,133, 252)/255.
#define GREEN vec3(75,198,185)/255.
#define DARK vec3(64,63,76)/255.

vec3 colorGradient(vec2 uv, vec3 col1, vec3 col2, float m) {
  float k = uv.y*m + m;
  vec3 col = mix(col1, col2, k);
  return col;
}  

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

// Copied from Inigo Quilez
float sdBox( vec2 uv, vec2 b )
{
    vec2 d = abs(uv)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float sdCircle( vec2 uv, float r) {
  return length(uv) - r;
} 

float Arc( vec2 uv, float r1, float r2) {
  return abs(sdCircle(uv, r1)) - r2;
}

float sdT( vec2 uv, float width) {
  vec2 gv = uv * 8.;
  float s1 = sdBox( gv - vec2(2., 0.), vec2(2.0, width) );
  float m1 = S(.008, .0, s1);
  float s2 = sdBox(gv- vec2(0.,0.), vec2(width, 5.));
  float m2 = S(.008, .0, s2);
  return max(m1, m2);
}

vec3 circleTile( vec2 uv, float angle) {
  vec2 gv = Rot(angle) * uv;
  float s1 = Arc(gv - vec2(.5, 0.), .20, .02);
  float m1 = S(.008, .0, s1);
  float s2 = Arc(gv - vec2(.5, 0.), .1, .02);
  float m2 = S(.008, .0, s2);
  float s3= sdCircle(gv - vec2(.5, 0.), .02);
  float m3 = S(.008, .0, s3);
  return m1*GREEN + m2 * RASPBERRY + m3 * BLUE;
}

float sdCorner( vec2 uv) {
  vec2 gv = uv * 8.;
  float s1 = sdBox( gv - vec2(1.5, 0.), vec2(1.75, .25) );
  float m1 = S(.008, .0, s1);
  float s2 = sdBox(gv- vec2(0.,1.5), vec2(.25, 1.75));
  float m2 = S(.008, .0, s2);
  return max(m1, m2);
}

vec3 sdTile( vec2 uv, vec3 col1, vec3 col2, vec3 col3, float angle, float width) {
   vec3 col = vec3(0);
   vec2 gv = Rot(angle) * uv;
   float m1 = sdT(gv, .25);
   float m2 = sdCorner(vec2(gv.x, abs(gv.y)) - vec2(.1,.1));
   float m3 = sdCorner(vec2(gv.x, abs(gv.y))- vec2(.2,.2));
   vec2 st = Rot(angle + PI) * uv;
   float s4 = sdBox(st - vec2(.1, .1), vec2(.025, .75));
   float m4 = S(.008, .0, s4); 
   float s5 = sdBox(st - vec2(.2, .2), vec2(.025, .75));
   float m5 = S(.008, .0, s5);   
   return col += m1*col1 + m2*col2 + m3*col3 + m4*col2 + m5*col3;
}

vec3 sdStripes( vec2 uv, vec3 col1, vec3 col2, vec3 col3, float angle, float width) {
   vec3 col = vec3(0);
   vec2 gv = Rot(angle) * uv;
   float s1 = sdBox(gv - vec2(.0, .0), vec2(.025, .75));
   float m1 = S(.008, .0, s1); 
   float s2 = sdBox(vec2(abs(gv.x), gv.y) - vec2(.1, .1), vec2(.025, .75));
   float m2 = S(.008, .0, s2); 
   float s3 = sdBox(vec2(abs(gv.x), gv.y) - vec2(.2, .2), vec2(.025, .75));
   float m3 = S(.008, .0, s3);   
   return col += m1*col1 + m2*col2 + m3*col3 ;
}

vec3 sdTexture( vec2 uv, float angle) {
  vec3 texture = texture2D(tex0, uv.xy*.5+0.5).rgb;
  vec2 gv = Rot(angle) * uv * 8.;
  float s1 = sdBox( gv - vec2(2.5, 0.), vec2(2.5, .75) );
  float m1 = S(.008, .0, s1);
  float s2 = sdBox(gv- vec2(0.0,0.0), vec2(.75, 10.));
  float m2 = S(.008, .0, s2);
  return max(m1, m2)*texture;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - .5*u_resolution.xy)/u_resolution.y;
	
    vec3 col = vec3(0);
    col += DARK; // add background color
  
    // Uncomment to check for symmetry
    float d1 = sdSegment(uv, vec2(-.5, .0), vec2(0.5, .0));
    float s1 = S(.008, .0, d1); // horizontal center line
    float d2 = sdSegment(uv, vec2(0., -.5), vec2(0., .5));
    float s2 = S(.008, .0, d2); // vertical center line
    //col += s1 + s2;
  
   // Change a to get Up, Down, Right, Left
   float a = 2.; // 0. Right, 1. Up, 2. Left, 3. Down
   vec3 tile1  = sdTile(uv, BLUE, RASPBERRY, GREEN, PI* a/2., .25);
   //col = max(tile1, col); 
   
   // a = 0. vertical, a = 1. horizontal
   vec3 tile2  = sdStripes(uv, BLUE, RASPBERRY, GREEN, PI* a/2., .25);
   //col = max(tile2, col); 
   // for cross, uncomment these lines
   vec3 tile3  = sdStripes(uv, BLUE, RASPBERRY, GREEN, PI* (a + 1.)/2., .25);
  // col = max(max(tile2,tile3), col);
  
  
   // Uncomment to pass an image (has to be fairly uniform)
   // vec3 texture = sdTexture(uv, 0.);
   // col  =  max(texture, col);
  
   vec3 c = circleTile(uv, PI* a/2.);
   col += c;
  
    gl_FragColor = vec4(col,1.0);
}
