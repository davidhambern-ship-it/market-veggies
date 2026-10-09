/* Market Veggies Kitchen Quest — zero-cost, vanilla JS.
   Gary's Guacamole is the first playable recipe; more stations can reuse this pattern.
   No accounts, trackers, or purchase mechanics. */
(function initKitchenQuest(){
  'use strict';
  const root=document.getElementById('kqApp');
  if(!root)return;
  const stage=document.getElementById('kqStage');
  const status=document.getElementById('kqStatus');
  const tracker=document.getElementById('kqTracker');
  const reward=document.getElementById('kqReward');
  const activity=document.getElementById('kqActivity');
  const pantry=[
    {id:'avocado',name:'Avocado',emoji:'🥑'},
    {id:'lime',name:'Lime',emoji:'🍋'},
    {id:'garlic',name:'Garlic',emoji:'🧄'},
    {id:'tomato',name:'Tomato',emoji:'🍅'},
    {id:'onion',name:'Onion',emoji:'🧅'},
    {id:'cilantro',name:'Cilantro',emoji:'🌿'}
  ];
  const toppings=pantry.filter(item=>item.id!=='avocado');
  const steps=['Gather','Mash','Prep ingredients','Stir','Serve'];
  const storageKey='marketveggies.kitchenquest.v1';
  function restore(){
    try{
      const data=JSON.parse(localStorage.getItem(storageKey)||'{}');
      return {completed:data.completed===true,downloaded:data.downloaded===true,activityDone:data.activityDone===true};
    }catch(error){return {completed:false,downloaded:false,activityDone:false}}
  }
  const saved=restore();
  let state={phase:saved.completed?'complete':'gather',collected:new Set(),added:new Set(saved.completed?['lime','garlic','tomato','onion','cilantro']:[]),
    mash:saved.completed?5:0,stir:saved.completed?5:0,prep:null,completed:saved.completed,downloaded:saved.downloaded,
    activityDone:saved.activityDone,quiz:0,quizNotice:'',quizCorrect:false};
  const quiz=[
    {question:'Which ingredient brings fiber and unsaturated fats to the bowl?',
      answers:['Avocado','Salt','Water'],correct:0,explain:'Avocado provides dietary fiber and mostly unsaturated fats. Fiber supports normal digestion.'},
    {question:'Why does freshly crushed garlic smell so strong?',
      answers:['It becomes sugar','Plant compounds change','It loses all nutrients'],correct:1,
      explain:'Crushing garlic lets enzymes and sulfur-containing compounds react, helping form its familiar aroma.'},
    {question:'What does moving your body do after a meal?',
      answers:['Activate food vitamins','Turn fiber into energy','Use energy while muscles work'],correct:2,
      explain:'Movement uses energy. Food supplies nutrients that help the body function; exercise does not switch nutrients on.'}
  ];
  const htmlEscape=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function persist(){
    try{localStorage.setItem(storageKey,JSON.stringify({
      completed:state.completed,downloaded:state.downloaded,activityDone:state.activityDone
    }))}catch(error){/* Private browsing remains playable without saved progress. */}
  }
  function announce(message){if(status)status.textContent=message}
  function stepNumber(){return ({gather:0,mash:1,season:2,stir:3,serve:4,complete:5})[state.phase]}
  function renderTracker(){
    const current=stepNumber();
    tracker.innerHTML=steps.map((name,i)=>{
      const done=current>i,active=current===i;
      return '<span class="kq-step'+(done?' is-done':'')+(active?' is-active':'')+
        '" '+(active?'aria-current="step"':'')+'><b>'+(done?'✓':i+1)+'</b>'+name+'</span>';
    }).join('');
  }


  /* Gary Kitchen Quest illustrated assets.
     New graphics are used automatically when the art folder is present.
     On a missing image the existing SVG game remains fully playable. */
  const kqAssetRoot='assets/recipes/gary-kitchen/';
  const kqMashArt=[
    'guac-stage-01-halves','guac-stage-02-crushed',
    'guac-stage-03-chunky','guac-stage-04-medium-mash',
    'guac-stage-05-smooth-base','guac-stage-06-ready-for-mixins'
  ];
  const kqMixArt=[
    'bowl-mix-01-added-not-mixed','bowl-mix-02-light-mix',
    'bowl-mix-03-mid-mix','bowl-mix-04-nearly-finished',
    'bowl-mix-05-finished-guac'
  ];
  const kqPrepArt={
    garlic:['garlic-prep-01-clove','garlic-prep-02-crushed','garlic-prep-03-minced'],
    lime:['lime-prep-01-half','lime-prep-02-squeezing','lime-prep-03-juice-drops'],
    tomato:['tomato-prep-01-whole','tomato-prep-02-sliced','tomato-prep-03-diced'],
    onion:['onion-prep-01-half','onion-prep-02-sliced','onion-prep-03-diced'],
    cilantro:['cilantro-prep-01-bunch','cilantro-prep-02-chopping','cilantro-prep-03-chopped']
  };
  const kqHostArt={
    gather:'gary-chef-idle',mash:'gary-chef-excited',
    season:'gary-chef-excited',stir:'gary-chef-approve',
    serve:'gary-chef-celebrate',complete:'gary-chef-celebrate'
  };
  let kqArtReady=false;
  let kqArtBroken=false;
  function kqSource(folder,name){return kqAssetRoot+folder+'/'+name+'.png'}
  function kqBowlFile(){
    if(state.phase==='serve')return kqSource('bowl','finished-guacamole-bowl');
    if(state.phase==='complete')return kqSource('bowl','plated-guac-with-chips');
    if(state.phase==='stir')return kqSource('bowl',kqMixArt[Math.min(4,state.stir)]);
    if(state.phase==='season'){
      if(state.added.size===0)return kqSource('bowl',kqMashArt[5]);
      // The initial unmixed bowl gives prepared ingredients a distinct look.
      return kqSource('bowl',kqMixArt[0]);
    }
    return kqSource('bowl',kqMashArt[Math.min(5,state.mash)]);
  }
  function kqIllustratedBowl(){
    const file=kqBowlFile();
    return '<div class="kq-countertop kq-illustrated-countertop">'+
      '<div class="kq-painted-bowl">'+
      '<img id="kqBowl" class="kq-guac-artwork" src="'+file+
      '" alt="'+(state.phase==='complete'?'Plated guacamole with crunchy tortilla chips':
        state.phase==='stir'?'Guacamole becoming more thoroughly mixed, stir '+state.stir+' of five':
        state.phase==='season'?'Guacamole bowl with prepared ingredients':
        'Avocado mash stage '+state.mash+' of five')+'" draggable="false">'+
      (state.phase==='stir'?'<span class="kq-art-spoon" aria-hidden="true">🥄</span>':'')+
      '</div></div>';
  }
  function kqIllustratedPrep(id,hits){
    const frames=kqPrepArt[id];
    if(!frames)return '';
    return '<img class="kq-prep-artwork" src="'+kqSource('ingredients',frames[Math.min(2,hits)])+
      '" alt="'+htmlEscape(id)+' preparation stage '+(hits+1)+' of three" draggable="false">';
  }
  function kqUpdateChef(){
    const avatar=root.querySelector('.kq-chef-avatar img');
    if(!avatar)return;
    const image=kqSource('host',kqHostArt[state.phase]||kqHostArt.gather);
    if(avatar.getAttribute('src')!==image){
      avatar.src=image;
      avatar.alt='Chef Gary cheering you on';
    }
  }
  function kqDecorateRewards(){
    if(!kqArtReady)return;
    const box=root.querySelector('#kqReward');
    if(!box)return;
    box.classList.add('kq-painted-rewards');
    const seed=box.querySelector('.kq-garden-plot>span');
    if(seed&&state.downloaded)seed.innerHTML='<img src="'+kqSource('rewards','garlic-seed-reward')+
      '" alt="Garlic garden starter">';
  }
  function kqActivateArt(){
    const tester=new Image();
    tester.onload=()=>{
      kqArtReady=true;
      root.classList.add('kq-illustrated');
      kqUpdateChef();
      render();
    };
    tester.onerror=()=>{
      // Temporary staging: the gameplay remains live until image files land.
      kqArtBroken=true;
    };
    tester.src=kqSource('bowl',kqMashArt[0]);
  }

  /* Original vector bowl art: the avocado, chopped pieces and texture
     genuinely change with each interaction, rather than staying an emoji. */
  const prepTasks={
    garlic:{verb:'Crush & mince',tool:'Knife',note:'Tap to crush, then mince the clove. In a real kitchen an adult handles the knife.',science:'Crushing garlic helps release the compounds behind its unmistakable aroma.'},
    lime:{verb:'Squeeze',tool:'Juice',note:'Press the lime wedge three times to squeeze juice into the bowl.',science:'Lime juice adds tangy flavor and some vitamin C.'},
    tomato:{verb:'Dice',tool:'Knife',note:'Tap to slice, then dice the tomato into little pieces. A grown-up uses the knife in real life.',science:'Tomatoes contain lycopene, a pigment behind their red color.'},
    onion:{verb:'Dice',tool:'Knife',note:'Cut the onion into tiny pieces. A grown-up handles knives in real kitchens.',science:'Onion adds crunch and sharp flavor.'},
    cilantro:{verb:'Chop',tool:'Knife',note:'Chop the cilantro leaves into small pieces. A grown-up can help with cutting.',science:'Cilantro adds a fresh, leafy aroma.'}
  };
  const svgDefs='<defs>'+
    '<radialGradient id="kq-ceramic" cx="48%" cy="27%"><stop stop-color="#fffdf3"/><stop offset=".72" stop-color="#edf0e9"/><stop offset="1" stop-color="#9dc5bd"/></radialGradient>'+
    '<radialGradient id="kq-guac" cx="43%" cy="35%"><stop stop-color="#d9e88a"/><stop offset=".63" stop-color="#a3c654"/><stop offset="1" stop-color="#6b9738"/></radialGradient>'+
    '<linearGradient id="kq-board" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#f2cd97"/><stop offset="1" stop-color="#d7a267"/></linearGradient>'+
    '<clipPath id="kq-fill-clip"><ellipse cx="260" cy="185" rx="151" ry="88"/></clipPath>'+
    '</defs>';
  function ellipse(cx,cy,rx,ry,fill,other){
    return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" '+(other||'')+'/>';
  }
  function avocadoHalf(cx,cy,angle){
    return '<g transform="rotate('+angle+' '+cx+' '+cy+')">'+
      ellipse(cx,cy,64,43,'#446e36')+
      ellipse(cx,cy,58,38,'#a1d54d')+
      ellipse(cx,cy,47,30,'#d9e69a')+
      ellipse(cx-2,cy+4,19,19,'#97633c')+
      ellipse(cx-5,cy+1,11,10,'#bb8450')+
      '</g>';
  }
  function guacBits(count,seed,large){
    let out='';
    for(let i=0;i<count;i++){
      const t=(i*2.39996+seed),rad=Math.sqrt((i+.6)/(count+1));
      const x=260+Math.cos(t)*rad*126,y=186+Math.sin(t)*rad*68;
      const rx=(large?15:7)+(i%4)*2,ry=(large?9:5)+(i%3)*1.4;
      out+=ellipse(x.toFixed(1),y.toFixed(1),rx,ry,
        i%3===0?'#8bad44':i%3===1?'#c3dd73':'#e4eb98',
        'transform="rotate('+((i*37)%70-35)+' '+x.toFixed(1)+' '+y.toFixed(1)+')"');
    }
    return out;
  }
  function guacTexture(){
    let dots='';
    for(let i=0;i<36;i++){
      const theta=i*2.39996,rad=Math.sqrt((i+.35)/36);
      const x=(260+Math.cos(theta)*rad*131).toFixed(1);
      const y=(186+Math.sin(theta)*rad*70).toFixed(1);
      dots+='<circle cx="'+x+'" cy="'+y+'" r="'+(1.6+i%3)+'" fill="'+(i%3===0?'#5c8d34':'#e1e988')+'" opacity=".68"/>';
    }
    return dots;
  }
  function toppingsArt(){
    let output='';
    const mixFactor=Math.min(1,state.stir/5);
    const configs={
      garlic:{x:204,y:156,color:'#f4ecc4',light:'#fffae5',size:4},
      lime:{x:303,y:162,color:'#f3e477',light:'#fff6a6',size:3},
      tomato:{x:230,y:212,color:'#e9583d',light:'#fa9262',size:7},
      onion:{x:326,y:206,color:'#c89acb',light:'#edd3e7',size:5},
      cilantro:{x:282,y:180,color:'#2a823f',light:'#5caa42',size:5}
    };
    [...state.added].forEach(id=>{
      const c=configs[id];if(!c)return;
      for(let i=0;i<15;i++){
        const t=i*2.4+(id.length*.39),rad=Math.sqrt((i+.4)/15);
        const tx=260+Math.cos(t)*rad*124,ty=186+Math.sin(t)*rad*64;
        const x=c.x*(1-mixFactor)+tx*mixFactor+(Math.cos(t)*i*1.1)*(1-mixFactor);
        const y=c.y*(1-mixFactor)+ty*mixFactor+(Math.sin(t)*i*.85)*(1-mixFactor);
        if(id==='cilantro'){
          output+='<path d="M'+x.toFixed(1)+' '+y.toFixed(1)+'l6 -4 l-2 8z" fill="'+(i%2?c.color:c.light)+'"/>';
        }else if(id==='lime'){
          output+=ellipse(x.toFixed(1),y.toFixed(1),c.size,c.size*.55,i%2?c.color:c.light,'opacity=".82"');
        }else{
          output+='<rect x="'+(x-c.size/2).toFixed(1)+'" y="'+(y-c.size/2).toFixed(1)+'" width="'+c.size+'" height="'+(c.size*.9)+'" rx="1" transform="rotate('+((i*29)%65-30)+' '+x.toFixed(1)+' '+y.toFixed(1)+')" fill="'+(i%2?c.color:c.light)+'"/>';
        }
      }
    });
    return output;
  }
  function bowl(extra){
    if(kqArtReady)return kqIllustratedBowl();
    const mash=Math.min(5,state.mash),stir=Math.min(5,state.stir);
    let contents='';
    if(mash===0)contents=avocadoHalf(202,184,-18)+avocadoHalf(318,184,18);
    else{
      const baseColors=['','#cee48d','#c1df7c','#afd370','#a3cb66','#99c45b'];
      contents=ellipse(260,186,149,85,baseColors[mash]);
      if(mash===1)contents+=avocadoHalf(310,180,18)+guacBits(4,1,true);
      if(mash===2)contents+=guacBits(12,2,true);
      if(mash===3)contents+=guacBits(12,3,false);
      if(mash===4)contents+=guacBits(7,4,false);
      if(mash===5)contents+=guacBits(4,5,false);
      contents+=guacTexture();
    }
    const final=state.phase==='serve'||state.phase==='complete';
    const fork=state.phase==='mash';
    const spoon=state.phase==='stir';
    const potatoTool=fork?'<g class="kq-masher-tool"><path d="M365 47 L306 152" stroke="#d3a36b" stroke-width="13" stroke-linecap="round"/><path d="M303 146 l-14 34 m14 -34 l-1 36 m1 -36 l16 32" stroke="#b1b9c2" stroke-width="6" stroke-linecap="round"/></g>':'';
    const woodTool=spoon?'<g class="kq-wood-spoon" style="--stir-rotation:'+stir*43+'deg"><path d="M358 55 L287 172" stroke="#bb8046" stroke-width="17" stroke-linecap="round"/><ellipse cx="278" cy="187" rx="17" ry="23" transform="rotate(26 278 187)" fill="#b98246"/></g>':'';
    const chips=final?'<g class="kq-served-chips"><path d="M52 107 L101 111 L71 45 Z" fill="#f4bd51" stroke="#df9744" stroke-width="4"/><path d="M420 80 L474 138 L402 149 Z" fill="#f4bd51" stroke="#df9744" stroke-width="4"/><path d="M399 302 L461 306 L437 255 Z" fill="#f2bd56" stroke="#db9854" stroke-width="4"/></g>':'';
    return '<div class="kq-countertop '+(final?'kq-plated':'')+'">'+
      '<svg id="kqBowl" class="kq-guac-svg '+(extra||'')+'" viewBox="0 0 520 370" role="img" aria-label="'+
      (final?'Finished bowl of chunky guacamole with tomato, onion and herbs':mash===0?'Two avocado halves in a bowl':mash<5?'Avocado being mashed, step '+mash+' of five':stir?'Guacamole mixing, stir '+stir+' of five':'Mashed avocado with prepared toppings')+'">'+svgDefs+
      ellipse(260,311,170,23,'#684727','opacity=".18"')+
      chips+
      '<path d="M90 185 Q87 314 154 322 Q260 354 367 322 Q435 305 430 185" fill="url(#kq-ceramic)" stroke="#acc1ac" stroke-width="6"/>'+
      ellipse(260,186,176,112,'#fffdf0','stroke="#9dbcb2" stroke-width="5"')+
      '<g clip-path="url(#kq-fill-clip)"><g class="kq-contents" style="--kq-mix-angle:'+stir*37+'deg">'+
      contents+toppingsArt()+'</g></g>'+
      ellipse(260,185,152,90,'none','stroke="#f7f5e3" stroke-width="8"')+
      potatoTool+woodTool+
      '</svg></div>';
  }
  function prepArtwork(id,hits){
    if(kqArtReady)return kqIllustratedPrep(id,hits);
    const cut=prepTasks[id];
    const colors={
      garlic:['#f5e5bd','#f7d7a8'],lime:['#8fc84a','#d9e984'],
      tomato:['#e5573e','#f18a61'],onion:['#c59cce','#e5d1e8'],
      cilantro:['#3a9153','#77c06d']
    };
    const color=colors[id][0],light=colors[id][1],n=Math.min(3,hits);
    let picture='';
    if(id==='lime'){
      const squeezeY=52+n*7;
      picture='<g transform="translate(150 '+squeezeY+')">'+
        '<path d="M0 0 Q64 -42 130 0 Q85 65 0 0" fill="'+light+'" stroke="'+color+'" stroke-width="9"/>'+
        '<path d="M19 3 L60 33 L59 -5 M67 31 L108 5" stroke="#f4f4b4" stroke-width="5" fill="none"/>'+
        '</g>'+
        Array.from({length:n*3},(_,i)=>ellipse(201+i*17%98,123+(i*19)%38,4,7,'#d5e95d')).join('');
    }else if(id==='cilantro'){
      picture=Array.from({length:n?13:5},(_,i)=>{
        const x=141+i*17%(n?160:100),y=70+i*13%(n?77:35);
        const z=n?7+n*1.7:22;
        return '<path d="M'+x+' '+(y+z)+' Q'+(x-z)+' '+y+' '+x+' '+(y-z)+' Q'+(x+z)+' '+y+' '+x+' '+(y+z)+'" fill="'+(i%2?color:light)+'" stroke="#318249" stroke-width="2"/>';
      }).join('');
    }else{
      const shapes=n?4+n*5:1;
      picture=Array.from({length:shapes},(_,i)=>{
        const x=n?142+i*31%155:210,y=n?63+i*27%75:90;
        const radius=n?Math.max(6,20-n*3):48;
        const piece= id==='tomato'?'<circle cx="'+x+'" cy="'+y+'" r="'+radius+'" fill="'+color+'" stroke="#b83a2a" stroke-width="3"/>'+
          (n===0?ellipse(x,y,25,12,light):''):
          id==='onion'?ellipse(x,y,radius,radius*.87,light,'stroke="'+color+'" stroke-width="5"'):
          ellipse(x,y,radius*.74,radius*1.12,light,'stroke="'+color+'" stroke-width="4"');
        return piece;
      }).join('');
    }
    const tool=cut.tool==='Knife'?'<path class="kq-prep-knife" d="M300 29 L372 59 L294 80 Q282 62 300 29Z" fill="#c5d8df" stroke="#849ba6" stroke-width="4"/>':'';
    return '<svg class="kq-prep-svg" viewBox="0 0 420 185" aria-hidden="true">'+
      '<defs><linearGradient id="kq-prep-board" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#f2cd97"/><stop offset="1" stop-color="#d7a267"/></linearGradient></defs>'+
      '<rect x="24" y="20" width="372" height="146" rx="27" fill="url(#kq-prep-board)" stroke="#b87f49" stroke-width="8"/>'+
      picture+tool+'</svg>';
  }
  function controls(){
    if(state.phase==='gather'){
      return '<div class="kq-step-head"><span class="kq-chapter">ROUND 01 / MARKET PANTRY</span>'+
        '<h3>Collect your guacamole ingredients!</h3><p>Tap the food or drag it into the basket. Find all six to unlock the counter.</p></div>'+
        '<div class="kq-pantry">'+pantry.map(item=>'<button class="kq-ingredient'+(state.collected.has(item.id)?' selected':'')+
          '" type="button" draggable="true" data-collect="'+item.id+'" aria-pressed="'+state.collected.has(item.id)+'">'+
          '<span aria-hidden="true">'+item.emoji+'</span><b>'+item.name+'</b><small>'+(state.collected.has(item.id)?'Added ✓':'Tap or drag')+'</small></button>').join('')+
        '</div><div class="kq-basket" id="kqBasket" aria-label="Ingredient basket" role="region">'+
        '<strong>🧺 Your basket · '+state.collected.size+'/6</strong><span>'+
        (state.collected.size?[...state.collected].map(id=>pantry.find(item=>item.id===id)?.emoji||'').join(' '):'Drop ingredients here!')+
        '</span></div><button type="button" class="kq-main-action" data-action="next" '+
        (state.collected.size===pantry.length?'':'disabled')+'>All gathered! Head to the counter →</button>';
    }
    if(state.phase==='mash'){
      return '<div class="kq-step-head"><span class="kq-chapter">ROUND 02 / PREP TIME</span>'+
        '<h3>Mash those avocados!</h3><p>Press the mash button five times and watch your guacamole come together.</p></div>'+
        bowl('kq-mashing')+'<div class="kq-count">'+state.mash+'/5 good mashes</div>'+
        '<div class="kq-meter"><span style="width:'+(state.mash*20)+'%"></span></div>'+
        '<button type="button" class="kq-main-action" data-action="mash" '+(state.mash>=5?'disabled':'')+'>🥄 Mash! '+(state.mash>=5?'✓':'')+'</button>'+
        (state.mash>=5?'<button class="kq-next" type="button" data-action="next">Next: add flavor →</button>':'');
    }
    if(state.phase==='season'){
      const active=state.prep&&prepTasks[state.prep.id];
      const selected=active?pantry.find(p=>p.id===state.prep.id):null;
      return '<div class="kq-step-head"><span class="kq-chapter">ROUND 03 / PREP & FLAVOR</span>'+
        '<h3>Chop, dice and squeeze!</h3><p>Choose an ingredient, prepare it, and watch the finished pieces drop into your guacamole.</p></div>'+
        bowl('kq-seasoning')+
        '<div class="kq-pantry kq-toppings">'+toppings.map(item=>
          '<button class="kq-ingredient'+(state.added.has(item.id)?' selected':'')+
          (state.prep?.id===item.id?' kq-preparing':'')+
          '" type="button" data-season="'+item.id+'" aria-pressed="'+(state.prep?.id===item.id)+'" '+
          (state.added.has(item.id)?'disabled':'')+'>'+
          '<span aria-hidden="true">'+item.emoji+'</span><b>'+item.name+'</b><small>'+
          (state.added.has(item.id)?'Prepped ✓':state.prep?.id===item.id?'Preparing...':prepTasks[item.id].verb)+'</small></button>').join('')+'</div>'+
        (active?'<div class="kq-prep-panel"><div class="kq-prep-top"><strong>'+selected.emoji+' '+active.verb+' the '+selected.name.toLowerCase()+
          '</strong><span>'+state.prep.hits+'/3</span></div>'+
          '<button type="button" class="kq-prep-art-button" data-action="prep" aria-label="'+active.verb+' '+selected.name+'">'+
          prepArtwork(state.prep.id,state.prep.hits)+'</button>'+
          '<p>'+active.note+'</p><div class="kq-meter"><span style="width:'+(state.prep.hits/3*100)+'%"></span></div>'+
          '<button type="button" class="kq-main-action" data-action="prep">'+active.verb+'! ✨</button> '+
          '<button type="button" class="kq-cancel" data-action="cancel-prep">Choose a different ingredient</button></div>':
          '<p class="kq-prep-prompt">'+state.added.size+' of 5 ingredients prepared. Pick the next ingredient above.</p>')+
        '<button type="button" class="kq-next" data-action="next" '+
        (state.added.size===toppings.length&&!state.prep?'':'disabled')+'>All prepped! Time to stir →</button>';
    }
    if(state.phase==='stir'){
      return '<div class="kq-step-head"><span class="kq-chapter">ROUND 04 / STIR IT UP</span>'+
        '<h3>Give it a good mix!</h3><p>Drag across the mixing bowl, or press Stir five times. Both ways work.</p></div>'+
        bowl('kq-stirring')+'<div class="kq-count">'+state.stir+'/5 stirs complete</div>'+
        '<div class="kq-meter"><span style="width:'+(state.stir*20)+'%"></span></div>'+
        '<button type="button" class="kq-main-action" data-action="stir" '+(state.stir>=5?'disabled':'')+
        '>🥣 Stir it! '+(state.stir>=5?'✓':'')+'</button>'+
        (state.stir>=5?'<button type="button" class="kq-next" data-action="next">Ready to serve →</button>':'');
    }
    if(state.phase==='serve'){
      return '<div class="kq-step-head"><span class="kq-chapter">ROUND 05 / CHEF FINISH</span>'+
        '<h3>You made guacamole!</h3><p>Plate your creation, then unlock the real recipe to try with a grown-up.</p></div>'+
        bowl('kq-ready-to-serve')+
        '<button type="button" class="kq-main-action" data-action="complete">✨ Serve your guacamole!</button>';
    }
    return '<div class="kq-step-head"><span class="kq-chapter">LEVEL COMPLETED!</span>'+
      '<h3>Chef Gary says: YOU DID IT!</h3><p>You cooked your first virtual Market Veggies recipe. The real-world recipe is ready!</p></div>'+
      bowl('kq-finished-guac')+
      '<div class="kq-unlock"><strong>🔓 Take-home recipe unlocked!</strong>'+
      '<p>Get a printable PDF with ingredients, quantities, grown-up help, and a family activity.</p>'+
      '<button class="kq-main-action" type="button" data-action="download">⬇ Download Gary’s Guacamole PDF</button>'+
      '<small>Starting the download earns a Chef Passport stamp and a garden seed. You can download it again any time.</small></div>'+
      '<button class="kq-next" type="button" data-action="restart">↻ Cook again</button>';
  }
  function renderReward(){
    reward.innerHTML='<div class="kq-reward-title">🌱 Your Chef Passport</div>'+
      '<div class="kq-stamps"><span class="kq-stamp'+(state.completed?' earned':'')+'">'+
      (state.completed?'🏆':'🔒')+'<b>Kitchen Cook</b></span>'+
      '<span class="kq-stamp'+(state.downloaded?' earned':'')+'">'+
      (state.downloaded?'🧄':'🔒')+'<b>Gary’s Stamp</b></span>'+
      '<span class="kq-stamp'+(state.activityDone?' earned':'')+'">'+
      (state.activityDone?'🌟':'🔒')+'<b>Garden Explorer</b></span></div>'+
      '<div class="kq-garden-plot"><span aria-hidden="true">'+
      (state.downloaded?'🌱':'🪴')+'</span><div><strong>'+
      (state.downloaded?'Your first garden seed is growing!':'Your Garden Quest starts here')+
      '</strong><p>'+(state.downloaded?
      'You earned a garlic garden seed by requesting your take-home recipe. More recipes will grow this collection.' :
      'Finish the recipe, then download it to plant your first collectible garden seed.')+'</p></div></div>'+
      '<p class="kq-save-note">Progress saves on this device when your browser allows it. No sign-in required.</p>';
  }
  function renderActivity(){
    if(!state.completed){
      activity.innerHTML='<div class="kq-activity-locked"><span aria-hidden="true">🌳</span><div>'+
        '<b>Next up: Gary’s Garden Power Trail</b><p>Finish cooking to play a mini-game about how your body uses nutrients and energy.</p></div></div>';
      return;
    }
    if(state.quiz>=quiz.length){
      activity.innerHTML='<div class="kq-activity-win"><span aria-hidden="true">🌟</span><h3>Garden trail completed!</h3>'+
        '<p>Great work! Food helps supply nutrients, while your body uses energy when you move.</p>'+
        '<button type="button" class="kq-next" data-action="replay-quiz">Play the garden trail again ↻</button></div>';
      return;
    }
    const current=quiz[state.quiz];
    const progress=['🌱','🍃','🌻'].map((symbol,i)=>'<span class="'+(i<=state.quiz?'reached':'')+'">'+symbol+'</span>').join('');
    activity.innerHTML='<div class="kq-trail">'+progress+'</div><p class="kq-chapter">GARDEN TRAIL · '+(state.quiz+1)+'/3</p>'+
      '<h3>'+htmlEscape(current.question)+'</h3><div class="kq-trail-options">'+
      current.answers.map((answer,i)=>'<button type="button" class="kq-trail-choice" data-answer="'+i+'" '+
      (state.quizCorrect?'disabled':'')+'>'+htmlEscape(answer)+'</button>').join('')+
      '</div><p class="kq-trail-feedback" role="status">'+htmlEscape(state.quizNotice)+'</p>'+
      (state.quizCorrect?'<button type="button" class="kq-main-action" data-action="next-question">'+
      (state.quiz===quiz.length-1?'Finish the trail! →':'Next garden stop →')+'</button>':'');
  }
  function render(){
    stage.innerHTML=controls();
    renderTracker();renderReward();renderActivity();
    root.dataset.phase=state.phase;
    if(kqArtReady){kqUpdateChef();kqDecorateRewards()}
  }
  function next(){
    const phases=['gather','mash','season','stir','serve'];
    const index=phases.indexOf(state.phase);
    if(index<0)return;
    const allowed=(state.phase==='gather'&&state.collected.size===pantry.length)||
      (state.phase==='mash'&&state.mash>=5)||
      (state.phase==='season'&&state.added.size===toppings.length)||
      (state.phase==='stir'&&state.stir>=5);
    if(!allowed)return;
    state.phase=phases[index+1];
    announce('Great job! Next step: '+steps[index+1]);
    render();
  }
  function addIngredient(id){
    if(state.phase!=='gather'||!pantry.some(x=>x.id===id)||state.collected.has(id))return;
    state.collected.add(id);
    announce(pantry.find(x=>x.id===id).name+' added to your basket. '+state.collected.size+' of 6 collected.');
    render();
  }
  function addTopping(id){
    if(state.phase!=='season'||!prepTasks[id]||state.added.has(id))return;
    state.prep={id,hits:0};
    announce('Time to '+prepTasks[id].verb.toLowerCase()+' the '+pantry.find(x=>x.id===id).name.toLowerCase()+'.');
    render();
  }
  function prepHit(){
    if(state.phase!=='season'||!state.prep)return;
    state.prep.hits=Math.min(3,state.prep.hits+1);
    const {id,hits}=state.prep;
    if(hits===3){
      state.added.add(id);
      state.prep=null;
      announce(prepTasks[id].science+' Added to the bowl! '+state.added.size+' of 5 prepped.');
    }else{
      announce(prepTasks[id].verb+' in progress: '+hits+' of 3. Keep going!');
    }
    render();
  }
  function stepTap(which){
    if(which==='mash'&&state.phase==='mash'){
      state.mash=Math.min(5,state.mash+1);
      announce(state.mash>=5?'Perfect mash! Your avocado is ready.':'Mash '+state.mash+' of 5!');
    }else if(which==='stir'&&state.phase==='stir'){
      state.stir=Math.min(5,state.stir+1);
      announce(state.stir>=5?'Great stirring! Ready to serve.':'Stir '+state.stir+' of 5!');
    }else return;
    render();
  }
  function complete(){
    if(state.phase!=='serve')return;
    state.phase='complete';state.completed=true;persist();
    announce('Congratulations! You finished Gary’s Guacamole! Download the real recipe to earn your stamp and seed.');
    render();
    const confetti=document.getElementById('kqConfetti');
    if(confetti){
      confetti.innerHTML=Array.from({length:18},(_,i)=>'<i style="--i:'+i+'"></i>').join('');
      confetti.classList.remove('burst');
      void confetti.offsetWidth;
      confetti.classList.add('burst');
    }
  }
  function pdfEscape(s){return String(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
  /* Minimal standalone, printable 1-page PDF. Only ASCII characters are used
     in the PDF stream so text-string byte offsets remain correct without deps. */
  function makePdf(){
    const page=[];
    const block=(r,g,b,x,y,w,h)=>page.push(r+' '+g+' '+b+' rg '+x+' '+y+' '+w+' '+h+' re f');
    const label=(x,y,text,size,bold,color)=>{
      const rgb=color||[.15,.25,.18];
      page.push(rgb.join(' ')+' rg BT /'+(bold?'F2':'F1')+' '+size+' Tf '+x+' '+y+
        ' Td ('+pdfEscape(text)+') Tj ET');
    };
    block(.975,.972,.942,0,0,612,792);
    block(.12,.40,.20,0,643,612,149);
    block(.96,.71,.18,0,636,612,7);
    label(46,748,'MARKET VEGGIES  /  KITCHEN QUEST',13,true,[1,.91,.43]);
    label(46,712,"GARY'S GUACAMOLE",28,true,[1,1,1]);
    label(46,681,'CHEF PASSPORT / PRINTABLE FAMILY RECIPE',11,true,[1,1,1]);
    label(46,654,'Family-friendly adaptation  |  Suggested amounts  |  4 small servings',10,false,[1,1,1]);
    label(46,604,"YOU'LL NEED",15,true,[.12,.39,.20]);
    [
      '2 ripe avocados',
      '1 small garlic clove, finely minced by a grown-up',
      '1 medium tomato, finely diced',
      '2 tablespoons finely diced onion',
      'Juice of 1 lime',
      '2 tablespoons chopped cilantro (optional)',
      'Optional: a small pinch of salt'
    ].forEach((s,i)=>label(53,579-i*22,'- '+s,11,false,[.16,.23,.18]));
    block(.86,.91,.81,46,416,520,1);
    label(46,394,'MAKE IT TOGETHER',15,true,[.12,.39,.20]);
    [
      '1. Wash the produce. Ask a grown-up to cut the avocados and vegetables.',
      '2. Scoop avocado into a bowl and mash with a fork.',
      '3. Stir in garlic, tomato, onion, lime juice, and optional cilantro.',
      '4. Taste together, adjust lime as desired, and serve right away.'
    ].forEach((s,i)=>label(53,368-i*23,s,10.7,false,[.16,.23,.18]));
    block(.96,.90,.67,44,166,524,97);
    label(56,242,'FOOD SCIENCE + FAMILY MOVEMENT',12,true,[.35,.27,.07]);
    label(56,222,'Avocado supplies fiber and unsaturated fats. Garlic adds big flavor;',10.4,false,[.30,.25,.14]);
    label(56,204,'crushing it helps form aroma compounds, including allicin.',10.4,false,[.30,.25,.14]);
    label(56,186,'Garden walk: spot 5 colors and march 20 steps. Movement uses energy!',10.4,false,[.30,.25,.14]);
    label(46,141,'GROWN-UP GUIDE',12,true,[.12,.39,.20]);
    label(46,120,'Help with knives, cutting, and food hygiene. Check allergies and age-',10.1,false,[.22,.24,.22]);
    label(46,104,'appropriate textures. Refrigerate leftovers promptly. Eat within 1 day.',10.1,false,[.22,.24,.22]);
    block(.12,.40,.20,0,0,612,65);
    label(46,39,'FRESH PRODUCE. BIG ADVENTURES.',12,true,[1,.91,.43]);
    label(46,22,'Market Veggies | A family cooking adventure | marketveggies.hireberna.app',9,false,[1,1,1]);
    const stream=page.join('\n')+'\n';
    const objects=[
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
      '<< /Length '+stream.length+' >>\nstream\n'+stream+'endstream'
    ];
    let pdf='%PDF-1.4\n';
    const offsets=[0];
    objects.forEach((object,i)=>{
      offsets.push(pdf.length);
      pdf+=(i+1)+' 0 obj\n'+object+'\nendobj\n';
    });
    const xref=pdf.length;
    pdf+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
    for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf+='trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n';
    return new Blob([pdf],{type:'application/pdf'});
  }
  function download(){
    if(!state.completed)return;
    const file=makePdf();
    const url=URL.createObjectURL(file);
    const a=document.createElement('a');
    a.href=url;a.download='Market-Veggies-Gary-Guacamole-Recipe.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
    // Browsers do not confirm a disk save; reward the download REQUEST.
    state.downloaded=true;persist();
    announce('Recipe PDF download requested! You earned Gary’s Chef Passport stamp and a garden seed.');
    render();
  }
  function quizAnswer(index){
    if(!state.completed||state.quizCorrect||state.quiz>=quiz.length)return;
    const current=quiz[state.quiz];
    if(index===current.correct){
      state.quizCorrect=true;state.quizNotice='Correct! '+current.explain;
      announce(state.quizNotice);
    }else{
      state.quizNotice='Nice try! Think about what food gives your body and what movement does.';
      announce(state.quizNotice);
    }
    renderActivity();
  }
  function advanceQuestion(){
    if(!state.quizCorrect)return;
    state.quiz++;
    state.quizNotice='';state.quizCorrect=false;
    if(state.quiz>=quiz.length){
      state.activityDone=true;persist();
      announce('Garden Explorer badge unlocked! Great job finishing Gary’s Garden Power Trail.');
    }else announce('Next garden stop!');
    render();
  }
  root.addEventListener('click',event=>{
    if(state.phase==='mash'&&event.target.closest('#kqBowl')){
      stepTap('mash');return;
    }
    const button=event.target.closest('button');if(!button||!root.contains(button))return;
    if(button.dataset.collect){addIngredient(button.dataset.collect);return}
    if(button.dataset.season){addTopping(button.dataset.season);return}
    if(button.dataset.answer!==undefined){quizAnswer(Number(button.dataset.answer));return}
    switch(button.dataset.action){
      case 'next':next();break;
      case 'prep':prepHit();break;
      case 'cancel-prep':state.prep=null;render();break;
      case 'mash':stepTap('mash');break;
      case 'stir':stepTap('stir');break;
      case 'complete':complete();break;
      case 'download':download();break;
      case 'next-question':advanceQuestion();break;
      case 'replay-quiz':
        state.quiz=0;state.quizCorrect=false;state.quizNotice='';renderActivity();
        break;
      case 'restart':
        state.phase='gather';state.collected.clear();state.added.clear();
        state.mash=0;state.stir=0;state.prep=null;state.quiz=0;state.quizCorrect=false;state.quizNotice='';
        announce('Welcome back, chef! Your earned Passport stamps will stay.');
        render();break;
    }
  });
  root.addEventListener('dragstart',event=>{
    const item=event.target.closest('[data-collect]');
    if(!item||state.phase!=='gather')return;
    if(event.dataTransfer){event.dataTransfer.setData('text/plain',item.dataset.collect);event.dataTransfer.effectAllowed='copy'}
  });
  root.addEventListener('dragover',event=>{
    if(state.phase==='gather'&&event.target.closest('#kqBasket'))event.preventDefault();
  });
  root.addEventListener('drop',event=>{
    if(state.phase!=='gather'||!event.target.closest('#kqBasket'))return;
    event.preventDefault();addIngredient(event.dataTransfer?.getData('text/plain'));
  });
  let startPoint=null;
  root.addEventListener('pointerdown',event=>{
    if(state.phase==='stir'&&event.target.closest('#kqBowl')){
      startPoint={x:event.clientX,y:event.clientY};
    }
  });
  root.addEventListener('pointerup',event=>{
    if(!startPoint)return;
    const distance=Math.hypot(event.clientX-startPoint.x,event.clientY-startPoint.y);
    if(state.phase==='stir'&&distance>40)stepTap('stir');
    startPoint=null;
  });
  root.addEventListener('pointercancel',()=>{startPoint=null});
  render();
  kqActivateArt();
})();