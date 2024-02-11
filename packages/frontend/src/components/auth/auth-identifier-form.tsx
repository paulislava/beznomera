import * as React from 'react'
import { AuthMode } from '@paulislava/shared/auth/auth.types'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'

import SiteButton1 from '../common/buttons/site-button-1'
import { SiteTextField } from '../common/fields/site-text-field'

import { useAppSelector } from '~/app/application.store'
import { authActions } from '~/app/auth/auth.slice'

export interface AuthIdentifierRouteQuery {
  organizationId?: number
}

export const AuthIdentifierForm: React.FC = () => {
  const dispatch = useDispatch()
  const [identifier, setIdentifier] = React.useState('')
  const router = useRouter()
  const { organizationId }: AuthIdentifierRouteQuery = router.query
  const pending = useAppSelector(state => state.auth.pending)

  const authMode = AuthMode.EMAIL

  const submitHandler = React.useCallback(() => {
    dispatch(
      authActions.fetchStartAuth({
        identifier,
        authMode,
        organizationId
      })
    )
  }, [authMode, dispatch, identifier, organizationId])

  return (
    <>
      <h1>Авторизация</h1>
      <p>Войдите в свой аккаунт, чтобы получить доступ к вашему депозитному счету</p>
      <SiteTextField
        onChange={value => {
          setIdentifier(value.currentTarget.value)
        }}
        defaultValue={identifier}
        label='E-mail'
        type='email'
      />
      <SiteButton1 disabled={pending || !identifier.trim()} onClick={submitHandler}>
        Получить код
      </SiteButton1>
    </>
  )
}
