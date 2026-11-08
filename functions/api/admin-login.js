const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
async function sign(value,secret){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const bytes=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(value)));return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");}
export async function onRequestPost({request,env}){
 if(!env.ADMIN_PASSWORD)return json({error:"Falta configurar ADMIN_PASSWORD en Cloudflare Pages."},503);
 let body={};try{body=await request.json()}catch{return json({error:"Solicitud inválida."},400)}
 const supplied=String(body.password||"");
 if(supplied.length<1||supplied!==env.ADMIN_PASSWORD)return json({error:"Contraseña incorrecta."},401);
 const expires=Date.now()+8*60*60*1000,token=String(expires),signature=await sign(token,env.ADMIN_PASSWORD);
 return new Response(JSON.stringify({ok:true}),{headers:{"Content-Type":"application/json","Cache-Control":"no-store","Set-Cookie":`onehit_admin=${token}.${signature}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`}});
}