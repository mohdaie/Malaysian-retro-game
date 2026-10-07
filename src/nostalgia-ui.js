import { ITEMS } from './economy.js?v=2.6.0';
import { NOSTALGIA_QUESTS, nostalgiaStatus } from './nostalgia-quests.js?v=2.6.0';
import { itemThumbnail } from './item-ui.js?v=2.6.0';
export function memoryQuestCard(id, eco, { placeName, inspect, context, start, clue, claim, navigate }) {
  const q=NOSTALGIA_QUESTS[id],p=eco.nostalgia.quests[id],s=nostalgiaStatus(eco,id);
  const card=document.createElement('article');card.className='memory-quest';card.dataset.nostalgia=id;card.dataset.stage=s.stage;
  const heading=document.createElement('div');heading.className='memory-heading';
  const image=itemThumbnail(id,inspect),copy=document.createElement('div'),title=document.createElement('h3'),item=document.createElement('small');
  title.textContent=q.title;item.textContent=ITEMS[id].title;copy.append(title,item);heading.append(image,copy);card.append(heading);
  const intro=document.createElement('p');intro.textContent=q.intro;card.append(intro);
  const steps=document.createElement('ol');steps.className='memory-requirements';
  for(const label of [`${q.grind.deliveries} deliveries · ${q.grind.destinations} destinations · ${q.grind.long} long routes (60 m+)`,`${q.trail.length} story clues in order`,...q.challenges.map(c=>c.label)]){const li=document.createElement('li');li.textContent=label;steps.append(li);}card.append(steps);
  const status=document.createElement('p');status.className='memory-status';status.setAttribute('role','status');status.textContent=s.place?`Story trail ${p.trail}/${q.trail.length} · Next: ${placeName(s.place)}`:s.text;card.append(status);
  const progress=document.createElement('progress');progress.max=3;progress.setAttribute('aria-label',q.title+' progress');
  progress.value=s.stage==='locked'?0:s.stage==='grind'?Math.min(1,(Math.min(1,p.deliveries/q.grind.deliveries)+Math.min(1,p.destinations.length/q.grind.destinations)+Math.min(1,p.long/q.grind.long))/3):s.stage==='trail'?1+p.trail/q.trail.length:s.stage==='challenge'?2+q.challenges.reduce((n,c,i)=>n+Math.min((p.wins[i]||0)/c.count,c.tracks?p.tracks.length/c.tracks.length:1),0)/q.challenges.length:3;card.append(progress);
  const actions=document.createElement('div');actions.className='memory-actions';
  const button=(label,fn,primary=false)=>{const b=document.createElement('button');b.type='button';b.className=primary?'primary':'secondary';b.textContent=label;b.onclick=fn;actions.append(b);};
  const giverHere=context&&(q.npc?context.npc===q.npc:context.place===q.place&&!context.npc);
  if(!p&&giverHere)button('Begin this keepsake quest',()=>start(id),true);
  else if(!p)button(`Find ${q.giver}`,()=>navigate(q.npc?`npc:${q.npc}`:`place:${q.place}`));
  if(s.stage==='trail') {
    if(context?.place===s.place)button('Read the next story clue',()=>clue(id),true);
    else button('Follow the next clue',()=>navigate(`place:${s.place}`));
  }
  if(s.stage==='ready') {
    if(giverHere){const label=document.createElement('p');label.textContent='Choose the dedication your keepsake will remember:';card.append(label);q.choices.forEach((choice,i)=>button(choice.label,()=>claim(id,i),true));}
    else button(`Return to ${q.giver}`,()=>navigate(q.npc?`npc:${q.npc}`:`place:${q.place}`));
  }
  if(s.stage==='earned'){const e=eco.nostalgia.earned[id],memory=document.createElement('p');memory.className='memory-dedication';memory.textContent=`“${e.inscription}” — ${e.giver}, for ${e.player}, game day ${e.day}`;card.append(memory);button('Inspect my keepsake',()=>inspect(id));}
  card.append(actions);return card;
}
