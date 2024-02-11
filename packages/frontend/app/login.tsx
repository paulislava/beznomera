import styled from 'styled-components/native'
import React from 'react'
import { TextInput } from 'react-native'

import { Text } from '../components/Themed'

const LoginContainer = styled(Text)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`

export default function LoginPage() {
  return (
    <LoginContainer>
      <form>
        <TextInput autoComplete='email' placeholder='Email' />
        <input type='password' placeholder='Password' />
        <button type='submit'>Login</button>
      </form>
    </LoginContainer>
  )
}
