const http=require('http');
const fs=require('fs');
const path=require('path');
const root=__dirname;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};

const canvaSources={
  hero:"https://export-download.canva.com/a0be0689-7d04-4636-b9c7-aa765d3af6fa/0/0001-7265950252639869776.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261006%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261006T130647Z&X-Amz-Expires=25616&X-Amz-Signature=3b4faf6757db2dbaaa5a3d4930573fc0cbdf2a40ab7dac1a0d0b54b959df3c36&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Tue%2C%2006%20Oct%202026%2020%3A13%3A43%20GMT",
  gary:"https://export-download.canva.com/55be8d56-879b-45b2-b223-163cab62fc54/0/0001-2415573455518237608.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261005%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261005T182749Z&X-Amz-Expires=92459&X-Amz-Signature=fdac8c284c17de35f58a5c37b027b8d09188379152170123555bac1dd20a264d&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Tue%2C%2006%20Oct%202026%2020%3A08%3A48%20GMT",
  book2:"https://export-download.canva.com/503af39b-2114-44c2-99c7-23252dc53a2d/0/0001-461011216681167375.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261006%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261006T020829Z&X-Amz-Expires=64505&X-Amz-Signature=0cbcd6d032bfc996e44f6c08b5744c24e48b65f3ae9b7bbeb4fcc448e36c2130&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Tue%2C%2006%20Oct%202026%2020%3A03%3A34%20GMT",
  artie:"https://export-download.canva.com/a00e24a6-b415-4f92-8c27-9d955e31a857/0/0001-7861551304593678002.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261006%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261006T033910Z&X-Amz-Expires=58643&X-Amz-Signature=75b4f53681ab5236c67ce5ef7488fa6bbb5b5b10abecebe7b0c131e9db20e808&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Tue%2C%2006%20Oct%202026%2019%3A56%3A33%20GMT",
  publishing:"https://export-download.canva.com/a054cb58-61ba-4882-9754-35406f96a753/0/0001-7095939367784001735.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261005%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261005T184641Z&X-Amz-Expires=88674&X-Amz-Signature=d757ab1c5b6c772a70697191d95464ed7657a47d8fb0694cc468308d9e883286&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Tue%2C%2006%20Oct%202026%2019%3A24%3A35%20GMT",
  walking:"https://export-download.canva.com/be325538-ea5e-46f6-9147-ecfef9fdd275/0/0001-6366356230538143709.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20261006%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261006T165524Z&X-Amz-Expires=11822&X-Amz-Signature=d1c046e18fabd0ec41ab519cb1a3732b68fdab13528f9f5b27c0da34fe464d8d&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Tue%2C%2006%20Oct%202026%2020%3A12%3A26%20GMT"
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
  const m=pathname.match(/^\/canva\/(hero|gary|book2|artie|publishing|walking)\.png$/);
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
  if(pathname==='/book1'||pathname==='/book1/') pathname='/book1.html';
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
