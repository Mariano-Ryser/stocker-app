import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  // Detectar si estamos en app.usestocker.com
  const isAppSubdomain = host.startsWith('app.')

  // Rutas públicas (NO requieren login)
  const isPublicPath =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')

  // ==============================
  // 👉 CASO 1: app.usestocker.com
  // ==============================
  if (isAppSubdomain) {
    // Si entra a "/" → mandarlo al dashboard
    if (pathname === '/') {
      url.pathname = '/dashboard'
      return NextResponse.rewrite(url)
    }

    // Verificar autenticación (cookie)
    const token = req.cookies.get('token')

    // Si NO hay token y no es ruta pública → login
    if (!token && !isPublicPath) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  // ==================================
  // 👉 CASO 2: usestocker.com (landing)
  // ==================================
  // Bloquear acceso al dashboard desde el dominio principal
  if (pathname.startsWith('/dashboard')) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// 🔥 MUY IMPORTANTE (si no, rompe cosas)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}