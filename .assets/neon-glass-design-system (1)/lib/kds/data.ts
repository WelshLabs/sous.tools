export type TicketStatus = "new" | "cooking" | "ready" | "completed"
export type KdsLayout = "rail" | "grid" | "compact"
export type KitchenStation = "All" | "Grill" | "Sauté" | "Cold"
export type TicketItem = { id: string; quantity: number; name: string; modifier?: string; done: boolean; station: Exclude<KitchenStation, "All"> }
export type Ticket = { id: string; number: number; type: "Dine in" | "Takeout"; destination: string; createdMinutesAgo: number; status: TicketStatus; items: TicketItem[] }

export const KDS_TICKETS: Ticket[] = [
 { id:"t1", number:1048, type:"Dine in", destination:"Table 12", createdMinutesAgo:3, status:"new", items:[{id:"i1",quantity:2,name:"Smash Burger",modifier:"One no pickles",done:false,station:"Grill"},{id:"i2",quantity:1,name:"Sea Salt Fries",done:false,station:"Grill"}]},
 { id:"t2", number:1047, type:"Takeout", destination:"Maya", createdMinutesAgo:7, status:"new", items:[{id:"i3",quantity:1,name:"Market Bowl",modifier:"Dressing on side",done:false,station:"Cold"}]},
 { id:"t3", number:1045, type:"Dine in", destination:"Table 4", createdMinutesAgo:11, status:"cooking", items:[{id:"i4",quantity:1,name:"Steak Frites",modifier:"Medium rare",done:true,station:"Grill"},{id:"i5",quantity:1,name:"Charred Broccolini",done:false,station:"Sauté"}]},
 { id:"t4", number:1044, type:"Takeout", destination:"Jordan", createdMinutesAgo:16, status:"cooking", items:[{id:"i6",quantity:2,name:"Crispy Chicken",done:false,station:"Grill"},{id:"i7",quantity:2,name:"House Lemonade",done:true,station:"Cold"}]},
 { id:"t5", number:1043, type:"Dine in", destination:"Bar 3", createdMinutesAgo:8, status:"ready", items:[{id:"i8",quantity:1,name:"Mushroom Rigatoni",done:true,station:"Sauté"}]},
]
export const KDS_STATUSES: { key: TicketStatus; label: string }[] = [{key:"new",label:"New"},{key:"cooking",label:"Cooking"},{key:"ready",label:"Ready"}]
