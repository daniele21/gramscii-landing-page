#!/usr/bin/env node
/** Real Chromium smoke test of served page; no npm/browser packages needed. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";

const root = path.resolve(process.cwd());
const chrome = process.env.CHROME_BIN ||
  ["google-chrome","chromium","chromium-browser"].find(bin =>
    spawnSync("which",[bin],{encoding:"utf8"}).status===0);
if(!chrome){console.error("Chromium/Chrome missing");process.exit(2);}
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".svg":"image/svg+xml"};

function auditPage(width){
 return `<!doctype html><html lang="it"><meta charset="utf-8">
<style>html,body{margin:0;background:white}iframe{display:block;border:0;width:${width}px;height:900px}</style>
<iframe id="site" src="/index.html" title="Gramscii"></iframe>
<pre id="result">PENDING</pre>
<script>
const width=${width};
const iframe=document.getElementById("site");
iframe.addEventListener("load",()=>setTimeout(()=>{
try {
 const d=iframe.contentDocument;
 const win=iframe.contentWindow;
 const html=d.documentElement;
 const problems=[];
 const viewport=html.clientWidth;
 const scroll=html.scrollWidth;
 if(viewport>width+1||viewport<width-20)problems.push("iframe viewport beyond scrollbar allowance: "+viewport+" / "+width);
 if(scroll>viewport+3)problems.push("document horizontal scroll: "+(scroll-viewport)+"px");
 const core=[".site-header",".hero h1",".demo-frame",".stories-grid",".value-grid",
 ".local-illustration",".case-grid",".mission-content",".vision-path",".faq-list"];
 for(const selector of core){
  const el=d.querySelector(selector);
  if(!el){problems.push("missing "+selector);continue;}
  const b=el.getBoundingClientRect();
  if(b.width<15||b.height<10)problems.push("collapsed "+selector);
  if(b.left<-4||b.right>viewport+4)problems.push("overflow "+selector+
      " ["+b.left.toFixed(1)+","+b.right.toFixed(1)+"]");
 }
 const allowedScroll=".demo-tabs,.preview-window,.preview-content,.document-sheet,.terminal-row";
 for(const el of d.querySelectorAll("h1,h2,h3,p,a,button")){
   if(el.closest(allowedScroll))continue;
   if(win.getComputedStyle(el).display==="none"||el.getClientRects().length===0)continue;
   const b=el.getBoundingClientRect();
   if(b.width<1||b.height<1)continue;
   if(b.left<-5||b.right>viewport+5){
    problems.push("text overflow "+el.tagName+" "+(el.textContent||"").trim().slice(0,32));
    if(problems.length>30)break;
   }
 }
 const heading=d.getElementById("hero-heading");
 const computed=win.getComputedStyle(heading);
 if(!computed.fontFamily.includes("Georgia"))problems.push("heading font: "+computed.fontFamily);
 if(parseFloat(computed.fontSize)<34)problems.push("hero heading font below 34px");
 // Motion is progressive: desktop and mobile enter gracefully and the
 // document always remains usable with a reduced-motion preference.
 const isReduced=win.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const motionReady=html.classList.contains("motion-ready");
 const motionStatic=html.classList.contains("motion-static");
 if(!isReduced&&!motionReady)problems.push("motion controller not initialized");
 if(isReduced&&!motionStatic)problems.push("reduced-motion did not disable reveal system");
 if(isReduced&&motionReady)problems.push("reduced-motion still has motion-ready class");
 const sourceReveal=d.querySelector(".stories-grid .story-card");
 if(!sourceReveal) problems.push("missing narrative card");
 else if(!isReduced&&!sourceReveal.classList.contains("reveal-pending"))
   problems.push("motion reveal not registered on narrative card");
 else if(isReduced&&sourceReveal.classList.contains("reveal-pending"))
   problems.push("reveal registered despite reduced-motion preference");
 const heroAnim=win.getComputedStyle(d.getElementById("hero-heading")).animationName;
 if(isReduced&&heroAnim!=="none")problems.push("hero animates under reduced-motion: "+heroAnim);
 const mission=win.getComputedStyle(d.querySelector(".mission-section")).backgroundColor;
 const demo=win.getComputedStyle(d.querySelector(".demo-section")).backgroundColor;
 if(mission!=="rgb(232, 230, 223)")problems.push("mission bg: "+mission);
 if(demo!=="rgb(46, 66, 84)")problems.push("demo bg: "+demo);
 document.querySelector("#result").textContent="__AUDIT_RESULT__"+JSON.stringify({
  width,viewport,scroll,font:computed.fontFamily,fontSize:computed.fontSize,
  mission,demo,motionMode:isReduced?"reduced":"standard",motionReady,motionStatic,
  sections:d.querySelectorAll("main > section").length,problems
 });
} catch(e){
 document.querySelector("#result").textContent="__AUDIT_RESULT__"+
  JSON.stringify({width,problems:[String(e),String(e?.stack||"")]});
}
},850),{once:true});
setTimeout(()=>{
 const v=document.querySelector("#result");
 if(!v.textContent.startsWith("__AUDIT_RESULT__"))
 v.textContent="__AUDIT_RESULT__"+JSON.stringify({width,problems:["audit timed out"]});
},4600);
</script></html>`;
}

const server=http.createServer((req,res)=>{
 const url=new URL(req.url||"/","http://127.0.0.1");
 if(url.pathname==="/__audit"){
  res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});
  res.end(auditPage(Number(url.searchParams.get("width"))||1440));
  return;
 }
 try {
  const pathname=decodeURIComponent(url.pathname);
  let file=path.resolve(root,"."+pathname);
  if(!file.startsWith(root+path.sep))throw Error("Outside source tree");
  if(fs.statSync(file).isDirectory())file=path.join(file,"index.html");
  const ext=path.extname(file);
  if(!Object.hasOwn(MIME,ext))throw Error("Unexpected extension");
  res.writeHead(200,{"Content-Type":MIME[ext]+"; charset=utf-8"});
  fs.createReadStream(file).pipe(res);
 } catch {res.writeHead(404);res.end("Not found");}
});
server.listen(0,"127.0.0.1");
await once(server,"listening");
const port=server.address().port;

async function runChrome(width,reduced=false){
 const url="http://127.0.0.1:"+port+"/__audit?width="+width;
 const args=["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
 "--no-first-run","--no-default-browser-check","--window-size=1480,1050",
 "--virtual-time-budget=6000","--dump-dom",url];
 if(reduced)args.splice(1,0,"--force-prefers-reduced-motion=reduce");
 const proc=spawn(chrome,args,{stdio:["ignore","pipe","pipe"]});
 let stdout="",stderr="";
 proc.stdout.on("data",d=>stdout+=d);
 proc.stderr.on("data",d=>stderr+=d);
 const exit=await new Promise((resolve,reject)=>{
  proc.on("error",reject);
  proc.on("exit",(code,signal)=>resolve({code,signal}));
  setTimeout(()=>proc.kill("SIGKILL"),25000).unref();
 });
 const found=stdout.match(/__AUDIT_RESULT__(\{[^\n<>]*\})/);
 if(!found)throw Error("Chrome failed at "+width+"px exit "+exit.code+": "+
    stderr.slice(-1200)+" / "+stdout.slice(-400));
 return JSON.parse(found[1].replaceAll("&quot;",'"').replaceAll("&amp;","&"));
}
const widths=[320,390,640,768,1440];
let bad=0;
try {
 for(const width of widths){
  const result=await runChrome(width);
  console.log(JSON.stringify(result));
  if(result.problems.length)bad++;
 }
 for(const width of [390,1440]){
  const result=await runChrome(width,true);
  console.log(JSON.stringify(result));
  if(result.problems.length)bad++;
 }
} finally {server.close();}
if(bad){
 console.error("Layout/motion smoke: "+bad+"/"+(widths.length+2)+" viewports flagged");
 process.exitCode=1;
}else console.log("Layout/motion smoke: five standard and two reduced-motion Chromium checks passed");
