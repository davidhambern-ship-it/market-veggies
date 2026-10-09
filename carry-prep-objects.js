/* Carry Kitchen Quest: independent, object-based ingredient preparation.
   The cutting board remains mounted. Only vegetable SVG objects change per cut.
   SVG primitives render locally without image swapping, networks or paid libraries. */
(function(){
  'use strict';
  const allowed=new Set(['carrot','onion','garlic','ginger','herbs']);
  const names={
    carrot:['Whole carrot on the cutting board','Carrot with first rounds cut off','Carrot partly sliced with more rounds','All carrot slices, ready for soup'],
    onion:['Whole red onion on the cutting board','First onion dice separated','More onion cubes with a smaller onion','Onion fully diced, ready for soup'],
    garlic:['Whole garlic cloves on the cutting board','Garlic partly chopped','Garlic minced into smaller pieces','Garlic finely minced, ready for soup'],
    ginger:['Fresh ginger root on the cutting board','First ginger shavings','Ginger root partly grated','Ginger fully grated, ready for soup'],
    herbs:['Fresh bunch of herbs on the cutting board','First herb leaves chopped','Herbs mostly chopped','Finely chopped herbs, ready for soup']
  };
  const clamp=n=>Math.max(0,Math.min(3,Number(n)||0));
  const shadow=(x,y,rx,ry)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#644324" opacity=".13"/>';
  const path=(d,fill,stroke,width,extra='')=>
    '<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linejoin="round" '+extra+'/>';
  const circle=(x,y,r,fill,stroke='none',w=0)=>
    '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+w+'"/>';
  const ell=(x,y,rx,ry,fill,stroke='none',w=0,extra='')=>
    '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+w+'" '+extra+'/>';
  const rotate=(i)=>[-18,13,-9,24,-26,8,19][i%7];
  function bits(kind,number,step){
    let s='';
    const n=number;
    for(let i=0;i<n;i++){
      const col=i%7,row=Math.floor(i/7);
      const x=(step===3?325:540)+col*38+(row%2?11:0);
      const y=(step===3?190:180)+row*37+((i*13)%12);
      const rot=rotate(i);
      const transform='transform="rotate('+rot+' '+x+' '+y+')"';
      if(kind==='onion'){
        s+='<g class="ck-food-piece ck-new-piece" style="--ck-delay:'+((i%7)*18)+'ms" '+transform+'>'+
          '<rect x="'+(x-14)+'" y="'+(y-12)+'" width="29" height="25" rx="6" fill="#c478cc" stroke="#94469a" stroke-width="3"/>'+
          path('M'+(x-9)+' '+(y-7)+'q7 -5 15 0','none','#f0bce9',3)+'</g>';
      }else if(kind==='garlic'){
        s+='<g class="ck-food-piece ck-new-piece" style="--ck-delay:'+((i%8)*12)+'ms" '+transform+'>'+
          '<rect x="'+(x-9)+'" y="'+(y-7)+'" width="'+(step===3?13:18)+'" height="'+(step===3?10:14)+'" rx="3" fill="#fff2cf" stroke="#c8ac73" stroke-width="2"/>'+
          path('M'+(x-6)+' '+(y-4)+'l6 -2','none','#fffdf0',2)+'</g>';
      }else if(kind==='ginger'){
        s+='<g class="ck-food-piece ck-new-piece" style="--ck-delay:'+((i%7)*15)+'ms" '+transform+'>'+
          '<rect x="'+(x-11)+'" y="'+(y-3)+'" width="'+(step===3?23:20)+'" height="6" rx="3" fill="#eec875" stroke="#ad8441" stroke-width="2"/></g>';
      }else if(kind==='herbs'){
        s+='<g class="ck-food-piece ck-new-piece" style="--ck-delay:'+((i%9)*13)+'ms" '+transform+'>'+
          path('M'+(x-13)+' '+(y+6)+'q6 -18 19 -15q10 11 -3 22z','#399747','#1e7839',2)+'</g>';
      }
    }
    return s;
  }
  function carrot(step){
    const widths=[365,268,150,0],w=widths[step];
    let whole='';
    if(w){
      const x=224,y=245;
      const leafy=
        path('M237 220 Q193 177 177 147 Q212 133 251 197Z','#41974b','#247447',5)+
        path('M232 226 Q169 210 147 176 Q191 164 247 207Z','#55b957','#2e8944',5)+
        path('M236 224 Q220 169 234 134 Q273 156 254 213Z','#65c565','#348b4c',5)+
        path('M234 242 Q174 259 154 239 Q172 206 238 218Z','#3ea84c','#2c8444',5);
      const body=
        path('M'+x+' '+(y-52)+' Q'+(x+36)+' '+(y-70)+' '+(x+w-8)+' '+(y-35)+
          ' Q'+(x+w+18)+' '+(y-7)+' '+(x+w-8)+' '+(y+26)+
          ' Q'+(x+35)+' '+(y+72)+' '+x+' '+(y+45)+' Q'+(x-18)+' '+(y+6)+' '+x+' '+(y-52)+'Z',
          'url(#ck-carrot)','#cd5e13',7)+
        path('M'+(x+30)+' '+(y-42)+' Q'+(x+w*.5)+' '+(y-54)+' '+(x+w-18)+' '+(y-25),'none','#ffbf5d',9,'opacity=".58"')+
        ell(x+w-7,y-4,12,31,'#ffb253','#e4771b',3);
      let markings='';
      for(let i=0;i<3;i++){
        const pos=x+40+(i+1)*(w-70)/4;
        markings+=path('M'+pos.toFixed(0)+' '+(y-18)+'l-8 18','none','#e3721a',5,'opacity=".55"');
      }
      whole='<g class="ck-whole-ingredient">'+shadow(365,300,w*.48,21)+leafy+body+markings+'</g>';
    }
    const numbers=[0,2,4,8][step];
    let slices='';
    for(let i=0;i<numbers;i++){
      const x=(step===3?320:615)+(i%4)*67+(Math.floor(i/4)%2?24:0);
      const y=(step===3?200:216)+Math.floor(i/4)*63+((i*13)%19);
      const rot=rotate(i);
      slices+='<g class="ck-cut-piece" style="--ck-delay:'+((i%4)*38)+'ms" transform="rotate('+rot+' '+x+' '+y+')">'+
        ell(x+2,y+7,26,20,'#975329','none',0,'opacity=".14"')+
        ell(x,y,29,22,'#e87712','#bd5510',4)+ell(x,y-2,24,18,'url(#ck-slice)','#e48a29',2)+
        ell(x,y-2,10,8,'#ffc67b','none',0,'opacity=".95"')+
        path('M'+(x-15)+' '+(y+2)+'q9 9 19 3','none','#ef9b34',2)+'</g>';
    }
    return whole+slices;
  }
  function onion(step){
    const scales=[1,.77,.51,0],scale=scales[step];
    let whole='';
    if(scale){
      whole='<g class="ck-whole-ingredient" transform="translate(310 229) scale('+scale+')">'+
        shadow(0,81,108,27)+
        path('M-110 20 Q-127 -57 -48 -92 Q-11 -121 0 -128 Q45 -117 90 -61 Q137 7 102 70 Q13 124 -94 67Z','url(#ck-onion)','#803479',8)+
        path('M-3 -121 Q-18 -142 1 -156 Q17 -144 11 -119Z','#a554a6','#803479',5)+
        path('M-78 -40 Q-49 -89 -4 -103','none','#f6adf3',7,'opacity=".65"')+
        path('M-28 -95 Q-12 -30 -24 70 M23 -103 Q12 -30 25 74 M63 -81 Q49 -29 63 56','none','#efb4e9',6,'opacity=".64"')+
        path('M-91 28 Q-4 73 96 25','none','#85377e',4,'opacity=".65"')+
        '</g>';
    }
    return whole+bits('onion',[0,5,13,25][step],step);
  }
  function garlic(step){
    const scales=[1,.78,.53,0],scale=scales[step];
    let whole='';
    if(scale){
      whole='<g class="ck-whole-ingredient" transform="translate(316 229) scale('+scale+')">'+
        shadow(0,74,100,27)+
        path('M-100 29 Q-110 -27 -69 -69 Q-36 -100 -12 -76 Q10 -110 35 -91 Q98 -58 106 21 Q79 75 20 78 Q-52 92 -100 29Z','url(#ck-garlic)','#c2a16f',7)+
        path('M-50 68 Q-77 -29 -31 -75 M2 76 Q-18 -15 16 -90 M56 56 Q42 -19 39 -82','none','#ddc99b',6)+
        path('M-22 -79 Q-23 -121 -5 -126 L12 -88Z','#e5d0a6','#c0a478',4)+
        path('M-54 -9q12 -28 30 -40','none','#fffced',8,'opacity=".56"')+
        '</g>';
    }
    return whole+bits('garlic',[0,7,18,35][step],step);
  }
  function ginger(step){
    const scales=[1,.78,.53,0],scale=scales[step];
    let whole='';
    if(scale){
      whole='<g class="ck-whole-ingredient" transform="translate(302 228) scale('+scale+')">'+
        shadow(7,76,125,29)+
        path('M-130 20 Q-146 -9 -108 -38 Q-87 -53 -61 -45 Q-57 -97 -12 -96 Q30 -96 35 -57 Q83 -90 111 -45 Q123 -25 98 4 Q149 32 115 66 Q87 91 51 68 Q18 116 -24 87 Q-43 108 -78 79 Q-130 82 -130 20Z',
          'url(#ck-ginger)','#a57541',8)+
        path('M-95 -7 Q-48 -28 1 -13 M15 -56 Q28 -25 35 6 M-50 39 Q-10 48 45 38 M68 8 Q88 32 88 52',
          'none','#f7dfab',7,'opacity=".65"')+
        path('M-65 -42l-12 -16 M38 -59l18 -14 M96 -25l21 -10','none','#ac804c',7)+
        '</g>';
    }
    return whole+bits('ginger',[0,7,17,29][step],step);
  }
  function herbs(step){
    const scale=[1,.72,.46,0][step];let whole='';
    if(scale){
      let sprigs='';
      for(let i=0;i<6;i++){
        const shift=(i-2.5)*25;
        sprigs+=path('M'+shift+' 70 Q'+(shift+9)+' 0 '+(shift+17)+' -102','none','#2c8245',5)+
          path('M'+(shift+4)+' -15 Q'+(shift-49)+' -55 '+(shift-32)+' -93 Q'+(shift+12)+' -88 '+(shift+9)+' -25Z','#4fb860','#2a8746',3)+
          path('M'+(shift+10)+' -43 Q'+(shift+58)+' -76 '+(shift+51)+' -101 Q'+(shift+9)+' -99 '+(shift+3)+' -53Z','#5cc46b','#2a8746',3)+
          path('M'+(shift+16)+' -85 Q'+(shift-5)+' -143 '+(shift+18)+' -147 Q'+(shift+45)+' -128 '+(shift+16)+' -85Z','#41a95b','#287e46',3);
      }
      whole='<g class="ck-whole-ingredient" transform="translate(308 255) scale('+scale+')">'+
        shadow(0,68,110,22)+sprigs+
        path('M-95 57 Q-16 76 85 55','none','#6aaa58',10)+
        '</g>';
    }
    return whole+bits('herbs',[0,8,18,30][step],step);
  }
  const scenes={carrot,onion,garlic,ginger,herbs};
  const defs='<defs>'+
    '<linearGradient id="ck-board-wood" x1="0" y1="0" x2=".15" y2="1">'+
      '<stop stop-color="#fbe1b2"/><stop offset=".53" stop-color="#efc58b"/><stop offset="1" stop-color="#e3ae6c"/></linearGradient>'+
    '<linearGradient id="ck-board-rim" x1="0" y1="0" x2="0" y2="1">'+
      '<stop stop-color="#c88e53"/><stop offset="1" stop-color="#95602f"/></linearGradient>'+
    '<linearGradient id="ck-carrot" x1="0" y1="0" x2=".7" y2="1">'+
      '<stop stop-color="#ffb23b"/><stop offset=".48" stop-color="#fc901c"/><stop offset="1" stop-color="#e77215"/></linearGradient>'+
    '<radialGradient id="ck-slice"><stop stop-color="#ffd18b"/><stop offset="1" stop-color="#f6a33d"/></radialGradient>'+
    '<linearGradient id="ck-onion"><stop stop-color="#edaae6"/><stop offset=".46" stop-color="#b15ab3"/><stop offset="1" stop-color="#8a378b"/></linearGradient>'+
    '<linearGradient id="ck-garlic"><stop stop-color="#fffbe8"/><stop offset=".55" stop-color="#efe0b7"/><stop offset="1" stop-color="#d1b883"/></linearGradient>'+
    '<linearGradient id="ck-ginger"><stop stop-color="#f1d49a"/><stop offset=".58" stop-color="#dab075"/><stop offset="1" stop-color="#b1854f"/></linearGradient>'+
    '<linearGradient id="ck-steel"><stop stop-color="#f8fdff"/><stop offset=".45" stop-color="#d4e4eb"/><stop offset=".7" stop-color="#eff7f9"/><stop offset="1" stop-color="#92acbd"/></linearGradient>'+
    '</defs>';
  const board='<rect x="0" y="0" width="960" height="475" fill="#f6deba"/>'+
    '<rect x="54" y="40" width="858" height="390" rx="57" fill="#906037" opacity=".18"/>'+
    '<rect x="50" y="27" width="857" height="384" rx="54" fill="url(#ck-board-rim)"/>'+
    '<rect x="66" y="41" width="824" height="350" rx="43" fill="#f7dfb9" stroke="#eac48e" stroke-width="8"/>'+
    '<rect x="87" y="63" width="781" height="305" rx="34" fill="url(#ck-board-wood)" stroke="#e7b67e" stroke-width="3"/>'+
    '<path d="M123 126 Q249 111 363 127 T651 122 T830 126 M112 192 Q242 174 388 188 T694 187 T841 195 M115 276 Q296 267 398 283 T670 281 T849 275 M133 338 Q286 330 434 337 T810 336" fill="none" stroke="#d5a368" stroke-width="4" opacity=".3"/>'+
    '<path d="M108 85 Q476 73 843 87" stroke="#ffedc9" stroke-width="9" stroke-linecap="round" fill="none" opacity=".6"/>';
  const knife='<g class="ck-live-tool ck-live-knife">'+
    '<path d="M614 93 Q666 95 745 128 L717 206 Q656 190 596 177 Q579 140 614 93Z" fill="url(#ck-steel)" stroke="#819aa8" stroke-width="6"/>'+
    '<path d="M605 168 Q659 184 717 206" stroke="#fffdf2" stroke-width="5" fill="none"/>'+
    '<path d="M721 129 Q771 124 819 155 L848 180 Q855 198 840 216 Q817 234 794 223 L708 181Z" fill="#aa6b38" stroke="#86502b" stroke-width="8"/>'+
    '<circle cx="767" cy="168" r="7" fill="#f9e4b9"/><circle cx="812" cy="189" r="7" fill="#f9e4b9"/>'+
    '</g>';
  const grater='<g class="ck-live-tool ck-live-grater">'+
    '<path d="M620 95 L762 133 L735 229 L596 193Z" fill="url(#ck-steel)" stroke="#8298a5" stroke-width="7"/>'+
    '<rect x="637" y="85" width="99" height="21" rx="9" transform="rotate(15 637 85)" fill="#af7441" stroke="#88552d" stroke-width="5"/>'+
    Array.from({length:20},(_,i)=>{
      const x=620+(i%5)*27,y=124+Math.floor(i/5)*22;
      return '<path d="M'+x+' '+y+'l10 3" stroke="#93a8b1" stroke-width="5" stroke-linecap="round"/>';
    }).join('')+'</g>';
  function render(id,hits){
    if(!allowed.has(id))return '';
    const step=clamp(hits);
    return '<div class="ck-art-board ck-live-board ck-art-'+id+' ck-art-progress-'+step+'" data-prep="'+id+'" data-step="'+step+'">'+
      '<svg class="ck-live-svg" viewBox="0 0 960 475" role="img" aria-label="'+names[id][step]+'" focusable="false">'+
      '<title>'+names[id][step]+'</title>'+
      defs+board+
      '<g class="ck-live-food">'+scenes[id](step)+'</g>'+
      (id==='ginger'?grater:knife)+
      '<g class="ck-cut-sparks" aria-hidden="true">'+
      path('M518 151 l-14 -20 M530 143 l5 -25 M541 155 l19 -12','none','#fff8bb',7)+
      '</g></svg></div>';
  }
  function update(container,id,hits){
    const step=clamp(hits);
    if(!allowed.has(id)||!container||container.dataset.prep!==id)return false;
    const svg=container.querySelector('.ck-live-svg');
    const pieces=container.querySelector('.ck-live-food');
    if(!svg||!pieces)return false;
    pieces.innerHTML=scenes[id](step);
    svg.setAttribute('aria-label',names[id][step]);
    const title=svg.querySelector('title');
    if(title)title.textContent=names[id][step];
    container.dataset.step=String(step);
    container.className='ck-art-board ck-live-board ck-art-'+id+' ck-art-progress-'+step;
    if(step){
      container.classList.remove('ck-just-cut');
      void container.offsetWidth;
      container.classList.add('ck-just-cut');
    }
    return true;
  }
  window.CarryPrepScene={render,update};
})();