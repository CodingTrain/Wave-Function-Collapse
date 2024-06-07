// This sketches uses local storage to save the color choices and train track tiles.  
// https://www.youtube.com/watch?v=QvoTSl60Y88
// The idea for storing the tiles in local storage is based on the the Local Storage tutorial by Dan Shiffman
// https://www.youtube.com/watch?v=_SRS8b4LcZ8
// The train track tiles are generated using sdfs.  See the frag file for more information.

new p5(sa => {

  // a shader variable
  let shader0;

  // Declare variables
  let radio1;

  let button0;
  let c0;
  let graphics0;

  sa.preload = () => {
      // load the the shader
      shader0 = sa.loadShader('train.vert', 'train.frag');
  }

  sa.setup = () => {
      sa.pixelDensity(1);
      sa.noStroke();

      let divA = sa.createDiv();
      divA.position(20, 750);
      divA.style('max-width', '100px');
      divA.style('align-content', 'center');

      c0 = sa.createCanvas(100, 100, sa.WEBGL);
      c0.parent(divA);
      sa.pixelDensity(1);
      // shaders require WEBGL mode to work
      graphics0 = sa.createGraphics(100, 100, sa.WEBGL);

      button0 = sa.createButton('SAVE TILE A');
      button0.parent(divA);
      button0.mousePressed(sa.saveTile0);

      r1Slider = sa.createSlider(0, 255, 0);
      g1Slider = sa.createSlider(0, 255, 0);
      b1Slider = sa.createSlider(0, 255, 0);
      r2Slider = sa.createSlider(0, 255, 89);
      g2Slider = sa.createSlider(0, 255, 89);
      b2Slider = sa.createSlider(0, 255, 89);
      r3Slider = sa.createSlider(0, 255, 255);
      g3Slider = sa.createSlider(0, 255, 255);
      b3Slider = sa.createSlider(0, 255, 255);

      let colors = sa.getItem("colors");
      if (colors !== null) {
          r1Slider.value(colors.r1);
          g1Slider.value(colors.g1);
          b1Slider.value(colors.b1);
          r2Slider.value(colors.r2);
          g2Slider.value(colors.g2);
          b2Slider.value(colors.b2);
          r3Slider.value(colors.r3);
          g3Slider.value(colors.g3);
          b3Slider.value(colors.b3);
      }
      r1Slider.changed(sa.storeColors);
      g1Slider.changed(sa.storeColors);
      b1Slider.changed(sa.storeColors);
      r2Slider.changed(sa.storeColors);
      g2Slider.changed(sa.storeColors);
      b2Slider.changed(sa.storeColors);
      r3Slider.changed(sa.storeColors);
      g3Slider.changed(sa.storeColors);
      b3Slider.changed(sa.storeColors);

      // Organize the layout
      let div1 = sa.createDiv();
      div1.style('font-size', '16px');
      div1.position(10, 440);
      colAlabel = sa.createP('BACKGROUND COLOR');
      colAlabel.parent(div1);
      colAlabel.style("color", "#fff");
      r1Slider.parent(div1);
      g1Slider.parent(div1);
      b1Slider.parent(div1);   
       
      let div2 = sa.createDiv();
      div2.style('font-size', '16px');
      div2.position(10, 520);
      colBlabel = sa.createP('CIRCLE COLOR');
      colBlabel.parent(div2);
      colBlabel.style("color", "#fff");
      r2Slider.parent(div2);
      g2Slider.parent(div2);
      b2Slider.parent(div2); 

      let div3 = sa.createDiv();
      div3.style('font-size', '16px');
      div3.position(10, 595);
      colClabel = sa.createP('TRACK COLOR');
      colClabel.parent(div3);
      colClabel.style("color", "#fff");
      r3Slider.parent(div3);
      g3Slider.parent(div3);
      b3Slider.parent(div3);           
  }

  sa.draw = () => {
      let r1 = r1Slider.value();
      let g1 = g1Slider.value();
      let b1 = b1Slider.value();
      let r2 = r2Slider.value();
      let g2 = g2Slider.value();
      let b2 = b2Slider.value();
      let r3 = r3Slider.value();
      let g3 = g3Slider.value();
      let b3 = b3Slider.value();
      shader0.setUniform('u_resolution', [sa.width, sa.height]);
      shader0.setUniform('colorAr', r1);
      shader0.setUniform('colorAg', g1);
      shader0.setUniform('colorAb', b1);
      shader0.setUniform('colorBr', r2);
      shader0.setUniform('colorBg', g2);
      shader0.setUniform('colorBb', b2);
      shader0.setUniform('colorCr', r3);
      shader0.setUniform('colorCg', g3);
      shader0.setUniform('colorCb', b3);
      shader0.setUniform('tileChoice', 0.0);
      sa.shader(shader0);
      sa.rect(0, 0, sa.width, sa.height);
  }

  sa.storeColors = () => {
      let colors = {
          r1: r1Slider.value(),
          g1: g1Slider.value(),
          b1: b1Slider.value(),
          r2: r2Slider.value(),
          g2: g2Slider.value(),
          b2: b2Slider.value(),
          r3: r3Slider.value(),
          g3: g3Slider.value(),
          b3: b3Slider.value(),
      }

      sa.storeItem("colors", colors);
  }

  sa.saveTile0 = () => {
      //sa.saveCanvas(c0, "0.png");
      sa.storeItem("img0", c0.elt.toDataURL());
  }

});

new p5(sb => {
  // a shader variable
  let shader1;
  let button1;
  let c2;
  let graphics2;

  sb.preload = () => {
      // load the the shader
      shader1 = sb.loadShader('train.vert', 'train.frag');
  }

  sb.setup = () => {
      sb.pixelDensity(1);
      sb.noStroke();
      // shaders require WEBGL mode to work

      let divB = sb.createDiv();
      divB.position(125, 750);
      divB.style('max-width', '100px');
      c1 = sb.createCanvas(100, 100, sb.WEBGL);
      c1.parent(divB);
      sb.pixelDensity(1);
      graphics2 = sb.createGraphics(100, 100, sb.WEBGL);

      button1 = sb.createButton('SAVE TILE B');
      button1.mousePressed(sb.saveTile1);
      button1.parent(divB);

      let colors = sb.getItem("colors");
      if (colors !== null) {
          r1Slider.value(colors.r1);
          g1Slider.value(colors.g1);
          b1Slider.value(colors.b1);
          r2Slider.value(colors.r2);
          g2Slider.value(colors.g2);
          b2Slider.value(colors.b2);
          r3Slider.value(colors.r3);
          g3Slider.value(colors.g3);
          b3Slider.value(colors.b3);
      }  
  }

  sb.draw = () => {
      let r1 = r1Slider.value();
      let g1 = g1Slider.value();
      let b1 = b1Slider.value();
      let r2 = r2Slider.value();
      let g2 = g2Slider.value();
      let b2 = b2Slider.value(); 
      let r3 = r3Slider.value();
      let g3 = g3Slider.value();
      let b3 = b3Slider.value(); 
      shader1.setUniform('u_resolution', [sb.width, sb.height]);
      shader1.setUniform('colorAr', r1);
      shader1.setUniform('colorAg', g1);
      shader1.setUniform('colorAb', b1);
      shader1.setUniform('colorBr', r2);
      shader1.setUniform('colorBg', g2);
      shader1.setUniform('colorBb', b2);
      shader1.setUniform('colorCr', r3);
      shader1.setUniform('colorCg', g3);
      shader1.setUniform('colorCb', b3);
      shader1.setUniform('tileChoice', 1.0);
      sb.shader(shader1);
      sb.rect(0, 0, sb.width, sb.height)
  }

  sb.saveTile1 = () => {
      //sb.saveCanvas(c1, "0.png");
      sb.storeItem("img0", c1.elt.toDataURL());
  }
});



new p5(sc => {
  // a shader variable
  let shader2;
  let button2;
  let c2;
  let graphics3;

  sc.preload = () => {
      // load the the shader
      shader2 = sc.loadShader('train.vert', 'train.frag');
  }

  sc.setup = () => {
      sc.pixelDensity(1);
      sc.noStroke();
      // shaders require WEBGL mode to work

      let divC = sc.createDiv();
      divC.position(230, 750);
      divC.style('max-width', '100px');
      c2 = sc.createCanvas(100, 100, sc.WEBGL);
      c2.parent(divC);
      sc.pixelDensity(1);
      graphics3 = sc.createGraphics(100, 100, sc.WEBGL);

      button2 = sc.createButton('SAVE TILE C');
      button2.mousePressed(sc.saveTile2);
      button2.parent(divC);

      let colors = sc.getItem("colors");
      if (colors !== null) {
          r1Slider.value(colors.r1);
          g1Slider.value(colors.g1);
          b1Slider.value(colors.b1);
          r2Slider.value(colors.r2);
          g2Slider.value(colors.g2);
          b2Slider.value(colors.b2);
          r3Slider.value(colors.r3);
          g3Slider.value(colors.g3);
          b3Slider.value(colors.b3);
      }
      
  }

  sc.draw = () => {
      let r1 = r1Slider.value();
      let g1 = g1Slider.value();
      let b1 = b1Slider.value();
      let r2 = r2Slider.value();
      let g2 = g2Slider.value();
      let b2 = b2Slider.value();
      let r3 = r3Slider.value();
      let g3 = g3Slider.value();
      let b3 = b3Slider.value();
      shader2.setUniform('u_resolution', [sc.width, sc.height]);
      shader2.setUniform('colorAr', r1);
      shader2.setUniform('colorAg', g1);
      shader2.setUniform('colorAb', b1);
      shader2.setUniform('colorBr', r2);
      shader2.setUniform('colorBg', g2);
      shader2.setUniform('colorBb', b2);
      shader2.setUniform('colorCr', r3);
      shader2.setUniform('colorCg', g3);
      shader2.setUniform('colorCb', b3);
      shader2.setUniform('tileChoice', 2.0);
      sc.shader(shader2);
      sc.rect(0, 0, sc.width, sc.height)
  }

  sc.saveTile2 = () => {
      //sc.saveCanvas(c2, "1.png");
      sc.storeItem("img1", c2.elt.toDataURL());
  }
  
});

