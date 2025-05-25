import CompanionCard from '@/components/CompanionCard';
import CompanionsList from '@/components/CompanionsList';
import CTA from '@/components/CTA';
import {
  getAllCompanions,
  getRecentSessions,
} from '@/lib/actions/companion.actions';
import { getSubjectColor } from '@/lib/utils';
import { Suspense } from 'react';

export default async function Home() {
  const companions = await getAllCompanions({ limit: 3 });
  const recentSessionsCompanions = await getRecentSessions(10);

  return (
    <main className='container mx-auto max-w-7xl px-4 sm:px-6 xl:px-0 pb-12'>
      <h1>Popular Companions</h1>

      <section className='home-section'>
        <Suspense fallback={<p>Loading...</p>}>
          {companions.map((companion) => (
            <CompanionCard
              key={companion.id}
              {...companion}
              color={getSubjectColor(companion.subject)}
            />
          ))}
        </Suspense>
      </section>

      <section className='home-section'>
        <CompanionsList
          title='Recently completed sessions'
          companions={recentSessionsCompanions}
          classNames='w-2/3 max-lg:w-full'
        />
        <CTA />
      </section>
    </main>
  );
}
