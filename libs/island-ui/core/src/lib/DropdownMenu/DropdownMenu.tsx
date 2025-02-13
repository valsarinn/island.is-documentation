import React, { ReactElement, MouseEvent } from 'react'
import {
  useMenuState,
  Menu,
  MenuItem,
  MenuButton,
  MenuStateReturn,
} from 'reakit/Menu'
import cn from 'classnames'
import { useBoxStyles } from '../Box/useBoxStyles'
import { Button, ButtonProps } from '../Button/Button'
import { getTextStyles } from '../Text/Text'

import * as styles from './DropdownMenu.css'

export interface DropdownMenuProps {
  /**
   * Aria label for menu
   */
  menuLabel?: string
  items: {
    href?: string
    onClick?: (event: MouseEvent<HTMLElement>, menu: MenuStateReturn) => void
    title: string
    noStyle?: boolean
    render?: (
      element: ReactElement,
      index: number,
      className: string,
    ) => ReactElement
  }[]
  /**
   * Utility button text
   */
  title?: string
  /**
   * Utility button icon
   */
  icon?: ButtonProps['icon']
  disclosure?: ReactElement
  menuClassName?: string
}

export const DropdownMenu = ({
  menuLabel,
  items,
  title,
  icon,
  disclosure,
  menuClassName,
}: DropdownMenuProps) => {
  const menu = useMenuState({ placement: 'bottom', gutter: 8 })
  const menuBoxStyle = useBoxStyles({
    component: 'div',
    background: 'white',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 'large',
  })
  const menuItemBoxStyle = useBoxStyles({
    component: 'button',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
    paddingBottom: 2,
    cursor: 'pointer',
    width: 'full',
  })
  const menuItemTextStyle = getTextStyles({
    variant: 'eyebrow',
  })
  return (
    <>
      {disclosure ? (
        <MenuButton {...menu} {...disclosure.props}>
          {(disclosureProps) => React.cloneElement(disclosure, disclosureProps)}
        </MenuButton>
      ) : (
        <MenuButton as={Button} variant="utility" icon={icon} {...menu}>
          {title}
        </MenuButton>
      )}
      <Menu
        {...menu}
        aria-label={menuLabel}
        className={cn(styles.menu, menuBoxStyle, menuClassName)}
      >
        {items.map((item, index) => {
          let anchorProps = {}
          const render = item.render || ((i: ReactElement, _) => i)
          if (item.href) {
            anchorProps = {
              href: item.href,
              as: 'a',
            }
          }
          const classNames = cn(
            menuItemBoxStyle,
            menuItemTextStyle,
            styles.menuItem,
          )
          return render(
            <MenuItem
              {...menu}
              {...anchorProps}
              key={index}
              onClick={(event) => {
                if (item.onClick) {
                  item.onClick(event, menu)
                }
              }}
              className={cn({ [classNames]: !item.noStyle })}
            >
              {item.title}
            </MenuItem>,
            index,
            classNames,
          )
        })}
      </Menu>
    </>
  )
}

export default DropdownMenu
