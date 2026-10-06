const http=require('http');
const fs=require('fs');
const path=require('path');
const root=__dirname;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
http.createServer((req,res)=>{
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/') pathname='/index.html';
  let file=path.join(root,pathname);
  if(!file.startsWith(root)){res.writeHead(403);return res.end('Forbidden');}
  fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Not found');}
    const ext=path.extname(file).toLowerCase();
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':ext==='.html'?'no-cache':'public, max-age=3600'});
    fs.createReadStream(file).pipe(res);
  });
}).listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Market Veggies preview running'));
