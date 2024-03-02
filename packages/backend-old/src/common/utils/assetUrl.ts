import { prefixPath } from './prefixPath'

import { ASSETS_URI_PATH } from '~/constants'

export const assetUrl = (path: string): string =>
  `${process.env.BACKEND_URL}${prefixPath(`/${ASSETS_URI_PATH}/${path}`)}`
