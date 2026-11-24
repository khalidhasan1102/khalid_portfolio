import {initializeAdmin} from './portfolio-backend.mjs';import path from 'node:path';import readline from 'node:readline';import {Writable} from 'node:stream';
try{process.loadEnvFile('.env')}catch(e){if(e.code!=='ENOENT')throw e}
if(!process.stdin.isTTY)throw Error('Run this command in an interactive terminal.');
let muted=false;const output=new Writable({write(chunk,encoding,callback){if(!muted)process.stdout.write(chunk);callback();}});
const rl=readline.createInterface({input:process.stdin,output,terminal:true});
const ask=q=>new Promise(resolve=>rl.question(q,resolve));
try{const email=process.env.ADMIN_EMAIL||await ask('Admin email: ');process.stdout.write('New password (12–128 characters; hidden): ');muted=true;const password=await ask('');muted=false;process.stdout.write('\nConfirm password (hidden): ');muted=true;const confirm=await ask('');muted=false;process.stdout.write('\n');if(password!==confirm)throw Error('Passwords do not match.');await initializeAdmin(path.resolve(process.cwd(),process.env.PORTFOLIO_DATA_DIR||'.portfolio-private'),email,password);console.log('Admin account created. Sign in at /admin/login.');}finally{muted=false;rl.close();}
