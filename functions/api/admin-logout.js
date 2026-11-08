export async function onRequestPost(){
 return new Response(JSON.stringify({ok:true}),{headers:{"Content-Type":"application/json","Cache-Control":"no-store","Set-Cookie":"onehit_admin=; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0"}});
}