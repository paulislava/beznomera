import { CircularProgress } from '@mui/material'
import { UserTransaction } from '@paulislava/shared/user/user.types'
import * as React from 'react'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { useSwipeable } from 'react-swipeable'

import SiteButton1 from '../common/buttons/site-button-1'
import { Container } from '../common/container/container'
import { userActions } from '../../app/user/user.slice'
import { Loader } from '../common/loaders/Loader'

import styles from './style.module.scss'

import { useAppSelector, useAuthorized } from '~/app/application.store'
import { appRoutes } from '~/app/application.routes'
import {
  formatDate,
  formatMoneyFull,
  formatMoneyWithSign,
  formatSumm
} from '~/common/utils/formats'
import { classnames } from '~/common/utils/classnames'

export const HomeScreen: React.FC = () => {
  const authorized = useAuthorized()
  const dispatch = useDispatch()
  const balance = useAppSelector(state => state.user.balance)
  const transactions = useAppSelector(state => state.user.transactions)
  const router = useRouter()

  React.useEffect(() => {
    dispatch(userActions.fetchBalance())
    dispatch(userActions.fetchTransactions())
  }, [dispatch])

  const swipeTransactionHandlers = useSwipeable({
    trackMouse: true,
    delta: {
      left: 50
    },
    onSwipedLeft: event => {
      alert('swiped left')
    }
  })

  const transactionTitle = (transaction: UserTransaction): string => {
    return transaction.title
      ? transaction.title
      : transaction.summ >= 0
      ? 'Пополнение депозитного счета'
      : 'Списание за услугу'
  }

  let lastTransactionDay: string | null = null

  if (!authorized) {
    return (
      <Container>
        <Loader />
      </Container>
    )
  }

  return (
    <>
      <Container>
        <h1>Баланс</h1>
        <div className={styles.balance}>
          {balance ? (
            <>
              <div className={styles.balanceFull}>{formatMoneyFull(balance.full)}</div>
              <div className={styles.balanceBonuses}>
                из них {formatSumm(balance.bonus)} бонусов
              </div>
            </>
          ) : (
            <CircularProgress />
          )}
        </div>
        <SiteButton1
          onClick={() => {
            void router.push(appRoutes.pay())
          }}
        >
          <span className={styles.buttonPlus}>+</span> Пополнить депозит
        </SiteButton1>
        <div className={styles.transactions}>
          {transactions !== null ? (
            <>
              {transactions.length ? (
                <>
                  <div className={styles.transactions}>
                    {transactions.map(transaction => {
                      const transactionDay = formatDate(transaction.date)

                      const result = (
                        <div key={transaction.id}>
                          {lastTransactionDay !== transactionDay && (
                            <h3 className={styles.transactionDate} key={transactionDay}>
                              {transactionDay}
                            </h3>
                          )}
                          <div className={styles.transaction} {...swipeTransactionHandlers}>
                            <div className={styles.transactionBody}>
                              <div className={styles.transactionTitle}>
                                {transactionTitle(transaction)}
                              </div>
                              <div
                                className={classnames(
                                  styles.transactionSumm,
                                  transaction.summ > 0
                                    ? styles.transactionPlus
                                    : styles.transactionMinus
                                )}
                              >
                                {formatMoneyWithSign(transaction.summ)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )

                      lastTransactionDay = transactionDay

                      return result
                    })}
                  </div>
                </>
              ) : (
                <div className={styles.noTransactions}>
                  <h2>История</h2>
                  <p>Здесь будут отображаться все ваши транзакции</p>
                </div>
              )}
            </>
          ) : (
            <CircularProgress />
          )}
        </div>
      </Container>
    </>
  )
}
