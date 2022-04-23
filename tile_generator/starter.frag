// Frag shader creates tiles for wave function collapse

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
/
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

// Shape functions from Inigo Quilez
float sdBox( vec2 uv, vec2 b )
{
    vec2 d = abs(uv)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float sdCircle( vec2 uv, float r) {
  return length(uv) - r;
} 
float ndot(vec2 a, vec2 b ) { return a.x*b.x - a.y*b.y; }
float sdRhombus( vec2 uv, vec2 b ) 
{
    uv = abs(uv);
    float h = clamp( ndot(b-2.0*uv,b)/dot(b,b), -1.0, 1.0 );
    float d = length( uv-0.5*b*vec2(1.0-h,1.0+h) );
    return d * sign( uv.x*b.y + uv.y*b.x - b.x*b.y );
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

vec3 circleTile( vec2 uv, vec3 col1, vec3 col2, vec3 col3, float angle) {
  vec2 gv = Rot(angle) * uv;
  float s1 = Arc(gv - vec2(.5, 0.), .2, .025);
  float m1 = S(.008, .0, s1);
  float s2 = Arc(gv - vec2(.5, 0.), .1, .025);
  float m2 = S(.008, .0, s2);
  float s3= sdCircle(gv - vec2(.5, 0.), .025);
  float m3 = S(.008, .0, s3);
  return m1* col1 + m2 * col2 + m3 * col3;
}

float sdCorner( vec2 uv) {
  vec2 gv = uv * 8.;
  float s1 = sdBox( gv - vec2(1.51, 0.), vec2(1.75, .24) );
  float m1 = S(.008, .0, s1);
  float s2 = sdBox(gv- vec2(0.,1.51), vec2(.24, 1.75));
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


float opRhombus( vec2 uv, float r1, float r2) {
  return abs( sdRhombus(uv, vec2(r1)) )- r2;
}

vec3 sdRhombusTile( vec2 uv, vec3 col1, float angle) {
   vec3 col = vec3(0);
   vec2 gv = Rot(angle) * uv;
   float s6 = opRhombus(gv, .33, .025); // outer
   float m6 = S(.008, .0, s6);  
   float s7 = sdBox(abs(gv) - vec2(.2, .37), vec2(.026, .25));
   float m7 = S(.008, .0, s7);  // outer 
   float rh3 = max(m6, m7);
  
   float s4 = opRhombus(gv, .23, .025); // middle
   float m4 = S(.008, .0, s4);  
   float s5= sdBox(abs(gv) - vec2(.1, .37), vec2(.026, .25));
   float m5= S(.008, .0, s5); // middle
   float rh2 = max(m4,m5);
  
   float s1 = opRhombus(gv, .13, .025); //center
   float m1 = S(.008, .0, s1);
   float s2 = sdBox(gv - vec2(.0, .3), vec2(.026, .20));  
   float m2 = S(.008, .0, s2); 
   float s3 = sdBox(gv - vec2(.0, -.3), vec2(.026, .20));  
   float m3 = S(.008, .0, s3); 
   float rh1 = max(max(m1, m2), m3) ;
     
   return col =  max(max(rh3, rh2), rh1) * col1;
}

vec3 sdStripes( vec2 uv, vec3 col1, vec3 col2, vec3 col3, float angle, float width) {
   vec3 col = vec3(0);
   vec2 gv = Rot(angle) * uv;
   float s1 = sdBox(gv - vec2(.0, .0), vec2(.026, .75));  
   float m1 = S(.008, .0, s1); // center
   float s2 = sdBox(vec2(abs(gv.x), gv.y) - vec2(.1, .1), vec2(.026, .75));
   float m2 = S(.008, .0, s2); // middle
   float s3 = sdBox(vec2(abs(gv.x), gv.y) - vec2(.2, .2), vec2(.026, .75));
   float m3 = S(.008, .0, s3);  // outer 
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
  
    // Add background color
    col += DARK; 
  
    // Uncomment to check for symmetry
    float d1 = sdSegment(uv, vec2(-.5, .0), vec2(0.5, .0));
    float s1 = S(.008, .0, d1); // horizontal center line
    float d2 = sdSegment(uv, vec2(0., -.5), vec2(0., .5));
    float s2 = S(.008, .0, d2); // vertical center line
    //col += s1 + s2;
  
   // Change a (angle) to get Up, Down, Right, Left
   // a = 0. vertical, a = 1. horizontal
   float a = 0.; //  Right 0., Up  1., Left 2., Down 3. 
  
   // "T" connector tiles
   // vec3 tile  = sdTile(uv, BLUE, RASPBERRY, GREEN, PI* a/2., .25);
   vec3 tile  = sdTile(uv, BLUE, BLUE, BLUE, PI* a/2., .25);
   // col = max(tile, col); 
   
   // Horizontal and Vertical Stripes
   // vec3 vert_stripes  = sdStripes(uv, BLUE, RASPBERRY, GREEN, PI* a/2., .25);
   // single color version
   vec3 vert_stripes  = sdStripes(uv, BLUE, BLUE, BLUE, PI* a/2., .25);
   //col = max(hor_stripes, col); 
   //col = max(vert_stripes, col); 
  
   // Cross with horiztontal and vertical stripes
  // vec3 hor_stripes = sdStripes(uv, BLUE, RASPBERRY, GREEN, PI*/2., .25);
   vec3 hor_stripes  = sdStripes(uv, BLUE, BLUE, BLUE, PI*/2., .25);
   
   //col = max(max(vert_stripes,horizontal_stripes), col);
  
   // Horizontal and Vertical Stripes with rhombus at center
   vec3 rhombus_tile = sdRhombusTile(uv, BLUE, PI* a/2.);
   //col = max(col, rhombus_tile);
  
   // Pass a image to add texture (has to be fairly uniform)
   vec3 texture = sdTexture(uv, 0.);
   // col  =  max(texture, col);
  
  // Half circles 
  vec3 c = circleTile(uv, GREEN, RASPBERRY, BLUE, PI* a/2.);
  // vec3 c = circleTile(uv, BLUE, BLUE, BLUE, PI* a/2.);
  // col = max(c, col);
  
    gl_FragColor = vec4(col,1.0);
}
