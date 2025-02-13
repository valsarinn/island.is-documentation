import { FC, ReactElement } from 'react'

import { Box } from '../Box/Box'
import * as styles from './FormStepper.css'

export const HistoryStepper: FC<{
  sections?: ReactElement[]
}> = ({ sections }) => {
  return (
    <Box width="full">
      {sections ? <Box className={styles.historyList}>{sections}</Box> : null}
    </Box>
  )
}

export default HistoryStepper
