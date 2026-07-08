// ORIGINAL BACKUP - laluna-reservation Edge Function
// Backed up: July 8, 2026 07:24 AM - FROM MARION'S PASTE

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
serve(async (req) => {
 try {
 const { record } = await req.json()
 
 if (!record.guest_email || record.status !== 'confirmed') {
 return new Response(JSON.stringify({ message: 'Skipped' }), { status: 200 })
 }

 const date = new Date(record.date + 'T12:00:00').toLocaleDateString('en-US', {
 weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
 })
 
 const [h, m] = record.time.split(':')
 const hour = parseInt(h)
 const time = `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
 
 const code = record.id.slice(0, 8).toUpperCase()
 const cancelUrl = `https://reserve.lalunanosara.com/cancel?id=${record.id}`

// REST OF CODE CONTINUES - captured from screenshots above
