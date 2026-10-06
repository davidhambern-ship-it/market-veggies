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
