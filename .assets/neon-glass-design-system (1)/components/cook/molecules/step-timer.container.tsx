"use client"
import * as React from "react"
import { StepTimerView } from "./step-timer.view"
export function StepTimerContainer({seconds}:{seconds:number}){const[remaining,setRemaining]=React.useState(seconds);const[running,setRunning]=React.useState(false);React.useEffect(()=>{setRemaining(seconds);setRunning(false)},[seconds]);React.useEffect(()=>{if(!running||remaining<=0)return;const id=setInterval(()=>setRemaining(value=>Math.max(0,value-1)),1000);return()=>clearInterval(id)},[running,remaining]);React.useEffect(()=>{if(remaining===0)setRunning(false)},[remaining]);return <StepTimerView remaining={remaining} total={seconds} running={running} onToggle={()=>setRunning(v=>!v)} onReset={()=>{setRemaining(seconds);setRunning(false)}}/>}
