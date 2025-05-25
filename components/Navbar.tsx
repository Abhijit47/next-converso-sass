import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import NavItems from './NavItems';

export default function Navbar() {
  return (
    <header className='navbar sticky top-0 left-0 z-50 shadow-sm'>
      <Link href='/'>
        <div className='flex items-center gap-2.5 cursor-pointer'>
          <Image src='/images/logo.svg' alt='logo' width={46} height={44} />
        </div>
      </Link>
      <div className='flex items-center gap-8'>
        <NavItems />
        <SignedOut>
          <SignInButton>
            <button className='btn-signin shadow-md hover:shadow-sm'>
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
