import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className={'h-dvh flex items-center justify-center'}>
      <span className={'sr-only'}>Loading...</span>
      <span>
        <Loader2 className='animate-spin size-6 md:size-8 lg:size-12' />
      </span>
    </div>
  );
}
