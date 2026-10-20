import test from "node:test";
import assert from "node:assert/strict";
import { initMotion, pulseEvidence } from "../src/motion.js";

function element(top=1200) {
  const classes=new Set();
  const styles=new Map();
  return {
    classList: {
      add(value) { classes.add(value); },
      remove(value) { classes.delete(value); },
      contains(value) { return classes.has(value); }
    },
    style: { setProperty(name,value){styles.set(name,value);} },
    getBoundingClientRect() {return {top,bottom:top+120};},
    styles
  };
}

function fixture({reduced=false}={}) {
  const root=element(0);
  const initial=element(160);
  const below=element(1700);
  const preference={
    matches:reduced,
    listeners:new Set(),
    addEventListener(event,fn){if(event==="change")this.listeners.add(fn);},
    removeEventListener(event,fn){if(event==="change")this.listeners.delete(fn);},
    change(matches){
      this.matches=matches;
      for(const listener of this.listeners)listener({matches});
    }
  };
  let observer;
  class FakeObserver {
    constructor(callback,options){
      this.callback=callback;
      this.options=options;
      this.observed=new Set();
      this.disconnected=false;
      observer=this;
    }
    observe(node){this.observed.add(node);}
    unobserve(node){this.observed.delete(node);}
    disconnect(){this.disconnected=true;this.observed.clear();}
    intersect(node){this.callback([{target:node,isIntersecting:true}]);}
  }
  const doc={
    documentElement:root,
    querySelectorAll(selector){
      if(selector===".section-intro h2")return [initial,below];
      return [];
    }
  };
  const win={
    innerHeight:800,
    matchMedia(){return preference;},
    IntersectionObserver:FakeObserver
  };
  return {doc,win,root,initial,below,preference,get observer(){return observer;}};
}

test("initial content remains visible; off-screen content is observed and revealed once",()=>{
  const f=fixture();
  const cleanup=initMotion(f.doc,f.win);
  assert.equal(f.root.classList.contains("motion-ready"),true);
  assert.equal(f.initial.classList.contains("is-visible"),true);
  assert.equal(f.below.classList.contains("reveal-pending"),true);
  assert.equal(f.below.classList.contains("is-visible"),false);
  assert.equal(f.observer.observed.has(f.below),true);
  assert.equal(f.observer.observed.has(f.initial),false);
  f.observer.intersect(f.below);
  assert.equal(f.below.classList.contains("is-visible"),true);
  assert.equal(f.observer.observed.has(f.below),false);
  cleanup();
  assert.equal(f.observer.disconnected,true);
  assert.equal(f.root.classList.contains("motion-ready"),false);
});

test("reduced-motion preference disables choreography and reveals pending elements",()=>{
  const f=fixture();
  initMotion(f.doc,f.win);
  assert.equal(f.below.classList.contains("is-visible"),false);
  f.preference.change(true);
  assert.equal(f.observer.disconnected,true);
  assert.equal(f.root.classList.contains("motion-ready"),false);
  assert.equal(f.root.classList.contains("motion-static"),true);
  assert.equal(f.below.classList.contains("is-visible"),true);
});

test("reduced-motion enabled at page load never initializes observer",()=>{
  const f=fixture({reduced:true});
  initMotion(f.doc,f.win);
  assert.equal(f.root.classList.contains("motion-static"),true);
  assert.equal(f.root.classList.contains("motion-ready"),false);
  assert.equal(f.observer,undefined);
  assert.equal(f.below.classList.contains("reveal-pending"),false);
});

test("evidence animation degrades cleanly in a non-browser environment",()=>{
  // Rendering the source excerpt must never depend on the animation engine.
  let animated=false;
  pulseEvidence({animate(){animated=true;}});
  assert.equal(animated,false);
});
