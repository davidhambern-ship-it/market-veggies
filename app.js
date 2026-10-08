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

  showSlide(0);
})();
