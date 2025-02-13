import React, {
  forwardRef,
  useState,
  ReactElement,
  HTMLProps,
  ButtonHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  useContext,
} from 'react'
import Downshift, { DownshiftProps } from 'downshift'
import { ControllerStateAndHelpers } from 'downshift/typings'
import cn from 'classnames'
import { helperStyles } from '@island.is/island-ui/theme'
import { Input, InputProps } from './shared/Input/Input'
import { Label } from './shared/Label/Label'
import { Menu, MenuProps } from './shared/Menu/Menu'
import { Item } from './shared/Item/Item'
import { Icon } from '../IconRC/Icon'
import { ColorSchemeContext } from '../context'

import * as styles from './AsyncSearch.css'
import { TestSupport } from '@island.is/island-ui/utils'

export type AsyncSearchSizes = 'medium' | 'large'

export type ItemCmpProps = {
  active?: boolean
  selected?: boolean
  colored?: boolean
  white?: boolean
}

export type AsyncSearchOption = {
  label: string
  value: string
  component?: (props: ItemCmpProps) => ReactElement
  disabled?: boolean
}

export interface AsyncSearchProps {
  id?: string
  label?: string
  placeholder?: string
  options: AsyncSearchOption[]
  colored?: boolean
  filter?: boolean | ((x: AsyncSearchOption) => boolean)
  inputValue?: string
  initialInputValue?: string
  size?: AsyncSearchSizes
  loading?: boolean
  closeMenuOnSubmit?: boolean
  white?: boolean
  onSubmit?: (
    inputValue: string,
    selectedOption: AsyncSearchOption | null,
  ) => void
  onChange?: DownshiftProps<AsyncSearchOption>['onChange']
  onInputValueChange?: DownshiftProps<AsyncSearchOption>['onInputValueChange']
}

export const AsyncSearch = forwardRef<HTMLInputElement, AsyncSearchProps>(
  (
    {
      id = 'asyncsearch-id',
      label,
      placeholder,
      size = 'medium',
      colored,
      options,
      filter = false,
      loading,
      inputValue,
      initialInputValue,
      white,
      closeMenuOnSubmit,
      onChange,
      onSubmit,
      onInputValueChange,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState<boolean>(false)
    const { colorScheme } = useContext(ColorSchemeContext)

    const onFocus = () => setFocused(true)
    const onBlur = () => setFocused(false)

    const hasLabel = Boolean(size === 'large' && label)

    const whiteColorScheme = colorScheme === 'white' || white

    return (
      <Downshift
        id={id}
        onChange={onChange}
        initialInputValue={initialInputValue}
        onInputValueChange={onInputValueChange}
        onOuterClick={(ctx) => {
          ctx.clearItems()
          ctx.setState({ inputValue })
          ctx.closeMenu()
        }}
        onStateChange={(changes, ctx) => {
          switch (changes.type) {
            case Downshift.stateChangeTypes.unknown:
            case Downshift.stateChangeTypes.mouseUp:
            case Downshift.stateChangeTypes.blurInput:
              ctx.setState({ inputValue })
          }
        }}
        itemToString={(item: AsyncSearchOption | null) =>
          item ? item.label : ''
        }
        {...props}
      >
        {(downshiftProps: ControllerStateAndHelpers<AsyncSearchOption>) => {
          const {
            getInputProps,
            getItemProps,
            getLabelProps,
            getMenuProps,
            getToggleButtonProps,
            closeMenu,
            isOpen,
            highlightedIndex,
            getRootProps,
            inputValue,
          } = downshiftProps

          const filterFunc = createFilterFunction(filter, inputValue)
          const filteredOptions = options.filter(filterFunc)
          const shouldShowItems = filteredOptions.length > 0 && isOpen

          const menuContent =
            shouldShowItems &&
            filteredOptions.map((item, index) => (
              <Item
                index={index}
                highlightedIndex={highlightedIndex}
                isActive={highlightedIndex === index}
                colored={colored}
                size={size}
                item={item}
                {...getItemProps({
                  key: item.value,
                  index,
                  item,
                  isSelected: options.includes(item),
                })}
              />
            ))

          const onKeyDown = (event: {
            key: string
            nativeEvent: { preventDownshiftDefault: boolean }
          }) => {
            if (event.key === 'Enter') {
              // Prevent Downshift's default 'Enter' behavior.
              event.nativeEvent.preventDownshiftDefault = true

              const selectedOption =
                highlightedIndex !== null ? options[highlightedIndex] : null

              closeMenuOnSubmit && closeMenu()
              onSubmit && onSubmit(inputValue || '', selectedOption)
            }
          }

          let inputColor: InputProps['color'] | undefined = undefined
          if (whiteColorScheme) {
            inputColor = 'white'
          } else if (colorScheme === 'blueberry') {
            inputColor = 'blueberry'
          }

          return (
            <AsyncSearchInput
              hasFocus={focused}
              loading={loading}
              rootProps={getRootProps(
                { refKey: 'ref' },
                { suppressRefError: true },
              )}
              inputProps={{
                ...getInputProps({
                  value: inputValue,
                  onFocus,
                  onBlur,
                  ref,
                  spellCheck: true,
                  ...(onSubmit && { onKeyDown }),
                }),
                inputSize: size,
                isOpen: shouldShowItems,
                colored,
                hasLabel,
                placeholder,
                color: inputColor,
              }}
              buttonProps={{
                onFocus,
                onBlur,
                ...(onSubmit
                  ? {
                      onClick: () => {
                        closeMenuOnSubmit && closeMenu()
                        onSubmit && onSubmit(inputValue || '', null)
                      },
                    }
                  : getToggleButtonProps()),
              }}
              label={label}
              labelProps={getLabelProps()}
              menuProps={{
                ...getMenuProps(),
                isOpen,
                shouldShowItems,
              }}
            >
              {menuContent}
            </AsyncSearchInput>
          )
        }}
      </Downshift>
    )
  },
)

const createFilterFunction = (
  filter: AsyncSearchProps['filter'],
  inputValue: string | null,
): ((item: AsyncSearchOption) => boolean) => {
  if (typeof filter === 'function') {
    return filter
  }

  if (filter) {
    return (item) =>
      item.label.toLowerCase().includes((inputValue ?? '').toLowerCase())
  }

  return () => true
}

const getIconColor = (
  whiteColorScheme: boolean,
  blueberryColorScheme: boolean,
) => {
  if (whiteColorScheme) {
    return 'white'
  }
  if (blueberryColorScheme) {
    return 'blueberry600'
  }
  return 'blue400'
}

export interface AsyncSearchInputProps {
  hasFocus: boolean
  rootProps: HTMLProps<HTMLDivElement>
  inputProps: InputProps
  buttonProps: ButtonHTMLAttributes<HTMLButtonElement>
  menuProps?: Partial<MenuProps>
  white?: boolean
  label?: string
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>
  loading?: boolean
  children?: ReactNode
  skipContext?: boolean
}

export const AsyncSearchInput = forwardRef<
  HTMLInputElement,
  AsyncSearchInputProps & TestSupport
>(
  (
    {
      hasFocus,
      rootProps,
      inputProps,
      buttonProps,
      loading = false,
      white = false,
      label,
      labelProps = {},
      menuProps = {},
      children,
      skipContext,
      dataTestId,
    },
    ref,
  ) => {
    const { colorScheme: colorSchemeContext } = useContext(ColorSchemeContext)
    const { value, inputSize: size } = inputProps
    const showLabel = Boolean(size === 'large' && label)
    const isOpen = hasFocus && !!children && React.Children.count(children) > 0

    const whiteColorScheme = skipContext
      ? false
      : colorSchemeContext === 'white' || white

    const blueberryColorScheme = skipContext
      ? false
      : colorSchemeContext === 'blueberry'

    const iconColor = getIconColor(whiteColorScheme, blueberryColorScheme)

    let inputColor: InputProps['color'] | undefined = undefined

    if (whiteColorScheme) {
      inputColor = 'white'
    } else if (blueberryColorScheme) {
      inputColor = 'blueberry'
    }

    return (
      <div
        {...rootProps}
        className={cn(styles.wrapper, {
          [styles.focused]: hasFocus || isOpen,
          [styles.open]: isOpen,
          [styles.white]: whiteColorScheme,
        })}
      >
        <Input
          {...inputProps}
          data-testid={dataTestId}
          color={inputColor}
          isOpen={isOpen}
          ref={ref}
        />
        {!loading ? (
          <button
            className={cn(styles.icon, styles.iconSizes[size], {
              [styles.transparentBackground]:
                whiteColorScheme || blueberryColorScheme,
              [styles.focusable]: value,
            })}
            tabIndex={value ? 0 : -1}
            {...buttonProps}
          >
            <Icon size={size} icon="search" color={iconColor} />
          </button>
        ) : (
          <span
            className={cn(styles.loadingIcon, styles.loadingIconSizes[size])}
            aria-hidden="false"
            aria-label="Loading"
          >
            <Icon icon="reload" color={iconColor} />
          </span>
        )}
        {showLabel && <Label {...labelProps}>{label}</Label>}
        {!showLabel && (
          <label
            className={helperStyles.srOnly}
            id={inputProps['aria-labelledby']}
          >
            {inputProps.placeholder}
          </label>
        )}
        <Menu {...{ isOpen, shouldShowItems: isOpen, ...menuProps }}>
          {children}
        </Menu>
      </div>
    )
  },
)
