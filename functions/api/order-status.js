const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
export async function onRequestGet({request,env}){
 if(!env.DB)return json({error:"Orders database not configured."},503);
 const reference=new URL(request.url).searchParams.get("reference")||"";
 if(!/^1HIT-[0-9a-f-]{36}$/i.test(reference))return json({error:"Referencia inválida."},400);
 const order=await env.DB.prepare("SELECT id,status,amount,items,created_at FROM orders WHERE id=?").bind(reference).first();
 if(!order)return json({error:"Pedido no encontrado."},404);
 let items=[];try{items=JSON.parse(order.items);}catch{}
 const meta=items.find(item=>item?._meta)?._meta||{};
 const visibleItems=items.filter(item=>!item?._meta);
 const shipping=visibleItems.find(item=>item.is_shipping)||null;
 return json({reference:order.id,status:order.status,total:Number(order.amount),items:visibleItems.filter(item=>!item.is_shipping).map(({name,color,size,quantity})=>({name,color,size,quantity})),shipping:shipping?{method:meta.shipping_label||shipping.name,cost:Number(meta.shipping_cost||shipping.unit_price)}:null,created_at:order.created_at});
}
