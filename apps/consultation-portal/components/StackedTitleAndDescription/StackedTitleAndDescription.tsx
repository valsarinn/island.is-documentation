import { Stack, Text } from '@island.is/island-ui/core'

export type StackedTitleAndDescriptionProps = {
  headingColor: 'blue400' | 'blue600'
  title: string
  children: any
}

export const StackedTitleAndDescription = ({
  headingColor,
  title,
  children,
}: StackedTitleAndDescriptionProps) => {
  return (
    <Stack space={1}>
      <Text variant="h3" color={headingColor}>
        {title}
      </Text>
      {children}
    </Stack>
  )
}

export default StackedTitleAndDescription
