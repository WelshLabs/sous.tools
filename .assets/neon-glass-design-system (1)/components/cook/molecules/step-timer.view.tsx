import { Pause, Play, RotateCcw, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function StepTimerView({remaining,total,running,onToggle,onReset}:{remaining:number;total:number;running:boolean;onToggle:()=>void;onReset:()=>void}){
 const minutes=Math.floor(remaining/60).toString().padStart(2,"0"),seconds=(remaining%60).toString().padStart(2,"0"),done=remaining===0
 return <div className={cn("flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border p-4",done?"border-success/40 bg-success/10":"border-primary/20 bg-primary/5")}><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-background text-primary"><Timer className="h-5 w-5"/></span><div><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Step timer</p><p className="font-mono text-3xl font-bold tabular-nums">{minutes}:{seconds}</p></div></div><div className="flex gap-2"><Button size="icon" variant="ghost" onClick={onReset} aria-label="Reset timer"><RotateCcw className="h-4 w-4"/></Button><Button onClick={onToggle} disabled={done}>{running?<><Pause className="h-4 w-4"/>Pause</>:<><Play className="h-4 w-4"/>Start timer</>}</Button></div><span className="sr-only">{Math.round(((total-remaining)/total)*100)} percent elapsed</span></div>
}
