import { getErrorViaPath, getValueViaPath } from '@island.is/application/core'
import { FieldBaseProps } from '@island.is/application/types'
import { Box, Text } from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import { InputController } from '@island.is/shared/form-fields'
import { Dispatch, FC, SetStateAction } from 'react'
import { NationalIdWithName } from '../NationalIdWithName'
import { information } from '../../lib/messages'
import { UserInformation } from '../../shared'

interface Props {
  id: string
  buyer: UserInformation
  setBuyer: Dispatch<SetStateAction<UserInformation>>
}

export const BuyerItem: FC<Props & FieldBaseProps> = ({
  id,
  buyer,
  setBuyer,
  ...props
}) => {
  const { formatMessage } = useLocale()
  const { application, errors } = props
  const emailField = `${id}.email`
  const phoneField = `${id}.phone`

  return (
    <Box position="relative">
      <Box display="flex" flexDirection="row" justifyContent="spaceBetween">
        <Text variant="h5">
          {formatMessage(information.labels.buyer.title)}
        </Text>
      </Box>
      <NationalIdWithName
        {...props}
        customId={id}
        customNameLabel={formatMessage(information.labels.buyer.name)}
        customNationalIdLabel={formatMessage(
          information.labels.buyer.nationalId,
        )}
        onNameChange={(name: string) => {
          setBuyer({
            ...buyer,
            name,
          })
        }}
        onNationalIdChange={(nationalId: string) => {
          setBuyer({
            ...buyer,
            nationalId,
          })
        }}
      />
      <Box marginTop={2}>
        <InputController
          id={emailField}
          name={emailField}
          type="email"
          label={formatMessage(information.labels.buyer.email)}
          error={errors && getErrorViaPath(errors, emailField)}
          backgroundColor="blue"
          required
          onChange={(event) => {
            setBuyer({
              ...buyer,
              email: event.target.value,
            })
          }}
          defaultValue={
            getValueViaPath(application.answers, emailField, '') as string
          }
        />
      </Box>
      <Box marginTop={2}>
        <InputController
          id={phoneField}
          name={phoneField}
          type="tel"
          format="###-####"
          label={formatMessage(information.labels.buyer.phone)}
          error={errors && getErrorViaPath(errors, phoneField)}
          backgroundColor="blue"
          required
          onChange={(event) => {
            setBuyer({
              ...buyer,
              phone: event.target.value,
            })
          }}
          defaultValue={
            getValueViaPath(application.answers, phoneField, '') as string
          }
        />
      </Box>
    </Box>
  )
}
