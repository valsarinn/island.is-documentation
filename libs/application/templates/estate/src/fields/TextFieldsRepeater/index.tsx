import { FC, useEffect, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { InputController } from '@island.is/shared/form-fields'
import { FieldBaseProps } from '@island.is/application/types'
import {
  Box,
  GridColumn,
  GridRow,
  Button,
  Text,
} from '@island.is/island-ui/core'
import { Answers } from '../../types'
import * as styles from '../styles.css'
import { formatCurrency } from '@island.is/application/ui-components'

type Props = {
  field: {
    props: {
      fields: Array<object>
      repeaterButtonText: string
      repeaterHeaderText: string
    }
  }
}

export const TextFieldsRepeater: FC<FieldBaseProps<Answers> & Props> = ({
  field,
}) => {
  const { id, props } = field
  const { fields, append, remove } = useFieldArray<any>({
    name: id,
  })

  const [rateOfExchange, setRateOfExchange] = useState(0)
  const [faceValue, setFaceValue] = useState(0)
  const [index, setIndex] = useState('0')

  const { setValue } = useFormContext()

  const handleAddRepeaterFields = () => {
    const values = props.fields.map((field: object) => {
      return Object.values(field)[1]
    })

    const repeaterFields = values.reduce(
      (acc: Record<string, string>, elem: string) => {
        acc[elem] = ''
        return acc
      },
      {},
    )

    append(repeaterFields)
  }

  useEffect(() => {
    if (fields.length === 0) {
      handleAddRepeaterFields()
    }

    setValue(`${index}.value`, String(faceValue * rateOfExchange))
  }, [fields, faceValue, rateOfExchange, setValue])

  return (
    <Box>
      {fields.map((repeaterField, index) => {
        const fieldIndex = `${id}[${index}]`

        return (
          <Box
            position="relative"
            key={repeaterField.id}
            marginTop={2}
            hidden={repeaterField.initial || repeaterField?.dummy}
          >
            {index > 0 && (
              <>
                <Text variant="h4" marginBottom={2}>
                  {props.repeaterHeaderText + ' ' + (index + 1)}
                </Text>
                <Box position="absolute" className={styles.removeFieldButton}>
                  <Button
                    variant="ghost"
                    size="small"
                    circle
                    icon="remove"
                    onClick={() => remove(index)}
                  />
                </Box>
              </>
            )}

            <GridRow>
              {props.fields.map((field: any) => {
                return (
                  <GridColumn
                    span={['1/1', '1/2']}
                    paddingBottom={2}
                    key={field.id}
                  >
                    <InputController
                      id={`${fieldIndex}.${field.id}`}
                      name={`${fieldIndex}.${field.id}`}
                      defaultValue={repeaterField[field.id] || ''}
                      format={field.format}
                      label={field.title}
                      placeholder={field.placeholder}
                      backgroundColor={field.color ? field.color : 'blue'}
                      currency={field.currency}
                      readOnly={field.readOnly}
                      type={field.type}
                      onChange={(e) => {
                        setIndex(fieldIndex)
                        if (field.id === 'rateOfExchange') {
                          setRateOfExchange(Number(e.target.value))
                        } else if (field.id === 'faceValue') {
                          setFaceValue(Number(e.target.value))
                        }
                      }}
                    />
                  </GridColumn>
                )
              })}
            </GridRow>
          </Box>
        )
      })}
      <Box marginTop={1}>
        <Button
          variant="text"
          icon="add"
          iconType="outline"
          onClick={handleAddRepeaterFields}
          size="small"
        >
          {props.repeaterButtonText}
        </Button>
      </Box>
    </Box>
  )
}

export default TextFieldsRepeater
