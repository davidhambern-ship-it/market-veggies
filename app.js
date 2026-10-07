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
