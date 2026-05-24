import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth(req => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const isAppRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profil') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/spiel') ||
    pathname.startsWith('/welten') ||
    pathname.startsWith('/missionen')

  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/registrieren')

  if (isAppRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAdminRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url))
    if (!req.auth?.user?.isAdmin) return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
