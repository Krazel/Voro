import { useEffect, useRef } from 'react';

// One textured quad. Only the artwork moves; accessible controls stay in the DOM.
export function LivingMenuArt({ journey }: { journey: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
    if (!gl) return;
    let frame = 0, disposed = false, ready = false, last = -100, time = 0;
    const vertex = gl.createShader(gl.VERTEX_SHADER)!;
    const fragment = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(vertex, 'attribute vec2 p; varying vec2 uv; void main(){uv=vec2((p.x+1.)*.5,(1.-p.y)*.5);gl_Position=vec4(p,0.,1.);}');
    gl.shaderSource(fragment, `precision mediump float;
      varying vec2 uv; uniform sampler2D art; uniform float t; uniform float journey;
      void main(){
        vec2 q=uv;
        float bottom=mix(.69,.79,journey);
        float panel=smoothstep(.18,.24,q.y)*(1.-smoothstep(bottom-.035,bottom,q.y));
        float edges=smoothstep(.18,.36,abs(q.x-.5));
        float button=smoothstep(mix(.77,.82,journey),mix(.80,.85,journey),q.y)
          *(1.-smoothstep(mix(.90,.95,journey),mix(.93,.98,journey),q.y))
          *smoothstep(.19,.27,q.x)*(1.-smoothstep(.73,.81,q.x));
        float side=panel*edges;
        q.x+=side*(sin(q.y*23.+t*.32)*.006+sin(q.y*41.-t*.21)*.0025);
        q.y+=panel*(sin(q.x*19.-t*.27)*.0025+cos(q.x*31.+t*.19)*.0015);
        q.x+=button*sin(q.y*35.+t*.30)*.004;
        q.y+=button*(sin(q.x*24.+t*.35)*.004+cos(q.x*39.-t*.22)*.0015);
        gl_FragColor=texture2D(art,clamp(q,0.,1.));
      }`);
    gl.compileShader(vertex); gl.compileShader(fragment);
    const program = gl.createProgram()!;
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment); return; }
    gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    const clock=gl.getUniformLocation(program,'t'); gl.uniform1f(gl.getUniformLocation(program,'journey'),journey?1:0);
    function draw(now:number){
      frame=0;
      if(disposed || document.hidden || reduced.matches || !ready) return;
      if(now-last>=1000/30){
        time+=last<0?0:Math.min((now-last)/1000,.1); last=now;
        const width=Math.min(941,Math.max(1,Math.round(canvas!.clientWidth* Math.min(devicePixelRatio,1.5))));
        const height=Math.round(width*1672/941);
        if(canvas!.width!==width || canvas!.height!==height){canvas!.width=width;canvas!.height=height;gl!.viewport(0,0,width,height);}
        gl!.uniform1f(clock,time * 7);gl!.drawArrays(gl!.TRIANGLE_STRIP,0,4);canvas!.style.opacity='1';
      }
      frame=requestAnimationFrame(draw);
    }
    function resume(){cancelAnimationFrame(frame);last=-100;canvas!.style.opacity=reduced.matches?'0':canvas!.style.opacity;if(!document.hidden&&!reduced.matches&&ready)frame=requestAnimationFrame(draw);}
    const picture=new Image();
    picture.onload=()=>{if(disposed)return;gl!.bindTexture(gl!.TEXTURE_2D,texture);gl!.texImage2D(gl!.TEXTURE_2D,0,gl!.RGBA,gl!.RGBA,gl!.UNSIGNED_BYTE,picture);ready=true;resume();};
    picture.src=journey?'/ui/approved/journey-plate.png':'/ui/approved/settings-plate.png';
    function lost(event:Event){event.preventDefault();ready=false;cancelAnimationFrame(frame);canvas!.style.opacity='0';}
    canvas.addEventListener('webglcontextlost',lost); document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
    return()=>{disposed=true;cancelAnimationFrame(frame);canvas.style.opacity='0';canvas.removeEventListener('webglcontextlost',lost);document.removeEventListener('visibilitychange',resume);reduced.removeEventListener('change',resume);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);};
  },[journey]);
  return <canvas ref={ref} className="living-menu-art" aria-hidden="true" />;
}
