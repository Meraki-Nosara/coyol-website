import { defineMiddleware } from 'astro:middleware';

// Simple auth for /command routes
const USERS: Record<string, string> = {
  'marion': 'c527Q1Nq3AJff8',
  'ruth': 'zKYSHmOKroQ5w6',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  
  // Only protect /command routes
  if (!url.pathname.startsWith('/command')) {
    return next();
  }
  
  // Check for auth cookie
  const cookies = context.cookies;
  const authCookie = cookies.get('coyol_auth');
  
  if (authCookie?.value === 'authenticated') {
    return next();
  }
  
  // Check for login attempt
  if (context.request.method === 'POST') {
    const formData = await context.request.formData();
    const username = formData.get('username')?.toString().toLowerCase();
    const password = formData.get('password')?.toString();
    
    if (username && password && USERS[username] === password) {
      // Set auth cookie (24 hours)
      cookies.set('coyol_auth', 'authenticated', {
        path: '/',
        maxAge: 60 * 60 * 24,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      
      return context.redirect(url.pathname);
    }
  }
  
  // Show login page
  return new Response(loginPage(), {
    status: 401,
    headers: { 'Content-Type': 'text/html' },
  });
});

function loginPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login — Coyol Command</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #080a07;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e8e6e1;
    }
    .login-box {
      background: #0f1210;
      border: 1px solid #1a1d17;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 360px;
    }
    .logo {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo-mark {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #C4A67C, #a8905f);
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 24px;
      color: #0a0c08;
      margin-bottom: 12px;
    }
    .logo h1 {
      font-size: 20px;
      font-weight: 600;
      color: #e8e6e1;
    }
    .logo span {
      font-size: 11px;
      color: #555;
      letter-spacing: 2px;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    label {
      font-size: 12px;
      color: #888;
      margin-bottom: 6px;
      display: block;
    }
    input {
      width: 100%;
      padding: 14px 16px;
      background: #1a1d17;
      border: 1px solid #2a3024;
      border-radius: 8px;
      color: #e8e6e1;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus {
      border-color: #C4A67C;
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #C4A67C, #a8905f);
      border: none;
      border-radius: 8px;
      color: #0a0c08;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
      transition: opacity 0.2s;
    }
    button:hover {
      opacity: 0.9;
    }
    .error {
      background: rgba(244, 63, 94, 0.1);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #f43f5e;
      padding: 12px;
      border-radius: 8px;
      font-size: 13px;
      text-align: center;
      display: none;
    }
  </style>
</head>
<body>
  <div class="login-box">
    <div class="logo">
      <div class="logo-mark">C</div>
      <h1>Coyol Command</h1>
      <span>DINING TO LIVING</span>
    </div>
    <form method="POST">
      <div>
        <label>Username</label>
        <input type="text" name="username" required autofocus>
      </div>
      <div>
        <label>Password</label>
        <input type="password" name="password" required>
      </div>
      <button type="submit">Sign In</button>
    </form>
  </div>
</body>
</html>`;
}
