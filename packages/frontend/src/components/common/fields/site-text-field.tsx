import { TextField, TextFieldProps } from '@mui/material'
import * as React from 'react'

import styles from './styles.module.css'

import { classnames } from '~/common/utils/classnames'

export const SiteTextField: React.FC<TextFieldProps> = props => {
  return <TextField classes={{ root: classnames(props.classes?.root, styles.root) }} {...props} />
}
