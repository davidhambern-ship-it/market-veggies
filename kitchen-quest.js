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
  const steps=['Gather','Mash','Add flavor','Stir','Serve'];
  const storageKey='marketveggies.kitchenquest.v1';
  function restore(){
    try{
      const data=JSON.parse(localStorage.getItem(storageKey)||'{}');
      return {completed:data.completed===true,downloaded:data.downloaded===true,activityDone:data.activityDone===true};
    }catch(error){return {completed:false,downloaded:false,activityDone:false}}
  }
  const saved=restore();
  let state={phase:saved.completed?'complete':'gather',collected:new Set(),added:new Set(),
    mash:0,stir:0,completed:saved.completed,downloaded:saved.downloaded,
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
  function bowl(extra){
    return '<div class="kq-countertop"><div class="kq-bowl '+(extra||'')+
      '" id="kqBowl" aria-label="Mixing bowl">'+
      '<div class="kq-food" aria-hidden="true">'+
      (state.mash?'🥑':'🥑')+
      '<div class="kq-mix-ins">'+[...state.added].map(id=>{
        const item=pantry.find(x=>x.id===id);return item?'<span>'+item.emoji+'</span>':'';
      }).join('')+'</div></div><span class="kq-spoon" aria-hidden="true">🥄</span></div></div>';
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
      return '<div class="kq-step-head"><span class="kq-chapter">ROUND 03 / FLAVOR FACTORY</span>'+
        '<h3>Build your flavor!</h3><p>Add the lime, garlic, tomato, onion and cilantro to your avocado bowl.</p></div>'+
        bowl('kq-seasoning')+'<div class="kq-pantry kq-toppings">'+toppings.map(item=>
          '<button class="kq-ingredient'+(state.added.has(item.id)?' selected':'')+
          '" type="button" data-season="'+item.id+'" aria-pressed="'+state.added.has(item.id)+'">'+
          '<span aria-hidden="true">'+item.emoji+'</span><b>'+item.name+'</b><small>'+
          (state.added.has(item.id)?'In the bowl ✓':'Add to bowl')+'</small></button>').join('')+'</div>'+
        '<button type="button" class="kq-main-action" data-action="next" '+(state.added.size===toppings.length?'':'disabled')+
        '>Ready to stir →</button>';
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
        '<div class="kq-finished-food" aria-hidden="true">🥑<span>✨</span>🥣<span>✨</span>🧄</div>'+
        '<button type="button" class="kq-main-action" data-action="complete">✨ Serve your guacamole!</button>';
    }
    return '<div class="kq-step-head"><span class="kq-chapter">LEVEL COMPLETED!</span>'+
      '<h3>Chef Gary says: YOU DID IT!</h3><p>You cooked your first virtual Market Veggies recipe. The real-world recipe is ready!</p></div>'+
      '<div class="kq-finished-food" aria-hidden="true">🎉 🥑 🏆</div>'+
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
    if(state.phase!=='season'||!toppings.some(x=>x.id===id)||state.added.has(id))return;
    state.added.add(id);
    const lines={
      garlic:'Crushing garlic changes its sulfur compounds and helps release its signature aroma.',
      lime:'Lime adds bright flavor and some vitamin C.',
      tomato:'Tomatoes get much of their red color from a plant pigment called lycopene.',
      onion:'Onion adds crunch and bold flavor to your bowl.',
      cilantro:'Cilantro is a leafy herb that brings a fresh aroma.'
    };
    announce(lines[id]||'Ingredient added!');
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
    const button=event.target.closest('button');if(!button||!root.contains(button))return;
    if(button.dataset.collect){addIngredient(button.dataset.collect);return}
    if(button.dataset.season){addTopping(button.dataset.season);return}
    if(button.dataset.answer!==undefined){quizAnswer(Number(button.dataset.answer));return}
    switch(button.dataset.action){
      case 'next':next();break;
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
        state.mash=0;state.stir=0;state.quiz=0;state.quizCorrect=false;state.quizNotice='';
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
})();