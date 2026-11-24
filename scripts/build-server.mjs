import {promises as fs} from 'node:fs';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/postcss';
import ts from 'typescript';
const root=process.cwd(),out=path.join(root,'.server-build'),entry=path.join(root,'.production-entry.tsx');
await fs.mkdir(out,{recursive:true});
await fs.writeFile(entry,"import React from 'react';import{createRoot}from'react-dom/client';import App from './app/page';import Admin from './app/admin/page';import Messages from './app/admin/messages/page';import AuthScreen from './app/admin/auth-screen';import './app/globals.css';const p=location.pathname.replace(/\\/$/,'');const page=p==='/admin'?<Admin/>:p==='/admin/messages'?<Messages/>:p==='/admin/login'?<AuthScreen/>:p==='/admin/forgot-password'?<AuthScreen mode='forgot'/>:p==='/admin/reset-password'?<AuthScreen mode='reset'/>:<App/>;createRoot(document.getElementById('root')!).render(page);");
try{const result=await build({configFile:false,root,publicDir:false,define:{'process.env.NODE_ENV':JSON.stringify('production')},resolve:{alias:{'@':root}},plugins:[react()],css:{postcss:{plugins:[tailwind()]}},build:{write:false,lib:{entry,formats:['iife'],name:'Portfolio'},cssCodeSplit:false}});
const outputs=(Array.isArray(result)?result:[result]).flatMap(x=>x.output);
await fs.writeFile(path.join(out,'bundle.js'),outputs.filter(x=>x.type==='chunk').map(x=>x.code).join('\n'));
await fs.writeFile(path.join(out,'bundle.css'),outputs.filter(x=>x.type==='asset'&&x.fileName.endsWith('.css')).map(x=>x.source).join('\n'));
await fs.writeFile(path.join(out,'schema.mjs'),ts.transpileModule(await fs.readFile('lib/portfolio-schema.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
await fs.writeFile(path.join(out,'index.html'),'<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Md. Khalid Hasan | Geospatial Portfolio</title><link rel="stylesheet" href="/bundle.css"><script src="/bundle.js" defer></script></head><body><div id="root"></div></body></html>');
console.log('Node production bundle ready.');}finally{await fs.unlink(entry);}
