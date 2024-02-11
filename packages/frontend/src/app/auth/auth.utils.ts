import { appRoutes } from '../application.routes'
import browserHistory from 'next/router'
import { LOGIN_REDIRECT_PARAM } from '../application.constants'

export const goAuth = () => {
  const location = document.location
  const url = `${location.origin}${appRoutes.login()}`
  const loginUrl = new URL(url)
  const redirect: string = browserHistory.pathname
  loginUrl.searchParams.append(LOGIN_REDIRECT_PARAM, redirect)
  console.info('test')
  browserHistory.push(loginUrl)
}
