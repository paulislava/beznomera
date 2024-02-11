import * as React from 'react'

import styles from './styles.module.css'
import { ContainerProps } from './types'

export const FullHeightContainer: React.FC<ContainerProps> = props => {
  return <div className={styles.fullHeightContainer}>{props.children}</div>
}
