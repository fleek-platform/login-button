import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';

import { Root } from '@radix-ui/react-dropdown-menu';
import { FiLogOut } from 'react-icons/fi';
import { AvatarMarble } from '../../ui/AvatarMarble';
import { Content, Item } from '../../ui/Dropdown';
import { useAuthStore } from '../../store/authStore';
import type { LoginProviderChildrenProps } from '../../providers/LoginProvider';

type AuthDropdownProps = React.PropsWithChildren<Pick<LoginProviderChildrenProps, 'logout'>>;

export const AuthDropdown = ({ children, ...props }: AuthDropdownProps) => {
  const { logout } = props;
  const { userProfile } = useAuthStore();

  return (
    <Root>
      <DropdownMenuTrigger>
        {userProfile?.avatar ? (
          <img src={userProfile.avatar} alt="Your avatar" className="size-32 rounded-8" />
        ) : (
          <AvatarMarble name={userProfile?.username} className="size-32 rounded-8" />
        )}
      </DropdownMenuTrigger>
      <Content className="w-[200px] p-8 font-medium" align="end">
        {children}
        <Item className="flex flex-row items-center gap-10 justify-between py-6" onClick={logout}>
          <div>Disconnect</div>
          <FiLogOut className="size-18" />
        </Item>
      </Content>
    </Root>
  );
};
