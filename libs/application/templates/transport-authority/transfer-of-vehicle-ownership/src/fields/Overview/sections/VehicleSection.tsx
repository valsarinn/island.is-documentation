import { FieldBaseProps } from '@island.is/application/types'
import { FC } from 'react'
import { Text, GridRow, GridColumn } from '@island.is/island-ui/core'
import { getValueViaPath } from '@island.is/application/core'
import format from 'date-fns/format'
import is from 'date-fns/locale/is'
import parseISO from 'date-fns/parseISO'
import { useLocale } from '@island.is/localization'
import { information, overview } from '../../../lib/messages'
import { ReviewGroup } from '../../ReviewGroup'
import { CoOwnerAndOperator, ReviewScreenProps } from '../../../shared'
import { formatIsk } from '../../../utils'

export const VehicleSection: FC<FieldBaseProps & ReviewScreenProps> = ({
  application,
  reviewerNationalId = '',
}) => {
  const { formatMessage } = useLocale()
  const { answers } = application

  const dateOfContract = format(
    parseISO(getValueViaPath(answers, 'vehicle.date', '') as string),
    'dd.MM.yyyy',
    {
      locale: is,
    },
  )
  const carColor = getValueViaPath(answers, 'pickVehicle.color', undefined) as
    | string
    | undefined
  const carPlate = getValueViaPath(answers, 'pickVehicle.plate', '') as string
  const salePrice = getValueViaPath(answers, 'vehicle.salePrice', '') as string
  const buyerCoOwnerAndOperator = getValueViaPath(
    answers,
    'buyerCoOwnerAndOperator',
    [],
  ) as CoOwnerAndOperator[]
  const isOperator = buyerCoOwnerAndOperator
    .filter(({ wasRemoved }) => wasRemoved !== 'true')
    .find(
      (reviewerItems) =>
        reviewerItems.nationalId === reviewerNationalId &&
        reviewerItems.type === 'operator',
    )

  return (
    <ReviewGroup isLast>
      <GridRow>
        <GridColumn span={['12/12', '12/12', '12/12', '12/12']}>
          <Text variant="h4">
            {formatMessage(information.labels.vehicle.title)}
          </Text>
        </GridColumn>
        <GridColumn span={['12/12', '12/12', '12/12', '6/12']}>
          <Text>{getValueViaPath(answers, 'vehicle.type', '') as string}</Text>
          <Text>
            {carColor ? `${carColor} - ` : ''}
            {carPlate}
          </Text>
        </GridColumn>
        <GridColumn span={['12/12', '12/12', '12/12', '6/12']}>
          {!isOperator && salePrice.length > 0 && (
            <Text>
              {`${formatMessage(overview.labels.salePrice)} ${formatIsk(
                parseInt(salePrice, 10),
              )}`}
            </Text>
          )}
          <Text>{`${formatMessage(
            overview.labels.agreementDate,
          )} ${dateOfContract}`}</Text>
        </GridColumn>
      </GridRow>
    </ReviewGroup>
  )
}
