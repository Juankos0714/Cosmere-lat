// scene.js — Cosmere Galaxy (planetas realistas + tormenta animada)

(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────
  const STAR_COUNT = 10000;
  const CAM_POS    = new THREE.Vector3(0, 11, 17);
  const CAM_LOOK   = new THREE.Vector3(0, 0, 0);

  // ── State ─────────────────────────────────────────────────
  let renderer, scene, camera, clock;
  let starPoints, markerMesh, markerData = [];
  let planetGroup = null;
  let planets     = [];
  let stormMeshes = [];    // meshes with uStormFront uniform
  let cloudMeshes = [];    // meshes with independent spin
  let state       = 'galaxy';
  let tween       = null;
  let lookAt      = CAM_LOOK.clone();

  // ── Shaders ───────────────────────────────────────────────
  const STAR_VERT = `
    attribute float aSize; attribute float aBright; attribute vec3 aColor;
    varying float vB; varying vec3 vC; uniform float uTime;
    void main(){
      vC = aColor;
      vB = aBright * (0.78 + 0.22 * sin(uTime*1.7 + aBright*51.3));
      vec4 mv = modelViewMatrix * vec4(position,1.0);
      gl_PointSize = clamp(aSize*(180.0/-mv.z), 0.3, 5.0);
      gl_Position = projectionMatrix * mv;
    }`;
  const STAR_FRAG = `
    varying float vB; varying vec3 vC;
    void main(){
      float d = length(gl_PointCoord - 0.5);
      if(d>0.5) discard;
      gl_FragColor = vec4(vC, smoothstep(0.5,0.0,d)*vB);
    }`;

  const MKR_VERT = `
    attribute float aSize; attribute vec3 aColor;
    varying vec3 vC; uniform float uTime;
    void main(){
      vC = aColor;
      float p = 1.0 + 0.18*sin(uTime*2.2);
      vec4 mv = modelViewMatrix * vec4(position,1.0);
      gl_PointSize = aSize * p;
      gl_Position = projectionMatrix * mv;
    }`;
  const MKR_FRAG = `
    varying vec3 vC;
    void main(){
      float d = length(gl_PointCoord - 0.5);
      if(d>0.5) discard;
      float g = pow(smoothstep(0.5,0.0,d), 1.3);
      float c = smoothstep(0.12,0.0,d);
      gl_FragColor = vec4(vC, clamp(g*0.65 + c*0.9, 0.0, 1.0));
    }`;

  const ATMO_VERT = `
    varying vec3 vN;
    void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
  const ATMO_FRAG = `
    varying vec3 vN; uniform vec3 uColor;
    void main(){
      float e = 1.0 - abs(dot(vN, vec3(0,0,1)));
      gl_FragColor = vec4(uColor, pow(e,2.0)*0.9);
    }`;

  // ── Storm Shader (Altas Tormentas de Roshar) ──────────────
  const STORM_VERT = `
    varying vec2 vUv; varying vec3 vN;
    void main(){
      vUv = uv;
      vN = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;
  const STORM_FRAG = `
    uniform float uTime;
    uniform float uFront;   // 0-1 UV-x position of storm front
    varying vec2 vUv;
    varying vec3 vN;

    float hash(float n){ return fract(sin(n)*43758.5453123); }
    float noise(vec2 p){
      vec2 i = floor(p); vec2 f = fract(p);
      f = f*f*(3.0-2.0*f);
      float a=hash(i.x+i.y*57.0), b=hash(i.x+1.0+i.y*57.0);
      float c=hash(i.x+(i.y+1.0)*57.0), d=hash(i.x+1.0+(i.y+1.0)*57.0);
      return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
    }
    float fbm(vec2 p){
      float v=0.0,a=0.5;
      for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.1; a*=0.5; }
      return v;
    }

    void main(){
      float front = mod(uFront, 1.0);
      float dx = vUv.x - front;
      if(dx > 0.5)  dx -= 1.0;
      if(dx < -0.5) dx += 1.0;
      // Storm moves in -x direction (east→west). dx>0 = ahead, dx<0 = inside storm
      float behindDist = max(0.0, -dx);
      float stormWidth  = 0.20;

      // Turbulent noise in storm body
      vec2 nc = vec2(vUv.x*5.0 + uTime*0.08, vUv.y*9.0 + uTime*0.02);
      float turb = fbm(nc);

      // Storm body (dark clouds)
      float body = smoothstep(0.0, 0.025, behindDist) * smoothstep(stormWidth, stormWidth*0.25, behindDist);
      body *= (0.4 + 0.6*turb);

      // Leading edge bright wall
      float edgeDist = abs(dx);
      float edge = smoothstep(0.055, 0.0, edgeDist);

      // Lightning: random bright flashes at leading edge
      float l1 = step(0.965, sin(uTime*41.0 + vUv.y*31.0 + vUv.x*17.0));
      float l2 = step(0.982, sin(uTime*67.0 + vUv.y*52.0));
      float lightning = max(l1,l2) * edge * 2.5;

      // Latitude fade (avoid seam at poles)
      float lat = smoothstep(0.0,0.08,vUv.y)*smoothstep(1.0,0.92,vUv.y);

      vec3 bodyCol    = vec3(0.12, 0.15, 0.22);
      vec3 edgeCol    = vec3(0.55, 0.75, 1.0);
      vec3 lightCol   = vec3(1.0,  0.95, 0.7);

      vec3 col = mix(bodyCol, edgeCol, edge);
      col = mix(col, lightCol, clamp(lightning, 0.0, 1.0));

      float alpha = body*0.78 + edge*0.88 + lightning*0.5;
      alpha *= lat;

      gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
    }`;

  // ── Cloud Shader ──────────────────────────────────────────
  const CLOUD_VERT = `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
  const CLOUD_FRAG = `
    uniform sampler2D uTex;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main(){
      vec4 t = texture2D(uTex, vUv);
      gl_FragColor = vec4(uColor * 1.1, t.a * 0.7);
    }`;

  // ── Noise Utilities ───────────────────────────────────────
  function h2(x, y, s) {
    const n = Math.sin(x * 127.1 + y * 311.7 + (s||0) * 74.3) * 43758.5453;
    return n - Math.floor(n);
  }
  function n2(x, y, s) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const ux = fx*fx*(3-2*fx), uy = fy*fy*(3-2*fy);
    return h2(ix,iy,s)*(1-ux)*(1-uy) + h2(ix+1,iy,s)*ux*(1-uy)
         + h2(ix,iy+1,s)*(1-ux)*uy   + h2(ix+1,iy+1,s)*ux*uy;
  }
  function fbm(x, y, oct, s) {
    let v=0, a=0.5, f=1;
    for(let i=0;i<(oct||6);i++){ v+=a*n2(x*f,y*f,s); a*=0.5; f*=2.08; }
    return v;
  }
  const sm = (lo,hi,x) => Math.max(0,Math.min(1,(x-lo)/(hi-lo)));
  const lerp = (a,b,t) => a+(b-a)*t;

  // ── Planet Texture Generator ──────────────────────────────
  function makeTex(type, seed) {
    const S = 256; // 256 works great for 3D spheres
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(S, S);
    const d = img.data;
    const sd = seed || 7;

    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        const idx = (py*S+px)*4;
        const u = px/S, v = py/S;
        let r=0, g=0, b=0;

        if (type === 'roshar') {
          // Ocean world: FBM height map → continents
          const h = fbm(u*3.5+sd, v*3.5, 6, sd);
          const isLand = h > 0.48;
          // Polar caps
          const pole = sm(0.0,0.07,v) + sm(1.0,0.93,v);
          // Ocean colors
          if (!isLand) {
            const depth = sm(0.0,0.48,h);
            r = lerp(10,  40,  depth)|0;
            g = lerp(38, 100,  depth)|0;
            b = lerp(120, 175, depth)|0;
          } else {
            // Land: rocky, no vegetation (Roshar has little plant life)
            const elev = sm(0.48, 0.85, h);
            r = lerp(100, 180, elev)|0;
            g = lerp( 88, 155, elev)|0;
            b = lerp( 72, 130, elev)|0;
          }
          // Polar ice
          if (pole > 0.3) { const t=sm(0.3,0.9,pole); r=lerp(r,230,t)|0; g=lerp(g,238,t)|0; b=lerp(b,255,t)|0; }
          // Shallow sea (coast glow)
          if (!isLand && h > 0.38) { const sh=sm(0.38,0.48,h); g=lerp(g,g+20,sh)|0; b=lerp(b,b-10,sh)|0; }

        } else if (type === 'scadrial') {
          // Ash world: dark brown-grey, no water
          const h = fbm(u*4+sd, v*4, 5, sd);
          const ash = fbm(u*8+sd*3, v*8, 3, sd);
          // Base: dark ashen brown
          r = lerp(55, 100, h)|0;
          g = lerp(42,  78, h)|0;
          b = lerp(28,  55, h)|0;
          // Ash rivers/deposits
          r = lerp(r, 25, ash*0.4)|0;
          g = lerp(g, 18, ash*0.4)|0;
          b = lerp(g, 12, ash*0.4)|0;
          // Metallic glints (feruquimia deposits)
          if (ash > 0.68) { const t=sm(0.68,0.78,ash)*0.6; r=lerp(r,160,t)|0; g=lerp(g,130,t)|0; b=lerp(b,80,t)|0; }

        } else if (type === 'sel') {
          // Green world with ocean
          const h = fbm(u*3+sd, v*3, 6, sd);
          if (h < 0.45) {
            // Ocean
            const dep = sm(0,0.45,h);
            r = lerp(15,40,dep)|0; g = lerp(60,120,dep)|0; b = lerp(130,180,dep)|0;
          } else {
            // Lush green land
            const elev = sm(0.45,0.85,h);
            r = lerp(55,130,elev)|0; g = lerp(110,160,elev)|0; b = lerp(40,80,elev)|0;
          }
          // Elantris glow region (small bright spot) - northeast area
          const ex = Math.abs(u-0.62), ey = Math.abs(v-0.38);
          const eDist = Math.sqrt(ex*ex+ey*ey);
          if (eDist < 0.06) { const t=sm(0.06,0.01,eDist); r=lerp(r,220,t*0.4)|0; g=lerp(g,200,t*0.4)|0; b=lerp(b,180,t*0.4)|0; }

        } else if (type === 'nalthis') {
          // Colorful world — warm tropical
          const h = fbm(u*3.5+sd, v*3.5, 5, sd);
          if (h < 0.44) {
            const dep = sm(0,0.44,h);
            r = lerp(20,60,dep)|0; g = lerp(90,140,dep)|0; b = lerp(140,190,dep)|0;
          } else {
            const elev = sm(0.44,0.82,h);
            // Rich orange-red tropical land with patches of green
            const veg = fbm(u*7+sd*2, v*7, 3, sd+5);
            r = lerp(170,220,elev)|0; g = lerp(80,110,elev)|0; b = lerp(30,55,elev)|0;
            // Vegetation patches
            r = lerp(r,60,veg*0.3)|0; g = lerp(g,130,veg*0.3)|0; b = lerp(b,40,veg*0.25)|0;
          }

        } else if (type === 'taldain') {
          // Tidally locked: bright day side, dark night side
          // u=0.5 is the terminator
          const dayFactor = sm(0.45,0.55,u); // 0=day, 1=night
          const h = fbm(u*5+sd, v*5, 5, sd);
          // Dayside: bright white sand desert
          const sandR = lerp(220, 255, h), sandG = lerp(195, 230, h), sandB = lerp(130, 170, h);
          // Nightside: near-black
          const nightR = lerp(5,15,h), nightG = lerp(5,12,h), nightB = lerp(8,18,h);
          // Terminator glow (thin orange band)
          const termDist = Math.abs(u - 0.5);
          const termGlow = sm(0.08,0.0,termDist);
          r = lerp(sandR, nightR, dayFactor)|0; g = lerp(sandG, nightG, dayFactor)|0; b = lerp(sandB, nightB, dayFactor)|0;
          r = lerp(r, 230, termGlow*0.8)|0; g = lerp(g, 140, termGlow*0.8)|0; b = lerp(b, 40, termGlow*0.6)|0;
          // Dune patterns on day side
          if (u < 0.48) { const dune=sm(0.6,1.0,fbm(u*12,v*12,2,sd+9))*0.12*(1-dayFactor); r=Math.min(255,r+dune*40|0); g=Math.min(255,g+dune*30|0); }

        } else if (type === 'lumar') {
          // Ether spore seas — alien purple/green/crimson
          const h = fbm(u*4+sd, v*4, 6, sd);
          const sporeType = fbm(u*2+sd*3, v*2, 3, sd+11);
          // Spore sea base
          if (h < 0.52) {
            // Different ether colors based on sporeType
            if (sporeType < 0.33) { // Emerald
              r = lerp(10,40,h)|0; g = lerp(80,150,h)|0; b = lerp(40,90,h)|0;
            } else if (sporeType < 0.66) { // Crimson
              r = lerp(100,170,h)|0; g = lerp(10,35,h)|0; b = lerp(20,50,h)|0;
            } else { // Cobalt/violet
              r = lerp(30,70,h)|0; g = lerp(20,55,h)|0; b = lerp(120,180,h)|0;
            }
            // Iridescent shimmer
            const shimmer = n2(u*20,v*20,sd)*0.15;
            r=Math.min(255,r+shimmer*60|0); g=Math.min(255,g+shimmer*80|0); b=Math.min(255,b+shimmer*100|0);
          } else {
            // Islands — rocky dark
            const elev = sm(0.52,0.85,h);
            r = lerp(55,90,elev)|0; g = lerp(48,75,elev)|0; b = lerp(62,95,elev)|0;
          }

        } else if (type === 'komashi') {
          // Spirit energy world — very dark with lava veins
          const h = fbm(u*5+sd, v*5, 6, sd);
          const lava = fbm(u*8+sd*2, v*8, 4, sd+3);
          // Very dark base (rock)
          r = lerp(12,40,h)|0; g = lerp(8,25,h)|0; b = lerp(10,20,h)|0;
          // Lava/spirit energy veins
          if (lava > 0.6) {
            const t = sm(0.6,0.82,lava);
            r = lerp(r,255,t)|0; g = lerp(g,100,t*0.6)|0; b = lerp(b,20,t*0.3)|0;
          }
          // Spirit glow spots (yoki-hijo)
          const spirit = n2(u*15,v*15,sd+7);
          if (spirit > 0.82) { const t=sm(0.82,0.95,spirit); r=lerp(r,230,t)|0; g=lerp(g,180,t*0.8)|0; b=lerp(b,255,t*0.6)|0; }

        } else if (type === 'canticle') {
          // Hot desert world — brilliant white/orange
          const h = fbm(u*4+sd, v*4, 5, sd);
          const rock = fbm(u*9+sd*4, v*9, 3, sd+6);
          // Base: bright white sand
          r = lerp(220,255,h)|0; g = lerp(190,235,h)|0; b = lerp(140,190,h)|0;
          // Rock formations (darker orange-red)
          if (rock > 0.58) { const t=sm(0.58,0.78,rock); r=lerp(r,200,t)|0; g=lerp(g,100,t)|0; b=lerp(b,60,t)|0; }
          // Sunheart crystals (small bright red-orange spots)
          const crystal = n2(u*22,v*22,sd+8);
          if (crystal > 0.88) { const t=sm(0.88,0.96,crystal); r=Math.min(255,lerp(r,255,t))|0; g=lerp(g,80,t*0.8)|0; b=lerp(b,0,t)|0; }
          // Eternal bright heat — slight bloom at center
          const cx=u-0.5, cy=v-0.5, cd=Math.sqrt(cx*cx+cy*cy);
          const bloom = sm(0.5,0.0,cd)*0.12;
          r=Math.min(255,r+bloom*50|0); g=Math.min(255,g+bloom*30|0);

        } else if (type === 'gas') {
          // Gas giant / abandoned world
          const h = fbm(u*3+sd, v*12, 4, sd); // horizontal bands
          r = lerp(160,210,h)|0; g = lerp(130,180,h)|0; b = lerp(60,100,h)|0;

        } else if (type === 'hellworld') {
          // Braize — crimson frozen hell
          const h = fbm(u*5+sd, v*5, 6, sd);
          const crack = fbm(u*12+sd*2, v*12, 3, sd+4);
          r = lerp(80,160,h)|0; g = lerp(8,30,h)|0; b = lerp(8,25,h)|0;
          if (crack > 0.65) { const t=sm(0.65,0.8,crack); r=lerp(r,220,t)|0; g=lerp(g,60,t)|0; b=lerp(b,0,t*0.5)|0; }

        } else {
          r=100; g=100; b=100;
        }

        d[idx]=Math.min(255,r); d[idx+1]=Math.min(255,g); d[idx+2]=Math.min(255,b); d[idx+3]=255;
      }
    }

    ctx.putImageData(img, 0, 0);

    // Specular highlight (light source sim) — draw over pixels
    const rg = ctx.createRadialGradient(S*0.38, S*0.3, 0, S*0.38, S*0.3, S*0.6);
    rg.addColorStop(0, 'rgba(255,255,255,0.12)');
    rg.addColorStop(0.5,'rgba(255,255,255,0.04)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, S, S);

    return new THREE.CanvasTexture(cv);
  }

  // ── Cloud Texture ─────────────────────────────────────────
  function makeCloudTex(seed, dark) {
    const S = 256;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(S, S);
    const d = img.data;
    for (let py=0;py<S;py++) {
      for (let px=0;px<S;px++) {
        const idx=(py*S+px)*4;
        const u=px/S, v=py/S;
        const n = fbm(u*5+(seed||0), v*5, 5, seed||0);
        const cloud = Math.max(0, n - 0.42) / 0.58;
        const lat = sm(0,0.05,v)*sm(1,0.95,v);
        const a = (cloud * lat * (dark ? 160 : 210)) | 0;
        d[idx]   = dark ? 30 : 240;
        d[idx+1] = dark ? 20 : 240;
        d[idx+2] = dark ? 10 : 245;
        d[idx+3] = a;
      }
    }
    ctx.putImageData(img, 0, 0);
    return new THREE.CanvasTexture(cv);
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    const canvas = document.getElementById('cosmos-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x010306, 1);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010306, 0.007);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.01, 600);
    camera.position.copy(CAM_POS);
    camera.lookAt(CAM_LOOK);

    clock = new THREE.Clock();

    scene.add(new THREE.AmbientLight(0x111827, 2.5));
    const sun = new THREE.DirectionalLight(0xffffff, 3.5);
    sun.position.set(5,3,5); scene.add(sun);

    buildStarfield();
    buildNebulae();
    buildMarkers();

    window.addEventListener('resize', ()=>{
      camera.aspect=window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth,window.innerHeight);
    });

    animate();
    window.CosmereScene = { flyToSystem, flyBack, getState:()=>state };
    document.dispatchEvent(new CustomEvent('cosmere:ready'));
    emitPositions();
  }

  // ── Starfield ─────────────────────────────────────────────
  function buildStarfield() {
    const pos=new Float32Array(STAR_COUNT*3), sz=new Float32Array(STAR_COUNT);
    const br=new Float32Array(STAR_COUNT), col=new Float32Array(STAR_COUNT*3);
    for(let i=0;i<STAR_COUNT;i++){
      const th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1), r=45+Math.random()*200;
      pos[i*3]=r*Math.sin(ph)*Math.cos(th); pos[i*3+1]=r*Math.sin(ph)*Math.sin(th)*.2; pos[i*3+2]=r*Math.cos(ph);
      sz[i]=0.4+Math.random()*2; br[i]=0.3+Math.random()*0.7;
      const w=Math.random(); col[i*3]=.82+w*.18; col[i*3+1]=.86+w*.08; col[i*3+2]=1;
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geo.setAttribute('aSize',new THREE.BufferAttribute(sz,1));
    geo.setAttribute('aBright',new THREE.BufferAttribute(br,1));
    geo.setAttribute('aColor',new THREE.BufferAttribute(col,3));
    starPoints=new THREE.Points(geo,new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:STAR_VERT,fragmentShader:STAR_FRAG,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    scene.add(starPoints);
  }

  // ── Nebulae ───────────────────────────────────────────────
  function buildNebulae() {
    const g=new THREE.Group();
    [{p:[-22,3,-35],s:55,c:0x1a0f55,o:.22},{p:[28,-6,-25],s:48,c:0x2a0520,o:.18},{p:[-12,4,22],s:52,c:0x051828,o:.20},{p:[8,-3,-55],s:70,c:0x100838,o:.15},{p:[0,6,-8],s:65,c:0x0d1530,o:.12}].forEach(cfg=>{
      for(let i=0;i<5;i++){
        const m=new THREE.Mesh(new THREE.PlaneGeometry(cfg.s+Math.random()*25,cfg.s*.65+Math.random()*18),new THREE.MeshBasicMaterial({color:cfg.c,transparent:true,opacity:cfg.o*(.5+Math.random()*.5),blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
        m.position.set(cfg.p[0]+(Math.random()-.5)*18,cfg.p[1]+(Math.random()-.5)*10,cfg.p[2]+(Math.random()-.5)*12);
        m.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
        g.add(m);
      }
    });
    scene.add(g);
  }

  // ── Markers ───────────────────────────────────────────────
  function buildMarkers() {
    const sys=COSMERE_DATA.systems, N=sys.length;
    const pos=new Float32Array(N*3), sz=new Float32Array(N), col=new Float32Array(N*3);
    sys.forEach((s,i)=>{
      pos[i*3]=s.galacticPos.x; pos[i*3+1]=s.galacticPos.y; pos[i*3+2]=s.galacticPos.z;
      sz[i]=22;
      const c=new THREE.Color(s.color); col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
      markerData.push({id:s.id,pos:new THREE.Vector3(s.galacticPos.x,s.galacticPos.y,s.galacticPos.z)});
    });
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geo.setAttribute('aSize',new THREE.BufferAttribute(sz,1));
    geo.setAttribute('aColor',new THREE.BufferAttribute(col,3));
    markerMesh=new THREE.Points(geo,new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:MKR_VERT,fragmentShader:MKR_FRAG,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    scene.add(markerMesh);
  }

  // ── Screen projection ──────────────────────────────────────
  function project(wp) {
    const v=wp.clone().project(camera);
    return {x:(v.x*.5+.5)*window.innerWidth, y:(-v.y*.5+.5)*window.innerHeight, behind:v.z>=1};
  }
  function emitPositions() {
    if (!camera||!markerData.length) return;
    document.dispatchEvent(new CustomEvent('cosmere:markerPositions',{detail:markerData.map(md=>({id:md.id,...project(md.pos)}))}));
  }

  // ── Build System ──────────────────────────────────────────
  function buildSystem(systemId) {
    const sys=COSMERE_DATA.systems.find(s=>s.id===systemId);
    if (!sys) return;
    planets=[]; stormMeshes=[]; cloudMeshes=[];
    planetGroup=new THREE.Group();
    planetGroup.position.set(sys.galacticPos.x,sys.galacticPos.y,sys.galacticPos.z);

    // Star
    planetGroup.add(new THREE.Mesh(new THREE.SphereGeometry(.55,32,32),new THREE.MeshBasicMaterial({color:sys.glowHex})));
    planetGroup.add(new THREE.Mesh(new THREE.SphereGeometry(.92,32,32),new THREE.MeshBasicMaterial({color:sys.glowHex,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.BackSide})));

    // Unique seed per system for deterministic textures
    const sysSeed = sys.id.split('').reduce((a,c)=>a+c.charCodeAt(0),0);

    sys.planets.forEach((pd, pi) => {
      // Orbit ring
      const ring=new THREE.Mesh(
        new THREE.RingGeometry(pd.orbitRadius-.012,pd.orbitRadius+.012,96),
        new THREE.MeshBasicMaterial({color:0x2a3850,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false})
      );
      ring.rotation.x=Math.PI/2;
      planetGroup.add(ring);

      // Pivot
      const pivot=new THREE.Object3D();
      pivot.rotation.y=Math.random()*Math.PI*2;
      pivot.userData.orbitSpeed=pd.orbitSpeed;
      planetGroup.add(pivot);

      // Planet mesh
      const tex=makeTex(pd.type, sysSeed + pi*100);
      const planet=new THREE.Mesh(
        new THREE.SphereGeometry(pd.radius,64,64),
        new THREE.MeshPhongMaterial({map:tex,shininess:pd.type==='roshar'?25:12,specular:new THREE.Color(pd.type==='roshar'?0x334466:0x1a1a1a)})
      );
      planet.position.x=pd.orbitRadius;
      planet.rotation.z=THREE.MathUtils.degToRad(pd.tilt||0);
      planet.userData.spinSpeed=.2+Math.random()*.3;
      pivot.add(planet);

      // Atmosphere rim
      if (pd.hasAtmosphere) {
        const aC=new THREE.Color(pd.atmosphereColor||'#4488ff');
        planet.add(new THREE.Mesh(
          new THREE.SphereGeometry(pd.radius*1.18,48,48),
          new THREE.ShaderMaterial({uniforms:{uColor:{value:aC}},vertexShader:ATMO_VERT,fragmentShader:ATMO_FRAG,transparent:true,blending:THREE.AdditiveBlending,side:THREE.FrontSide,depthWrite:false})
        ));
      }

      // ── HIGHSTORM SHADER (Roshar only) ──
      if (pd.hasStorm) {
        const stormMat=new THREE.ShaderMaterial({
          uniforms:{uTime:{value:0},uFront:{value:0.0}},
          vertexShader:STORM_VERT,
          fragmentShader:STORM_FRAG,
          transparent:true,
          blending:THREE.AdditiveBlending,
          depthWrite:false,
          side:THREE.FrontSide,
        });
        const stormMesh=new THREE.Mesh(new THREE.SphereGeometry(pd.radius*1.012,64,64),stormMat);
        planet.add(stormMesh);
        stormMeshes.push(stormMesh);
      }

      // ── CLOUD LAYER ──
      if (pd.hasClouds) {
        const cloudTex=makeCloudTex(sysSeed+pi*37, pd.cloudColor==='dark');
        const cloudMat=new THREE.ShaderMaterial({
          uniforms:{uTex:{value:cloudTex},uColor:{value:new THREE.Color(pd.cloudColor||0xffffff)}},
          vertexShader:CLOUD_VERT,
          fragmentShader:CLOUD_FRAG,
          transparent:true,
          depthWrite:false,
          side:THREE.FrontSide,
        });
        const cloudMesh=new THREE.Mesh(new THREE.SphereGeometry(pd.radius*1.025,48,48),cloudMat);
        planet.add(cloudMesh);
        cloudMesh.userData.spinRate = pd.type==='scadrial' ? 0.05 : 0.08; // ash clouds slow, others faster
        cloudMeshes.push(cloudMesh);
      }

      // Moon
      if (pd.hasMoon) {
        const mPivot=new THREE.Object3D();
        mPivot.userData.moonSpeed=pd.moonSpeed||1.5;
        planet.userData.moonPivot=mPivot;
        planet.add(mPivot);
        const moon=new THREE.Mesh(new THREE.SphereGeometry(pd.moonRadius||.08,24,24),new THREE.MeshPhongMaterial({color:0x9a9aaa}));
        moon.position.x=pd.moonOrbit||1.0;
        mPivot.add(moon);
        planet.add(new THREE.Mesh(
          new THREE.RingGeometry((pd.moonOrbit||1)-.01,(pd.moonOrbit||1)+.01,48),
          new THREE.MeshBasicMaterial({color:0x334455,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false})
        ));
      }

      planets.push({pivot, planet});
    });

    scene.add(planetGroup);
  }

  function destroySystem() {
    if (!planetGroup) return;
    scene.remove(planetGroup);
    planetGroup.traverse(obj=>{
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material){
        if (obj.material.map) obj.material.map.dispose();
        if (obj.material.uTex && obj.material.uTex.value) obj.material.uTex.value.dispose();
        obj.material.dispose();
      }
    });
    planetGroup=null; planets=[]; stormMeshes=[]; cloudMeshes=[];
  }

  // ── Camera Tweens ─────────────────────────────────────────
  function flyToSystem(systemId) {
    if (state==='flying') return;
    const sys=COSMERE_DATA.systems.find(s=>s.id===systemId);
    if (!sys) return;
    state='flying';
    document.dispatchEvent(new CustomEvent('cosmere:stateChange',{detail:{state:'flying'}}));
    if (markerMesh) markerMesh.visible=false;
    buildSystem(systemId);

    const target=new THREE.Vector3(sys.galacticPos.x,sys.galacticPos.y,sys.galacticPos.z);
    const destCam=new THREE.Vector3(target.x+2,target.y+3,target.z+7);
    const startCam=camera.position.clone();
    const midCam=new THREE.Vector3((startCam.x+destCam.x)/2,(startCam.y+destCam.y)/2+5,(startCam.z+destCam.z)/2-2);
    const t0=performance.now(), dur=2800;

    tween=function(now){
      const t=Math.min((now-t0)/dur,1);
      const e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      const u=1-e;
      camera.position.set(u*u*startCam.x+2*u*e*midCam.x+e*e*destCam.x,u*u*startCam.y+2*u*e*midCam.y+e*e*destCam.y,u*u*startCam.z+2*u*e*midCam.z+e*e*destCam.z);
      lookAt.lerp(target,e*.1); camera.lookAt(lookAt);
      if(t>=1){tween=null;state='system';camera.position.copy(destCam);lookAt.copy(target);camera.lookAt(target);document.dispatchEvent(new CustomEvent('cosmere:stateChange',{detail:{state:'system',systemId}}));}
    };
  }

  function flyBack() {
    if (state==='flying') return;
    state='flying';
    document.dispatchEvent(new CustomEvent('cosmere:stateChange',{detail:{state:'flying'}}));
    const startCam=camera.position.clone();
    const destCam=CAM_POS.clone();
    const midCam=new THREE.Vector3((startCam.x+destCam.x)/2,(startCam.y+destCam.y)/2+6,(startCam.z+destCam.z)/2+3);
    const t0=performance.now(), dur=2500;
    tween=function(now){
      const t=Math.min((now-t0)/dur,1);
      const e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      const u=1-e;
      camera.position.set(u*u*startCam.x+2*u*e*midCam.x+e*e*destCam.x,u*u*startCam.y+2*u*e*midCam.y+e*e*destCam.y,u*u*startCam.z+2*u*e*midCam.z+e*e*destCam.z);
      lookAt.lerp(CAM_LOOK,e*.08); camera.lookAt(lookAt);
      if(t>=1){tween=null;state='galaxy';destroySystem();if(markerMesh)markerMesh.visible=true;document.dispatchEvent(new CustomEvent('cosmere:stateChange',{detail:{state:'galaxy'}}));emitPositions();}
    };
  }

  // ── Render Loop ───────────────────────────────────────────
  let lastEmit=0;
  function animate(now) {
    now=now||0;
    requestAnimationFrame(animate);
    const delta=clock.getDelta(), elapsed=clock.getElapsedTime();

    if (tween) tween(now);
    if (starPoints) starPoints.material.uniforms.uTime.value=elapsed;
    if (markerMesh) markerMesh.material.uniforms.uTime.value=elapsed;

    if (state==='galaxy'&&!tween) {
      camera.position.y=CAM_POS.y+Math.sin(elapsed*.14)*.4;
      camera.lookAt(lookAt);
    }

    if (planetGroup&&planets.length) {
      planets.forEach(({pivot,planet})=>{
        pivot.rotation.y+=pivot.userData.orbitSpeed*delta;
        planet.rotation.y+=(planet.userData.spinSpeed||.25)*delta;
        if (planet.userData.moonPivot) planet.userData.moonPivot.rotation.y+=planet.userData.moonPivot.userData.moonSpeed*delta;
      });

      // Animate storm front (Altas Tormentas sweep east→west)
      stormMeshes.forEach(m=>{
        m.material.uniforms.uTime.value=elapsed;
        // One full sweep every ~40 seconds
        m.material.uniforms.uFront.value=1.0 - ((elapsed*0.025) % 1.0);
      });

      // Rotate clouds slightly faster than planet
      cloudMeshes.forEach(m=>{
        m.rotation.y+=(m.userData.spinRate||0.08)*delta;
      });
    }

    renderer.render(scene,camera);

    if (state==='galaxy'&&now-lastEmit>48) { lastEmit=now; emitPositions(); }
  }

  // ── Boot ──────────────────────────────────────────────────
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
