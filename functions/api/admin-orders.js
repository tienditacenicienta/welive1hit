const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
async function authorized(request,env){
 if(!env.ADMIN_PASSWORD)return false;
 const cookie=request.headers.get("Cookie")||"",match=cookie.match(/(?:^|;\s*)onehit_admin=([^;]+)/);if(!match)return false;
 const [expires,provided]=match[1].split(".");if(!/^\d+$/.test(expires)||Number(expires)<Date.now()||!provided)return false;
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(env.ADMIN_PASSWORD),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const bytes=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(expires)));
 const expected=Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
 if(expected.length!==provided.length)return false;let diff=0;for(let i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^provided.charCodeAt(i);return diff===0;
}
function parse(order){
 let items=[];try{items=JSON.parse(order.items||"[]")}catch{}
 const meta=items.find(x=>x?._meta)?._meta||{},shipping=items.find(x=>x?.is_shipping);
 return {reference:order.id,short_id:"1HIT-"+String(order.id).replace(/^1HIT-/,"").slice(0,8).toUpperCase(),status:order.status,total:Number(order.amount),phone:meta.phone||"—",shipping_method:meta.shipping_label||shipping?.name||"—",shipping_cost:Number(meta.shipping_cost??shipping?.unit_price??0),products_total:Number(meta.products_total??0),items:items.filter(x=>x&&!x._meta&&!x.is_shipping).map(x=>({name:x.name||x.title||"Producto",color:x.color||"—",size:x.size||"—",quantity:Number(x.quantity)||1,unit_price:Number(x.unit_price)||0})),created_at:order.created_at,updated_at:order.updated_at};
}
export async function onRequestGet({request,env}){
 if(!await authorized(request,env))return json({error:"No autorizado."},401);
 if(!env.DB)return json({error:"Base de datos no conectada."},503);
 const result=await env.DB.prepare("SELECT id,status,amount,items,created_at,updated_at FROM orders ORDER BY created_at DESC LIMIT 200").all();
 return json({orders:(result.results||[]).map(parse)});
}
export async function onRequestPost({request,env}){
 if(!await authorized(request,env))return json({error:"No autorizado."},401);
 if(!env.DB)return json({error:"Base de datos no conectada."},503);
 let body={};try{body=await request.json()}catch{return json({error:"Solicitud inválida."},400)}
 const reference=String(body.reference||""),status=String(body.status||"");
 if(!/^1HIT-[0-9a-f-]{36}$/i.test(reference)||!["paid","pending","preparing","shipped","delivered","cancelled"].includes(status))return json({error:"Datos inválidos."},400);
 const result=await env.DB.prepare("UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,reference).run();
 if(!result.meta?.changes)return json({error:"Pedido no encontrado."},404);
 return json({ok:true});
}