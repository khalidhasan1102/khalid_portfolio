'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import seed from './portfolio-seed.json';
export type Content=typeof seed;
const Context=createContext<Content>(seed);
export function PortfolioProvider({children}:{children:React.ReactNode}){
 const [content,setContent]=useState(seed);
 useEffect(()=>{let alive=true;const load=()=>fetch('/portfolio-content.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then((data:any)=>{if(alive&&data.personal&&Array.isArray(data.gallery))setContent(data)}).catch(()=>{});load();window.addEventListener('focus',load);return()=>{alive=false;window.removeEventListener('focus',load)}},[]);
 return <Context.Provider value={content}>{children}</Context.Provider>
}
export const usePortfolio=()=>useContext(Context);
export const imageUrl=(s:string)=>!s?'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22640%22 height=%22400%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23eaf4ff%22/%3E%3C/svg%3E':s.startsWith('/')?s:'/images/'+s+'.webp';
