import { cookies } from 'next/headers';

import { CookiesContext } from '@/providers/CookiesProvider';
import LoginButton from '@/components/LoginButton';

export default function Home() {
  const requestCookies = cookies() as CookiesContext['values'];

  // console.log('requestCookies', requestCookies);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <LoginButton requestCookies={requestCookies}></LoginButton>
      </div>
    </main>
  );
}
