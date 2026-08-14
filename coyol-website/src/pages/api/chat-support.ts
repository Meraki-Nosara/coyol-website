import type { APIRoute } from 'astro';

// API Keys
const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

// Log conversation to Supabase for analysis
async function logConversation(restaurant: string, userMessage: string, botReply: string, category?: string) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/chat_logs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        restaurant,
        user_message: userMessage,
        bot_reply: botReply,
        category: category || 'general',
        created_at: new Date().toISOString()
      })
    });
  } catch (e) {
    // Silent fail - don't break chat if logging fails
    console.error('Failed to log conversation:', e);
  }
}

// Categorize the question for analytics
function categorizeQuestion(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('cómo') || m.includes('como') || m.includes('how')) return 'how-to';
  if (m.includes('error') || m.includes('no funciona') || m.includes('problema')) return 'issue';
  if (m.includes('mesa') || m.includes('table') || m.includes('asignar')) return 'table-assign';
  if (m.includes('cancelar') || m.includes('cancel')) return 'cancellation';
  if (m.includes('walk-in') || m.includes('walkin')) return 'walk-in';
  if (m.includes('busca') || m.includes('cliente') || m.includes('reserva de')) return 'search';
  if (m.includes('cuant') || m.includes('hoy') || m.includes('noche')) return 'stats';
  if (m.includes('combinar') || m.includes('juntar') || m.includes('grupo grande')) return 'table-combine';
  return 'general';
}

// Fetch reservations from database
async function getReservations(restaurant: string, date?: string) {
  const table = restaurant === 'laluna' ? 'laluna_reservations' : 'coyol_reservations';
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=*&date=eq.${targetDate}&order=time.asc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );
    return await res.json();
  } catch (e) {
    return [];
  }
}

// Get reservations for date range (week)
async function getWeekReservations(restaurant: string) {
  const table = restaurant === 'laluna' ? 'laluna_reservations' : 'coyol_reservations';
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  
  const startDate = startOfWeek.toISOString().split('T')[0];
  const endDate = endOfWeek.toISOString().split('T')[0];
  
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=*&date=gte.${startDate}&date=lte.${endDate}&status=neq.cancelled&order=date.asc,time.asc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );
    return await res.json();
  } catch (e) {
    return [];
  }
}

// Search reservations by name
async function searchReservations(restaurant: string, searchTerm: string) {
  const table = restaurant === 'laluna' ? 'laluna_reservations' : 'coyol_reservations';
  // Both tables use guest_name
  const nameCol = 'guest_name';
  
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=*&${nameCol}=ilike.*${searchTerm}*&order=date.desc&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );
    return await res.json();
  } catch (e) {
    return [];
  }
}

// Search gift cards by code or recipient name
async function searchGiftCards(restaurant: string, searchTerm: string) {
  const table = restaurant === 'laluna' ? 'laluna_gift_cards' : 'coyol_gift_cards';
  const term = searchTerm.toUpperCase();
  
  try {
    // Search by code or recipient name
    const byCode = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=*&code=ilike.*${term}*&order=created_at.desc&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );
    const codeResults = await byCode.json();
    
    const byName = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=*&recipient_name=ilike.*${searchTerm}*&order=created_at.desc&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );
    const nameResults = await byName.json();
    
    // Combine and dedupe
    const all = [...(codeResults || []), ...(nameResults || [])];
    const seen = new Set();
    return all.filter(gc => {
      if (seen.has(gc.code)) return false;
      seen.add(gc.code);
      return true;
    });
  } catch (e) {
    return [];
  }
}

const SYSTEM_PROMPT = `Eres el asistente de soporte del sistema de reservaciones de Meraki Restaurants (La Luna y Coyol) en Nosara, Costa Rica.

Tu trabajo es ayudar al personal (hostess, managers) con preguntas sobre cómo usar el sistema Y responder consultas sobre reservaciones y gift cards.

TIENES ACCESO A LA BASE DE DATOS DE RESERVACIONES Y GIFT CARDS. Cuando el usuario pregunte sobre datos específicos, busca en los datos proporcionados.

CONOCIMIENTO DEL SISTEMA:

**Panel Principal (Dashboard)**
- Muestra reservaciones del día seleccionado
- Tabs: "Seated" (sentados) y "Coming" (por llegar)
- Barra de búsqueda: buscar por nombre o # de confirmación
- Filtro de shift: Dinner 1 (4-7pm), Dinner 2 (7pm+)
- Botón "+" para nueva reservación
- Botón "Walk-in" para clientes sin reserva

**Gift Cards:**
- Ver en menú lateral "Gift Cards" o ir a /laluna/admin/gifts
- Buscar por código (ej: LL-DJCS-AKW3) o nombre del destinatario
- Al encontrar un gift card, mostrar: código, monto, balance restante, nombre
- Para aplicar: abrir el gift card, click "Use", seleccionar la reservación

**Cómo crear una reservación:**
1. Click en botón "+" (arriba a la izquierda)
2. Llenar: nombre, teléfono, email, fecha, hora, # de personas
3. Guardar

**Cómo agregar un Walk-in:**
1. Click en botón "Walk-in"
2. Ingresar nombre y # de personas
3. Asignar mesa directamente

**Cómo asignar mesa:**
1. Click en la reservación de la lista
2. Aparece banner "Click a table to assign"
3. Click en la mesa deseada en el plano

**Cómo cancelar:**
1. Click en la reservación
2. En el modal, click "Cancel Reservation"
3. Confirmar

REGLAS DE RESPUESTA:
1. Responde SIEMPRE en español
2. Sé conciso y directo
3. Cuando muestres datos de reservaciones, incluye: nombre, hora, # personas, mesa asignada, notas especiales
4. Cuando muestres gift cards, incluye: código, monto, balance, destinatario, estado
5. Si buscas algo y no lo encuentras, dilo claramente
6. Para preguntas que no puedas responder, di "Contacta a Marion"
7. NUNCA inventes datos - solo usa los datos proporcionados`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message, restaurant, history = [] } = await request.json();
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const messageLower = message.toLowerCase();
    let contextData = '';
    
    // Detect if user is asking about reservations
    const isAskingAboutReservations = 
      messageLower.includes('reserv') ||
      messageLower.includes('reserva') ||
      messageLower.includes('hoy') ||
      messageLower.includes('today') ||
      messageLower.includes('noche') ||
      messageLower.includes('cuant') ||
      messageLower.includes('mesa') ||
      messageLower.includes('table') ||
      messageLower.includes('cliente') ||
      messageLower.includes('guest') ||
      messageLower.includes('busca') ||
      messageLower.includes('search') ||
      messageLower.includes('personas') ||
      messageLower.includes('pax');
    
    // Detect if asking about the week
    const isAskingAboutWeek = 
      messageLower.includes('semana') ||
      messageLower.includes('week') ||
      messageLower.includes('semanal') ||
      messageLower.includes('esta semana') ||
      messageLower.includes('weekly');
    
    // Detect if searching for a specific person
    const nameMatch = messageLower.match(/(?:busca|encuentra|reserva de|cliente|guest|señor|señora|sr\.|sra\.)\s+([a-záéíóúñ]+)/i);
    
    // Detect gift card queries
    const isAskingAboutGiftCards = 
      messageLower.includes('gift') ||
      messageLower.includes('certificado') ||
      messageLower.includes('tarjeta de regalo') ||
      messageLower.includes('codigo') ||
      messageLower.includes('código') ||
      /[LC][LY][L-]-?[A-Z0-9]{4}-?[A-Z0-9]{4}/i.test(message); // Gift card code pattern
    
    // Extract gift card code if present
    const giftCodeMatch = message.match(/([LC][LY][L-]-?[A-Z0-9]{4}-?[A-Z0-9]{4})/i);
    
    // Extract name for gift card search
    const giftNameMatch = messageLower.match(/(?:gift\s*card|certificado|tarjeta).*?(?:de|for|nombre|name)\s+([a-záéíóúñ\s]+)/i);
    
    // Handle gift card searches first (higher priority)
    if (giftCodeMatch || (isAskingAboutGiftCards && giftNameMatch)) {
      const searchTerm = giftCodeMatch ? giftCodeMatch[1] : (giftNameMatch ? giftNameMatch[1].trim() : '');
      const giftCards = await searchGiftCards(restaurant, searchTerm);
      
      if (giftCards && giftCards.length > 0) {
        contextData = `\n\n🎁 GIFT CARDS ENCONTRADOS:\n`;
        giftCards.forEach((gc: any) => {
          const balance = gc.remaining_balance ?? gc.amount;
          contextData += `\n• Código: ${gc.code}\n`;
          contextData += `  Monto original: $${gc.amount}\n`;
          contextData += `  Balance restante: $${balance}\n`;
          contextData += `  Destinatario: ${gc.recipient_name}\n`;
          contextData += `  Estado: ${gc.status === 'redeemed' ? 'CANJEADO' : gc.status === 'partial' ? 'PARCIALMENTE USADO' : 'ACTIVO'}\n`;
          if (gc.recipient_email) contextData += `  Email: ${gc.recipient_email}\n`;
        });
      } else {
        contextData = `\n\n⚠️ No encontré gift cards para "${searchTerm}"`;
      }
    } else if (isAskingAboutWeek) {
      // Get week reservations
      const weekReservations = await getWeekReservations(restaurant);
      if (weekReservations && weekReservations.length > 0) {
        const totalPax = weekReservations.reduce((sum: number, r: any) => sum + (r.party_size || r.guests || 0), 0);
        const byDate: any = {};
        weekReservations.forEach((r: any) => {
          if (!byDate[r.date]) byDate[r.date] = { count: 0, pax: 0 };
          byDate[r.date].count++;
          byDate[r.date].pax += (r.party_size || r.guests || 0);
        });
        
        contextData = `\n\n📊 RESUMEN SEMANAL:\n`;
        contextData += `Total: ${weekReservations.length} reservaciones, ${totalPax} personas\n\n`;
        contextData += `Por día:\n`;
        for (const [date, stats] of Object.entries(byDate as any)) {
          contextData += `- ${date}: ${stats.count} reservas, ${stats.pax} personas\n`;
        }
      } else {
        contextData = `\n\n📊 No hay reservaciones para esta semana`;
      }
    } else if (nameMatch) {
      // Search for specific guest
      const searchResults = await searchReservations(restaurant, nameMatch[1]);
      if (searchResults && searchResults.length > 0) {
        contextData = `\n\n📋 RESULTADOS DE BÚSQUEDA para "${nameMatch[1]}":\n`;
        searchResults.forEach((r: any) => {
          const guestName = r.name || r.guest_name;
          const partySize = r.party_size || r.guests;
          const tableNum = r.table_number || r.table_id;
          const notes = r.notes || r.special_requests;
          contextData += `- ${guestName}: ${r.date} a las ${r.time}, ${partySize} personas`;
          if (tableNum) contextData += `, Mesa ${tableNum}`;
          if (notes) contextData += ` | Notas: ${notes}`;
          if (r.status) contextData += ` | Estado: ${r.status}`;
          contextData += '\n';
        });
      } else {
        contextData = `\n\n⚠️ No encontré reservaciones para "${nameMatch[1]}"`;
      }
    } else if (isAskingAboutReservations) {
      // Get today's reservations
      const todayReservations = await getReservations(restaurant);
      const today = new Date().toISOString().split('T')[0];
      
      if (todayReservations && todayReservations.length > 0) {
        const total = todayReservations.length;
        const totalPax = todayReservations.reduce((sum: number, r: any) => sum + (r.party_size || r.guests || 0), 0);
        const confirmed = todayReservations.filter((r: any) => r.status === 'confirmed' || !r.status).length;
        
        contextData = `\n\n📋 RESERVACIONES PARA HOY (${today}):\n`;
        contextData += `Total: ${total} reservaciones, ${totalPax} personas\n\n`;
        
        todayReservations.forEach((r: any) => {
          const guestName = r.name || r.guest_name;
          const partySize = r.party_size || r.guests;
          const tableNum = r.table_number || r.table_id;
          const notes = r.notes || r.special_requests;
          contextData += `• ${r.time} - ${guestName}: ${partySize} pax`;
          if (tableNum) contextData += `, Mesa ${tableNum}`;
          if (notes) contextData += ` | "${notes}"`;
          if (r.status && r.status !== 'confirmed') contextData += ` [${r.status}]`;
          contextData += '\n';
        });
      } else {
        contextData = `\n\n📋 No hay reservaciones para hoy (${today})`;
      }
    }

    // Build messages array
    const systemContent = SYSTEM_PROMPT + 
      `\n\nRestaurante actual: ${restaurant === 'laluna' ? 'La Luna' : 'Coyol'}` +
      contextData;
    
    const messages = [
      { role: 'system', content: systemContent },
      ...history.map((h: any) => ({
        role: h.role,
        content: h.content
      })),
      { role: 'user', content: message }
    ];

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://coyolnosara.com',
        'X-Title': 'Meraki Reservations Support'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        max_tokens: 600,
        messages
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return new Response(JSON.stringify({ 
        reply: 'Error: ' + error.substring(0, 150)
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No pude procesar tu pregunta.';

    // Log the conversation for analytics
    const category = categorizeQuestion(message);
    logConversation(restaurant, message, reply, category);

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Chat support error:', error);
    return new Response(JSON.stringify({ 
      reply: 'Error de conexión. Verifica tu internet e intenta de nuevo.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
