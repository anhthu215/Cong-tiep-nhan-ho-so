import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva('cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none active:scale-98 duration-200 [&_svg]:size-4 [&_svg]:shrink-0', {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-foreground',
            destructive: 'bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90',
            outline: 'border border-input bg-card text-foreground hover:bg-accent',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-foreground/6.5 hover:text-accent-foreground',
            link: 'text-primary underline-offset-4 hover:underline',
        },
        size: {
            default: 'h-11 px-5 text-[15px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
            xs: "h-7 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
            sm: "h-9 px-4 text-sm has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
            lg: 'h-12 px-6 text-base has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
            icon: 'size-11',
            'icon-xs': "size-7 [&_svg:not([class*='size-'])]:size-3",
            'icon-sm': 'size-9',
            'icon-lg': 'size-12',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
})

function Button({
    className,
    variant = 'default',
    size = 'default',
    loading = false,
    disabled,
    children,
    ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & { loading?: boolean }) {
    return (
        <ButtonPrimitive
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...props}
        >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    {children}
                </>
            ) : (
                children
            )}
        </ButtonPrimitive>
    )
}

export { Button, buttonVariants }
