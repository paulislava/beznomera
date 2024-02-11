import * as React from 'react'

import { useAppSelector } from '~/app/application.store'
interface ComponentPropsType {
  children?: JSX.Element
}

export const AuthProvider: React.FC<ComponentPropsType> = (props: ComponentPropsType) => {
  const needAuth = useAppSelector(state => state.auth.needAuth)

  if (needAuth) {
    return <></>
  }

  return <>{props.children}</>
}
