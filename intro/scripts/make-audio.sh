#!/usr/bin/env bash
# Rebuilds every audio file the intro composition plays. Run from intro/.
# Needs ffmpeg. Sources: Scene 1's own rain ambience and the game's soundtrack.
set -euo pipefail
out=assets/audio
mkdir -p "$out"
q() { ffmpeg -v error -y "$@"; }

# Rain: Scene 1's steady ambience (1–19 s), looped with a 3 s crossfade to cover
# the continuation, so the room sounds the same after the cut.
q -ss 1 -t 18 -i assets/video/scene-1.mp4 -vn -ac 2 -ar 48000 "$out/.rain-a.wav"
q -i "$out/.rain-a.wav" -i "$out/.rain-a.wav" -i "$out/.rain-a.wav" \
  -filter_complex "[0][1]acrossfade=d=3[ab];[ab][2]acrossfade=d=3,atrim=0:36" -c:a aac -b:a 160k "$out/rain-bed.m4a"
rm "$out/.rain-a.wav"

# Memory bed: the game's own theme. The intro plays its opening ~31 s.
q -t 32 -i ../assets/audio/sore-kampung-loop.mp3 -ac 2 -ar 48000 -c:a aac -b:a 192k "$out/sore-kampung-intro.m4a"

# Raise phone: soft cloth swish.
q -f lavfi -i "anoisesrc=d=0.9:c=pink:a=0.5:seed=7" \
  -af "highpass=f=250,lowpass=f=2400,afade=t=in:d=0.35:curve=qsin,afade=t=out:st=0.4:d=0.5:curve=qsin,volume=1.6" \
  -ac 2 -ar 48000 "$out/sfx-raise.wav"

# Screen tap: short glassy tick.
q -f lavfi -i "aevalsrc='0.55*sin(2*PI*2400*t)*exp(-t*90)+0.35*sin(2*PI*1150*t)*exp(-t*60)':d=0.12:s=48000" \
  -ac 2 "$out/sfx-tap.wav"

# Swipe: airy whoosh.
q -f lavfi -i "anoisesrc=d=0.45:c=pink:a=0.6:seed=3" \
  -af "highpass=f=900,lowpass=f=6500,afade=t=in:d=0.16:curve=qsin,afade=t=out:st=0.16:d=0.29:curve=exp,volume=1.5" \
  -ac 2 -ar 48000 "$out/sfx-swipe.wav"

# Notification: two-note bell (E6 then A6).
q -f lavfi -i "aevalsrc='0.32*(sin(2*PI*1318.5*t)+0.3*sin(2*PI*2637*t))*exp(-t*7)+0.32*gte(t,0.14)*(sin(2*PI*1760*(t-0.14))+0.3*sin(2*PI*3520*(t-0.14)))*exp(-(t-0.14)*5)':d=1.4:s=48000" \
  -af "aecho=0.7:0.5:90:0.22,volume=3.5" -ac 2 "$out/sfx-notify.wav"

# Pull into the past: rising tone + swelling air, ends abruptly on the cut.
q -f lavfi -i "aevalsrc='(0.22*sin(2*PI*(180*t+700*t*t))+0.12*sin(2*PI*(360*t+1400*t*t)))*(t/0.6)^2':d=0.6:s=48000" \
  -f lavfi -i "anoisesrc=d=0.6:c=white:a=0.4:seed=11" \
  -filter_complex "[1]highpass=f=1800,afade=t=in:d=0.6:curve=exp[n];[0][n]amix=inputs=2:normalize=0,volume=0.9" \
  -ac 2 -ar 48000 "$out/sfx-pull.wav"

# Walkman play key: plastic click, motor thump, second latch click.
q -f lavfi -i "aevalsrc='0.7*sin(2*PI*85*t)*exp(-t*28)+0.5*sin(2*PI*1900*t)*exp(-t*220)+0.35*gte(t,0.07)*sin(2*PI*2600*(t-0.07))*exp(-(t-0.07)*260)':d=0.4:s=48000" \
  -ac 2 "$out/sfx-clunk.wav"

ls -la "$out"
