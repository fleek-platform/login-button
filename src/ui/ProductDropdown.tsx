import { Dropdown } from './Dropdown';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Text } from './Text';
import { Box } from './Box';
import { IoApps, IoBrowsers } from 'react-icons/io5';
import { Button } from './Button';
import { RiRobot2Line } from 'react-icons/ri';
import { cn } from '../utils/cn';
import { type ReactElement, cloneElement, useState } from 'react';
import { getDefined } from '../defined';

export type Product = {
  name: string;
  description: string;
  icon: ReactElement;
  disabled?: boolean;
};

const products: Product[] = [
  {
    name: 'Agents',
    description: 'Create and manage AI agents',
    icon: <RiRobot2Line />,
  },
  {
    name: 'Dashboard',
    description: 'Hosting and storage solutions',
    icon: <IoBrowsers />,
  },
];

export type ProductDropdownProps = {
  onClick: (product: Product) => void;
};

export const ProductDropdown = ({
  defaultSelectedProductName
}: {
  defaultSelectedProductName?: string
}) => {
  const [selectedProduct, setSelecterdProduct] = useState(defaultSelectedProductName);
  
  const onClick = (product: Product) => {
    let url = '#';
    
    if (product.name === 'Agents') {
      url = getDefined('PUBLIC_APP_AGENTS_URL');
    } else if (product.name === 'Dashboard') {
      url = getDefined('PUBLIC_APP_HOSTING_URL');
    } else {
      console.error('Unknown product!');
    }

    setSelecterdProduct(product.name);

    window.location.href = url;
  };

  return (
    <Dropdown.Root>
      <DropdownMenuTrigger asChild>
        <Button variant="neutral" className="aspect-1">
          <IoApps />
        </Button>
      </DropdownMenuTrigger>
      <Dropdown.Content
        className="w-fit space-y-8 p-12 bg-elz-neutral-0"
        align="end"
      >
        {products.map((product) => {
          return (
            <ProductDropdownItem
              key={product.name}
              product={product}
              isActive={product.name === selectedProduct}
              onClick={() => onClick(product)}
            />
          );
        })}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

type ProductDropdownItemProps = {
  product: Product;
  isActive?: boolean;
  onClick: () => void;
};

const ProductDropdownItem = ({
  product,
  isActive = false,
  onClick,
}: ProductDropdownItemProps) => {
  const Icon = () => {
    const { className, ...props } = product.icon.props;
    return cloneElement(product.icon, {
      className: cn('size-16 flex-shrink-0', className),
      ...props,
    });
  };
  return (
    <Dropdown.Item
      key={product.name}
      className={cn(
        'flex flex-row items-center gap-10 justify-between py-6 hover:bg-elz-neutral-1',
        isActive && 'bg-elz-neutral-1 pointer-events-none',
      )}
      disabled={isActive}
      onClick={onClick}
    >
      <Box
        className={cn(
          'size-38 grid place-content-center bg-elz-neutral-2 rounded-5',
          isActive && 'bg-elz-accent-3 text-elz-accent-11',
        )}
      >
        <Icon />
      </Box>
      <Box>
        <Text variant="primary" className="font-medium">
          {product.name}
        </Text>
        <Text variant="secondary" size="xs">
          {product.description}
        </Text>
      </Box>
    </Dropdown.Item>
  );
};
