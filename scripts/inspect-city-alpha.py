import sys,json
from PIL import Image
for p in sys.argv[1:]:
 im=Image.open(p).convert('RGBA');a=im.getchannel('A')
 print(json.dumps({'path':p,'size':im.size,'alpha':a.getextrema(),'bbox':a.point(lambda v:255 if v>32 else 0).getbbox()}))
