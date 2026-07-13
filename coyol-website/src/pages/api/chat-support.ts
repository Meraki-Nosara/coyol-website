import type { APIRoute } from 'astro';

// Use Anthropic Claude Sonnet for cost efficiency
const ANTHROPIC_API_KEY = import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `Eres el asistente de soporte del sistema de reservaciones de Meraki Restaurants (La Luna y Coyol) en Nosara, Costa Rica.

Tu trabajo es ayudar al personal (hostess, managers) con preguntas sobre cómo usar el sistema.

CONOCIMIENTO DEL SISTEMA:

**Panel Principal (Dashboard)**
- Muestra reservaciones del día seleccionado
- Tabs: "Seated" (sentados) y "Coming" (por llegar)
- Barra de búsqueda: buscar por nombre o # de confirmación
- Filtro de shift: Dinner 1 (4-7pm), Dinner 2 (7pm+)
- Botón "+" para nueva reservación
- Botón "Walk-in" para clientes sin reserva
- Botón "WhatsApp All" para mensajear a todos
- Botón "Remind" para enviar recordatorios por email

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
4. La reservación queda asignada

**Cómo cancelar:**
1. Click en la reservación
2. En el modal, click "Cancel Reservation"
3. Confirmar

**Cómo cambiar estado:**
- Click en reservación → cambiar status: Confirmed, Seated, No-Show, Cancelled

**Capacidad de mesas:**
- Cada mesa tiene capacidad máxima definida en Settings
- El sistema NO debería asignar más personas que la capacidad
- Si esto pasa, es un bug - reportar a Marion

**Floor Plan:**
- Muestra mesas y su estado: disponible (verde), ocupada (rojo), reservada (amarillo)
- Drag & drop para mover mesas (solo admin)

**Gift Cards (La Luna):**
- Ver tarjetas vendidas
- Buscar por código o comprador
- Marcar como usada/redimida

**Settings:**
- Horarios de operación
- Capacidades de mesas
- Bloquear fechas específicas

REGLAS DE RESPUESTA:
1. Responde SIEMPRE en español
2. Sé conciso y directo
3. Usa pasos numerados cuando expliques procesos
4. Si no sabes algo, di "No tengo esa información, contacta a Marion"
5. Si es un bug o error del sistema, di que lo reporten a Marion
6. Nunca inventes funcionalidades que no existen`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message, restaurant, history = [] } = await request.json();
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build messages array
    const messages = [
      ...history.map((h: any) => ({
        role: h.role,
        content: h.content
      })),
      { role: 'user', content: message }
    ];

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT + `\n\nRestaurante actual: ${restaurant === 'laluna' ? 'La Luna' : 'Coyol'}`,
        messages
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return new Response(JSON.stringify({ 
        reply: 'Lo siento, hay un problema con el servicio. Intenta de nuevo en un momento.' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'No pude procesar tu pregunta.';

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
