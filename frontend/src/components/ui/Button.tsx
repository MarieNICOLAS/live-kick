import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonProps<TElement extends ElementType = 'button'> = {
  as?: TElement
  children: ReactNode
  variant?: ButtonVariant
} & Omit<ComponentPropsWithoutRef<TElement>, 'as' | 'className'>

export function Button<TElement extends ElementType = 'button'>({
  as,
  children,
  variant = 'primary',
  ...props
}: ButtonProps<TElement>) {
  const Component = as ?? 'button'

  return (
    <Component className={`ui-button ui-button--${variant}`} {...props}>
      {children}
    </Component>
  )
}
