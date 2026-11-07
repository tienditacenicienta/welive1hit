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
    <span><b>${p.name}</b><br><small>${p.color||"Blanco"} · Talla ${p.size} · Cant. ${p.quantity}</small></span>
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

const catalog=[
 {name:"PROV. 17:22",price:49,colors:["Blanco","Negro","Gris"]},
 {name:"ONE MOMENT",price:49,colors:["Negro","Blanco"]},
 {name:"NO FEAR",price:49,colors:["Blanco","Negro","Gris"]},
 {name:"LIVE YOUR 1HIT",price:49,colors:["Negro","Blanco"]},
 {name:"EVERYDAY 1HIT",price:45,colors:["Blanco","Negro","Gris"]},
 {name:"OWN YOUR WAY",price:49,colors:["Negro","Blanco"]},
 {name:"ONE LIFE",price:49,colors:["Blanco","Negro","Gris"]},
 {name:"1HIT CLASSIC",price:45,colors:["Negro","Blanco"]}
];
const colorHex={Blanco:"#fff",Negro:"#111",Gris:"#929292"};
$("#shop-grid").innerHTML=catalog.map((p,i)=>`<article class="shop-card" data-product="${i}">
 <div class="shop-image"><img src="/public/models/model-white.webp" alt="${p.name}" loading="lazy"></div>
 <div class="shop-info"><div class="shop-name-row"><h3>${p.name}</h3><b>S/ ${p.price.toFixed(2)}</b></div>
 <div class="shop-color-row"><span class="shop-label">COLOR</span><div class="shop-swatches">${p.colors.map((c,n)=>`<button type="button" class="swatch ${n===0?"active":""}" data-color="${c}" aria-label="${c}" title="${c}" style="--swatch:${colorHex[c]}"></button>`).join("")}</div><span class="selected-color">${p.colors[0]}</span></div>
 <div class="shop-controls"><div class="size-picker"><span class="option-label">TALLA</span><div class="size-options card-sizes"><button type="button" data-size="S">S</button><button type="button" data-size="M">M</button><button type="button" data-size="L">L</button><button type="button" data-size="XL">XL</button></div></div><div class="quantity-picker"><span class="option-label">CANTIDAD</span><div class="quantity-control"><button type="button" class="qty-minus" aria-label="Disminuir">−</button><output class="card-quantity">1</output><button type="button" class="qty-plus" aria-label="Aumentar">+</button></div></div></div>
 <button class="card-add" type="button">AÑADIR A LA BOLSA ↗</button></div></article>`).join("");
document.querySelectorAll(".shop-card").forEach(card=>{
 let chosenColor=catalog[Number(card.dataset.product)].colors[0],chosenSize=null,qty=1;
 const sizeButtons=card.querySelectorAll(".card-sizes button"),quantityOut=card.querySelector(".card-quantity");
 sizeButtons.forEach(btn=>btn.onclick=()=>{
  chosenSize=btn.dataset.size;
  sizeButtons.forEach(x=>x.classList.toggle("selected",x===btn));
 });
 card.querySelector(".qty-minus").onclick=()=>{qty=Math.max(1,qty-1);quantityOut.textContent=qty};
 card.querySelector(".qty-plus").onclick=()=>{qty=Math.min(20,qty+1);quantityOut.textContent=qty};
 card.querySelectorAll(".swatch").forEach(btn=>btn.onclick=()=>{
  chosenColor=btn.dataset.color;
  card.querySelectorAll(".swatch").forEach(x=>x.classList.toggle("active",x===btn));
  card.querySelector(".selected-color").textContent=chosenColor;
  const img=card.querySelector(".shop-image img");
  img.style.filter=chosenColor==="Negro"?"brightness(.72) contrast(1.15)":chosenColor==="Gris"?"grayscale(.7)":"none";
 });
 card.querySelector(".card-add").onclick=()=>{
  const p=catalog[Number(card.dataset.product)];
  if(!chosenSize){card.querySelector(".card-sizes").classList.add("needs-size");return}
  const item={name:p.name,price:p.price,color:chosenColor,size:chosenSize,quantity:qty};
  const existing=cart.find(x=>x.name===item.name&&x.color===item.color&&x.size===item.size);
  if(existing)existing.quantity+=qty;else cart.push(item);
  render();open();
 };
});updateSelection();show(0);render();

/* ONE HIT manifesto: sequential transitions, no overlapping text */
(()=>{
 const phrase=document.getElementById("manifesto-changing");
 const fixed=document.querySelector(".manifesto-fixed");
 const line=document.querySelector(".manifesto-line");
 if(!phrase||!fixed||!line)return;
 const phrases=["toqué fondo.","fallé mil veces.","voy a mi ritmo.","encontré un camino."];
 const wait=ms=>new Promise(resolve=>window.setTimeout(resolve,ms));
 const showPhrase=async(text)=>{
  phrase.classList.remove("manifesto-wipe");
  phrase.classList.add("is-changing");
  await wait(650);
  phrase.textContent=text;
  phrase.classList.remove("is-changing");
  await wait(2800);
 };
 const run=async()=>{
  while(true){
   for(let i=0;i<phrases.length;i++) await showPhrase(phrases[i]);
   phrase.classList.add("is-changing");
   await wait(650);
   fixed.classList.add("is-hidden");
   line.classList.add("manifesto-final");
   phrase.textContent="ENCONTRÉ ONE HIT.";
   phrase.classList.remove("is-changing");
   void phrase.offsetWidth;
   phrase.classList.add("manifesto-wipe");
   await wait(4200);
   phrase.classList.remove("manifesto-wipe");
   phrase.classList.add("is-changing");
   await wait(650);
   line.classList.remove("manifesto-final");
   fixed.classList.remove("is-hidden");
   phrase.textContent=phrases[0];
   phrase.classList.remove("is-changing");
   await wait(2800);
   for(let i=1;i<phrases.length;i++) await showPhrase(phrases[i]);
  }
 };
 run();
})();
