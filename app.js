const toggle=document.querySelector('.mobile-toggle');
const links=document.querySelector('.navlinks');
if(toggle&&links){toggle.addEventListener('click',()=>links.classList.toggle('open'));links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')))}
const BOOK_CHECKOUT={book1:''};
document.querySelectorAll('[data-book-buy]').forEach(btn=>{btn.addEventListener('click',()=>{const url=BOOK_CHECKOUT[btn.dataset.bookBuy];if(url){location.href=url;return}alert('The Market Veggies bookstore checkout is being connected. No payment was attempted.');});});

const missionSlides=[...document.querySelectorAll('.mission-bg-slide')];
let missionIndex=0;
let missionTimer=null;
function showMissionBackground(index){
  if(!missionSlides.length)return;
  missionIndex=(index+missionSlides.length)%missionSlides.length;
  missionSlides.forEach((slide,i)=>slide.classList.toggle('active',i===missionIndex));
}
function startMissionRotation(){
  if(missionSlides.length<2||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  clearInterval(missionTimer);
  missionTimer=setInterval(()=>showMissionBackground(missionIndex+1),6500);
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){clearInterval(missionTimer)}
  else{startMissionRotation()}
});
showMissionBackground(0);
startMissionRotation();


// Home page interaction reveal pass
(function initHomeMotion(){
  const home=document.body.classList.contains('home-page');
  if(!home)return;

  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const groups=[
    [...document.querySelectorAll('.mission-cards-section .mission-card')],
    [...document.querySelectorAll('.section.alt .section-head, .character-feature, .crew-card')],
    [...document.querySelectorAll('.recipe-adventures-section .section-head, .book-recipe-card')],
    [...document.querySelectorAll('.book-band > *')]
  ];

  const targets=[];
  groups.forEach(group=>{
    group.forEach((el,index)=>{
      el.classList.add('mv-reveal');
      el.style.setProperty('--mv-delay', Math.min(index*90,360)+'ms');
      targets.push(el);
    });
  });

  if(reduce || !('IntersectionObserver' in window)){
    targets.forEach(el=>el.classList.add('mv-in-view'));
    return;
  }

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add('mv-in-view');
      observer.unobserve(entry.target);
    });
  },{threshold:.12,rootMargin:'0px 0px -7% 0px'});

  targets.forEach(el=>observer.observe(el));
})();


// Meet the Characters story carousel + Gary explainer
(function initCharacterStories(){
  const carousel=document.getElementById('characterCarousel');
  if(!carousel)return;
  const storySection=carousel.closest('.character-story-section');
  const atmosphereLayers=storySection?[...storySection.querySelectorAll('.character-atmosphere-layer')]:[];

  const track=carousel.querySelector('.character-track');
  const slides=[...carousel.querySelectorAll('.character-story-slide')];
  const dots=[...document.querySelectorAll('.character-dot')];
  const prev=carousel.querySelector('.character-prev');
  const next=carousel.querySelector('.character-next');
  const current=document.getElementById('characterCurrent');
  const total=document.getElementById('characterTotal');
  let index=0;
  let startX=null;
  let pointerId=null;

  if(total) total.textContent=slides.length;

  function showSlide(nextIndex){
    index=(nextIndex+slides.length)%slides.length;
    track.style.transform='translateX(-'+(index*100)+'%)';
    slides.forEach((slide,i)=>slide.classList.toggle('active',i===index));
    // Repaint only the surrounding PAGE section; character cards remain unchanged.
    const character=slides[index]?.dataset.character||'gary';
    if(storySection)storySection.dataset.characterTheme=character;
    atmosphereLayers.forEach(layer=>layer.classList.toggle('active',layer.dataset.atmosphere===character));
    dots.forEach((dot,i)=>{
      dot.classList.toggle('active',i===index);
      dot.setAttribute('aria-selected',i===index?'true':'false');
    });
    if(current) current.textContent=index+1;
  }

  prev?.addEventListener('click',()=>showSlide(index-1));
  next?.addEventListener('click',()=>showSlide(index+1));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>showSlide(i)));

  carousel.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'){e.preventDefault();showSlide(index-1)}
    if(e.key==='ArrowRight'){e.preventDefault();showSlide(index+1)}
  });

  carousel.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    startX=e.clientX;
    pointerId=e.pointerId;
  });
  carousel.addEventListener('pointerup',e=>{
    if(startX===null||e.pointerId!==pointerId)return;
    const delta=e.clientX-startX;
    if(Math.abs(delta)>55){
      showSlide(index+(delta<0?1:-1));
    }
    startX=null;
    pointerId=null;
  });
  carousel.addEventListener('pointercancel',()=>{
    startX=null;
    pointerId=null;
  });

  const garyButtons=[...document.querySelectorAll('.gary-fact')];
  const garyArt=document.getElementById('garyMainArt');
  const garyTitle=document.getElementById('garyFactTitle');
  const garyCopy=document.getElementById('garyFactCopy');
  const garySpeech=document.getElementById('garySpeech');
  const crush=document.getElementById('crushClove');
  const crushResult=document.getElementById('crushResult');

  function setGaryFact(btn){
    garyButtons.forEach(b=>{
      const active=b===btn;
      b.classList.toggle('active',active);
      b.setAttribute('aria-selected',active?'true':'false');
    });

    if(garyTitle) garyTitle.textContent=btn.dataset.title||'';
    if(garyCopy) garyCopy.textContent=btn.dataset.copy||'';
    if(garySpeech) garySpeech.textContent=btn.dataset.speech||'';
    if(crushResult){
      crushResult.hidden=true;
      crushResult.classList.remove('pop');
    }

    const src=btn.dataset.image;
    if(garyArt&&src&&garyArt.getAttribute('src')!==src){
      garyArt.classList.add('swap-out');
      window.setTimeout(()=>{
        garyArt.src=src;
        garyArt.onload=()=>{
          garyArt.classList.remove('swap-out');
          garyArt.classList.add('swap-in');
          window.setTimeout(()=>garyArt.classList.remove('swap-in'),420);
        };
      },140);
    }
  }

  garyButtons.forEach(btn=>btn.addEventListener('click',()=>setGaryFact(btn)));

  crush?.addEventListener('click',()=>{
    if(!crushResult)return;
    crushResult.hidden=!crushResult.hidden;
    crushResult.classList.remove('pop');
    if(!crushResult.hidden){
      requestAnimationFrame(()=>crushResult.classList.add('pop'));
    }
  });


  const carryButtons=[...document.querySelectorAll('.carry-fact')];
  const carryArt=document.getElementById('carryMainArt');
  const carryTitle=document.getElementById('carryFactTitle');
  const carryCopy=document.getElementById('carryFactCopy');
  const carrySpeech=document.getElementById('carrySpeech');
  const pickCrunch=document.getElementById('pickCrunch');
  const crunchOptions=document.getElementById('crunchOptions');
  const crunchChoices=[...document.querySelectorAll('.crunch-choice')];
  const crunchResultBox=document.getElementById('crunchResultBox');
  const crunchResultTitle=document.getElementById('crunchResultTitle');
  const crunchResultCopy=document.getElementById('crunchResultCopy');

  function setCarryFact(btn){
    carryButtons.forEach(b=>{
      const active=b===btn;
      b.classList.toggle('active',active);
      b.setAttribute('aria-selected',active?'true':'false');
    });

    if(carryTitle) carryTitle.textContent=btn.dataset.title||'';
    if(carryCopy) carryCopy.textContent=btn.dataset.copy||'';
    if(carrySpeech) carrySpeech.textContent=btn.dataset.speech||'';

    if(crunchOptions) crunchOptions.hidden=true;
    if(crunchResultBox){
      crunchResultBox.hidden=true;
      crunchResultBox.classList.remove('pop');
    }

    const src=btn.dataset.image;
    if(carryArt&&src&&carryArt.getAttribute('src')!==src){
      carryArt.classList.add('swap-out');
      window.setTimeout(()=>{
        carryArt.src=src;
        carryArt.onload=()=>{
          carryArt.classList.remove('swap-out');
          carryArt.classList.add('swap-in');
          window.setTimeout(()=>carryArt.classList.remove('swap-in'),420);
        };
      },140);
    }
  }

  carryButtons.forEach(btn=>btn.addEventListener('click',()=>setCarryFact(btn)));

  pickCrunch?.addEventListener('click',()=>{
    if(!crunchOptions)return;
    crunchOptions.hidden=!crunchOptions.hidden;
    if(crunchResultBox) crunchResultBox.hidden=true;
  });

  crunchChoices.forEach(choice=>{
    choice.addEventListener('click',()=>{
      if(crunchResultTitle) crunchResultTitle.textContent=choice.dataset.crunchTitle||'';
      if(crunchResultCopy) crunchResultCopy.textContent=choice.dataset.crunchCopy||'';
      if(crunchResultBox){
        crunchResultBox.hidden=false;
        crunchResultBox.classList.remove('pop');
        requestAnimationFrame(()=>crunchResultBox.classList.add('pop'));
      }
    });
  });


  const artieButtons=[...document.querySelectorAll('.artie-fact')];
  const artieArt=document.getElementById('artieMainArt');
  const artieTitle=document.getElementById('artieFactTitle');
  const artieCopy=document.getElementById('artieFactCopy');
  const artieSpeech=document.getElementById('artieSpeech');
  const peelHeart=document.getElementById('peelHeart');
  const peelProgress=document.getElementById('peelProgress');
  const peelSteps=[...document.querySelectorAll('.peel-step')];
  const peelResultBox=document.getElementById('peelResultBox');
  const peelResultTitle=document.getElementById('peelResultTitle');
  const peelResultCopy=document.getElementById('peelResultCopy');
  const peelResultQuote=document.getElementById('peelResultQuote');
  const peelNext=document.getElementById('peelNext');
  let peelIndex=0;

  const peelStages=[
    {
      title:'OUTER LEAVES',
      copy:'Start on the outside. Pull away the firm outer leaves and keep exploring inward.',
      quote:'“One layer at a time.”',
      image:'assets/characters/artie/artie-leaf-layers.png'
    },
    {
      title:'INNER LEAVES',
      copy:'The leaves become softer and more tender as you move toward the center.',
      quote:'“Getting warmer… keep going.”',
      image:'assets/characters/artie/artie-investigates.png'
    },
    {
      title:'THE CHOKE',
      copy:'Near the center is the fuzzy choke. A grown-up can help remove this part before eating the heart.',
      quote:'“Almost there. Don’t stop now.”',
      image:'assets/characters/artie/artie-investigates.png'
    },
    {
      title:'YOU FOUND THE HEART! 💚',
      copy:'Under all those layers is the tender artichoke heart — the part Artie says is worth the exploring.',
      quote:'“See? Sometimes the best part takes a little exploring.”',
      image:'assets/characters/artie/artie-heart.png'
    }
  ];

  function swapArtieImage(src){
    if(!artieArt||!src||artieArt.getAttribute('src')===src)return;
    artieArt.classList.add('swap-out');
    window.setTimeout(()=>{
      artieArt.src=src;
      artieArt.onload=()=>{
        artieArt.classList.remove('swap-out');
        artieArt.classList.add('swap-in');
        window.setTimeout(()=>artieArt.classList.remove('swap-in'),420);
      };
    },140);
  }

  function setArtieFact(btn){
    artieButtons.forEach(b=>{
      const active=b===btn;
      b.classList.toggle('active',active);
      b.setAttribute('aria-selected',active?'true':'false');
    });

    if(artieTitle) artieTitle.textContent=btn.dataset.title||'';
    if(artieCopy) artieCopy.textContent=btn.dataset.copy||'';
    if(artieSpeech) artieSpeech.textContent=btn.dataset.speech||'';
    if(peelProgress) peelProgress.hidden=true;
    peelIndex=0;
    peelSteps.forEach((step,i)=>step.classList.toggle('active',i===0));
    if(peelNext){
      peelNext.textContent='Peel another layer →';
      peelNext.classList.remove('done');
    }
    swapArtieImage(btn.dataset.image);
  }

  function renderPeelStage(){
    const stage=peelStages[peelIndex];
    if(!stage)return;
    peelSteps.forEach((step,i)=>step.classList.toggle('active',i===peelIndex));
    if(peelResultTitle) peelResultTitle.textContent=stage.title;
    if(peelResultCopy) peelResultCopy.textContent=stage.copy;
    if(peelResultQuote) peelResultQuote.textContent=stage.quote;
    if(peelResultBox){
      peelResultBox.classList.remove('pop');
      requestAnimationFrame(()=>peelResultBox.classList.add('pop'));
    }
    if(artieSpeech) artieSpeech.textContent=stage.quote;
    swapArtieImage(stage.image);

    if(peelNext){
      const done=peelIndex===peelStages.length-1;
      peelNext.textContent=done?'Start over ↺':'Peel another layer →';
      peelNext.classList.toggle('done',done);
    }
  }

  artieButtons.forEach(btn=>btn.addEventListener('click',()=>setArtieFact(btn)));

  peelHeart?.addEventListener('click',()=>{
    if(!peelProgress)return;
    peelIndex=0;
    peelProgress.hidden=false;
    renderPeelStage();
  });

  peelNext?.addEventListener('click',()=>{
    peelIndex=peelIndex===peelStages.length-1?0:peelIndex+1;
    renderPeelStage();
  });

  showSlide(0);
})();

// Tommy the Tomato: artwork-backed nutrition explorer and fruit/vegetable challenge.
(function initTommyExplainer(){
  const buttons=[...document.querySelectorAll('.tommy-fact')];
  if(!buttons.length)return;

  const frame=document.getElementById('tommyArtFrame');
  const artwork=document.getElementById('tommyMainArt');
  let artworkRequest=0;

  // Load each new illustration before swapping, so slower mobile connections
  // keep the previous picture visible instead of flashing a broken image.
  function showArtwork(src,alt,pose){
    if(!artwork||!src)return;
    const request=++artworkRequest;
    if(artwork.getAttribute('src')===src){
      artwork.alt=alt||'Tommy the Tomato';
      if(frame){
        frame.dataset.pose='';
        requestAnimationFrame(()=>{
          if(request===artworkRequest)frame.dataset.pose=pose||'heart';
        });
      }
      return;
    }
    const next=new Image();
    next.onload=()=>{
      if(request!==artworkRequest)return;
      artwork.src=src;
      artwork.alt=alt||'Tommy the Tomato';
      if(frame){
        frame.dataset.pose='';
        requestAnimationFrame(()=>{
          if(request===artworkRequest)frame.dataset.pose=pose||'heart';
        });
      }
    };
    next.onerror=()=>{
      // Preserve the last successful illustration if a file cannot load.
      if(request===artworkRequest)console.warn('Tommy illustration unavailable:',src);
    };
    next.src=src;
  }
  const title=document.getElementById('tommyFactTitle');
  const copy=document.getElementById('tommyFactCopy');
  const speech=document.getElementById('tommySpeech');
  const debate=document.getElementById('tomatoDebate');
  const options=document.getElementById('tomatoDebateOptions');
  const choices=[...document.querySelectorAll('.tomato-debate-choice')];
  const result=document.getElementById('tomatoDebateResult');
  const resultTitle=document.getElementById('tomatoDebateTitle');
  const resultCopy=document.getElementById('tomatoDebateCopy');
  const resultQuote=document.getElementById('tomatoDebateQuote');

  const answers={
    fruit:{
      title:'BOTANICALLY: FRUIT ✅',
      copy:'A tomato develops from a flower and contains seeds, so botanists classify it as a fruit.',
      quote:'“Science class gets this point.”'
    },
    vegetable:{
      title:'IN THE KITCHEN: VEGETABLE ✅',
      copy:'Cooks usually group tomatoes with vegetables because they are used mostly in savory meals rather than sweet desserts.',
      quote:'“The kitchen gets a point too.”'
    },
    both:{
      title:'YOU FOUND THE WHOLE ANSWER! 🍅',
      copy:'Tomato is botanically a fruit and culinarily treated like a vegetable. The two labels are answering different questions.',
      quote:'“Why pick one team when I can play both?”'
    }
  };

  function setFact(btn){
    buttons.forEach(b=>{
      const active=b===btn;
      b.classList.toggle('active',active);
      b.setAttribute('aria-selected',active?'true':'false');
    });

    if(title)title.textContent=btn.dataset.title||'';
    if(copy)copy.textContent=btn.dataset.copy||'';
    if(speech)speech.textContent=btn.dataset.speech||'';

    showArtwork(btn.dataset.image,btn.dataset.imageAlt,btn.dataset.pose);

    if(options)options.hidden=true;
    if(debate)debate.setAttribute('aria-expanded','false');
    if(result){
      result.hidden=true;
      result.classList.remove('pop');
    }
  }

  buttons.forEach(btn=>btn.addEventListener('click',()=>setFact(btn)));

  debate?.addEventListener('click',()=>{
    if(!options)return;
    const opening=options.hidden;
    if(opening){
      // The debate is its own illustrated question, even if another fact
      // was selected before the child opened this activity.
      const debateFact=buttons[buttons.length-1];
      setFact(debateFact);
      options.hidden=false;
    }else{
      options.hidden=true;
    }
    debate.setAttribute('aria-expanded',String(opening));
    if(result)result.hidden=true;
  });

  choices.forEach(choice=>{
    choice.addEventListener('click',()=>{
      const answer=answers[choice.dataset.answer];
      if(!answer)return;
      if(resultTitle)resultTitle.textContent=answer.title;
      if(resultCopy)resultCopy.textContent=answer.copy;
      if(resultQuote)resultQuote.textContent=answer.quote;
      if(result){
        result.hidden=false;
        result.classList.remove('pop');
        requestAnimationFrame(()=>result.classList.add('pop'));
      }
      if(speech)speech.textContent=answer.quote;
      // Keep Tommy's fruit/vegetable showdown artwork visible for every answer.
      const debateFact=buttons[buttons.length-1];
      showArtwork(debateFact.dataset.image,debateFact.dataset.imageAlt,'debate');
    });
  });
})();

/* Nanner: six nutrition scenes and in-place ripeness mini-lesson. */
(function initNannerExplainer(){
  const buttons=[...document.querySelectorAll('.nanner-fact')];
  const art=document.getElementById('nannerMainArt');
  if(!buttons.length||!art)return;

  const title=document.getElementById('nannerFactTitle');
  const copy=document.getElementById('nannerFactCopy');
  const speech=document.getElementById('nannerSpeech');
  const factView=document.getElementById('nannerFactView');
  const game=document.getElementById('nannerRemixGame');
  const open=document.getElementById('nannerStartRemix');
  const close=document.getElementById('nannerCloseRemix');
  const stageButtons=[...document.querySelectorAll('.nanner-stage')];
  const stageTitle=document.getElementById('nannerStageTitle');
  const stageCopy=document.getElementById('nannerStageCopy');
  const fallback='assets/characters/nanner/nanner-fuel-for-fun.png';
  const stages={
    green:{
      title:'GREEN — FIRM & STARCHY',
      copy:'A green banana is generally firmer and contains more starch. Some families like cooking greener bananas instead of eating them raw.',
      speech:'“Green and growing! My sweetness is still on its way.”'
    },
    yellow:{
      title:'YELLOW — SOFT & SWEET',
      copy:'As bananas ripen, some starch turns into sugars. A yellow banana is generally softer, sweeter and easy to enjoy as a snack.',
      speech:'“Bright yellow and ready for your next adventure!”'
    },
    spotted:{
      title:'SPOTTED — RIPE & READY TO MASH',
      copy:'Brown spots can mean a banana is very ripe, softer and sweeter. If it still smells and looks safe to eat, it can be great for baking or smoothies.',
      speech:'“Don’t judge me by my spots — I’m great in banana bread!”'
    }
  };
  let imageRequest=0;
  const missing=new Set();

  function setArtwork(src,alt){
    if(!src)return;
    const request=++imageRequest;
    if(art.getAttribute('src')===src){
      art.alt=alt||'Nanner the Banana';
      return;
    }
    // Keep the approved starting illustration visible if another scene fails to load.
    if(missing.has(src)){
      art.src=fallback;
      art.alt='Nanner the Banana';
      return;
    }
    const image=new Image();
    image.onload=()=>{
      if(request!==imageRequest)return;
      art.src=src;
      art.alt=alt||'Nanner the Banana';
      art.classList.remove('nanner-swapping');
      void art.offsetWidth;
      art.classList.add('nanner-swapping');
    };
    image.onerror=()=>{
      missing.add(src);
      if(request!==imageRequest)return;
      art.src=fallback;
      art.alt='Nanner the Banana';
    };
    image.src=src;
  }

  function resetGame(){
    if(game)game.hidden=true;
    if(factView)factView.hidden=false;
    stageButtons.forEach(btn=>btn.setAttribute('aria-pressed','false'));
  }

  function setFact(button,moveFocus){
    if(!button)return;
    buttons.forEach(btn=>{
      const active=btn===button;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-selected',String(active));
      btn.tabIndex=active?0:-1;
    });
    if(title)title.textContent=button.dataset.title||'';
    if(copy)copy.textContent=button.dataset.copy||'';
    if(speech)speech.textContent=button.dataset.speech||'';
    resetGame();
    setArtwork(button.dataset.image,button.dataset.imageAlt);
    if(moveFocus)button.focus();
  }

  buttons.forEach((button,i)=>{
    button.addEventListener('click',()=>setFact(button,false));
    button.addEventListener('keydown',event=>{
      if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:
        (i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
      setFact(buttons[next],true);
    });
  });

  open?.addEventListener('click',()=>{
    // Open the activity inside the existing explainer instead of extending
    // the whole carousel's 690px desktop footprint.
    setFact(buttons[4],false);
    if(factView)factView.hidden=true;
    if(game)game.hidden=false;
    if(stageTitle)stageTitle.textContent='Which banana would you pick?';
    if(stageCopy)stageCopy.textContent='Choose green, yellow or spotted to discover how bananas change as they ripen.';
    stageButtons[0]?.focus();
  });

  stageButtons.forEach(button=>button.addEventListener('click',()=>{
    const stage=stages[button.dataset.stage];
    if(!stage)return;
    stageButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    if(stageTitle)stageTitle.textContent=stage.title;
    if(stageCopy)stageCopy.textContent=stage.copy;
    if(speech)speech.textContent=stage.speech;
    setArtwork(buttons[4].dataset.image,buttons[4].dataset.imageAlt);
  }));

  close?.addEventListener('click',()=>{
    const active=buttons.find(btn=>btn.classList.contains('active'))||buttons[0];
    setFact(active,false);
    open?.focus();
  });
})();

/* Gingy: six ginger facts plus an in-place, three-recipe flavor activity.
   Scoped to the Gingy slide; other character interactions are unchanged. */
(function initGingyExplainer(){
  const slide=document.querySelector('.gingy-story');
  if(!slide)return;
  const buttons=[...slide.querySelectorAll('.gingy-fact')];
  const art=slide.querySelector('#gingyMainArt');
  if(buttons.length!==6||!art)return;

  const title=slide.querySelector('#gingyFactTitle');
  const copy=slide.querySelector('#gingyFactCopy');
  const speech=slide.querySelector('#gingySpeech');
  const factView=slide.querySelector('#gingyFactView');
  const game=slide.querySelector('#gingyMatchGame');
  const open=slide.querySelector('#gingyStartMatch');
  const close=slide.querySelector('#gingyCloseMatch');
  const choices=[...slide.querySelectorAll('.gingy-match-choice')];
  const matchTitle=slide.querySelector('#gingyMatchTitle');
  const matchCopy=slide.querySelector('#gingyMatchCopy');
  const fallback='assets/Gingy_Card_02.png';
  const matches={
    tea:{
      title:'TEA — A COZY ZING!',
      copy:'A few slices of ginger can flavor a warm, caffeine-free ginger drink. Ask a grown-up to help with hot water.',
      speech:'“A cozy cup gets a little zing!”',
      image:'assets/Gingy_Card_08.png',
      alt:'Gingy presenting a warm cup of ginger tea'
    },
    stirfry:{
      title:'STIR-FRY — A SAVORY SPARK!',
      copy:'A little chopped or grated ginger adds bold flavor to vegetables, noodles and stir-fries. Grown-ups can help at the stove.',
      speech:'“Watch me wake up those veggies!”',
      image:'assets/Gingy_Card_09.png',
      alt:'Gingy tossing colorful vegetables in a stir-fry'
    },
    cookies:{
      title:'COOKIES — A SWEET SURPRISE!',
      copy:'Ground ginger brings warm, spicy flavor to ginger cookies and gingerbread. Baking is a fun way to explore new tastes together.',
      speech:'“Who knew I could be sweet AND zesty?”',
      image:'assets/Gingy_Card_10.png',
      alt:'Gingy baking smiling gingerbread cookies'
    }
  };
  let imageRequest=0;
  const missing=new Set();

  function setArtwork(src,alt){
    if(!src)return;
    const request=++imageRequest;
    if(art.getAttribute('src')===src){
      art.alt=alt||'Gingy the Ginger';
      return;
    }
    if(missing.has(src))return;
    const next=new Image();
    next.onload=()=>{
      if(request!==imageRequest)return;
      art.src=src;
      art.alt=alt||'Gingy the Ginger';
      art.classList.remove('gingy-swapping');
      void art.offsetWidth;
      art.classList.add('gingy-swapping');
    };
    next.onerror=()=>{
      missing.add(src);
      if(request!==imageRequest)return;
      // Keep the last successful illustration rather than show a broken image.
      if(!art.complete||!art.naturalWidth){
        art.src=fallback;
        art.alt='Gingy the Ginger';
      }
      console.warn('Gingy illustration unavailable:',src);
    };
    next.src=src;
  }

  function resetMatch(){
    if(game)game.hidden=true;
    if(factView)factView.hidden=false;
    choices.forEach(choice=>choice.setAttribute('aria-pressed','false'));
  }
  function selectFact(button,focus){
    if(!button)return;
    buttons.forEach(b=>{
      const selected=b===button;
      b.classList.toggle('active',selected);
      b.setAttribute('aria-selected',String(selected));
      b.tabIndex=selected?0:-1;
    });
    if(title)title.textContent=button.dataset.title||'';
    if(copy)copy.textContent=button.dataset.copy||'';
    if(speech)speech.textContent=button.dataset.speech||'';
    resetMatch();
    setArtwork(button.dataset.image,button.dataset.imageAlt);
    if(focus)button.focus();
  }

  buttons.forEach((button,index)=>{
    button.addEventListener('click',()=>selectFact(button,false));
    button.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      event.stopPropagation(); // Do not navigate the outer character carousel.
      const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:
        (index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
      selectFact(buttons[next],true);
    });
  });

  open?.addEventListener('click',()=>{
    if(factView)factView.hidden=true;
    if(game)game.hidden=false;
    if(matchTitle)matchTitle.textContent='What should Gingy flavor next?';
    if(matchCopy)matchCopy.textContent='Pick a food or drink. Every choice is a tasty way to use ginger!';
    choices.forEach(choice=>choice.setAttribute('aria-pressed','false'));
    choices[0]?.focus();
  });

  choices.forEach(choice=>choice.addEventListener('click',()=>{
    const match=matches[choice.dataset.match];
    if(!match)return;
    choices.forEach(button=>button.setAttribute('aria-pressed',String(button===choice)));
    if(matchTitle)matchTitle.textContent=match.title;
    if(matchCopy)matchCopy.textContent=match.copy;
    if(speech)speech.textContent=match.speech;
    setArtwork(match.image,match.alt);
  }));

  close?.addEventListener('click',()=>{
    const current=buttons.find(button=>button.classList.contains('active'))||buttons[0];
    selectFact(current,false);
    open?.focus();
  });
})();
