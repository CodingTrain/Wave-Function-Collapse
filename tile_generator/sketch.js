// This sketch generates tiles that can be used with the wave function collapse algorithm

let textureImg;

// a shader variable
let theShader;

function preload(){
  // load the shader
  // monochromatic image works best
  textureImg = loadImage("Assets/blue.PNG");
  theShader = loadShader('starter.vert', 'starter.frag');
}


function setup() {
  pixelDensity(1);
  // shaders require WEBGL mode to work
  createCanvas(600, 600, WEBGL);
  noStroke();
}

function draw() {  
  background(0);

  // send resolution of sketch into shader
  theShader.setUniform('u_resolution', [width, height]);
  theShader.setUniform("iMouse", [mouseX, map(mouseY, 0, height, height, 0)]);
  theShader.setUniform("iFrame", frameCount);
  theShader.setUniform("iTime", millis()/1000.);
  theShader.setUniform("tex0", textureImg);
  
  // shader() sets the active shader with our shader
  shader(theShader);
  //model(cubeObj);
  // rect gives us some geometry on the screen
  rect(0,0,width, height);
  
}

function mousePressed() {
saveFrames('uv', 'png', 1, 1);

}