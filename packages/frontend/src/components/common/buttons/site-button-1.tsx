import * as React from 'react'
import { Button, ButtonProps, CircularProgress } from '@mui/material'

import styles from './styles.module.scss'

interface ComponentPropsType extends ButtonProps {
  loading?: boolean
}

const SiteButton1: React.FC<ComponentPropsType> = ({
  children,
  loading,
  onClick,
  ...props
}: ComponentPropsType) => {
  return (
    <Button
      {...props}
      onClick={loading ? undefined : onClick}
      classes={{ root: styles.root, disabled: styles.disabled }}
      className={styles.button}
    >
      {!loading ? children : <CircularProgress />}
    </Button>
  )
}

export default SiteButton1
