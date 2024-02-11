import * as React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'

import { HomeScreen } from '~/components/home/home-screen'

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>DePoMed</title>
      </Head>
      <HomeScreen />
    </>
  )
}

export default HomePage
