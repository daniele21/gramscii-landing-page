import test from "node:test";
import assert from "node:assert/strict";
import { renderAsciiFrame, setProofStep, initProofJourney, initAsciiWave } from "../src/storytelling.js";

function fakeElement() {
  const classes=new Set();
  return {
    textContent: "",
    dataset: {},
    classList: {
      add(value) {classes.add(value);},
      remove(value) {classes.delete(value);},
      contains(value) {return classes.has(value);},
      toggle(value, enabled) {
        if (enabled) classes.add(value);
        else classes.delete(value);
      }
    }
  };
}

test("ASCII wave is deterministic, bounded, recognizably distinct and purely decorative",()=>{
  const first=renderAsciiFrame(0,24,7);
  const second=renderAsciiFrame(2,24,7);
  assert.equal(first,renderAsciiFrame(0,24,7));
  assert.equal(first.split("\n").length,7);
  assert.ok(first.split("\n").every(line=>line.length===24));
  assert.notEqual(first,second);
  assert.match(first,/[*+:]/);
  assert.doesNotMatch(first,/https?:|<script|@font-face/);
});

function sceneFixture(){
  const nodes=Array.from({length:3},fakeElement);
  const steps=Array.from({length:3},fakeElement);
  const readout=fakeElement(),index=fakeElement();
  const scene={
    dataset:{activeStep:"0"},
    querySelectorAll(selector){return selector==="[data-proof-node]"?nodes:[];},
    querySelector(selector){
      if(selector==="[data-proof-readout]")return readout;
      if(selector==="[data-proof-index]")return index;
      return null;
    }
  };
  return {nodes,steps,readout,index,scene};
}
test("proof story tracks exactly one active state in both directions",()=>{
  const f=sceneFixture();
  setProofStep(f.scene,f.steps,1);
  assert.equal(f.scene.dataset.activeStep,"1");
  assert.equal(f.readout.textContent,"AI LOCALE");
  assert.equal(f.index.textContent,"02 / 03");
  assert.deepEqual(f.nodes.map(n=>n.classList.contains("is-active")),[false,true,false]);
  setProofStep(f.scene,f.steps,2);
  assert.deepEqual(f.steps.map(n=>n.classList.contains("is-active")),[false,false,true]);
  setProofStep(f.scene,f.steps,-1);
  assert.equal(f.readout.textContent,"DOCUMENTI");
});

test("narrative scene uses an observer rather than scroll events and can reverse",()=>{
  const f=sceneFixture();
  let observer;
  class FakeObserver {
    constructor(fn, opts){this.callback=fn;this.opts=opts;this.nodes=[];observer=this;}
    observe(el){this.nodes.push(el);}
    disconnect(){this.disconnected=true;}
    trigger(index,ratio=.75){
      this.callback([{isIntersecting:true,intersectionRatio:ratio,target:f.steps[index]}]);
    }
  }
  const doc={
    querySelector(selector){return selector==="[data-proof-scene]"?f.scene:null;},
    querySelectorAll(selector){return selector==="[data-proof-step]"?f.steps:[];}
  };
  const cleanup=initProofJourney(doc,{IntersectionObserver:FakeObserver});
  assert.equal(observer.nodes.length,3);
  assert.equal(observer.opts.rootMargin,"-16% 0px -30% 0px");
  observer.trigger(2);
  assert.equal(f.scene.dataset.activeStep,"2");
  observer.trigger(0);
  assert.equal(f.scene.dataset.activeStep,"0");
  cleanup();
  assert.equal(observer.disconnected,true);
});

test("ASCII respects reduced motion and provides static fallback with no observer",()=>{
  const field=fakeElement();
  const doc={querySelector(){return field;},visibilityState:"visible"};
  const cleanup=initAsciiWave(doc,{
    matchMedia(query){return {matches:query.includes("prefers-reduced-motion")};}
  });
  assert.equal(field.textContent.split("\n").length,9);
  assert.equal(typeof cleanup,"function");
});

test("ASCII timer pauses when offscreen and after reduced-motion preference change",()=>{
  const field=fakeElement();
  const listeners=new Map();
  const preference={
    matches:false,
    listeners:new Set(),
    addEventListener(event,fn){if(event==="change")this.listeners.add(fn);},
    removeEventListener(event,fn){if(event==="change")this.listeners.delete(fn);}
  };
  let pending=null,cancels=0,observer;
  class FakeObserver{
    constructor(cb){this.callback=cb;observer=this;}
    observe(el){this.el=el;}
    disconnect(){this.disconnected=true;}
    enter(value){this.callback([{target:field,isIntersecting:value}]);}
  }
  const doc={
    visibilityState:"visible",
    querySelector(){return field;},
    addEventListener(name,cb){listeners.set(name,cb);},
    removeEventListener(name){listeners.delete(name);}
  };
  const win={
    matchMedia(){return preference;},IntersectionObserver:FakeObserver,
    requestAnimationFrame(cb){pending=cb;return 5;},
    cancelAnimationFrame(){cancels++;pending=null;}
  };
  const cleanup=initAsciiWave(doc,win);
  assert.equal(pending,null);
  observer.enter(true);
  assert.equal(typeof pending,"function");
  pending(120);
  assert.notEqual(pending,null);
  preference.matches=true;
  for(const listener of preference.listeners)listener({matches:true});
  assert.equal(pending,null);
  assert.ok(cancels>=1);
  assert.equal(field.textContent,renderAsciiFrame(0));
  cleanup();
  assert.equal(observer.disconnected,true);
  assert.equal(listeners.size,0);
});
