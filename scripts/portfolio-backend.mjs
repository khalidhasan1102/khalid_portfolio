import {promises as fs} from 'node:fs';
import path from 'node:path';
import {randomBytes,randomUUID,createHash,scrypt as scryptCb,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCb);
export const digest=s=>createHash('sha256').update(s).digest('hex');
export async function hashPassword(password){if(typeof password!=='string'||password.length<12||password.length>128)throw Error('Use a password of 12–128 characters.');const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});return {salt,hash:key.toString('hex'),algorithm:'scrypt-N32768-r8-p1'};}
export async function verifyPassword(password,record){if(typeof password!=='string'||password.length>128)return false;const key=await scrypt(password,record.salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});const expected=Buffer.from(record.hash,'hex');return expected.length===key.length&&timingSafeEqual(key,expected);}
export async function atomicJson(file,data){await fs.mkdir(path.dirname(file),{recursive:true,mode:0o700});const tmp=file+'.'+randomUUID()+'.tmp';await fs.writeFile(tmp,JSON.stringify(data,null,2),{mode:0o600});await fs.rename(tmp,file);}
export async function initializeAdmin(dir,email,password){if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('A valid admin email is required.');await fs.mkdir(dir,{recursive:true,mode:0o700});const record={email:email.toLowerCase(),...await hashPassword(password),version:randomUUID(),reset:null};await fs.writeFile(path.join(dir,'account.json'),JSON.stringify(record),{flag:'wx',mode:0o600});}
export function createBackend({root,validatePortfolio,env=process.env,now=()=>Date.now(),mailTransport=undefined}){
const production=env.NODE_ENV==='production';const base=env.PUBLIC_BASE_URL||'http://127.0.0.1:3000';const origin=new URL(base).origin;
if(production&&new URL(base).protocol!=='https:')throw Error('Production requires an HTTPS PUBLIC_BASE_URL.');
const dir=path.resolve(root,env.PORTFOLIO_DATA_DIR||'.portfolio-private');const accountFile=path.join(dir,'account.json');const contentFile=path.join(root,'public/portfolio-content.json');const cookieName=production?'__Host-portfolio_session':'portfolio_session';
const sessions=new Map(),limits=new Map();let queue=Promise.resolve();let fakeHash;
const serialized=fn=>{const result=queue.then(fn);queue=result.catch(()=>{});return result;};
const json=(res,status,value)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));};
const fail=(status,message)=>Object.assign(Error(message),{status});
async function account(){try{return JSON.parse(await fs.readFile(accountFile,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function read(){const text=await fs.readFile(contentFile,'utf8');return {data:JSON.parse(text),revision:digest(text)};}
async function body(req,max=32768){let length=0;const parts=[];for await(const chunk of req){length+=chunk.length;if(length>max)throw fail(413,'Request is too large.');parts.push(chunk);}return Buffer.concat(parts);}
async function input(req){if(!String(req.headers['content-type']||'').startsWith('application/json'))throw fail(415,'Use application/json.');try{return JSON.parse((await body(req)).toString('utf8'));}catch(e){if(e.status)throw e;throw fail(400,'Invalid JSON.');}}
function limit(key,count,ms){for(const [k,v]of limits)if(v.until<=now())limits.delete(k);if(limits.size>=10000&&!limits.has(key))throw fail(429,'Please try again later.');const entry=limits.get(key)||{count:0,until:now()+ms};entry.count++;limits.set(key,entry);if(entry.count>count)throw fail(429,'Too many attempts. Please try again later.');}
function text(value,label,max){if(typeof value!=='string'||!value.trim()||value.length>max)throw fail(400,label+' is required and must be within '+max+' characters.');return value.trim();}
function email(value){const s=text(value,'Email',254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))throw fail(400,'Enter a valid email.');return s;}
function sameOrigin(req){if(req.headers['sec-fetch-site']==='cross-site')return false;if(req.headers.origin)return req.headers.origin===origin||(!production&&req.headers.origin==='http://'+req.headers.host&&['localhost','127.0.0.1'].includes(new URL(req.headers.origin).hostname));return false;}
function setCookie(res,token,clear=false){res.setHeader('Set-Cookie',cookieName+'='+token+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+(clear?0:28800)+(production?'; Secure':''));}
async function session(req){const c=String(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='));if(!c)return null;const key=digest(c.slice(cookieName.length+1));const value=sessions.get(key);const a=await account();if(!value||value.expires<=now()||!a||value.version!==a.version){sessions.delete(key);return null;}return {...value,key};}
async function sendMail(message){if(mailTransport)return mailTransport(message);if(!env.RESEND_API_KEY||!env.EMAIL_FROM)throw Error('Email is not configured.');const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':message.id},body:JSON.stringify({from:env.EMAIL_FROM,to:[message.to],subject:message.subject,text:message.text,...(message.replyTo?{reply_to:message.replyTo}:{})}),signal:AbortSignal.timeout(12000)});if(!res.ok)throw Error('Email provider rejected the request.');}
async function messages(){try{return JSON.parse(await fs.readFile(path.join(dir,'messages.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return [];throw e;}}
async function writeMessages(rows){await atomicJson(path.join(dir,'messages.json'),rows);}
async function handler(req,res,next){
let url;try{url=new URL(req.url||'/',origin).pathname;}catch{return json(res,400,{error:'Invalid request.'});}
const api=url.startsWith('/__portfolio_admin/')||url.startsWith('/api/auth/')||url==='/api/contact';
const adminRoute=url==='/admin'||url==='/admin/'||url==='/admin/messages'||url==='/admin/messages/';
if(!api&&!adminRoute)return next();
res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
try{
 const host=req.headers.host;if(host!==new URL(origin).host&&!(!production&&['localhost:'+new URL(origin).port,'127.0.0.1:'+new URL(origin).port].includes(host)))throw fail(403,'Unrecognized host. Use the configured website address.');
 const s=await session(req);
 if(adminRoute){if(!s){res.statusCode=303;res.setHeader('Location','/admin/login');res.end();return;}return next();}
 if(!['GET','POST'].includes(req.method))throw fail(405,'Method not allowed.');
 if(req.method==='POST'&&!sameOrigin(req))throw fail(403,'Request origin is not allowed.');
 const ip=req.socket.remoteAddress||'unknown';
 if(url==='/api/auth/session'&&req.method==='GET')return s?json(res,200,{authenticated:true,csrf:s.csrf}):json(res,401,{error:'Sign in required.'});
 if(url==='/api/auth/login'&&req.method==='POST'){
 limit('login:'+ip,10,15*60e3);limit('login-global',100,15*60e3);const data=await input(req);const username=email(data.email);const password=text(data.password,'Password',128);const a=await account();
 fakeHash??=await hashPassword(randomBytes(24).toString('hex'));const valid=await verifyPassword(password,a||fakeHash);
 if(!a||username!==a.email||!valid)throw fail(401,'Invalid email or password.');
 for(const [k,v]of sessions)if(v.expires<=now())sessions.delete(k);if(sessions.size>1000)throw fail(429,'Too many sessions.');
 const raw=randomBytes(32).toString('hex');sessions.set(digest(raw),{csrf:randomBytes(32).toString('hex'),expires:now()+8*60*60e3,version:a.version});setCookie(res,raw);return json(res,200,{ok:true});
 }
 if(url==='/api/auth/forgot'&&req.method==='POST'){
 limit('forgot:'+ip,5,60*60e3);limit('forgot-global',30,60*60e3);const requested=email((await input(req)).email);
 if(!mailTransport&&(!env.RESEND_API_KEY||!env.EMAIL_FROM))throw fail(503,'Password-reset email is not configured. Contact the site owner.');
 const a=await account();if(a&&a.email===requested){const raw=randomBytes(32).toString('hex');await serialized(async()=>{const current=await account();current.reset={hash:digest(raw),expires:now()+30*60e3};await atomicJson(accountFile,current);});
 try{await sendMail({id:randomUUID(),to:a.email,subject:'Reset your portfolio admin password',text:'Use this single-use link within 30 minutes:\n'+origin+'/admin/reset-password#token='+raw+'\nIf you did not request this, ignore this email.'});}catch{console.warn('Password-reset email delivery failed.');}}
 return json(res,200,{message:'If the address is registered, a reset link will be sent. Check your inbox.'});
 }
 if(url==='/api/auth/reset'&&req.method==='POST'){
 limit('reset:'+ip,10,15*60e3);const data=await input(req);if(typeof data.token!=='string'||!/^[a-f0-9]{64}$/.test(data.token))throw fail(400,'Invalid or expired reset link.');if(data.password!==data.confirmPassword)throw fail(400,'Passwords do not match.');
 await serialized(async()=>{const a=await account();if(!a?.reset||a.reset.expires<=now()||a.reset.hash!==digest(data.token))throw fail(400,'Invalid or expired reset link.');Object.assign(a,await hashPassword(data.password));a.reset=null;a.version=randomUUID();await atomicJson(accountFile,a);sessions.clear();});
 setCookie(res,'',true);return json(res,200,{ok:true});
 }
 if(url==='/api/contact'&&req.method==='POST'){
 limit('contact:'+ip,5,60*60e3);limit('contact-global',100,60*60e3);const data=await input(req);if(data.website)throw fail(400,'Invalid submission.');
 const row={id:randomUUID(),name:text(data.name,'Name',120),email:email(data.email),subject:text(data.subject,'Subject',200),message:text(data.message,'Message',6000),createdAt:new Date(now()).toISOString(),read:false,notification:'pending'};
 await serialized(async()=>{const rows=await messages();if(rows.length>=10000)throw fail(503,'Message storage is full. Please use the email link.');rows.unshift(row);await writeMessages(rows);});
 let sent=false;const a=await account();try{if(!a?.email&&!env.ADMIN_EMAIL)throw Error('Recipient not configured');await sendMail({id:row.id,to:env.ADMIN_EMAIL||a.email,replyTo:row.email,subject:'Portfolio: '+row.subject,text:'From: '+row.name+' <'+row.email+'>\nDate: '+row.createdAt+'\n\n'+row.message});sent=true;}catch{console.warn('Contact saved; notification delivery unavailable.');}
 await serialized(async()=>{const rows=await messages();const item=rows.find(x=>x.id===row.id);if(item){item.notification=sent?'sent':'failed';await writeMessages(rows);}});
 return json(res,201,{saved:true,notificationSent:sent,message:sent?'Your message has been received.':'Your message has been saved. Email notification is temporarily unavailable.'});
 }
 if(!s)throw fail(401,'Sign in required.');
 if(req.method==='POST'&&req.headers['x-portfolio-token']!==s.csrf)throw fail(403,'Invalid security token. Reload and try again.');
 if(url==='/api/auth/logout'&&req.method==='POST'){sessions.delete(s.key);setCookie(res,'',true);return json(res,200,{ok:true});}
 if(url==='/__portfolio_admin/state'&&req.method==='GET')return json(res,200,{...await read(),token:s.csrf});
 if(url==='/__portfolio_admin/messages'&&req.method==='GET')return json(res,200,{messages:await messages()});
 if(url==='/__portfolio_admin/messages'&&req.method==='POST'){
 const data=await input(req);if(!['read','unread','delete'].includes(data.action))throw fail(400,'Invalid message action.');await serialized(async()=>{let rows=await messages();const row=rows.find(x=>x.id===data.id);if(!row)throw fail(404,'Message not found.');if(data.action==='delete')rows=rows.filter(x=>x.id!==data.id);else row.read=data.action==='read';await writeMessages(rows);});return json(res,200,{ok:true});
 }
 if(url==='/__portfolio_admin/save'&&req.method==='POST'){
 const payload=JSON.parse((await body(req,2*1024*1024)).toString('utf8'));const data=validatePortfolio(payload.data);
 return await serialized(async()=>{const current=await read();if(payload.revision!==current.revision)throw fail(409,'Another window saved changes. Reload before saving again.');const backup=path.join(dir,'backups');await fs.mkdir(backup,{recursive:true,mode:0o700});await fs.copyFile(contentFile,path.join(backup,now()+'-'+randomUUID()+'.json'));await atomicJson(contentFile,data);return json(res,200,await read());});
 }
 if(url==='/__portfolio_admin/upload'&&req.method==='POST'){
 const b=await body(req,15*1024*1024);let ext='';if(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';else if(b[0]===255&&b[1]===216&&b[2]===255)ext='jpg';else if(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')ext='webp';else if(b.toString('ascii',0,6)==='GIF87a'||b.toString('ascii',0,6)==='GIF89a')ext='gif';else if(b.toString('ascii',0,5)==='%PDF-')ext='pdf';
 const kind=req.headers['x-file-kind'];if(!ext||!['pdf','image'].includes(kind)||(kind==='pdf')!==(ext==='pdf'))throw fail(400,'Choose a valid JPG, PNG, WebP, GIF or PDF file.');if(ext!=='pdf'&&b.length>10*1024*1024)throw fail(413,'Image must be 10 MB or smaller.');const target=path.join(root,'public/uploads');await fs.mkdir(target,{recursive:true});const name=randomUUID()+'.'+ext;await fs.writeFile(path.join(target,name),b,{flag:'wx'});return json(res,200,{url:'/uploads/'+name});
 }
 throw fail(404,'Unknown action.');
}catch(e){return json(res,e.status||400,{error:e.status?e.message:'Unable to complete the request. Please check the input or try again.'});}
}
return {handler,dir};
}

