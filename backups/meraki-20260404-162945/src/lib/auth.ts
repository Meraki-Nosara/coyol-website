// Simple password-based auth for Meraki Dashboard
// Credentials: Angelina / masro

const VALID_USER = 'Angelina';
const VALID_PASS = 'masro';
const SESSION_COOKIE = 'meraki_session';
const SESSION_SECRET = 'meraki_2026_nosara'; // Simple session token

export function validateCredentials(user: string, pass: string): boolean {
  return user.toLowerCase() === VALID_USER.toLowerCase() && pass === VALID_PASS;
}

export function createSessionToken(): string {
  // Simple token: base64 of user + timestamp + secret
  const data = `${VALID_USER}:${Date.now()}:${SESSION_SECRET}`;
  return Buffer.from(data).toString('base64');
}

export function validateSession(token: string | undefined): boolean {
  if (!token) return false;
  
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [user, timestamp, secret] = decoded.split(':');
    
    // Check secret matches
    if (secret !== SESSION_SECRET) return false;
    
    // Check user matches
    if (user.toLowerCase() !== VALID_USER.toLowerCase()) return false;
    
    // Session expires after 7 days
    const sessionAge = Date.now() - parseInt(timestamp);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (sessionAge > sevenDays) return false;
    
    return true;
  } catch {
    return false;
  }
}

export function getSessionCookie(request: Request): string | undefined {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : undefined;
}

export function setSessionCookie(token: string): string {
  // Cookie expires in 7 days
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  return `${SESSION_COOKIE}=${token}; Path=/; Expires=${expires}; HttpOnly; SameSite=Lax`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export { SESSION_COOKIE };
