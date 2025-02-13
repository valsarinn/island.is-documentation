import { style } from '@vanilla-extract/css'
import { theme } from '@island.is/island-ui/theme'

export const userControlContainer = style({
  maxWidth: '1440px',
  margin: `${theme.spacing[12]}px auto`,
  padding: `0 ${theme.spacing[6]}px`,
})

export const logoContainer = style({
  display: 'flex',
  marginBottom: theme.spacing[9],
})

export const userTable = style({
  // Needed for Safari.
  width: '100%',
})

export const thead = style({
  background: theme.color.blue100,
  boxShadow: `inset 0px -1px 0px ${theme.color.blue200}`,
})

export const tableRowContainer = style({
  borderBottom: `1px solid ${theme.color.blue200}`,
  cursor: 'pointer',
  transition: 'all .5s ease-in-out',
})

export const th = style({
  padding: `${theme.spacing[2]}px ${theme.spacing[3]}px`,
})

export const td = style({
  padding: `${theme.spacing[2]}px ${theme.spacing[3]}px`,
})
