#!/usr/bin/env python3
"""Local-only Market Veggies campaign dashboard. No cloud service or subscription."""
from __future__ import annotations
import base64, binascii, json, mimetypes, os, re, secrets, threading, webbrowser
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

from mv_auto.renderer import ROOT, render
from mv_auto.queue import enqueue, conn

HOST='127.0.0.1'
PORT=8765
UPLOADS=ROOT/'assets'/'uploads'
CAMPAIGNS=ROOT/'campaigns'
MAX_BYTES=17*1024*1024

PAGE='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Market Veggies · Promo Studio</title>
<style>
:root{--blue:#0b4ea2;--navy:#07316f;--gold:#ffdb00;--orange:#ff9d00;--cream:#f6f9fe}
*{box-sizing:border-box}body{margin:0;background:#f0f5ff;color:#123357;font-family:system-ui,'Segoe UI',sans-serif}header{background:linear-gradient(120deg,#07316f,#0b4ea2);color:white;padding:28px max(4vw,20px);border-bottom:6px solid var(--gold)}header h1{font-size:clamp(26px,4vw,42px);margin:0 0 6px}header p{margin:0;color:#cbe6ff}main{max-width:1230px;margin:28px auto;padding:0 20px;display:grid;grid-template-columns:1.15fr .85fr;gap:24px}article{border:1px solid #d2e2fb;border-radius:20px;background:white;box-shadow:0 8px 28px #0c306c12;padding:24px}h2{margin:0 0 18px;color:var(--navy);font-size:22px}h3{margin:18px 0 8px;font-size:15px}label{display:block;font-size:13px;font-weight:800;color:#284f7c;margin:12px 0 5px}input,textarea,select{width:100%;font:inherit;padding:12px;border:1.5px solid #bed0e7;border-radius:9px;color:#153657;background:#fff}textarea{min-height:112px}input:focus,textarea:focus,select:focus{outline:2px solid #7facff}small,.muted{color:#607b96}section.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}button{border:0;border-radius:12px;padding:13px 20px;font-weight:900;cursor:pointer;background:var(--gold);color:#123357}button.secondary{background:#e4efff}button:disabled{opacity:.55;cursor:wait}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.message{margin-top:14px;white-space:pre-wrap;padding:12px;border-radius:10px;background:#e9f5e8;display:none}.message.error{background:#ffecec}#preview{width:100%;max-height:460px;object-fit:contain;background:#0b4ea2;border-radius:12px}.previewRow{display:grid;grid-template-columns:1fr 1fr;gap:10px}video{width:100%;max-height:270px;object-fit:contain;background:#0b4ea2;border-radius:10px}a{color:#0865c1;font-weight:700}.queue{font-size:13px;padding:10px 0;border-bottom:1px solid #e4ecf6;overflow-wrap:anywhere}.choice{display:flex;gap:9px;align-items:center;margin:14px 0}.choice input{width:auto}footer{max-width:1230px;margin:auto;padding:8px 24px 30px;font-size:12px;color:#5c7797}@media(max-width:850px){main{grid-template-columns:1fr}section.two{grid-template-columns:1fr}}
</style></head><body><header><h1>Market Veggies · Promo Studio</h1><p>Create both official Book 1 video formats, review your queue, and prepare YouTube publishing — no subscription.</p></header>
<main><article><h2>Create a campaign</h2><label>Campaign name</label><input id="name" value="Monster Reading Promo"><label>Choose your original artwork</label><input id="image" type="file" accept="image/png,image/jpeg,image/webp" required><small>PNG/JPG/WebP, 15 MB maximum. Original characters only.</small>
<section class="two"><div><label>Landscape headline (yellow / orange / white)</label><input id="l1" value="Even Little"><input id="l2" value="Monsters Love"><input id="l3" value="to Read"></div><div><label>Vertical headline (yellow / orange / white)</label><input id="p1" value="Good Reads"><input id="p2" value="for Little"><input id="p3" value="Monsters"></div></section>
<label>YouTube title (landscape)</label><input id="title" value="Even Little Monsters Love to Read | Gary Saves the Market"><label>YouTube Shorts title (vertical)</label><input id="shorts" value="Good Reads for Little Monsters | Gary Saves the Market #Shorts"><label>Description</label><textarea id="description">Meet Gary the Garlic! Discover Gary Saves the Market, Book 1 of Market Veggies: Adventures of Produce.\n\nGet your copy: {url}\n\n#MarketVeggies #GarySavesTheMarket #StoryTime</textarea>
<section class="two"><div><label>Scheduled date and time (local)</label><input id="date" type="datetime-local"></div><div><label>First upload visibility</label><select id="privacy"><option value="private">Private (recommended)</option><option value="unlisted">Unlisted</option><option value="public">Public</option></select></div></section>
<label>YouTube audience classification (required before posting)</label><select id="kids"><option value="">Not decided (cannot publish)</option><option value="true">Made for kids</option><option value="false">Not made for kids</option></select><label class="choice"><input type="checkbox" id="approved"> I explicitly approve this campaign for publishing after review</label>
<div class="actions"><button id="render" onclick="submitCampaign('render')">Generate both videos</button><button class="secondary" id="queueButton" onclick="submitCampaign('queue')">Add to scheduled queue</button></div><div id="message" class="message"></div></article>
<article><h2>Preview & queue</h2><p class="muted">Approved layout, colors, standard CTA, and 10-second theme song are reused automatically.</p><div class="previewRow"><div><h3>Landscape</h3><video id="landscape" controls></video></div><div><h3>Vertical</h3><video id="portrait" controls></video></div></div><div id="downloads"></div><h2 style="margin-top:35px">Scheduled campaigns</h2><button class="secondary" onclick="refreshQueue()">Refresh queue</button><div id="jobs">Nothing queued yet.</div><h3>Publishing is not connected yet</h3><p class="muted">Google OAuth authorization and a private-upload test are required before any scheduled post can go live. The dashboard never uploads automatically.</p></article></main><footer>Runs only on your computer at 127.0.0.1. Nothing is sent to a paid generation platform. Keep OAuth files in the private folder, never GitHub.</footer>
<script>
let busy=false;const $=id=>document.getElementById(id);const base='https://marketveggies.hireberna.app/book1';
function msg(s,err=false){$('message').style.display='block';$('message').className='message'+(err?' error':'');$('message').textContent=s}
async function submitCampaign(mode){if(busy)return;const image=$('image').files[0];if(!image){msg('Choose an image first.',true);return}if(image.size>15*1024*1024){msg('Image must be 15 MB or less.',true);return}let b64;try{b64=await new Promise((resolve,reject)=>{const f=new FileReader();f.onload=()=>resolve(String(f.result).split(',')[1]);f.onerror=reject;f.readAsDataURL(image)})}catch(e){msg('Could not read image.',true);return}
const val=id=>$(id).value.trim();const lines=ids=>ids.map(val).filter(Boolean);let when=val('date');if(!when){msg('Choose a date and time (you can still render without scheduling).',true);if(mode==='render'){when=new Date(Date.now()+24*3600*1000).toISOString()}else return}else{const date=new Date(when);if(Number.isNaN(date.getTime())){msg('Invalid date.',true);return}when=date.toISOString()}
const data={name:val('name'),artwork_data:b64,artwork_name:image.name,publish_at:when,approved_for_posting:$('approved').checked,headlines:{landscape:lines(['l1','l2','l3']),portrait:lines(['p1','p2','p3'])},url:base,youtube:{title:val('title'),shorts_title:val('shorts'),description:val('description'),tags:['Market Veggies','Gary Saves the Market'],category_id:27,privacy:val('privacy'),made_for_kids:val('kids')===''?null:val('kids')==='true'}};
if(mode==='queue' && data.approved_for_posting && data.youtube.made_for_kids===null){msg('Select the YouTube audience classification before approving a queued post.',true);return}
for(let id of ['render','queueButton'])$(id).disabled=true;busy=true;msg(mode==='render'?'Rendering both videos. This may take a few minutes...':'Saving to the queue...');
try{const r=await fetch('/api/'+mode,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const j=await r.json();if(!r.ok)throw new Error(j.error||'Unknown problem');msg(j.message);if(j.videos){for(let f of ['landscape','portrait']){$(f).src=j.videos[f]+'?t='+Date.now();$('downloads').innerHTML='<p><a href="'+j.videos.landscape+'" download>Download landscape MP4</a> · <a href="'+j.videos.portrait+'" download>Download vertical MP4</a></p>'}}refreshQueue()}catch(e){msg(String(e),true)}finally{busy=false;for(let id of ['render','queueButton'])$(id).disabled=false}}
async function refreshQueue(){try{const r=await fetch('/api/queue');const rows=await r.json();$('jobs').replaceChildren();if(!rows.length){$('jobs').textContent='Nothing queued yet.';return}for(const j of rows){const el=document.createElement('div');el.className='queue';el.textContent=j.id+' · '+j.orientation+' · '+j.state+' · '+j.scheduled_at+((j.error)?' · '+j.error:'');$('jobs').appendChild(el)}}catch(e){$('jobs').textContent='Could not load queue.'}}
refreshQueue();
</script></body></html>'''

class Handler(BaseHTTPRequestHandler):
    def respond(self,code,obj):
        data=json.dumps(obj).encode('utf-8')
        self.send_response(code); self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
    def do_GET(self):
        url=urlsplit(self.path).path
        if url=='/':
            b=PAGE.encode('utf-8');self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(b)));self.end_headers();self.wfile.write(b);return
        if url=='/api/queue':
            with conn() as db:rows=db.execute('SELECT id,platform,orientation,state,scheduled_at,post_url,error FROM jobs ORDER BY scheduled_at DESC LIMIT 80').fetchall()
            return self.respond(200,[dict(zip(('id','platform','orientation','state','scheduled_at','post_url','error'),r)) for r in rows])
        if url.startswith('/videos/'):
            name=unquote(url[8:]);p=ROOT/'outputs'/name
            if name!=Path(name).name or p.suffix!='.mp4' or not p.is_file():return self.respond(404,{'error':'Not found'})
            self.send_response(200);self.send_header('Content-Type','video/mp4');self.send_header('Content-Length',str(p.stat().st_size));self.send_header('Cache-Control','no-store');self.end_headers();
            with p.open('rb') as f:
                while c:=f.read(512*1024):self.wfile.write(c)
            return
        self.respond(404,{'error':'Not found'})
    def do_POST(self):
        endpoint=urlsplit(self.path).path
        if endpoint not in ('/api/render','/api/queue'):return self.respond(404,{'error':'Not found'})
        if int(self.headers.get('Content-Length',0))>MAX_BYTES:return self.respond(413,{'error':'Request too large'})
        if self.headers.get('Content-Type','').split(';')[0]!='application/json':return self.respond(415,{'error':'Send JSON'})
        try:
            req=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
            raw=base64.b64decode(req['artwork_data'],validate=True)
            if len(raw)>15*1024*1024:raise ValueError('Artwork exceeds 15 MB')
            ext=Path(req.get('artwork_name','')).suffix.lower()
            if ext not in ('.jpg','.jpeg','.png','.webp'):raise ValueError('Use a PNG, JPG or WebP artwork')
            # PIL validates the actual image bytes; do not trust the file extension.
            from PIL import Image
            import io
            im=Image.open(io.BytesIO(raw));im.verify()
            UPLOADS.mkdir(parents=True,exist_ok=True);CAMPAIGNS.mkdir(parents=True,exist_ok=True)
            uid=secrets.token_hex(5);out=UPLOADS/f'{uid}{ext}';out.write_bytes(raw)
            name=re.sub('[^a-z0-9_-]+','_',str(req.get('name','promo')).lower()).strip('_')[:45] or 'promo'
            campaign={k:req[k] for k in ('headlines','publish_at','approved_for_posting','youtube','url')}
            campaign.update({'id':f'{name}_{uid}','artwork':str(out)})
            path=CAMPAIGNS/f"{campaign['id']}.json";path.write_text(json.dumps(campaign,indent=2),encoding='utf-8')
            if endpoint=='/api/queue':
                enqueue(path)
                return self.respond(200,{'message':'Campaign queued successfully. It will NOT publish until your YouTube OAuth connection and scheduler are configured.'})
            videos=render(campaign,path.parent,ROOT/'outputs')
            return self.respond(200,{'message':'Both videos rendered. Review before queuing or posting.', 'videos':{k:'/videos/'+Path(v).name for k,v in videos.items()}})
        except (ValueError,KeyError,binascii.Error) as ex:self.respond(400,{'error':str(ex)})
        except Exception as ex:self.respond(500,{'error':str(ex)})
    def log_message(self,fmt,*args):
        if args and str(args[1] if len(args)>1 else '').startswith('2'):return
        super().log_message(fmt,*args)

if __name__=='__main__':
    print(f'Market Veggies Promo Studio running at http://{HOST}:{PORT}')
    print('Close the window / Ctrl+C to stop. No videos are published automatically.')
    server=ThreadingHTTPServer((HOST,PORT),Handler)
    threading.Timer(0.8,lambda:webbrowser.open(f'http://{HOST}:{PORT}')).start()
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()