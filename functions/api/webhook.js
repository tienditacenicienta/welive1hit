const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
function safeEqual(a,b){if(a.length!==b.length)return false;let mismatch=0;for(let i=0;i<a.length;i++)mismatch|=a.charCodeAt(i)^b.charCodeAt(i);return mismatch===0;}
async function validSignature(request,dataId,secret){
 const signature=request.headers.get("x-signature")||"",requestId=request.headers.get("x-request-id")||"";
 const parts=Object.fromEntries(signature.split(",").map(part=>part.trim().split("=",2)));
 if(!parts.ts||!parts.v1||!dataId||!requestId)return false;
 const manifest=`id:${dataId};request-id:${requestId};ts:${parts.ts};`;
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const digest=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(manifest)));
 const expected=Array.from(digest,b=>b.toString(16).padStart(2,"0")).join("");
 return safeEqual(expected.toLowerCase(),parts.v1.toLowerCase());
}
export async function onRequestPost({request,env}){
 if(!env.DB||!env.MP_ACCESS_TOKEN||!env.MP_WEBHOOK_SECRET){console.error("Webhook missing required bindings");return json({error:"Webhook not configured."},503);}
 const url=new URL(request.url);let body={};try{body=await request.json();}catch{}
 const dataId=url.searchParams.get("data.id")||body?.data?.id,type=url.searchParams.get("type")||body?.type;
 if(type&&type!=="order")return json({received:true,ignored:true});
 if(!dataId)return json({error:"Missing order ID."},400);
 if(!await validSignature(request,String(dataId),env.MP_WEBHOOK_SECRET))return json({error:"Invalid webhook signature."},401);
 let response;
 try{response=await fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(dataId)}`,{headers:{Authorization:`Bearer ${env.MP_ACCESS_TOKEN}`,Accept:"application/json"}});}
 catch{return json({error:"Could not verify order with Mercado Pago."},502);}
 if(!response.ok)return json({error:"Mercado Pago order lookup failed."},502);
 const order=await response.json(),reference=order.external_reference;
 if(!reference||!String(reference).startsWith("1HIT-"))return json({received:true,ignored:true});
 const saved=await env.DB.prepare("SELECT id,amount,status FROM orders WHERE id=?").bind(reference).first();
 if(!saved){console.error("Order not found for webhook",reference);return json({error:"Order not found yet; retry notification."},503);}
 const total=Number(order.total_amount);
 if(!Number.isFinite(total)||Math.abs(total-Number(saved.amount))>0.009)return json({error:"Order amount mismatch."},409);
 const payment=order.transactions?.payments?.[0]||{},paymentStatus=payment.status||order.status||"pending",paymentDetail=payment.status_detail||order.status_detail||"";
 const paid=order.status==="processed"&&order.status_detail==="accredited";
 let status=paid?"paid":"pending";
 if(["canceled","cancelled","expired"].includes(String(order.status).toLowerCase()))status="cancelled";
 if(String(paymentStatus).toLowerCase()==="rejected")status="rejected";
 if(saved.status==="paid"&&!paid)status="paid";
 await env.DB.prepare("UPDATE orders SET status=?,payment_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
  .bind(status,payment.id?String(payment.id):null,reference).run();
 return json({received:true,order:reference,status});
}
