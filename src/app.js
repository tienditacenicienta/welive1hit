const items=[
{name:'Polo básico',variant:'Negro',price:45},
{name:'Polo básico',variant:'Blanco',price:45},
{name:'Polo gráfico 01',variant:'Drop 001',price:49},
{name:'Polo gráfico 02',variant:'Arena',price:49},
{name:'Hoodie ONE HIT',variant:'Negro',price:89}
];let active=0,cart=[],timer;const $=s=>document.querySelector(s);
function slide(n){active=(n+items.length)%items.length;$('#track').style.transform=`translateX(-${active*100}%)`;$('#number').textContent=`${String(active+1).padStart(2,'0')} / 05`;$('#product-name').textContent=`${items[active].name} / ${items[active].variant}`.toUpperCase();$('#product-price').textContent=`S/ ${items[active].price.toFixed(2)}`;document.querySelectorAll('.progress button').forEach((b,i)=>b.classList.toggle('on',i===active));restart()}
function restart(){clearInterval(timer);timer=setInterval(()=>slide(active+1),5500)}
$('#prev').onclick=()=>slide(active-1);$('#next').onclick=()=>slide(active+1);document.querySelectorAll('.progress button').forEach((b,i)=>b.onclick=()=>slide(i));
function openCart(){$('#drawer').classList.add('active');$('#shade').classList.add('active')}function closeCart(){$('#drawer').classList.remove('active');$('#shade').classList.remove('active')}
$('#cart-open').onclick=openCart;$('#cart-close').onclick=closeCart;$('#shade').onclick=closeCart;
function render(){ $('#count').textContent=cart.length;$('#total').textContent=`S/ ${cart.reduce((s,p)=>s+p.price,0).toFixed(2)}`;$('#checkout').disabled=!cart.length;$('#items').innerHTML=cart.length?cart.map((p,i)=>`<div class="cart-line"><span>${p.name} · ${p.variant}<br><small>Talla ${p.size}</small></span><span>S/ ${p.price.toFixed(2)} <button data-del="${i}">×</button></span></div>`).join(''):'<p>Tu bolsa está vacía.</p>';document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{cart.splice(+b.dataset.del,1);render()})}
function addCurrent(){const p=items[active];const size=prompt('Selecciona talla: S, M, L o XL','M');if(!size)return;if(!['S','M','L','XL'].includes(size.toUpperCase())){alert('Talla no válida');return}cart.push({...p,size:size.toUpperCase()});render();openCart()}
$('#buy').onclick=addCurrent;$('#checkout').onclick=()=>alert('Checkout de demostración. Mercado Pago todavía no está conectado.');
$('#grid').innerHTML=items.map((p,i)=>`<article class="card" data-i="${i}"><div class="card-art"><div class="mini-shirt">1HIT.</div></div><div class="card-meta"><b>${p.name} · ${p.variant}</b><b>S/ ${p.price}</b></div></article>`).join('');document.querySelectorAll('.card').forEach(c=>c.onclick=()=>{slide(+c.dataset.i);window.scrollTo({top:0,behavior:'smooth'})});
slide(0);render();