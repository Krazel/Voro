"""Inspect alpha only; write crop/registration metadata, never edit artwork."""
from pathlib import Path
from PIL import Image
import json

root=Path(__file__).resolve().parents[1]
folder=root/'public/inhabitants/city-perspective'
result=[]
for path in sorted(folder.glob('*.png')):
 id=path.stem
 human=id in ['city-0','city-1','city-2','city-3'] or 'civilian' in id
 prop='matter' in id
 kind='prop' if prop else 'human' if human else 'rotor' if id=='city-9' else 'vehicle'
 im=Image.open(path).convert('RGBA');w,h=im.size
 alpha=im.getchannel('A')
 assert alpha.getextrema()[0]==0, f'{id}: requires real transparent background'
 cols,rows=(1,1) if prop else (4,2) if human else (2,2)
 xs=[round(w*i/cols) for i in range(cols+1)]
 if id=='city-3': xs=[0,445,765,1135,w]
 if id=='city-civilian-2': xs=[0,430,768,1138,w]
 if id in ['city-4','city-5','city-6','city-7','city-8']: xs=[0,790,w]
 if id=='city-9': xs=[0,760,w]
 frames=[]
 ys=[0,490,h] if human else [round(h*i/rows) for i in range(rows+1)]
 for row in range(rows):
  for col in range(cols):
   l,t,r,b=xs[col],ys[row],xs[col+1],ys[row+1]
   mask=alpha.crop((l,t,r,b)).point(lambda v:255 if v>96 else 0)
   bb=mask.getbbox()
   assert bb, f'{id}: empty frame {row}/{col}'
   x0,y0,x1,y1=bb
   # Keep antialiased silhouette pixels within each assigned frame.
   x0=max(0,x0-3);y0=max(0,y0-3);x1=min(r-l,x1+3);y1=min(b-t,y1+3)
   crop=[l+x0,t+y0,x1-x0,y1-y0]
   frames.append({'direction':col if cols==4 else row*cols+col,'pose':row if cols==4 else 0,'crop':crop})
 refh=max(f['crop'][3] for f in frames)
 span=max(max(f['crop'][2:]) for f in frames)
 for f in frames:
  fw,fh=f['crop'][2:]
  anchorx=fw/2
  if human:
   x,y,_,_=f['crop']
   head=alpha.crop((x,y,x+fw,y+round(fh*.22))).point(lambda v:255 if v>64 else 0).getbbox()
   if head:anchorx=(head[0]+head[2])/2
  f['anchor']=[round(anchorx,2),round(refh/2 if human else fh/2,2)]
  if kind=='rotor':
   hubs=[(454,220),(971,233),(455,835),(974,773)]
   hx,hy=hubs[f['direction']]
   f['rotor']=[hx-f['crop'][0],hy-f['crop'][1],235,128]
   if f['direction']==2:f['flipX']=True
 result.append({'id':id,'kind':kind,'size':[w,h],'referenceHeight':refh,'referenceSpan':span,'frames':frames})
# Authored source crops remain reproducible; preserve subsequently baked walks.
for i, a in enumerate(result):
 baked=root/'design/city-walk-2026-10-01'/f"{a['id']}.json"
 if a['kind']=='human' and baked.exists(): result[i]=json.loads(baked.read_text(encoding='utf-8'))
(root/'app/city-perspective-art.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'assets':len(result),'frames':sum(len(a['frames']) for a in result),'decodedMiB':round(sum(a['size'][0]*a['size'][1]*4 for a in result)/1048576,2)}))
