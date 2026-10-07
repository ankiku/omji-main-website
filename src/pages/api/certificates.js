import fs from 'fs';
import { getDataPath } from '../../lib/data-store.js';

export const prerender = false;

function getCertificates() {
  const DATA_FILE = getDataPath('certificates.json');
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (e) { return []; }
}

function saveCertificates(certs) {
  const DATA_FILE = getDataPath('certificates.json');
  fs.writeFileSync(DATA_FILE, JSON.stringify(certs, null, 2));
}

export async function GET({ url }) {
  const certId = url.searchParams.get('certId');
  const certs = getCertificates();
  
  if (certId) {
    const cert = certs.find(c => c.certId === certId);
    if (!cert) {
      return new Response(JSON.stringify({ error: 'Certificate not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify(cert), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify(certs), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { internName, department, collegeName, startDate, endDate, performance, mentorName, projectWorkedOn } = body;
    
    if (!internName || !department || !startDate || !endDate) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const certs = getCertificates();
    
    // Generate unique certificate ID: OMJI-YYYY-XXXX
    const year = new Date().getFullYear();
    const existingIds = certs.map(c => c.certId).filter(id => id.startsWith(`OMJI-${year}-`));
    let nextNum = 1;
    if (existingIds.length > 0) {
      const nums = existingIds.map(id => parseInt(id.split('-')[2]));
      nextNum = Math.max(...nums) + 1;
    }
    const certId = `OMJI-${year}-${String(nextNum).padStart(4, '0')}`;
    
    const certificate = {
      id: Date.now(),
      certId,
      internName,
      department,
      collegeName: collegeName || '',
      startDate,
      endDate,
      performance: performance || 'Good',
      mentorName: mentorName || '',
      projectWorkedOn: projectWorkedOn || '',
      issuedAt: new Date().toISOString()
    };
    
    certs.push(certificate);
    saveCertificates(certs);
    
    return new Response(JSON.stringify({ success: true, certificate }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ request }) {
  try {
    const body = await request.json();
    const { id } = body;
    
    let certs = getCertificates();
    certs = certs.filter(c => c.id !== id);
    saveCertificates(certs);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
