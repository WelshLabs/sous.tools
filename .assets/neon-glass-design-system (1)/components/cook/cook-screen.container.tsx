"use client"

import * as React from "react"
import { COOK_RECIPE } from "@/lib/cook/data"
import { CookScreenView } from "./cook-screen.view"

type WakeLockSentinelLike={release:()=>Promise<void>}
export function CookScreenContainer(){
 const[stepIndex,setStepIndex]=React.useState(0),[yieldCount,setYieldCount]=React.useState(COOK_RECIPE.baseYield),[completed,setCompleted]=React.useState<Set<string>>(new Set()),[wakeLockActive,setWakeLockActive]=React.useState(false)
 React.useEffect(()=>{let sentinel:WakeLockSentinelLike|undefined;async function request(){try{const nav=navigator as Navigator&{wakeLock?:{request:(type:"screen")=>Promise<WakeLockSentinelLike>}};if(nav.wakeLock){sentinel=await nav.wakeLock.request("screen");setWakeLockActive(true)}}catch{setWakeLockActive(false)}}request();return()=>{sentinel?.release();setWakeLockActive(false)}},[])
 React.useEffect(()=>{function key(event:KeyboardEvent){if(event.key==="ArrowRight")setStepIndex(value=>Math.min(COOK_RECIPE.steps.length-1,value+1));if(event.key==="ArrowLeft")setStepIndex(value=>Math.max(0,value-1))}window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[])
 const step=COOK_RECIPE.steps[stepIndex]
 function complete(){setCompleted(current=>{const next=new Set(current);next.has(step.id)?next.delete(step.id):next.add(step.id);return next})}
 async function fullscreen(){if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}
 return <CookScreenView recipe={COOK_RECIPE} stepIndex={stepIndex} yieldCount={yieldCount} completed={completed} wakeLockActive={wakeLockActive} onYieldChange={(delta)=>setYieldCount(value=>Math.max(1,value+delta))} onComplete={complete} onPrevious={()=>setStepIndex(value=>Math.max(0,value-1))} onNext={()=>setStepIndex(value=>Math.min(COOK_RECIPE.steps.length-1,value+1))} onFullscreen={fullscreen}/>
}
