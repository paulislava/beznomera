import { NextPage } from 'next'
import * as React from 'react'
import Head from 'next/head'

import { PaymentOptionsForm } from '~/components/payment/payment-options-form'

const PayPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Пополнение счета</title>
      </Head>
      <PaymentOptionsForm />
    </>
  )
}

export default PayPage
