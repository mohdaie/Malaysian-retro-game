// Original synthesized ambience and foley, optional and fully local.
export function createSoundscape(isActive, isNight = () => false) {
  const context=new AudioContext(),master=context.createGain();master.gain.value=.22;master.connect(context.destination);
  const noise=context.createBuffer(1,context.sampleRate*4,context.sampleRate),data=noise.getChannelData(0);
  let seed=2001,last=0;
  for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;last=(last+((seed/4294967296)*2-1)*.12)/1.12;data[i]=last;}
  const wind=context.createBufferSource();wind.buffer=noise;wind.loop=true;
  const lowpass=context.createBiquadFilter();lowpass.type='lowpass';lowpass.frequency.value=600;
  const breeze=context.createGain();breeze.gain.value=.13;wind.connect(lowpass);lowpass.connect(breeze);breeze.connect(master);wind.start();
  function chirp(){
    if(context.state!=='running'||!isActive())return;
    const t=context.currentTime;
    // After dark the birds roost and the cengkerik take over.
    if(isNight()){for(let i=0;i<6;i++){const osc=context.createOscillator(),gain=context.createGain(),s=t+i*.09;osc.type='square';osc.frequency.setValueAtTime(4300,s);gain.gain.setValueAtTime(0,s);gain.gain.linearRampToValueAtTime(.008,s+.01);gain.gain.exponentialRampToValueAtTime(.0005,s+.05);osc.connect(gain);gain.connect(master);osc.start(s);osc.stop(s+.06);}return;}
    for(let i=0;i<3;i++){
      const osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.setValueAtTime(2100+i*170,t+i*.19);osc.frequency.exponentialRampToValueAtTime(3300,t+i*.19+.055);osc.frequency.exponentialRampToValueAtTime(1800,t+i*.19+.13);
      gain.gain.setValueAtTime(0,t+i*.19);gain.gain.linearRampToValueAtTime(.035,t+i*.19+.018);gain.gain.exponentialRampToValueAtTime(.001,t+i*.19+.14);osc.connect(gain);gain.connect(master);osc.start(t+i*.19);osc.stop(t+i*.19+.16);
    }
  }
  const timer=setInterval(chirp,6500);
  function click(pitch=950,volume=.13){
    if(context.state!=='running')return;
    const t=context.currentTime,osc=context.createOscillator(),gain=context.createGain();osc.type='triangle';osc.frequency.setValueAtTime(pitch,t);osc.frequency.exponentialRampToValueAtTime(pitch*.48,t+.05);gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.001,t+.06);osc.connect(gain);gain.connect(master);osc.start();osc.stop(t+.07);
  }
  let travel=0;
  function footsteps(distance){
    if(context.state!=='running')return;
    travel+=distance;if(travel<.95)return;travel%=.95;
    const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=noise;filter.type='lowpass';filter.frequency.value=1100;const t=context.currentTime;gain.gain.setValueAtTime(.38,t);gain.gain.exponentialRampToValueAtTime(.001,t+.075);source.connect(filter);filter.connect(gain);gain.connect(master);source.start(t,travel);source.stop(t+.09);
  }
  // Bicycle bell: two bright rings.
  function bell(){
    if(context.state!=='running')return;
    const t=context.currentTime;
    for(const at of [0,.16])for(const f of [2350,3520]){const osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.value=f;gain.gain.setValueAtTime(0,t+at);gain.gain.linearRampToValueAtTime(f>3000?.05:.09,t+at+.005);gain.gain.exponentialRampToValueAtTime(.001,t+at+.5);osc.connect(gain);gain.connect(master);osc.start(t+at);osc.stop(t+at+.55);}
  }
  return {context,footsteps,bell,shell:()=>click(),setVolume:(value)=>master.gain.setTargetAtTime(.22*Math.max(0,Math.min(1,value)),context.currentTime,.04),resume:()=>context.resume(),suspend:()=>context.suspend(),dispose:()=>{clearInterval(timer);context.close();}};
}
