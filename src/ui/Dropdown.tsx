import {
  Item as BaseItem,
  Portal,
  Content as BaseContent,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  Root as DropDownRoot,
} from '@radix-ui/react-dropdown-menu';
import { cn } from '../utils/cn';

const Root = DropDownRoot;

export const Content: React.FC<DropdownMenuContentProps> = ({ children, className, ...props }) => {
  return (
    <Portal>
      <BaseContent
        sideOffset={props.sideOffset || 6}
        align={props.align || 'start'}
        className={cn(
          'max-h-352 z-20 w-[var(--radix-dropdown-menu-trigger-width)] overflow-auto rounded-8 border border-neutral-6 bg-neutral-1 p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-[.98]',
          className,
        )}
        {...props}
      >
        {children}
      </BaseContent>
    </Portal>
  );
};

export const Item: React.FC<DropdownMenuItemProps> = ({ children, className, ...props }) => {
  return (
    <BaseItem
      className={cn(
        'cursor-pointer select-none rounded-6 px-5 py-3 font-plex-sans text-[1.4rem] text-neutral-11 outline-none hover:bg-neutral-3 focus:bg-neutral-3',
        className,
      )}
      {...props}
    >
      {children}
    </BaseItem>
  );
};

export const Dropdown = {
  Root,
  Content,
  Item,
};
