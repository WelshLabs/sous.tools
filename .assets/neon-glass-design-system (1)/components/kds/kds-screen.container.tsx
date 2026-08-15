"use client"

import * as React from "react"
import { KDS_TICKETS, type KdsLayout, type KitchenStation, type TicketStatus } from "@/lib/kds/data"
import { KdsScreenView } from "./kds-screen.view"

const nextStatus: Record<TicketStatus,TicketStatus>={new:"cooking",cooking:"ready",ready:"completed",completed:"completed"}
export function KdsScreenContainer(){
 const [tickets,setTickets]=React.useState(KDS_TICKETS)
 const [station,setStation]=React.useState<KitchenStation>("All")
 const [layout,setLayout]=React.useState<KdsLayout>("rail")
 const [now,setNow]=React.useState("")
 React.useEffect(()=>{const saved=window.localStorage.getItem("kds-layout");if(saved==="rail"||saved==="grid"||saved==="compact")setLayout(saved)},[])
 function changeLayout(value:KdsLayout){setLayout(value);window.localStorage.setItem("kds-layout",value)}
 React.useEffect(()=>{const update=()=>setNow(new Intl.DateTimeFormat("en",{hour:"numeric",minute:"2-digit"}).format(new Date()));update();const id=setInterval(update,30000);return()=>clearInterval(id)},[])
 const visible=React.useMemo(()=>tickets.filter(ticket=>ticket.status!=="completed"&&(station==="All"||ticket.items.some(item=>item.station===station))),[tickets,station])
 function toggleItem(ticketId:string,itemId:string){setTickets(current=>current.map(ticket=>ticket.id===ticketId?{...ticket,items:ticket.items.map(item=>item.id===itemId?{...item,done:!item.done}:item)}:ticket))}
 function advance(ticketId:string){setTickets(current=>current.map(ticket=>ticket.id===ticketId?{...ticket,status:nextStatus[ticket.status]}:ticket))}
 return <KdsScreenView tickets={visible} station={station} layout={layout} now={now} onStationChange={setStation} onLayoutChange={changeLayout} onToggleItem={toggleItem} onAdvance={advance}/>
}
