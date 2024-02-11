import * as React from 'react'
import { useDispatch } from 'react-redux'

import SiteButton1 from '../common/buttons/site-button-1'
import { SiteTextField } from '../common/fields/site-text-field'

import { useAppSelector } from '~/app/application.store'
import { authActions } from '~/app/auth/auth.slice'

export const AuthCodeForm: React.FC = () => {
  const dispatch = useDispatch()
  const [code, setCode] = React.useState('')
  const pending = useAppSelector(state => state.auth.pending)

  const authMode = useAppSelector(state => state.auth.authMode)
  const identifier = useAppSelector(state => state.auth.identifier)

  const submitHandler = React.useCallback(() => {
    if (identifier && authMode) {
      dispatch(
        authActions.fetchFinishAuth({
          identifier,
          authMode,
          code
        })
      )
    }
  }, [identifier, authMode, dispatch, code])

  return (
    <>
      <h1>Введите код</h1>
      <p>Введите код подтверждения авторизации, который получите в письме</p>
      <SiteTextField
        onChange={value => {
          setCode(value.currentTarget.value)
        }}
        defaultValue={code}
        label='Код'
      />
      <SiteButton1 disabled={!code.trim()} loading={pending} onClick={submitHandler}>
        Войти
      </SiteButton1>
    </>
  )
}
