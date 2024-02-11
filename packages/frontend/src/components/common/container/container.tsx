import * as React from 'react'

import styles from './styles.module.css'
import { ContainerProps } from './types'

export const Container: React.FC<ContainerProps> = props => {
  return <div className={styles.container}>{props.children}</div>
}
