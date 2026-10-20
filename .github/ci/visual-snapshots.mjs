#!/usr/bin/env node
/** Local-only capture of real Chrome output. No Playwright/npm dependency. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {spawn,spawnSync} from "node:child_process";
import {once} from "node:events";

const root=path.resolve(process.cwd());
const out=path.join(root,".visual-snapshots");
fs.mkdirSync(out,{recursive:true});
const browser=process.env.CHROME_BIN ||
  ["google-chrome","chromium","chromium-browser"].find(bin=>spawnSync("which",[bin]).status===0);
if(!browser)throw Error("Chrome or Chromium is required");
const MIMES={".html":"text/html",".js":"text/javascript",".css":"text/css",".svg":"image/svg+xml"};

function wrapper(width,scene){
 const mobile=width===390;
 const heading=scene==="journey"?"SOURCE TRACE / SCROLL SCENE":"GRAMSCII / HERO";
 return `<!doctype html><html><head><meta charset="utf-8">
 <style>html,body{height:100%;margin:0;background:#09111a;font:12px ui-monospace,monospace;color:#b8d6e6}
 body{display:flex;justify-content:center;align-items:flex-start;overflow:hidden}
 .screen{width:${mobile?390:1440}px;height:${mobile?844:900}px;position:relative}
 iframe{display:block;border:0;width:100%;height:100%;background:#0d0f12}
 .caption{position:absolute;pointer-events:none;z-index:9;right:8px;bottom:8px;padding:8px;background:#132330cc;border:1px solid #668599;font-size:10px}
 </style></head><body><div class="screen">
 <iframe title="Live Gramscii landing" src="/index.html"></iframe>

 </div><script>
 const frame=document.querySelector("iframe");
 frame.addEventListener("load",()=>{
   const d=frame.contentDocument;
   const w=frame.contentWindow;
   setTimeout(()=>{
     if ("${scene}"==="journey"||"${scene}"==="comparison"){
       const target=d.querySelector("${scene}"==="journey"?".proof-journey":".compare-section");
       if(target)w.scrollTo({top:target.getBoundingClientRect().top+w.scrollY-25,behavior:"instant"});
     }
     // Capture the fully settled editorial composition. Previous artifacts
     // silently caught the CSS hero animation at opacity:0 and showed a blank
     // page. Stop ephemeral motion ONLY inside this QA iframe.
     d.documentElement.classList.remove("motion-ready");
     d.documentElement.classList.add("motion-static");
     d.querySelectorAll(".reveal-pending").forEach(el=>el.classList.add("is-visible"));
     const style=d.createElement("style");
     style.textContent="*,*::before,*::after{animation:none!important;transition:none!important}";
     d.head.append(style);
     const title=d.getElementById("hero-heading");
     if(title&&Number.parseFloat(w.getComputedStyle(title).opacity)<.99){
       d.documentElement.dataset.visualCaptureError="hero-hidden";
     }
     d.documentElement.dataset.visualCaptureReady="true";
   },220);
 },{once:true});
 </script></body></html>`;
}
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,"http://127.0.0.1");
 if(u.pathname==="/__capture"){
   res.writeHead(200,{"Content-Type":"text/html"});
   res.end(wrapper(Number(u.searchParams.get("width")),u.searchParams.get("scene")));
   return;
 }
 try{
   const file=path.resolve(root,"."+decodeURIComponent(u.pathname));
   if(!file.startsWith(root+path.sep))throw Error("outside root");
   const ext=path.extname(file);
   if(!Object.hasOwn(MIMES,ext))throw Error("unexpected extension");
   res.writeHead(200,{"Content-Type":MIMES[ext]});
   fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(404);res.end("Not found");}
});
server.listen(0,"127.0.0.1");
await once(server,"listening");
const port=server.address().port;
try{
 for(const scene of ["hero","journey","comparison"]){
  for(const width of [1440,390]){
   const dest=path.join(out,scene+"-"+width+".png");
   const args=[
    "--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
    "--hide-scrollbars","--no-first-run","--window-size=1440,900",
    "--virtual-time-budget=4000","--screenshot="+dest,
    "http://127.0.0.1:"+port+"/__capture?scene="+scene+"&width="+width
   ];
   const proc=spawn(browser,args,{stdio:["ignore","ignore","pipe"]});
   let err="";
   proc.stderr.on("data",d=>err+=d);
   const code=await new Promise((resolve,reject)=>{
    proc.once("error",reject);proc.once("exit",(code)=>resolve(code));
    setTimeout(()=>proc.kill("SIGKILL"),30000).unref();
   });
   if(code!==0||!fs.existsSync(dest)||fs.statSync(dest).size<2000)
    throw Error("Screenshot failed "+dest+" exit="+code+" "+err.slice(-900));
   console.log(path.basename(dest)+": "+fs.statSync(dest).size+" bytes");
  }
 }
}finally{server.close();}
