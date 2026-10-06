const http=require('http');
const fs=require('fs');
const path=require('path');
const root=__dirname;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};

const canvaSources={
  hero:"https://export-download.canva.com/b3ec72f1-367b-436b-83df-d850da5bea2f/0/0001-6280787830297971022.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261006%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261006T050947Z&X-Amz-Expires=51565&X-Amz-Signature=0c7db2128eef696acef51e466dc0ad8b84f3b080eb00b3514094bb0af24d3dcc&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Tue%2C%2006%20Oct%202026%2019%3A29%3A12%20GMT",
  store:"https://export-download.canva.com/4eeeb7f8-77b7-4d1b-89c4-6974ad5282d9/0/0001-1654465114540709502.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261006%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261006T105751Z&X-Amz-Expires=31186&X-Amz-Signature=3d28acdb8f3708551bd90f50570ba0f649f5e60fc10ebf1f26149a787d663837&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Tue%2C%2006%20Oct%202026%2019%3A37%3A37%20GMT",
  carry:"https://export-download.canva.com/b1fa16e6-90e4-466d-b1aa-0df256ae6b48/0/0001-1825601900475021560.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261005%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261005T214958Z&X-Amz-Expires=78124&X-Amz-Signature=8cf8ccda21bd0e3703fa09d1ee2e08f203c29c30fccc7781246f3fe2c645501d&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Tue%2C%2006%20Oct%202026%2019%3A32%3A02%20GMT",
  artie:"https://export-download.canva.com/78b66846-4a0e-4ee0-b28e-384e8fdf337d/0/0001-7614979222914652524.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261006%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261006T073447Z&X-Amz-Expires=43152&X-Amz-Signature=e20e10d4a8836de520bdfbcf5a0c2da51f2db875272b33696b5984ee49b5783b&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Tue%2C%2006%20Oct%202026%2019%3A33%3A59%20GMT",
  story:"https://export-download.canva.com/6f4e4eed-40a8-4a2e-84ec-1b9605439436/0/0001-3585383453021862819.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261006%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261006T015134Z&X-Amz-Expires=62357&X-Amz-Signature=78d7968ec880392529e2486d95240afc7a63ccadf18c81327361289a1ccceb1f&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Tue%2C%2006%20Oct%202026%2019%3A10%3A51%20GMT"
};
const canvaCache=new Map();

async function getCanva(name){
  if(canvaCache.has(name)) return canvaCache.get(name);
  const src=canvaSources[name];
  if(!src) return null;
  const r=await fetch(src);
  if(!r.ok) throw new Error('Canva fetch '+r.status);
  const buf=Buffer.from(await r.arrayBuffer());
  canvaCache.set(name,buf);
  return buf;
}
async function preloadCanva(){
  await Promise.all(Object.keys(canvaSources).map(async name=>{
    try{await getCanva(name);console.log('Cached Canva asset:',name)}
    catch(e){console.error('Could not cache Canva asset',name,e.message)}
  }));
}

const server=http.createServer(async(req,res)=>{
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const m=pathname.match(/^\/canva\/(hero|store|carry|artie|story)\.png$/);
  if(m){
    try{
      const buf=await getCanva(m[1]);
      if(!buf){res.writeHead(404);return res.end('Not found');}
      res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'public, max-age=31536000, immutable'});
      return res.end(buf);
    }catch(e){
      res.writeHead(502,{'Content-Type':'text/plain; charset=utf-8'});
      return res.end('Image unavailable');
    }
  }
  if(pathname==='/') pathname='/index.html';
  let file=path.join(root,pathname);
  if(!file.startsWith(root)){res.writeHead(403);return res.end('Forbidden');}
  fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Not found');}
    const ext=path.extname(file).toLowerCase();
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':ext==='.html'?'no-cache':'public, max-age=3600'});
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(process.env.PORT||3000,'0.0.0.0',()=>{console.log('Market Veggies preview running');preloadCanva()});
