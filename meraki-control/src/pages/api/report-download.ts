import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async ({ url }) => {
  const month = url.searchParams.get('month');
  
  if (!month) {
    return new Response('Missing month parameter', { status: 400 });
  }
  
  const reportsDir = path.join(process.cwd(), 'reports');
  const pdfPath = path.join(reportsDir, `${month}-analysis.pdf`);
  
  if (!fs.existsSync(pdfPath)) {
    return new Response('Report not found', { status: 404 });
  }
  
  const file = fs.readFileSync(pdfPath);
  const monthLabel = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Meraki-${month}-Analysis.pdf"`,
    },
  });
};
