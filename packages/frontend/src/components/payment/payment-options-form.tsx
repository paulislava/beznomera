import { CircularProgress } from '@mui/material'
import * as React from 'react'
import { useDispatch } from 'react-redux'
import { useState } from 'react'
import { useRouter } from 'next/router'

import SiteButton1 from '../common/buttons/site-button-1'
import { Container } from '../common/container/container'

import styles from './style.module.scss'

import { useAppSelector } from '~/app/application.store'
import { paymentActions } from '~/app/payment/payment.slice'
import { appRoutes } from '~/app/application.routes'
import { userActions } from '~/app/user/user.slice'
import { formatMoney } from '~/common/utils/formats'

export const PaymentOptionsForm: React.FC = () => {
  const dispatch = useDispatch()
  const paymentOptions = useAppSelector(state => state.payment.options)
  const pending = useAppSelector(state => state.payment.pending)
  const paymentUrl = useAppSelector(state => state.payment.paymentUrl)
  const paymentSuccess = useAppSelector(state => state.payment.paymentSuccess)

  const router = useRouter()
  const [selectedOption, selectOption] = useState<string | null>(null)

  React.useEffect(() => {
    dispatch(paymentActions.fetchOptions())
  }, [dispatch])

  React.useEffect(() => {
    if (paymentUrl) {
      dispatch(paymentActions.checkPayment(paymentUrl))
    }
  }, [dispatch, paymentUrl])

  React.useEffect(() => {
    if (paymentSuccess) {
      dispatch(userActions.fetchTransactions())
      dispatch(userActions.fetchBalance())
      void router.push(appRoutes.paymentSuccess())
    }
  }, [dispatch, paymentSuccess, router])

  const submitHandler = React.useCallback(() => {
    if (selectedOption) {
      dispatch(paymentActions.createPayment(selectedOption))
    }
  }, [dispatch, selectedOption])

  return (
    <>
      <Container>
        <h1>Выберите сумму пополнения</h1>
        {paymentOptions ? (
          <>
            <div className={styles.paymentOptions}>
              {paymentOptions.map(option => (
                <div
                  key={option.id}
                  className={[
                    styles.option,
                    selectedOption === option.id ? styles.selectedOption : ''
                  ].join(' ')}
                  onClick={() => {
                    selectOption(option.id)
                  }}
                >
                  {option.recommended && <div className={styles.recommended}>Рекомендуем</div>}
                  <div className={styles.optionSumm}>{formatMoney(option.summ)}</div>
                  {option.bonusPercent && (
                    <div className={styles.optionBonus}>
                      {option.bonusPercent}% зачислим на счет дополнительно
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedOption && (
              <SiteButton1 disabled={pending} onClick={submitHandler}>
                Перейти к оплате
              </SiteButton1>
            )}
          </>
        ) : (
          <CircularProgress />
        )}
      </Container>
    </>
  )
}
