import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import { appRoutes } from '~/app/application.routes'
import SiteButton1 from '~/components/common/buttons/site-button-1'
import { Container } from '~/components/common/container/container'

const SuccessPaymentPage: NextPage = () => {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Счет пополнен</title>
      </Head>
      <Container>
        <h2>Ваш депозит успешно пополнен</h2>
        <p>
          Теперь вы можете использовать его при оплате услуг как для себя, так для родных и близких
        </p>
        <SiteButton1
          onClick={() => {
            void router.push(appRoutes.home())
          }}
        >
          Понятно
        </SiteButton1>
      </Container>
    </>
  )
}

export default SuccessPaymentPage
