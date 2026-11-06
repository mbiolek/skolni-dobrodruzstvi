from PIL import Image,ImageDraw,ImageFilter
from pathlib import Path
P=Path(__file__).parent/'assets/merlin'
source=Image.open(P/'merlin-cte.gif');source.seek(0)
original=source.convert('RGBA')
# Preserve the approved front-facing Merlin; keep the whole body still.
# Only the lantern moves up briefly and grows brighter, then returns down.
mask=Image.new('L',original.size,0)
d=ImageDraw.Draw(mask)
d.polygon([(75,226),(112,223),(132,237),(143,257),(137,286),(117,317),(82,322),(60,299),(59,269)],fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(.8))
lantern=Image.new('RGBA',original.size,(0,0,0,0)); lantern.paste(original,(0,0),mask)
source.seek(5)
lit_original=source.convert('RGBA')
lit_lantern=Image.new('RGBA',original.size,(0,0,0,0)); lit_lantern.paste(lit_original,(0,0),mask)
base=original.copy()
zero=Image.new('RGBA',original.size,(0,0,0,0))
base.paste(zero,(0,0),mask)
# A short, restrained lantern lift. Long holds make Merlin feel calm, not bouncing.
steps=[(0,1400),(0,450),(6,160),(12,160),(19,160),(24,650),(24,450),(19,160),(12,160),(6,160),(0,1500)]
frames=[];dur=[]
for lift,ms in steps:
    frame=base.copy()
    shifted=Image.new('RGBA',original.size,(0,0,0,0))
    shifted.paste(Image.blend(lantern,lit_lantern,lift/24),(0,-lift))
    frame=Image.alpha_composite(frame,shifted)
    # Slight steady lantern light; preserve original pixel colors, no change to Merlin.
    frames.append(frame);dur.append(ms)
# animated WEBP retains transparency + full RGBA and works on current Chrome/Android PWA
frames[0].save(P/'merlin-lucerna-5070.webp',save_all=True,append_images=frames[1:],duration=dur,loop=0,lossless=True,method=5)
print('Created',P/'merlin-lucerna-5070.webp', (P/'merlin-lucerna-5070.webp').stat().st_size)
# static poster used with reduced motion or old browser
frames[0].save(P/'merlin-celni-5070.png')
view=Image.new('RGBA',(362*5,362),(240,240,240,255))
for i,idx in enumerate([0,2,5,8,10]):view.alpha_composite(frames[idx],(i*362,0))
view.convert('RGB').save('/mnt/data/merlin_5070_preview.jpg',quality=85)
