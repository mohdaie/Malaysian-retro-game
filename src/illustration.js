import * as T from 'three';

// Shared three-step light ramp: geometry remains interactive in 3D while the
// surfaces read as inked colour blocks rather than polished plastic.
const ramp = new T.DataTexture(new Uint8Array([85,85,85,255, 175,175,175,255, 255,255,255,255]), 3, 1, T.RGBAFormat);
ramp.minFilter = ramp.magFilter = T.NearestFilter;
ramp.generateMipmaps = false; ramp.needsUpdate = true;
export function toon(color, options = {}) {
  const material=new T.MeshToonMaterial({ color, gradientMap: ramp, ...options });
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      // Subtle printed dots in shade, in screen space like an animation cels'
      // print layer. No fullscreen postprocessing targets on mobile.
      float inkShade=clamp(1.0-dot(reflectedLight.directDiffuse,vec3(.2126,.7152,.0722))/(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))+.001),0.0,1.0);
      vec2 inkCell=fract(gl_FragCoord.xy/5.0)-.5;
      float inkDot=1.0-smoothstep(.15,.22,length(inkCell));
      outgoingLight*=1.0-.10*inkDot*inkShade;
      #include <opaque_fragment>
    `);
  };
  material.customProgramCacheKey=()=> 'illustrated-halftone-v1';
  return material;
}
const ink = new T.ShaderMaterial({
  uniforms: { color: { value: new T.Color(0x282734) }, width: { value: .013 } },
  vertexShader: `uniform float width; void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*width,1.0);}`,
  fragmentShader: `uniform vec3 color; void main(){gl_FragColor=vec4(color,1.0);
#include <colorspace_fragment>
}`,
  side: T.BackSide
});
// Use a hull only for characters. Town ink uses batched crease lines, avoiding
// a second opaque pass over the entire scene.
export function outline(mesh) {
  const hull = new T.Mesh(mesh.geometry, ink);
  hull.position.copy(mesh.position); hull.quaternion.copy(mesh.quaternion); hull.scale.copy(mesh.scale);
  hull.userData.ink = true; mesh.parent.add(hull);
}
