import { parse } from 'cookie'

export function auth(ctx, path, location){
  const cookies = ctx.req.headers.cookie
  const parsedCookies = parse(cookies || '')
  const isLoggedIn = Boolean(parsedCookies['jwt'])
  if (!isLoggedIn && path !== '/login' && path !== '/register'){
    typeof window !== 'undefined'
      ? Router.push(location)
      : ctx.res.writeHead(302, { Location: location }).end()
    return false  
  } else if(isLoggedIn && (path === '/login' || path === '/register')){
    typeof window !== 'undefined'
      ? Router.push(location)
      : ctx.res.writeHead(302, { Location: location }).end()
    return false
  }
  return true
}