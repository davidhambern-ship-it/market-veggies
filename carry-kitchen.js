/* Carry's Special Soup — Market Veggies Kitchen Quest level two.
   Independent state and controls: Gary's game and rewards remain unchanged. */
(function initCarryKitchen(){
  'use strict';
  const root=document.getElementById('ckApp');
  const stage=document.getElementById('ckStage');
  const tracker=document.getElementById('ckTracker');
  const status=document.getElementById('ckStatus');
  const reward=document.getElementById('ckReward');
  const activity=document.getElementById('ckActivity');
  const stations=document.getElementById('kqStations');
  if(!root||!stage||!tracker||!status||!reward||!activity||!stations)return;
  const storageKey='marketveggies.carry-kitchen.v1';
  const garyKey='marketveggies.kitchenquest.v1';
  const pantry=[
    {id:'carrot',name:'Carrots',emoji:'🥕'},
    {id:'onion',name:'Onion',emoji:'🧅'},
    {id:'garlic',name:'Garlic',emoji:'🧄'},
    {id:'ginger',name:'Ginger',emoji:'🫚'},
    {id:'broth',name:'Veggie broth',emoji:'🥣'},
    {id:'herbs',name:'Fresh herbs',emoji:'🌿'}
  ];
  const prepOrder=['carrot','onion','garlic','ginger','herbs'];
  const prepSteps={
    carrot:{name:'Slice the carrots',verb:'Slice',science:'Carrots contain beta-carotene, which the body can convert into vitamin A.',safety:'Tap to cut the carrots into smaller pieces. In a real kitchen, a grown-up handles the knife.',color:'#f18a22'},
    onion:{name:'Dice the onion',verb:'Dice',science:'Onions add flavor and a little fiber to the soup.',safety:'Tap to dice the onion. In a real kitchen, ask a grown-up to do the cutting.',color:'#c597d1'},
    garlic:{name:'Mince the garlic',verb:'Mince',science:'Chopping garlic helps release the compounds responsible for its strong aroma.',safety:'Tap to mince the garlic. Have a grown-up handle the knife at home.',color:'#f3e6b8'},
    ginger:{name:'Grate the ginger',verb:'Grate',science:'Ginger brings a warm, zesty flavor and naturally occurring plant compounds.',safety:'Tap to grate the ginger. Let a grown-up manage the grater in a real kitchen.',color:'#dbc47a'},
    herbs:{name:'Chop the herbs',verb:'Chop',science:'Fresh herbs give the soup flavor without needing lots of extra salt.',safety:'Tap to chop the herbs. A grown-up can help with scissors or a knife.',color:'#388953'}
  };
  const steps=['Gather','Chop & grate','Pour broth','Simmer & stir','Serve'];
  const questions=[
    {q:'Carrots contain beta-carotene. What can your body make from it?',a:['Vitamin A','Vitamin D','Added sugar'],right:0,explain:'Correct! Your body can convert beta-carotene into vitamin A, which helps support normal vision.'},
    {q:'What can gently cooking carrots do?',a:['Turn them into candy','Soften them and make some beta-carotene easier to access','Activate every vitamin'],right:1,explain:'Yes! Cooking can soften carrot cells and help make some beta-carotene easier to access during digestion. It does not magically activate all nutrients.'},
    {q:'When you move and play, what does your body do?',a:['Activate the nutrients in soup','Stop using energy','Use energy while muscles work'],right:2,explain:'Exactly! Food gives your body nutrients and energy, and movement uses energy. Exercise does not activate nutrients.'}
  ];
  function stored(key){
    try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(error){return {}}
  }
  const old=stored(storageKey);
  const state={
    phase:old.completed?'complete':'gather',
    collected:new Set(),prepped:new Set(old.completed?prepOrder:[]),prep:null,
    poured:old.completed?3:0,simmer:old.completed?5:0,
    completed:old.completed===true,downloaded:old.downloaded===true,activityDone:old.activityDone===true,
    quiz:0,quizCorrect:false,quizNote:''
  };
  function persist(){
    try{localStorage.setItem(storageKey,JSON.stringify({completed:state.completed,downloaded:state.downloaded,activityDone:state.activityDone}))}
    catch(error){/* Without storage, the game remains playable. */}
  }
  function escapeText(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function say(message){status.textContent=message}
  function currentStep(){return ({gather:0,prep:1,pour:2,simmer:3,serve:4,complete:5})[state.phase]}
  function drawSteps(){
    const current=currentStep();
    tracker.innerHTML=steps.map((name,i)=>'<span class="kq-step'+(i<current?' is-done':'')+
      (i===current?' is-active':'')+'" '+(i===current?'aria-current="step"':'')+
      '><b>'+(i<current?'✓':i+1)+'</b>'+name+'</span>').join('');
  }
  const carryArtRoot='assets/recipes/carry-kitchen/';
  const carryArtNames=new Set(['carrot','onion','garlic','ginger','herbs']);
  function carryArtFile(name){return carryArtRoot+name+'.webp'}
  function carryServedBowl(){
    return '<div class="kq-countertop ck-countertop ck-served-countertop">'+
      '<img class="ck-served-image" src="'+carryArtFile('soup-finished')+
      '" alt="A warm bowl of orange carrot soup with real-looking carrot rounds, onion, ginger and green herb garnish" draggable="false">'+
      '<span class="ck-serving-shine" aria-hidden="true">✦</span></div>';
  }

  // Object-based soup stirring: a persistent pot, actual rotating ingredients,
  // visible ripples, and a wooden spoon whose bowl dips into the soup.
  function simmerPot(){
    let food='';
    const cx=265,cy=168;
    for(let i=0;i<45;i++){
      const angle=i*2.3999632297;
      const radial=Math.sqrt((i+.5)/45);
      const x=Math.round(cx+Math.cos(angle)*radial*131);
      const y=Math.round(cy+Math.sin(angle)*radial*132);
      const type=i%7;
      if(type===0||type===3){
        food+='<g transform="rotate('+(i*29%80-40)+' '+x+' '+y+')">'+
          '<circle cx="'+x+'" cy="'+y+'" r="'+(type===0?17:14)+'" fill="#d8751e" stroke="#ae5d18" stroke-width="3"/>'+
          '<circle cx="'+x+'" cy="'+y+'" r="'+(type===0?12:10)+'" fill="#f39a2d"/>'+
          '<path d="M'+(x-6)+' '+(y+2)+'q6 5 13 0" fill="none" stroke="#ffc16a" stroke-width="2"/></g>';
      }else if(type===1||type===5){
        food+='<rect x="'+(x-9)+'" y="'+(y-9)+'" width="'+(type===1?18:14)+'" height="'+(type===1?17:14)+
          '" rx="3" transform="rotate('+(i*31%60-30)+' '+x+' '+y+')" fill="'+(type===1?'#c88ed0':'#ffedb8')+
          '" stroke="'+(type===1?'#a86aab':'#ebdba5')+'" stroke-width="2"/>';
      }else if(type===2){
        food+='<path d="M'+(x-10)+' '+(y+5)+'q2 -14 15 -17q12 4 5 17q-8 9 -20 0z" fill="#408b3f" stroke="#2e763f" stroke-width="2"/>';
      }else if(type===4){
        food+='<rect x="'+(x-7)+'" y="'+(y-3)+'" width="14" height="6" rx="3" transform="rotate('+(i*39%100-50)+' '+x+' '+y+')" fill="#e8c074" stroke="#c7a45f" stroke-width="1"/>';
      }else{
        food+='<circle cx="'+x+'" cy="'+y+'" r="5" fill="#f1e3b0" opacity=".9"/>';
      }
    }
    let bubbles='';
    for(let i=0;i<12;i++){
      const x=153+(i*53)%228,y=134+(i*23)%68;
      bubbles+='<circle class="ck-stir-bubble" style="--ck-bubble-delay:'+(i*80)+'ms" cx="'+x+'" cy="'+y+
        '" r="'+(3+i%4)+'" fill="none" stroke="#fff2bd" stroke-width="2" opacity=".65"/>';
    }
    const defs='<defs>'+
      '<linearGradient id="ck-stir-pot-metal" x1="0" y1="0" x2=".6" y2="1">'+
      '<stop stop-color="#c4d2d4"/><stop offset=".55" stop-color="#97aeb3"/><stop offset="1" stop-color="#829da4"/></linearGradient>'+
      '<radialGradient id="ck-stir-broth" cx="42%" cy="32%">'+
      '<stop stop-color="#ffe195"/><stop offset=".65" stop-color="#f5c468"/><stop offset="1" stop-color="#e5a546"/></radialGradient>'+
      '<clipPath id="ck-stir-soup-clip"><ellipse cx="265" cy="170" rx="153" ry="72"/></clipPath>'+
      '</defs>';
    return '<div class="kq-countertop ck-countertop ck-simmer-countertop">'+
      '<svg id="ckPot" class="ck-pot-svg ck-simmer-pot" data-stirs="'+state.simmer+
      '" viewBox="0 0 530 365" role="img" aria-label="Wooden spoon stirring vegetables in a steaming pot of carrot soup">'+defs+
      '<ellipse cx="265" cy="327" rx="178" ry="19" fill="#835a32" opacity=".19"/>'+
      '<path d="M112 174 Q72 151 64 180 Q61 207 113 219 M417 174 Q466 150 469 183 Q472 208 419 219" fill="none" stroke="#78989e" stroke-width="17" stroke-linecap="round"/>'+
      '<path d="M112 160 Q115 298 185 312 Q261 339 350 310 Q416 294 418 158" fill="url(#ck-stir-pot-metal)" stroke="#698992" stroke-width="8"/>'+
      '<ellipse cx="265" cy="167" rx="175" ry="91" fill="#e0e9e3" stroke="#688992" stroke-width="8"/>'+
      '<g clip-path="url(#ck-stir-soup-clip)">'+
      '<ellipse cx="265" cy="170" rx="155" ry="74" fill="url(#ck-stir-broth)"/>'+
      '<g transform="translate(0 87) scale(1 .48)">'+
      '<g id="ckSoupIngredients" class="ck-soup-ingredients" style="transform:rotate('+(state.simmer*245)+'deg)">'+food+'</g></g>'+
      '<g id="ckSoupRipples" class="ck-soup-ripples">'+
      '<path d="M172 153 Q222 124 286 137 Q337 145 359 176" fill="none" stroke="#ffe7a6" stroke-width="8" stroke-linecap="round" opacity=".53"/>'+
      '<path d="M195 194 Q257 220 329 192" fill="none" stroke="#fff0c2" stroke-width="6" stroke-linecap="round" opacity=".5"/>'+
      '<ellipse cx="265" cy="171" rx="106" ry="42" fill="none" stroke="#fff2c6" stroke-width="3" opacity=".25"/></g>'+
      bubbles+'</g>'+
      // Spoon head sits inside soup opening. Handle rises diagonally over rim.
      '<g id="ckStirSpoon" class="ck-simmer-spoon">'+
      '<path d="M273 181 Q303 157 321 123 L373 43" fill="none" stroke="#8f5d2d" stroke-width="19" stroke-linecap="round"/>'+
      '<path d="M275 178 Q308 145 328 116 L372 45" fill="none" stroke="#c49150" stroke-width="12" stroke-linecap="round"/>'+
      '<ellipse cx="260" cy="190" rx="29" ry="18" transform="rotate(-19 260 190)" fill="#98632f" stroke="#795126" stroke-width="3"/>'+
      '<ellipse cx="257" cy="185" rx="21" ry="11" transform="rotate(-19 257 185)" fill="#c08b4b"/>'+
      '<path d="M234 202 Q259 213 286 195" fill="none" stroke="#ffe6a0" stroke-width="5" opacity=".68"/></g>'+
      '<ellipse cx="265" cy="168" rx="155" ry="74" fill="none" stroke="#fff9e9" stroke-width="9" opacity=".95"/>'+
      '<g class="ck-stir-steam" fill="none" stroke="#fff4d5" stroke-width="8" stroke-linecap="round" opacity=".75">'+
      '<path d="M210 77 Q190 57 213 26 M276 66 Q260 43 282 16 M335 81 Q316 55 337 29"/></g>'+
      '</svg></div>';
  }
  function soupPot(){
    if(state.phase==='simmer')return simmerPot();
    const done=state.phase==='serve'||state.phase==='complete';
    if(done)return carryServedBowl();
    const simmer=Math.min(5,state.simmer);
    const liquid=state.poured===0?'#d4a667':simmer>=4?'#eeb44b':simmer>=2?'#efab3c':'#f6c56a';
    let pieces='';
    const all=state.phase==='prep'?state.prepped:new Set(prepOrder);
    [...all].forEach((id,k)=>{
      const color=prepSteps[id]?.color||'#79a155';
      for(let i=0;i<id.length+3;i++){
        const x=154+((i*43+k*31)%235),y=144+((i*29+k*41)%83);
        const size=id==='carrot'?15:id==='herbs'?6:10;
        if(id==='carrot')pieces+='<ellipse cx="'+x+'" cy="'+y+'" rx="'+(size-2)+'" ry="'+(size*.6)+'" fill="'+color+'" stroke="#ce681c" stroke-width="2"/>';
        else if(id==='herbs')pieces+='<path d="M'+x+' '+y+'l'+size+' -9 l7 5 -5 9z" fill="'+color+'"/>';
        else pieces+='<rect x="'+x+'" y="'+y+'" width="'+size+'" height="'+size+'" rx="2" fill="'+color+'" stroke="#ffffff80" stroke-width="1"/>';
      }
    });
    let bubbles='';
    for(let i=0;i<Math.min(16,simmer*3);i++){
      const x=159+(i*37)%214,y=133+(i*19)%80;
      bubbles+='<circle cx="'+x+'" cy="'+y+'" r="'+(3+i%4)+'" fill="none" stroke="#fff6c8" stroke-width="2.6" opacity=".88"/>';
    }
    const fill=state.phase==='pour'?state.poured>0:(state.phase==='simmer'||done);
    const shape=done?
      '<ellipse cx="265" cy="198" rx="157" ry="92" fill="#fafaf4" stroke="#bac4ae" stroke-width="10"/>'+
      '<ellipse cx="265" cy="197" rx="140" ry="78" fill="#eca848" stroke="#d38b34" stroke-width="2"/>'+pieces+
      '<path d="M114 204 Q135 307 265 306 Q401 309 417 204" fill="none" stroke="#f1f3e8" stroke-width="13"/>'+
      '<path d="M112 204 Q135 312 265 311 Q395 313 419 204" fill="none" stroke="#92adb8" stroke-width="5"/>':
      '<path d="M110 155 Q114 303 184 310 Q277 345 359 307 Q418 288 421 155" fill="#9daeb4" stroke="#647b80" stroke-width="9"/>'+
      '<ellipse cx="266" cy="156" rx="169" ry="83" fill="#dce5de" stroke="#607d80" stroke-width="10"/>'+
      (fill?'<ellipse cx="266" cy="166" rx="'+(state.phase==='pour'?55+state.poured*32:151)+'" ry="'+(state.phase==='pour'?23+state.poured*14:66)+'" fill="'+liquid+'"/>'+pieces+bubbles:
        '<ellipse cx="266" cy="166" rx="151" ry="66" fill="#ffeed1"/>'+pieces)+
      '<path d="M99 154 Q72 146 69 168 Q66 192 103 199 M427 155 Q460 147 461 170 Q462 193 423 201" fill="none" stroke="#759196" stroke-width="17"/>'+      (state.phase==='pour'&&state.poured>0?'<path class="ck-broth-stream" d="M390 29 Q365 86 353 143" stroke="#edbd68" stroke-width="'+(7+state.poured*3)+'" stroke-linecap="round" fill="none" opacity=".76"/>':'');
    const spoon=state.phase==='simmer'?'<g class="ck-stir-spoon" style="--ck-angle:'+simmer*48+'deg"><path d="M362 42 L298 177" stroke="#9f703f" stroke-width="16" stroke-linecap="round"/><ellipse cx="293" cy="186" rx="15" ry="22" transform="rotate(25 293 186)" fill="#ba8a51"/></g>':'';
    const steam=state.phase==='simmer'||done?'<path class="ck-steam" d="M210 83 q-15 -23 3 -41 M267 76 q-13 -24 5 -42 M322 87 q-15 -24 4 -40" stroke="#f6f9e7" stroke-width="8" stroke-linecap="round" fill="none" opacity=".8"/>':'';
    const serving=done?'<g aria-hidden="true"><path d="M68 107 l24 -50 l26 49 Z" fill="#edbf5e"/><path d="M411 115 l25 -54 l34 57 Z" fill="#f4c468"/></g>':'';
    return '<div class="kq-countertop ck-countertop"><svg id="ckPot" class="ck-pot-svg" viewBox="0 0 530 365" role="img" aria-label="'+
      (done?'Finished bowl of orange carrot soup garnished with herbs':state.phase==='prep'?'Chopped vegetables filling the cooking pot':state.phase==='pour'?'Vegetable broth being poured into the pot':state.phase==='simmer'?'Carrot soup simmering and being stirred':'Empty soup pot waiting for ingredients')+'">'+
      '<ellipse cx="265" cy="325" rx="181" ry="19" fill="#6a492a" opacity=".18"/>'+serving+
      shape+spoon+steam+'</svg></div>';
  }
  /* Real four-frame food transformations: each cut changes the ingredient,
     not merely a counter or decorative pieces over an unchanged photograph. */
  function cuttingArt(id,hits){
    // Object-based board/food engine loads before this script.
    // Keep the previous illustrated frames as a safe fallback.
    if(window.CarryPrepScene)return window.CarryPrepScene.render(id,hits);
    if(!carryArtNames.has(id))return '';
    const frame=Math.max(0,Math.min(3,hits));
    const labels={
      carrot:['whole carrot','first carrot slices separated','more carrot slices','carrot fully sliced'],
      onion:['onion wedge','first onion pieces diced','onion partly diced','onion fully diced'],
      garlic:['garlic cloves','garlic roughly chopped','garlic mostly minced','garlic finely minced'],
      ginger:['whole ginger root','ginger partly grated','more grated ginger','ginger fully grated'],
      herbs:['whole herbs','herbs partly chopped','herbs mostly chopped','herbs finely chopped']
    };
    return '<div class="ck-art-board ck-art-'+id+' ck-art-progress-'+frame+'">'+
      '<img class="ck-prep-image" src="'+carryArtFile('prep-'+id+'-'+frame)+'" '+
      'alt="'+labels[id][frame]+'" draggable="false">'+
      '<span class="ck-slice-flash" aria-hidden="true"></span>'+
      '</div>';
  }
  function controls(){
    if(state.phase==='gather'){
      return '<div class="kq-step-head"><span class="kq-chapter">ROUND 01 / GARDEN BASKET</span>'+
        '<h3>Help Carry gather her soup ingredients!</h3><p>Choose all six ingredients to start cooking. Tap or drag each one into the basket.</p></div>'+
        '<div class="kq-pantry">'+pantry.map(x=>'<button class="kq-ingredient'+(state.collected.has(x.id)?' selected':'')+
          '" type="button" data-collect="'+x.id+'" draggable="true" aria-pressed="'+state.collected.has(x.id)+'">'+
          '<span aria-hidden="true">'+x.emoji+'</span><b>'+x.name+'</b><small>'+
          (state.collected.has(x.id)?'Collected ✓':'Tap or drag')+'</small></button>').join('')+'</div>'+
        '<div id="ckBasket" class="kq-basket"><strong>🧺 Carry’s basket · '+state.collected.size+'/6</strong><span>'+
        ([...state.collected].map(id=>pantry.find(p=>p.id===id)?.emoji||'').join(' ')||'Drop ingredients here!')+'</span></div>'+
        '<button type="button" class="kq-main-action" data-action="next" '+(state.collected.size===pantry.length?'':'disabled')+
        '>Ready to prepare the veggies →</button>';
    }
    if(state.phase==='prep'){
      const p=state.prep,x=p?pantry.find(i=>i.id===p.id):null;
      return '<div class="kq-step-head"><span class="kq-chapter">ROUND 02 / GARDEN PREP</span>'+
        '<h3>Slice, dice, mince and grate!</h3><p>Pick an ingredient and prepare it in three steps. In real life, a grown-up helps with sharp tools.</p></div>'+
        soupPot()+'<div class="kq-pantry ck-prep-list">'+prepOrder.map(id=>{
          const item=pantry.find(x=>x.id===id);
          return '<button class="kq-ingredient'+(state.prepped.has(id)?' selected':'')+(p?.id===id?' kq-preparing':'')+
            '" type="button" data-select="'+id+'" '+(state.prepped.has(id)?'disabled':'')+
            ' aria-pressed="'+(p?.id===id)+'"><span aria-hidden="true">'+item.emoji+'</span><b>'+item.name+'</b><small>'+
            (state.prepped.has(id)?'Prepped ✓':prepSteps[id].verb)+'</small></button>';
        }).join('')+'</div>'+
        (p?'<div class="kq-prep-panel ck-prep-panel"><div class="kq-prep-top"><strong>'+x.emoji+' '+prepSteps[p.id].name+
          '</strong><span>'+p.hits+'/3</span></div>'+
          '<button type="button" class="kq-prep-art-button" data-action="cut" aria-label="'+prepSteps[p.id].name+'">'+cuttingArt(p.id,p.hits)+'</button>'+
          '<p>'+prepSteps[p.id].safety+'</p><div class="kq-meter"><span style="width:'+(p.hits/3*100)+'%"></span></div>'+
          (p.hits===3?
            '<div class="ck-finish-feedback" role="status">✓ Beautifully prepared! Adding to Carry’s pot…</div>'+
            '<button type="button" class="kq-main-action" data-action="finish-prep">Add to the soup! →</button>':
            '<button type="button" class="kq-main-action" data-action="cut">'+prepSteps[p.id].verb+'! ✨</button>'+
            '<button type="button" class="kq-cancel" data-action="cancel">Pick another ingredient</button>')+'</div>':
          '<p class="kq-prep-prompt">'+state.prepped.size+' of five vegetables and herbs ready.</p>')+
        '<button type="button" class="kq-next" data-action="next" '+(state.prepped.size===prepOrder.length?'':'disabled')+
        '>Add the broth →</button>';
    }
    if(state.phase==='pour'){
      return '<div class="kq-step-head"><span class="kq-chapter">ROUND 03 / POUR THE BROTH</span>'+
        '<h3>Pour the veggie broth!</h3><p>Tap three times to fill the pot. Use broth with less sodium when cooking at home.</p></div>'+
        soupPot()+'<div class="kq-count">'+state.poured+' of 3 pours</div>'+
        '<div class="kq-meter"><span style="width:'+(state.poured/3*100)+'%"></span></div>'+
        '<button type="button" class="kq-main-action" data-action="pour" '+(state.poured>=3?'disabled':'')+'>'+
        '🥣 Pour broth '+(state.poured>=3?'✓':'')+'</button>'+
        (state.poured===3?'<button type="button" class="kq-next" data-action="next">Ready to simmer →</button>':'');
    }
    if(state.phase==='simmer'){
      return '<div class="kq-step-head"><span class="kq-chapter">ROUND 04 / SIMMER TIME</span>'+
        '<h3>Make that soup warm and cozy!</h3><p>Tap or swipe across the pot to stir five times. Cooking can soften carrots and help make some beta-carotene easier to access.</p></div>'+
        soupPot()+'<div class="kq-count">'+state.simmer+' of 5 gentle stirs</div>'+
        '<div class="kq-meter"><span style="width:'+(state.simmer*20)+'%"></span></div>'+
        '<button type="button" class="kq-main-action" data-action="simmer" '+(state.simmer>=5?'disabled':'')+'>'+
        '🥄 Stir the soup '+(state.simmer>=5?'✓':'')+'</button>'+
        (state.simmer>=5?'<button type="button" class="kq-next" data-action="next">Soup is ready! Serve it →</button>':'')+
        '<p class="ck-safe-note">This is a virtual stove. A grown-up handles real hot pots, hot soup and appliances.</p>';
    }
    if(state.phase==='serve'){
      return '<div class="kq-step-head"><span class="kq-chapter">ROUND 05 / SOUP STAR</span>'+
        '<h3>Carry’s Special Soup is ready!</h3><p>Look at that cozy carrot soup. Plate it to unlock the printable family recipe.</p></div>'+
        soupPot()+'<button type="button" class="kq-main-action" data-action="complete">✨ Serve Carry’s Special Soup!</button>';
    }
    return '<div class="kq-step-head"><span class="kq-chapter">LEVEL TWO COMPLETE!</span>'+
      '<h3>Carry says: WE DID IT!</h3><p>You made carrot soup virtually, and learned how your body uses nutrients from food.</p></div>'+
      soupPot()+'<div class="kq-unlock"><strong>🔓 Your family soup recipe is unlocked!</strong>'+
      '<p>Download an easy-to-print PDF with ingredient measurements, cooking steps, and safety notes for grown-ups.</p>'+
      '<button type="button" class="kq-main-action" data-action="download">⬇ Download Carry’s Soup PDF</button>'+
      '<small>Requesting the download earns Carry’s Carrot Stamp and a new garden seed!</small></div>'+
      '<button type="button" class="kq-next" data-action="restart">↻ Cook again</button>';
  }
  function drawReward(){
    const gary=stored(garyKey);
    const seedCount=(gary.downloaded===true?1:0)+(state.downloaded?1:0);
    reward.innerHTML='<div class="kq-reward-title">🌱 Your Chef Passport</div>'+
      '<div class="kq-stamps"><span class="kq-stamp'+(state.completed?' earned':'')+'">'+
      (state.completed?'🏆':'🔒')+'<b>Soup Chef</b></span>'+
      '<span class="kq-stamp'+(state.downloaded?' earned':'')+'">'+
      (state.downloaded?'🥕':'🔒')+'<b>Carry’s Stamp</b></span>'+
      '<span class="kq-stamp'+(state.activityDone?' earned':'')+'">'+
      (state.activityDone?'🌟':'🔒')+'<b>Color Explorer</b></span></div>'+
      '<div class="kq-garden-plot"><span aria-hidden="true">'+(state.downloaded?'🌱':'🪴')+
      '</span><div><strong>'+seedCount+' garden '+(seedCount===1?'seed':'seeds')+' collected</strong><p>'+
      (state.downloaded?'You planted Carry’s carrot seed! Complete more recipes to grow your garden.':
        'Finish Carry’s recipe and request the PDF download to earn a carrot seed.')+'</p></div></div>'+
      '<p class="kq-save-note">Progress saves on this device when your browser allows it. No account needed.</p>';
  }
  function drawActivity(){
    if(!state.completed){
      activity.innerHTML='<div class="kq-activity-locked"><span aria-hidden="true">🥕</span><div>'+
        '<b>Carry’s Color Power Trail</b><p>Make the soup first to unlock a mini-game about colorful foods and nutrients.</p></div></div>';return;
    }
    if(state.quiz>=questions.length){
      activity.innerHTML='<div class="kq-activity-win"><span aria-hidden="true">🌟</span>'+
        '<h3>Carry’s Color Power Trail complete!</h3><p>You found the connection between colorful carrots, vitamin A, and healthy movement.</p>'+
        '<button type="button" class="kq-next" data-action="replay-quiz">Try the questions again ↻</button></div>';return;
    }
    const q=questions[state.quiz];
    const icons=['🥕','🌱','🌞'].map((s,i)=>'<span class="'+(i<=state.quiz?'reached':'')+'">'+s+'</span>').join('');
    activity.innerHTML='<div class="kq-trail">'+icons+'</div><p class="kq-chapter">COLOR POWER TRAIL · '+(state.quiz+1)+'/3</p>'+
      '<h3>'+escapeText(q.q)+'</h3><div class="kq-trail-options">'+
      q.a.map((answer,i)=>'<button type="button" class="kq-trail-choice" data-answer="'+i+'" '+
      (state.quizCorrect?'disabled':'')+'>'+escapeText(answer)+'</button>').join('')+'</div>'+
      '<p class="kq-trail-feedback" role="status">'+escapeText(state.quizNote)+'</p>'+
      (state.quizCorrect?'<button type="button" class="kq-main-action" data-action="next-question">'+
      (state.quiz===2?'Finish the trail →':'Next question →')+'</button>':'');
  }
  function render(){stage.innerHTML=controls();drawSteps();drawReward();drawActivity();root.dataset.phase=state.phase}
  function next(){
    const flow=['gather','prep','pour','simmer','serve'];
    const i=flow.indexOf(state.phase);
    const ready=state.phase==='gather'?state.collected.size===pantry.length:
      state.phase==='prep'?state.prepped.size===prepOrder.length&&!state.prep:
      state.phase==='pour'?state.poured===3:state.phase==='simmer'?state.simmer===5:false;
    if(!ready||i<0)return;
    state.phase=flow[i+1];say('Great cooking! Next up: '+steps[i+1]);render();
  }
  function gather(id){
    if(state.phase!=='gather'||!pantry.some(x=>x.id===id)||state.collected.has(id))return;
    state.collected.add(id);say('Added '+pantry.find(x=>x.id===id).name+'. '+state.collected.size+' of six gathered.');render();
  }
  function select(id){
    if(state.phase!=='prep'||!prepSteps[id]||state.prepped.has(id)||state.prep?.hits===3)return;
    state.prep={id,hits:0};say(prepSteps[id].name+' — three steps to go!');render();
  }
  function finishPrep(id){
    if(state.phase!=='prep'||state.prep?.id!==id||state.prep.hits!==3)return;
    state.prepped.add(id);
    state.prep=null;
    say(prepSteps[id].science+' Added to the pot!');
    render();
  }
  function cut(){
    if(state.phase!=='prep'||!state.prep||state.prep.hits>=3)return;
    const id=state.prep.id;
    state.prep.hits++;
    const hits=state.prep.hits;
    // Keep the board, knife and progress controls mounted. Update just the
    // vegetable pieces: no flash of a different static board on each tap.
    const board=stage.querySelector('.ck-live-board');
    const live=window.CarryPrepScene&&window.CarryPrepScene.update(board,id,hits);
    if(live){
      const count=stage.querySelector('.kq-prep-top span');
      if(count)count.textContent=hits+'/3';
      const bar=stage.querySelector('.ck-prep-panel .kq-meter span');
      if(bar)bar.style.width=(hits/3*100)+'%';
      if(hits===3){
        const action=stage.querySelector('[data-action="cut"]');
        if(action){action.dataset.action='finish-prep';action.textContent='✓ Add to Carry’s soup →'}
        const cancel=stage.querySelector('[data-action="cancel"]');
        if(cancel)cancel.hidden=true;
      }
    }else render();
    if(hits===3){
      say('Beautifully prepared! '+prepSteps[id].name+' complete.');
      if(!live)render();
      window.setTimeout(()=>finishPrep(id),1000);
    }else say(prepSteps[id].verb+' step '+hits+' of three! The food is changing.');
  }
  function pour(){
    if(state.phase!=='pour'||state.poured===3)return;
    state.poured++;say(state.poured===3?'Broth is in! Now it’s ready to simmer.':'Pour '+state.poured+' of three.');render();
  }
  function simmer(){
    if(state.phase!=='simmer'||state.simmer>=5)return;
    state.simmer++;
    const pot=stage.querySelector('#ckPot');
    const food=stage.querySelector('#ckSoupIngredients');
    if(pot&&food){
      // Rotating the SAME SVG objects triggers a continuous circular transition,
      // rather than replacing the whole pot and losing the motion.
      food.style.transform='rotate('+(state.simmer*245)+'deg)';
      pot.dataset.stirs=String(state.simmer);
      pot.classList.remove('ck-stir-pulse');
      void pot.offsetWidth;
      pot.classList.add('ck-stir-pulse');
      const count=stage.querySelector('.kq-count');
      if(count)count.textContent=state.simmer+' of 5 gentle stirs';
      const bar=stage.querySelector('.kq-meter span');
      if(bar)bar.style.width=(state.simmer*20)+'%';
      const button=stage.querySelector('[data-action="simmer"]');
      if(state.simmer===5&&button){
        button.disabled=true;
        button.textContent='✓ Soup stirred!';
        // Reveal the Serve control only after the final stir animation.
        window.setTimeout(()=>{if(state.phase==='simmer'&&state.simmer===5)render()},1050);
      }
    }else render();
    say(state.simmer===5?'The soup is ready! Let’s serve it.':'Stir '+state.simmer+' of five — watch the vegetables swirl!');
  }
  function finish(){
    if(state.phase!=='serve')return;
    state.phase='complete';state.completed=true;persist();render();
    say('Congratulations! Download the family soup recipe to earn Carry’s stamp and seed.');
    const confetti=document.getElementById('ckConfetti');
    if(confetti){
      confetti.innerHTML=Array.from({length:16},(_,i)=>'<i style="--i:'+i+'"></i>').join('');
      confetti.classList.remove('burst');void confetti.offsetWidth;confetti.classList.add('burst');
    }
  }
  function pdfEscape(v){return String(v).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
  /* Printable 1-page letter-sized PDF, built locally with no server or fees. */
  function makePdf(){
    const pg=[];
    const rect=(r,g,b,x,y,w,h)=>pg.push(r+' '+g+' '+b+' rg '+x+' '+y+' '+w+' '+h+' re f');
    const txt=(x,y,v,size,bold,rgb)=>{
      pg.push((rgb||[.16,.28,.17]).join(' ')+' rg BT /'+(bold?'F2':'F1')+' '+size+' Tf '+x+' '+y+
        ' Td ('+pdfEscape(v)+') Tj ET');
    };
    rect(.996,.984,.947,0,0,612,792);
    rect(.82,.34,.08,0,636,612,156);
    rect(.22,.56,.23,0,630,612,6);
    txt(45,747,'MARKET VEGGIES / KITCHEN QUEST',13,true,[1,.96,.70]);
    txt(45,708,"CARRY'S SPECIAL SOUP",28,true,[1,1,1]);
    txt(45,673,'CHEF PASSPORT / PRINTABLE FAMILY RECIPE',11,true,[1,1,1]);
    txt(45,648,'Family-friendly adaptation | 4 servings | Approx. 30 minutes',10,false,[1,1,1]);
    txt(45,599,"YOU'LL NEED",16,true,[.64,.29,.08]);
    [
      '4 medium carrots, washed and cut into pieces',
      '1/2 medium onion, diced',
      '2 garlic cloves, minced',
      '1 teaspoon freshly grated ginger',
      '3 cups low-sodium vegetable broth',
      '1 tablespoon olive oil (optional)',
      'Fresh herbs for garnish (optional)'
    ].forEach((v,i)=>txt(52,575-i*21,'- '+v,10.7,false));
    rect(.93,.81,.6,45,408,523,1);
    txt(45,387,'COOK IT TOGETHER',15,true,[.64,.29,.08]);
    [
      '1. Ask a grown-up to cut the vegetables and prepare the stove.',
      '2. In a pot, gently soften onion in a little olive oil (if using).',
      '3. Add garlic, ginger and carrots; stir briefly with adult help.',
      '4. Add the broth and simmer until the carrots are tender, 15-20 min.',
      '5. Let a grown-up serve the soup; garnish with herbs if desired.'
    ].forEach((v,i)=>txt(52,361-i*22,v,10.25,false));
    rect(.98,.91,.73,43,162,526,80);
    txt(55,223,'CARROT SCIENCE + GARDEN ACTIVITY',11.8,true,[.52,.30,.07]);
    txt(55,204,'Carrots contain beta-carotene, which your body can turn into vitamin A.',10.2,false,[.31,.30,.17]);
    txt(55,186,'Cooking softens carrots. A little dietary fat can help absorb carotenoids.',10.2,false,[.31,.30,.17]);
    txt(55,168,'Color quest: spot five colors on a walk or in your kitchen!',10.2,false,[.31,.30,.17]);
    txt(45,135,'GROWN-UP GUIDE',12,true,[.64,.29,.08]);
    txt(45,115,'Adults handle knives, hot surfaces and hot soup. Let soup cool',10.2,false);
    txt(45,99,'before serving; check food allergies and age-appropriate textures.',10.2,false);
    txt(45,83,'Refrigerate leftovers promptly; use within 3-4 days.',10.2,false);
    rect(.17,.42,.2,0,0,612,61);
    txt(45,37,'FRESH PRODUCE. BIG ADVENTURES.',12,true,[1,.94,.63]);
    txt(45,21,'Market Veggies | marketveggies.hireberna.app',9,false,[1,1,1]);
    const stream=pg.join('\n')+'\n';
    const obj=[
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
      '<< /Length '+stream.length+' >>\nstream\n'+stream+'endstream'
    ];
    let pdf='%PDF-1.4\n';const offsets=[0];
    obj.forEach((v,i)=>{offsets.push(pdf.length);pdf+=(i+1)+' 0 obj\n'+v+'\nendobj\n';});
    const xref=pdf.length;
    pdf+='xref\n0 '+(obj.length+1)+'\n0000000000 65535 f \n';
    for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf+='trailer\n<< /Size '+(obj.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n';
    return new Blob([pdf],{type:'application/pdf'});
  }
  function download(){
    if(!state.completed)return;
    const url=URL.createObjectURL(makePdf());
    const a=document.createElement('a');a.href=url;a.download='Market-Veggies-Carry-Special-Soup-Recipe.pdf';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
    state.downloaded=true;persist();say('Soup recipe download requested! You earned Carry’s carrot stamp and garden seed.');render();
  }
  function answer(index){
    if(!state.completed||state.quizCorrect||state.quiz>=questions.length)return;
    const q=questions[state.quiz];
    if(index===q.right){state.quizCorrect=true;state.quizNote=q.explain;say(q.explain)}
    else{state.quizNote='Try again! Take another look at what food and cooking do.';say(state.quizNote)}
    drawActivity();
  }
  function nextQuestion(){
    if(!state.quizCorrect)return;
    state.quiz++;state.quizCorrect=false;state.quizNote='';
    if(state.quiz===questions.length){state.activityDone=true;persist();say('Color Explorer badge unlocked!')}
    drawActivity();drawReward();
  }
  function restart(){
    state.phase='gather';state.collected.clear();state.prepped.clear();state.prep=null;
    state.poured=0;state.simmer=0;state.quiz=0;state.quizCorrect=false;state.quizNote='';
    say('Welcome back to Carry’s Kitchen! Your earned rewards will stay.');render();
  }
  function gameClick(event){
    const button=event.target.closest('button');
    if(!button)return;
    if(button.dataset.collect){gather(button.dataset.collect);return}
    if(button.dataset.select){select(button.dataset.select);return}
    if(button.dataset.answer!==undefined){answer(Number(button.dataset.answer));return}
    switch(button.dataset.action){
      case 'next':next();break;
      case 'cut':cut();break;
      case 'finish-prep':if(state.prep)finishPrep(state.prep.id);break;
      case 'cancel':if(state.prep?.hits!==3){state.prep=null;render()}break;
      case 'pour':pour();break;
      case 'simmer':simmer();break;
      case 'complete':finish();break;
      case 'download':download();break;
      case 'next-question':nextQuestion();break;
      case 'replay-quiz':state.quiz=0;state.quizCorrect=false;state.quizNote='';drawActivity();break;
      case 'restart':restart();break;
    }
  }
  root.addEventListener('click',gameClick);
  activity.addEventListener('click',gameClick);
  root.addEventListener('dragstart',e=>{
    const item=e.target.closest('[data-collect]');if(!item||state.phase!=='gather'||!e.dataTransfer)return;
    e.dataTransfer.setData('text/plain',item.dataset.collect);e.dataTransfer.effectAllowed='copy';
  });
  root.addEventListener('dragover',e=>{if(state.phase==='gather'&&e.target.closest('#ckBasket'))e.preventDefault()});
  root.addEventListener('drop',e=>{
    if(state.phase!=='gather'||!e.target.closest('#ckBasket'))return;
    e.preventDefault();gather(e.dataTransfer?.getData('text/plain'));
  });
  let pointer=null;
  root.addEventListener('pointerdown',e=>{
    if(state.phase==='simmer'&&e.target.closest('#ckPot'))pointer={x:e.clientX,y:e.clientY};
  });
  root.addEventListener('pointerup',e=>{
    if(!pointer)return;
    // A tap or a short circular drag on the soup counts as one stir.
    // The on-screen Stir button remains an accessible alternative.
    if(state.phase==='simmer'&&e.target.closest('#ckPot'))simmer();
    pointer=null;
  });
  root.addEventListener('pointercancel',()=>{pointer=null});
  function showStation(id){
    if(id!=='gary'&&id!=='carry')return;
    const carry=id==='carry';
    const garyLevel=document.getElementById('kqGaryLevel');
    const garyTrail=document.getElementById('kqGaryActivityWrap');
    if(!garyLevel||!garyTrail)return;
    garyLevel.hidden=carry;
    garyTrail.hidden=carry;
    root.hidden=!carry;activity.hidden=!carry;
    stations.querySelectorAll('[data-station]').forEach(btn=>{
      btn.classList.toggle('active',btn.dataset.station===id);
      btn.setAttribute('aria-pressed',String(btn.dataset.station===id));
    });
    const hero=document.querySelector('.kq-hero-art img');
    if(hero){
      hero.src=carry?'assets/recipe-carry-soup.png':'assets/recipe-gary-guacamole.png';
      hero.alt=carry?'Carry the Carrot serving her special carrot soup':'Gary the Garlic with guacamole and fresh market ingredients';
    }
    const tag=document.querySelector('.kq-art-sticker');
    if(tag)tag.innerHTML=carry?'LEVEL 02<br>NOW OPEN!':'LEVEL 01<br>NOW OPEN!';
    if(carry)say('Welcome to Carry’s Kitchen! Pick your ingredients and make some soup.');
  }
  stations.addEventListener('click',e=>{
    const button=e.target.closest('[data-station]');if(!button)return;
    showStation(button.dataset.station);
    // Keep keyboard focus on the selected station button.
  });
  render();
  // Food is drawn as live SVG objects. No old static-image frame preloading.
  if(new URLSearchParams(window.location.search).get('chef')==='carry')showStation('carry');
})();
