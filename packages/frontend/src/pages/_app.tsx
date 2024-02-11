import '../styles/globals.css'
import type { AppProps } from 'next/app'
import * as React from 'react'
import { Provider } from 'react-redux'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { CssBaseline, ThemeProvider } from '@mui/material'

import { applicationStore } from '~/app/application.store'
import { AuthProvider } from '~/components/auth/auth-provider'
import createEmotionCache from '~/common/utils/createEmotionCache'
import muiTheme from '~/styles/theme/theme'

const clientSideEmotionCache = createEmotionCache()

export interface MyAppProps extends AppProps {
  emotionCache: EmotionCache
}

function MyApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: MyAppProps): JSX.Element {
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles)
    }
  }, [])

  return (
    <Provider store={applicationStore}>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </ThemeProvider>
      </CacheProvider>
    </Provider>
  )
}

export default MyApp
