const toggle=document.querySelector('.mobile-toggle');
const links=document.querySelector('.navlinks');
if(toggle&&links){toggle.addEventListener('click',()=>links.classList.toggle('open'));links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')))}
const BOOK_CHECKOUT={book1:''};
document.querySelectorAll('[data-book-buy]').forEach(btn=>{btn.addEventListener('click',()=>{const url=BOOK_CHECKOUT[btn.dataset.bookBuy];if(url){location.href=url;return}alert('The Market Veggies bookstore checkout is being connected. No payment was attempted.');});});
const bannerSlides=[...document.querySelectorAll('.banner-slide')];
const bannerDots=[...document.querySelectorAll('[data-banner-dot]')];
let bannerIndex=0;
let bannerTimer=null;
function showBanner(index){
  if(!bannerSlides.length)return;
  bannerIndex=(index+bannerSlides.length)%bannerSlides.length;
  bannerSlides.forEach((slide,i)=>slide.classList.toggle('active',i===bannerIndex));
  bannerDots.forEach((dot,i)=>dot.classList.toggle('active',i===bannerIndex));
}
function startBannerRotation(){
  if(bannerSlides.length<2||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  clearInterval(bannerTimer);
  bannerTimer=setInterval(()=>showBanner(bannerIndex+1),6500);
}
bannerDots.forEach((dot,i)=>dot.addEventListener('click',()=>{showBanner(i);startBannerRotation()}));
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInterval(bannerTimer)}else{startBannerRotation()}});
showBanner(0);
startBannerRotation();
