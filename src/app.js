const products=[
 {name:"Polo gráfico 01 / Blanco",price:49,color:"Blanco"},
 {name:"Polo básico / Negro",price:45,color:"Negro"},
 {name:"Polo gráfico 02 / Blanco",price:49,color:"Blanco"},
 {name:"Polo gráfico 02 / Arena",price:49,color:"Arena"},
 {name:"Hoodie ONE HIT / Negro",price:89,color:"Negro"}
];
let current=0,cart=[],timer,selectedSize=null,quantity=1,shippingMethod="",customerPhone="";
const $=s=>document.querySelector(s);

function show(i){
 const next=(i+products.length)%products.length;
 if(next!==current){selectedSize=null;updateSelection()}
 current=next;
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
$("#bag").onclick=open;
$("#lifestyle-cart-trigger").addEventListener("click",event=>{
 event.preventDefault();
 render();
 open();
});
$("#close").onclick=close;$("#backdrop").onclick=close;

function updateSelection(){
 document.querySelectorAll("#size-options button").forEach(b=>b.classList.toggle("selected",b.dataset.size===selectedSize));
 $("#quantity").textContent=quantity;
}
document.querySelectorAll("#size-options button").forEach(b=>{
 b.addEventListener("click",()=>{
  selectedSize=selectedSize===b.dataset.size?null:b.dataset.size;
  updateSelection();
 });
});
$("#qty-minus").onclick=()=>{quantity=Math.max(1,quantity-1);updateSelection()};
$("#qty-plus").onclick=()=>{quantity=Math.min(20,quantity+1);updateSelection()};

function render(){
 const units=cart.reduce((sum,p)=>sum+p.quantity,0);
 const subtotal=cart.reduce((sum,p)=>sum+p.price*p.quantity,0);
 const shippingCost=shippingMethod==="delivery"?20:shippingMethod==="shalom"?12:0;
 $("#bag-count").textContent=units;
 $("#subtotal").textContent=`S/ ${subtotal.toFixed(2)}`;
 $("#shipping-total").textContent=shippingMethod?`S/ ${shippingCost.toFixed(2)}`:"—";
 $("#grand-total").textContent=`S/ ${(subtotal+shippingCost).toFixed(2)}`;
 $("#shipping-panel").hidden=!cart.length;
 $("#checkout").disabled=!cart.length||!shippingMethod||!/^9\d{8}$/.test(customerPhone);
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
$("#customer-phone").addEventListener("input",event=>{
 customerPhone=event.target.value.replace(/\\D/g,"").slice(0,9);
 event.target.value=customerPhone;
 render();
});
document.querySelectorAll('input[name="shipping"]').forEach(input=>input.addEventListener("change",()=>{
 shippingMethod=input.value;render();
}));
$("#checkout").onclick=async()=>{
 if(!cart.length||!shippingMethod||!/^9\d{8}$/.test(customerPhone))return;
 const button=$("#checkout");
 const originalText=button.textContent;
 button.disabled=true;
 button.textContent="CONECTANDO CON MERCADO PAGO…";
 try{
  const response=await fetch("/api/create-order",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({items:cart.map(({name,color,size,quantity})=>({name,color,size,quantity})),phone:customerPhone,shipping_method:shippingMethod})
  });
  const data=await response.json();
  if(!response.ok||!data.checkout_url)throw new Error(data.error||"No pudimos iniciar el pago.");
  window.location.assign(data.checkout_url);
 }catch(error){
  alert(error.message||"Ocurrió un error al iniciar el pago. Inténtalo nuevamente.");
  button.disabled=false;
  button.textContent=originalText;
 }
};

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
const galleryImages=[
 "/public/models/mockup-front.svg",
 "/public/models/mockup-back.svg",
 "/public/models/mockup-print-detail.svg",
 "/public/models/mockup-fabric-detail.svg"
];
$("#shop-grid").innerHTML=catalog.map((p,i)=>`<article class="shop-card" data-product="${i}">
 <div class="shop-image" role="button" tabindex="0" aria-label="Ver detalles de ${p.name}"><img src="/public/models/mockup-front.svg" alt="${p.name} — mockup referencial" loading="lazy"></div>
 <div class="shop-info"><div class="shop-name-row"><h3 class="shop-open-detail" role="button" tabindex="0">${p.name}</h3><b>S/ ${p.price.toFixed(2)}</b></div>
 <div class="shop-color-row"><span class="shop-label">COLOR</span><div class="shop-swatches">${p.colors.map((c,n)=>`<button type="button" class="swatch ${n===0?"active":""}" data-color="${c}" aria-label="${c}" title="${c}" style="--swatch:${colorHex[c]}"></button>`).join("")}</div><span class="selected-color">${p.colors[0]}</span></div>
 <div class="shop-controls"><div class="size-picker"><span class="option-label">TALLA</span><div class="size-options card-sizes"><button type="button" data-size="S">S</button><button type="button" data-size="M">M</button><button type="button" data-size="L">L</button><button type="button" data-size="XL">XL</button></div></div><div class="quantity-picker"><span class="option-label">CANTIDAD</span><div class="quantity-control"><button type="button" class="qty-minus" aria-label="Disminuir">−</button><output class="card-quantity">1</output><button type="button" class="qty-plus" aria-label="Aumentar">+</button></div></div></div>
 <button class="card-add" type="button">AÑADIR A LA BOLSA ↗</button></div></article>`).join("");
let detailProduct=0,detailColor="",detailSize=null,detailQty=1,detailImage=0;
const modal=$("#product-modal"),modalBackdrop=$("#product-modal-backdrop");
function setDetailImage(index){
 detailImage=index;
 $("#detail-main-image").src=galleryImages[index];
 $("#detail-main-image").alt=catalog[detailProduct].name+" — vista "+(index+1);
 $("#detail-thumbnails").querySelectorAll("button").forEach((b,n)=>b.classList.toggle("active",n===index));
}
function updateDetailOptions(){
 $("#detail-color-name").textContent=detailColor;
 $("#detail-swatches").querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.color===detailColor));
 $("#detail-sizes").querySelectorAll("button").forEach(b=>b.classList.toggle("selected",b.dataset.size===detailSize));
 $("#detail-quantity").textContent=detailQty;
}
function openDetail(index,color=null){
 detailProduct=index;
 const p=catalog[index];
 detailColor=color||p.colors[0];detailSize=null;detailQty=1;
 $("#detail-name").textContent=p.name;
 $("#detail-price").textContent="S/ "+p.price.toFixed(2);
 $("#detail-swatches").innerHTML=p.colors.map(c=>`<button type="button" class="swatch ${c===detailColor?"active":""}" data-color="${c}" aria-label="${c}" title="${c}" style="--swatch:${colorHex[c]}"></button>`).join("");
 $("#detail-sizes").innerHTML=["S","M","L","XL"].map(size=>`<button type="button" data-size="${size}">${size}</button>`).join("");
 $("#detail-thumbnails").innerHTML=galleryImages.map((src,n)=>`<button type="button" class="${n===0?"active":""}" data-image="${n}" aria-label="Ver imagen ${n+1}"><img src="${src}" alt=""></button>`).join("");
 $("#detail-thumbnails").querySelectorAll("button").forEach(b=>b.onclick=()=>setDetailImage(Number(b.dataset.image)));
 $("#detail-swatches").querySelectorAll("button").forEach(b=>b.onclick=()=>{detailColor=b.dataset.color;updateDetailOptions()});
 $("#detail-sizes").querySelectorAll("button").forEach(b=>b.onclick=()=>{detailSize=detailSize===b.dataset.size?null:b.dataset.size;updateDetailOptions()});
 setDetailImage(0);updateDetailOptions();
 modal.classList.add("open");modalBackdrop.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");
}
function closeDetail(){modal.classList.remove("open");modalBackdrop.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
$("#detail-close").onclick=closeDetail;modalBackdrop.onclick=closeDetail;
$("#detail-minus").onclick=()=>{detailQty=Math.max(1,detailQty-1);updateDetailOptions()};
$("#detail-plus").onclick=()=>{detailQty=Math.min(20,detailQty+1);updateDetailOptions()};
$("#detail-add").onclick=()=>{
 if(!detailSize){$("#detail-sizes").classList.add("needs-size");return}
 const p=catalog[detailProduct],item={name:p.name,price:p.price,color:detailColor,size:detailSize,quantity:detailQty};
 const existing=cart.find(x=>x.name===item.name&&x.color===item.color&&x.size===item.size);
 if(existing)existing.quantity+=detailQty;else cart.push(item);
 render();closeDetail();open();
};
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeDetail();close()}});
document.querySelectorAll(".shop-card").forEach(card=>{
 let chosenColor=catalog[Number(card.dataset.product)].colors[0],chosenSize=null,qty=1;
 const index=Number(card.dataset.product);
 const sizeButtons=card.querySelectorAll(".card-sizes button"),quantityOut=card.querySelector(".card-quantity");
 const openCardDetail=()=>openDetail(index,chosenColor);
 const image=card.querySelector(".shop-image"),name=card.querySelector(".shop-open-detail");
 image.onclick=openCardDetail;image.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openCardDetail()}};
 name.onclick=openCardDetail;name.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openCardDetail()}};
 sizeButtons.forEach(btn=>btn.onclick=()=>{chosenSize=chosenSize===btn.dataset.size?null:btn.dataset.size;sizeButtons.forEach(x=>x.classList.toggle("selected",x.dataset.size===chosenSize))});
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
  const p=catalog[index];
  if(!chosenSize){card.querySelector(".card-sizes").classList.add("needs-size");return}
  const item={name:p.name,price:p.price,color:chosenColor,size:chosenSize,quantity:qty};
  const existing=cart.find(x=>x.name===item.name&&x.color===item.color&&x.size===item.size);
  if(existing)existing.quantity+=qty;else cart.push(item);
  render();open();
 };
});
updateSelection();show(0);render();

/* ONE HIT manifesto: independent phrase and finale layers */
(()=>{
 const phrase=document.getElementById("manifesto-changing");
 const fixed=document.querySelector(".manifesto-fixed");
 const line=document.querySelector(".manifesto-line");
 const finale=document.getElementById("manifesto-finale");
 if(!phrase||!fixed||!line||!finale)return;
 const phrases=["toqué fondo.","fallé mil veces.","no me rendí.","encontré un camino."];
 const wait=ms=>new Promise(resolve=>window.setTimeout(resolve,ms));
 const showPhrase=async(text)=>{
  /* Only the changing phrase fades; the opening words never move or fade here */
  phrase.classList.add("is-changing");
  await wait(650);
  phrase.textContent=text;
  phrase.classList.remove("is-changing");
  await wait(2800);
 };
 const showFinale=async()=>{
  /* Fade both parts of the outgoing sentence together */
  phrase.classList.add("is-changing");
  fixed.classList.add("is-hidden");
  await wait(650);
  /* Remove both outgoing text nodes only after their fade has completed */
  fixed.style.display="none";
  phrase.style.display="none";
  line.classList.add("manifesto-final");
  finale.classList.add("is-visible");
  void finale.offsetWidth;
  finale.classList.add("manifesto-wipe");
  await wait(4200);
  finale.classList.remove("manifesto-wipe");
  finale.classList.add("is-changing");
  await wait(650);
  finale.classList.remove("is-visible","is-changing");
  line.classList.remove("manifesto-final");
  phrase.textContent=phrases[0];
  phrase.classList.remove("is-changing");
  phrase.style.display="";
  fixed.style.display="";
  fixed.classList.remove("is-hidden");
  await wait(2800);
 };
 const run=async()=>{
  await wait(2800);
  while(true){
   for(let i=1;i<phrases.length;i++) await showPhrase(phrases[i]);
   await showFinale();
  }
 };
 run();
})();


/* ONE HIT: verify payment, show the shipping-registration step, then redirect to LATAM5S. */
(()=>{
 const LATAM5S_FORM_URL="https://www.latam5s.com/";
 const params=new URLSearchParams(window.location.search);
 const result=params.get("mp_return"),reference=params.get("reference");
 if(!result||!reference)return;
 const banner=document.createElement("section");
 banner.id="onehit-order-result";
 banner.setAttribute("role","status");
 banner.innerHTML='<div class="onehit-order-result-inner"><span class="onehit-order-result-kicker">ONE HIT / PEDIDO</span><strong class="onehit-order-result-title">Estamos verificando tu pago…</strong><p class="onehit-order-result-copy">Un momento, estamos consultando la confirmación de Mercado Pago.</p><div class="onehit-order-result-detail"></div></div>';
 document.body.prepend(banner);
 const title=banner.querySelector(".onehit-order-result-title"),copy=banner.querySelector(".onehit-order-result-copy"),detail=banner.querySelector(".onehit-order-result-detail");
 if(result==="failure"){title.textContent="No se completó el pago.";copy.textContent="Puedes volver a la tienda e intentarlo nuevamente.";return;}
 if(result==="pending"){title.textContent="Tu pago está pendiente.";copy.textContent="Te mostraremos el estado cuando Mercado Pago lo confirme.";return;}
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 (async()=>{
  let order=null;
  for(let attempt=0;attempt<10;attempt++){
   try{
    const response=await fetch("/api/order-status?reference="+encodeURIComponent(reference),{cache:"no-store"});
    const data=await response.json();
    if(response.ok&&data.status==="paid"){order=data;break;}
    if(response.ok&&["cancelled","rejected","error"].includes(data.status)){
     title.textContent="El pago no fue aprobado.";
     copy.textContent="Tu pedido no figura como pagado. Puedes volver a intentarlo desde la tienda.";
     return;
    }
   }catch(error){}
   await wait(1500);
  }
  if(!order){
   title.textContent="Estamos esperando la confirmación.";
   copy.textContent="Mercado Pago aún no ha actualizado el pedido. No vuelvas a pagar; revisaremos el estado en unos instantes.";
   return;
  }
  const shortId="1HIT-"+reference.replace(/^1HIT-/,"").slice(0,8).toUpperCase();
  title.textContent="¡Pago confirmado!";
  copy.textContent="Tu pedido está registrado correctamente.";
  const productRows=order.items.map(item=>'<div class="onehit-confirm-product"><span>'+item.name+'<small>'+item.color+' · Talla '+item.size+'</small></span><b>× '+item.quantity+'</b></div>').join("");
  const shipping=order.shipping?order.shipping.method+" · S/ "+Number(order.shipping.cost).toFixed(2):"Por registrar";
  detail.innerHTML='<div class="onehit-confirm-id">Pedido #'+shortId+' · S/ '+Number(order.total).toFixed(2)+'</div><div class="onehit-confirm-card"><span class="onehit-step">PASO 1 COMPLETADO</span><h2>Tu compra está casi lista.</h2><p>Para preparar tu pedido necesitamos que registres tus datos de envío.</p><div class="onehit-confirm-products">'+productRows+'</div><div class="onehit-confirm-shipping">Método seleccionado: <b>'+shipping+'</b></div><div class="onehit-next-step"><strong>Solo falta registrar tu envío</strong><p>Completa el formulario para indicarnos tus datos personales, dirección y método de entrega.</p></div><a class="onehit-register-link" href="'+LATAM5S_FORM_URL+'" id="onehit-register-link">REGISTRAR MI ENVÍO ↗</a><p class="onehit-countdown">Serás redirigido automáticamente en <b id="onehit-countdown">5</b> segundos.</p></div>';
  const link=banner.querySelector("#onehit-register-link"),count=banner.querySelector("#onehit-countdown");
  let seconds=5;
  const interval=setInterval(()=>{
   seconds--;if(count)count.textContent=String(seconds);
   if(seconds<=0){clearInterval(interval);window.location.assign(LATAM5S_FORM_URL);}
  },1000);
  link.addEventListener("click",()=>clearInterval(interval));
 })();
})();
