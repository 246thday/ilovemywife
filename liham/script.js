/* global Hydra */
/* global osc */

const canvas = document.getElementById("myCanvas");

canvas.width = window.innerWidth*2;//1024;
canvas.height = window.innerHeight*2;//1024;
//canvas.width = 1024;
//canvas.height = 1024;

// create a new hydra-synth instance
var hydra = new Hydra({
  canvas,
  detectAudio: false,
  enableStreamCapture: false,
})


 // Puertas II
// por Celeste Betancur
// https://github.com/essteban

//loadScript("https://cdn.statically.io/gl/metagrowing/extra-shaders-for-hydra/main/lib/all.js")

setFunction({
  name: 'ncontour',
  type: 'src',
  inputs: [
    {name: 'thresh',  type: 'float', default: 0.5},
    {name: 'smooth',  type: 'float', default: 0.1},
    {name: 'octaves', type: 'int',   default: 3},
    {name: 'scale',   type: 'float', default: 5.0},
    {name: 'speed',   type: 'float', default: 0.5},
    {name: 'step',    type: 'float', default: 2.0},
  ],
  glsl: `
  vec2 st = _st - 0.5;
  float d0 = _noise(vec3(st*scale, speed*time));
  for(int ni=1; ni < 5; ++ni) {
    if(ni >= octaves)
      break;
    speed /= step;
    scale *= step;
    d0 += _noise(vec3(st*scale, speed*time));
  }
  float d = distance(d0, thresh);
  float g = smoothstep(0.0, smooth, d);
  return vec4(vec3(g, g, g), 1.0);
`})

setFunction({
  name: 'warp',
  type: 'src',
  inputs: [
    {name: 'scalei',       type: 'float', default: 10.0},
    {name: 'offset',       type: 'float', default:  0.1},
    {name: 'octaves',      type: 'float', default:  2.0},
    {name: 'octavesinner', type: 'float', default:  3.0},
    {name: 'scale',        type: 'float', default:  1.0},
  ],
  glsl: `
  int oin = int(abs(octavesinner));
  float fri = fract(octavesinner);
  float fbmx = 0.0;
  {
  vec2 pos = scalei * _st;
  float sc = 1.0;
  for (int io = 0; io<8; io++) {
    fbmx += sc * _noise(vec3(pos, offset * time));
    pos *= 2.0;
    sc /= 2.0;
    if(io >= oin) break;
  }
  fbmx += fri * sc * _noise(vec3(pos, offset * time));
  }
  float fbmy = 0.0;
  {
  vec2 pos = scalei * (_st + vec2(5.123, 3.987));
  float sc = 1.0;
  for (int io = 0; io<8; io++) {
    fbmy += sc * _noise(vec3(pos, offset * time));
    pos *= 2.0;
    sc /= 2.0;
    if(io >= oin) break;
  }
  fbmy += fri * sc * _noise(vec3(pos, offset * time));
  }
  int on = int(abs(octaves));
  float fr = fract(octaves);
  float fbm = 0.0;
  vec2 pos = scale * vec2(fbmx, fbmy);
  float sc = 1.0;
  for (int io = 0; io<8; io++) {
    fbm += sc * _noise(vec3(pos, offset * time));
    pos *= 2.0;
    sc /= 2.0;
    if(io >= on) break;
  }
  fbm += fr * sc * _noise(vec3(pos, offset * time));
  return vec4(fbm, fbm, fbm, 1.0);
`})


s0.initCam()
s2.initCam()
src(s0)
  .modulateScale(ncontour(0.5, 0.99, 6, 50, 0.008, 93))
  //.rotate(1.4)
  .color(1,1,30)
  .diff(osc(() => Math.sin(time * 0.01), 0.004, 0.005))
  .add(noise(10, 0.6))
  .modulate(noise(0.1, 0.08))
  .out(o2)

src(o2)
 .modulate(warp( 100, 0.1, 0.2, 4,3)
 .rotate(.01, .007))
 .diff(src(s2))
 .colorama([0.2,4.2,0.1].fast(0.0001))
.modulateHue(s0).scale(1.01)
 .pixelate(1000,100)
 .luma(0.03)
 .out(o1)

// ncontour(0.5, 0.99, 6, () => mouse.x/10, 0.008, 93)
//  .out(o0)

//render()
render(o1)
  
