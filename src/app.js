const products=[
 {name:"Polo gráfico 01 / Blanco",price:49},
 {name:"Polo básico / Negro",price:45},
 {name:"Polo gráfico 02 / Blanco",price:49},
 {name:"Polo gráfico 02 / Arena",price:49},
 {name:"Hoodie ONE HIT / Negro",price:89}
];
let current=0,cart=[],timer,selectedSize=null,quantity=1;
const $=s=>document.querySelector(s);

function show(i){
 current=(i+products.length)%products.length;
 $("#model-track").style.transform=`translateX(-${current*20}%)`;
 $("#slide-number").textContent=`${String(current+1).padStart(2,"0")} / 05`;
 $("#product-name").textContent=products[current].name.toUpperCase();
 $("#product-price").textContent=`S/ ${products[current].price.toFixed(2)}`;
 document.querySelectorAll("#indicators button").forEach((b,n)=>b.classList.toggle("active",n===current));
 restart();
}
function restart(){clearInterval(timer);timer=setInterval(()=>show(current+1),5500)}
$("#prev").onclick=()=>show(current-1);
$("#next").onclick=()=>show(current+1);
document.querySelectorAll("#indicators button").forEach((b,i)=>b.onclick=()=>show(i));

function open(){ $("#drawer").classList.add("open");$("#backdrop").classList.add("open") }
function close(){ $("#drawer").classList.remove("open");$("#backdrop").classList.remove("open") }
$("#bag").onclick=open;$("#close").onclick=close;$("#backdrop").onclick=close;

function updateSelection(){
 document.querySelectorAll("#size-options button").forEach(b=>b.classList.toggle("selected",b.dataset.size===selectedSize));
 $("#quantity").textContent=quantity;
}
document.querySelectorAll("#size-options button").forEach(b=>{
 b.addEventListener("click",()=>{
  selectedSize=b.dataset.size;
  updateSelection();
 });
});
$("#qty-minus").onclick=()=>{quantity=Math.max(1,quantity-1);updateSelection()};
$("#qty-plus").onclick=()=>{quantity=Math.min(20,quantity+1);updateSelection()};

function render(){
 const units=cart.reduce((sum,p)=>sum+p.quantity,0);
 const subtotal=cart.reduce((sum,p)=>sum+p.price*p.quantity,0);
 $("#bag-count").textContent=units;
 $("#subtotal").textContent=`S/ ${subtotal.toFixed(2)}`;
 $("#checkout").disabled=!cart.length;
 $("#cart-items").innerHTML=cart.length?cart.map((p,i)=>
  `<div class="cart-line">
    <span><b>${p.name}</b><br><small>Talla ${p.size} · Cant. ${p.quantity}</small></span>
    <b>S/ ${(p.price*p.quantity).toFixed(2)} <button data-remove="${i}" aria-label="Quitar producto">×</button></b>
   </div>`
 ).join(""):"Tu bolsa está vacía.";
 document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{
  cart.splice(Number(b.dataset.remove),1);render();
 });
}
$("#buy").onclick=()=>{
 if(!selectedSize){
  return;
  return;
 }
 const p=products[current];
 const existing=cart.find(item=>item.name===p.name&&item.size===selectedSize);
 if(existing) existing.quantity+=quantity;
 else cart.push({...p,size:selectedSize,quantity});
 render();
 selectedSize=null;quantity=1;updateSelection();
 open();
};
$("#checkout").onclick=()=>alert("Checkout de demostración. Mercado Pago aún no está conectado.");

$("#shop-grid").innerHTML=products.map((p,i)=>
 `<article class="shop-card">
   <img src="/public/models/model-white.webp" alt="">
   <p>${p.name.toUpperCase()} · S/ ${p.price}</p>
  </article>`
).join("");

updateSelection();show(0);render();
