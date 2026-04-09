import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data/obligaciones.json');

const defaultObligations = [
  {
    id: 'iva-d104',
    name: 'IVA (D-104)',
    type: 'iva',
    frequency: 'monthly',
    dueDay: 15,
    description: 'Declaración y pago del Impuesto al Valor Agregado',
    haciendaCode: 'D-104'
  },
  {
    id: 'ccss-patronal',
    name: 'CCSS Patronal',
    type: 'ccss',
    frequency: 'monthly',
    dueDay: 15,
    description: 'Cuotas obrero-patronales de la Caja'
  },
  {
    id: 'renta-d101',
    name: 'Renta (D-101)',
    type: 'renta',
    frequency: 'annual',
    dueDay: 15,
    dueMonth: 12,
    description: 'Declaración anual del Impuesto sobre la Renta',
    haciendaCode: 'D-101'
  },
  {
    id: 'patente-nosara',
    name: 'Patente Municipal',
    type: 'patente',
    frequency: 'quarterly',
    dueDay: 1,
    description: 'Licencia comercial - Municipalidad de Nicoya'
  },
  {
    id: 'd151-clientes',
    name: 'D-151 Clientes',
    type: 'other',
    frequency: 'annual',
    dueDay: 30,
    dueMonth: 11,
    description: 'Declaración informativa de clientes y proveedores',
    haciendaCode: 'D-151'
  }
];

function loadObligations() {
  if (fs.existsSync(dataPath)) {
    try {
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } catch (e) {
      return [...defaultObligations];
    }
  }
  return [...defaultObligations];
}

function saveObligations(obligations: any[]) {
  fs.writeFileSync(dataPath, JSON.stringify(obligations, null, 2));
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, id, date, amount } = body;
    
    if (action === 'mark-paid') {
      const obligations = loadObligations();
      const index = obligations.findIndex((o: any) => o.id === id);
      
      if (index === -1) {
        return new Response(JSON.stringify({ error: 'Obligation not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      obligations[index].lastPaid = date;
      if (amount) {
        obligations[index].lastPaidAmount = amount;
      }
      
      saveObligations(obligations);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async () => {
  const obligations = loadObligations();
  return new Response(JSON.stringify(obligations), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
