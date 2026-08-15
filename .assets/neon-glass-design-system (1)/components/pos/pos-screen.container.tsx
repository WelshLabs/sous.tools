"use client"

import * as React from "react"
import { POS_CATEGORIES, POS_ITEMS, type CartLine, type OrderType, type PosCategory, type PosItem } from "@/lib/pos/data"
import { PosScreenView } from "./pos-screen.view"

export function PosScreenContainer() {
  const [category, setCategory] = React.useState<PosCategory>("Popular")
  const [query, setQuery] = React.useState("")
  const [lines, setLines] = React.useState<CartLine[]>([])
  const [orderType, setOrderType] = React.useState<OrderType>("Dine in")
  const [paid, setPaid] = React.useState(false)
  const items = React.useMemo(() => POS_ITEMS.filter((item) => item.category === category && item.name.toLowerCase().includes(query.toLowerCase())), [category, query])
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
  const tax = subtotal * 0.0825
  const total = subtotal + tax
  function add(item: PosItem) { setPaid(false); setLines((current) => current.some((line) => line.id === item.id) ? current.map((line) => line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { ...item, quantity: 1 }]) }
  function quantity(id: string, delta: number) { setLines((current) => current.map((line) => line.id === id ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0)) }
  function pay() { setPaid(true); setLines([]); window.setTimeout(() => setPaid(false), 4000) }
  return <PosScreenView items={items} categories={POS_CATEGORIES} category={category} query={query} lines={lines} orderType={orderType} subtotal={subtotal} tax={tax} total={total} paid={paid} onCategoryChange={setCategory} onQueryChange={setQuery} onAdd={add} onOrderTypeChange={setOrderType} onQuantity={quantity} onClear={() => setLines([])} onPay={pay} />
}
