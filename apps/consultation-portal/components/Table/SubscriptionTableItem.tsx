import {
  Checkbox,
  Table as T,
  Text,
  Icon,
  Hidden,
  Stack,
} from '@island.is/island-ui/core'
import { Fragment, useState } from 'react'
import { tableRowBackgroundColor } from '../../utils/helpers'
import SubscriptionChoices from '../SubscriptionChoices/SubscriptionChoices'
import * as styles from './SubscriptionTableItem.css'
import { Area } from '../../types/enums'
import { Case } from '../../types/interfaces'

export interface SubscriptionTableItemProps {
  item: Case
  idx: number
  checkboxStatus: boolean
  onCheckboxChange: () => void
  currentTab: Area
}

const SubscriptionTableItem = ({
  item,
  idx,
  checkboxStatus,
  onCheckboxChange,
  currentTab,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const onClick = () => {
    setIsOpen(!isOpen)
  }

  const borderColor = 'transparent'

  return (
    <Fragment>
      <T.Row>
        <T.Data
          borderColor={borderColor}
          box={{
            className: styles.tableRowLeft,
            background: tableRowBackgroundColor(idx),
          }}
        >
          <Checkbox
            checked={checkboxStatus(item.id)}
            onChange={(e) => onCheckboxChange(item.id, e.target.checked)}
          />
        </T.Data>
        {currentTab !== Area.case ? (
          <T.Data
            borderColor={borderColor}
            box={{ background: tableRowBackgroundColor(idx) }}
          >
            <Text variant="h5">{item.name}</Text>
          </T.Data>
        ) : (
          <>
            <T.Data
              borderColor={borderColor}
              box={{ background: tableRowBackgroundColor(idx) }}
            >
              <Hidden below="lg">
                <Text variant="h5">{item.caseNumber}</Text>
              </Hidden>
              <Hidden above="md">
                <Stack space={1}>
                  <Text variant="h5">{item.caseNumber}</Text>
                  <Text variant="medium" fontWeight="light">
                    {item.name}
                  </Text>
                </Stack>
              </Hidden>
            </T.Data>
            <T.Data
              borderColor={borderColor}
              box={{ background: tableRowBackgroundColor(idx) }}
            >
              <Hidden below="lg">
                <Text variant="medium" fontWeight="light">
                  {item.name}
                </Text>
              </Hidden>
            </T.Data>
          </>
        )}
        <T.Data
          borderColor={borderColor}
          box={{
            className: styles.tableRowRight,
            background: tableRowBackgroundColor(idx),
          }}
          align="right"
        >
          <div onClick={onClick} style={{ height: '24px' }}>
            <Icon icon={isOpen ? 'chevronUp' : 'chevronDown'} color="blue400" />
          </div>
        </T.Data>
      </T.Row>
      {isOpen && (
        <T.Row>
          <T.Data
            colSpan={4}
            borderColor={borderColor}
            box={{
              paddingTop: 'none',
              background: tableRowBackgroundColor(idx),
            }}
          >
            <SubscriptionChoices />
          </T.Data>
        </T.Row>
      )}
    </Fragment>
  )
}

export default SubscriptionTableItem
