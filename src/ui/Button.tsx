import { forwardRef, type Ref, type PropsWithChildren } from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../utils/cn';
import type { Target } from './Link';
import Link from './Link';

export const buttonVariants = cva(
  'flex min-w-fit font-medium no-underline gap-4 select-none font-elz-plex-sans cursor-pointer items-center justify-center transition-all ring-0 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-elz-neutral-3 disabled:text-elz-neutral-8',
  {
    variants: {
      variant: {
        neutral: 'text-elz-neutral-11 bg-elz-neutral-3 hover:bg-elz-neutral-4 active:bg-elz-neutral-5 focus-visible:ring-elz-neutral-8',
        accent: 'text-elz-accent-11 bg-elz-accent-3 hover:bg-elz-accent-4 active:bg-elz-accent-5 focus-visible:ring-elz-accent-8',
        success: 'text-elz-success-11 bg-elz-success-3 hover:bg-elz-success-4 active:bg-elz-success-5 focus-visible:ring-elz-success-8',
        warning: 'text-elz-warning-11 bg-elz-warning-3 hover:bg-elz-warning-4 active:bg-elz-warning-5 focus-visible:ring-elz-warning-8',
        danger: 'text-elz-danger-11 bg-elz-danger-3 hover:bg-elz-danger-4 active:bg-elz-danger-5 focus-visible:ring-elz-danger-8',
        ghost:
          'text-elz-neutral-11 bg-transparent hover:bg-elz-neutral-4 active:bg-elz-neutral-5 disabled:bg-transparent focus-visible:ring-elz-neutral-8',
        'ghost-bordered':
          'text-elz-neutral-11 bg-transparent hover:bg-elz-neutral-4 active:bg-elz-neutral-5 disabled:bg-transparent focus-visible:ring-elz-neutral-8 border border-elz-neutral-6',
        primary:
          'bg-elz-accent-9 hover:bg-elz-accent-10 active:bg-elz-accent-9 text-elz-accent-1 ring-elz-accent-8 disabled:bg-elz-neutral-3 disabled:text-elz-neutral-8 disabled:ring-elz-neutral-3 disabled:cursor-not-allowed',
        outline:
          'text-elz-neutral-11 bg-transparent hover:bg-elz-neutral-4 active:bg-elz-neutral-5 disabled:bg-transparent focus-visible:ring-elz-neutral-8 border border-elz-neutral-8',
      },
      size: {
        xs: 'h-24 gap-4 px-8 rounded-8 text-[1.4rem]',
        sm: 'h-32 gap-4 px-8 rounded-8 text-[1.4rem]',
        md: 'h-40 gap-8 px-16 rounded-12 text-[1.6rem]',
        lg: 'h-44 gap-8 px-16 rounded-12 text-[1.6rem]',
      },
    },
    defaultVariants: {
      variant: 'accent',
      size: 'sm',
    },
  },
);

export type ButtonProps = PropsWithChildren &
  VariantProps<typeof buttonVariants> & {
    id?: string;
    href?: string;
    className?: string;
    target?: Target;
    rel?: string;
    onClick?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ id, children, href, target, rel, onClick, variant, size, className, ...props }, ref) => {
    if (href)
      return (
        <Link
          ref={ref as Ref<HTMLAnchorElement>}
          id={id}
          href={href}
          target={target}
          rel={rel}
          className={cn(buttonVariants({ variant, size }), className)}
        >
          {children}
        </Link>
      );

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        id={id}
        onClick={onClick}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
