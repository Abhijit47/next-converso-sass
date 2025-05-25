'use server';

import { db } from '@/database/db';
import { bookmarks, companions, sessionHistory } from '@/database/schemas';
// import { createSupabaseClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const createCompanion = async (formData: CreateCompanion) => {
  const { userId: author } = await auth();
  // const supabase = createSupabaseClient();

  if (!author) {
    throw new Error('User not authenticated');
  }

  const [newCompanion] = await db
    .insert(companions)
    .values({
      name: formData.name,
      subject: formData.subject,
      topic: formData.topic,
      style: formData.style,
      voice: formData.voice,
      duration: formData.duration,
      author,
    })
    .returning({
      id: companions.id,
      name: companions.name,
      subject: companions.subject,
      topic: companions.topic,
      style: companions.style,
      voice: companions.voice,
      duration: companions.duration,
    });

  // const { data, error } = await supabase
  //   .from('companions')
  //   .insert({ ...formData, author })
  //   .select();

  // if (error || !data)
  //   throw new Error(error?.message || 'Failed to create a companion');

  return newCompanion;
};

export const getAllCompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  // const supabase = createSupabaseClient();

  // let query = supabase.from('companions').select();

  const companions = await db.query.companions.findMany({
    where(fields, operators) {
      return operators.and(
        operators.or(
          operators.ilike(fields.name, `%${subject || topic || ''}%`),
          operators.ilike(fields.subject, `%${subject || topic || ''}%`),
          operators.ilike(fields.topic, `%${subject || topic || ''}%`)
        )
      );
    },

    orderBy: (fields) => fields.createdAt,
    limit,
    offset: (page - 1) * limit,
  });

  // if (subject && topic) {
  //   query = query
  //     .ilike('subject', `%${subject}%`)
  //     .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  // } else if (subject) {
  //   query = query.ilike('subject', `%${subject}%`);
  // } else if (topic) {
  //   query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  // }

  // query = query.range((page - 1) * limit, page * limit - 1);

  // const { data: companions, error } = await query;

  // if (error) throw new Error(error.message);

  return companions;
};

export const getCompanion = async (id: string) => {
  // const supabase = createSupabaseClient();

  const companion = await db.query.companions.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!companion) return null;

  return companion;

  // const { data, error } = await supabase
  //   .from('companions')
  //   .select()
  //   .eq('id', id);

  // if (error) return console.log(error);

  // return data[0];
};

export const addToSessionHistory = async (companionId: string) => {
  const { userId } = await auth();
  // const supabase = createSupabaseClient();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  await db.insert(sessionHistory).values({
    companionId,
    userId,
  });

  // const { data, error } = await supabase.from('session_history').insert({
  //   companion_id: companionId,
  //   user_id: userId,
  // });

  // if (error) throw new Error(error.message);

  // return data;
};

export const getRecentSessions = async (limit = 10) => {
  const recentCompanions = await db.query.sessionHistory.findMany({
    with: {
      companion: true,
    },
    orderBy: (fields) => fields.createdAt,
    limit,
  });

  // const supabase = createSupabaseClient();
  // const { data, error } = await supabase
  //   .from('session_history')
  //   .select(`companions:companion_id (*)`)
  //   .order('created_at', { ascending: false })
  //   .limit(limit);

  // if (error) throw new Error(error.message);

  // return data.map(({ companions }) => companions);
  return recentCompanions.map((session) => session.companion);
};

export const getUserSessions = async (userId: string, limit = 10) => {
  const currentUserSession = await db.query.sessionHistory.findMany({
    where(fields, operators) {
      return operators.eq(fields.userId, userId);
    },
    with: {
      companion: true,
    },
    orderBy: (fields) => fields.createdAt,
    limit,
  });

  // const supabase = createSupabaseClient();
  // const { data, error } = await supabase
  //   .from('session_history')
  //   .select(`companions:companion_id (*)`)
  //   .eq('user_id', userId)
  //   .order('created_at', { ascending: false })
  //   .limit(limit);

  // if (error) throw new Error(error.message);

  // console.log('Current user session:', currentUserSession);
  // console.log('Supabase data:', data);

  // return data.map(({ companions }) => companions);
  return currentUserSession.map((session) => session.companion);
};

export const getUserCompanions = async (userId: string) => {
  const companions = await db.query.companions.findMany({
    where(fields, operators) {
      return operators.eq(fields.author, userId);
    },
  });

  // const companionsCount = await db.$count(
  //   companions,
  //   eq(companions.author, userId)
  // );

  // const supabase = createSupabaseClient();
  // const { data, error } = await supabase
  //   .from('companions')
  //   .select()
  //   .eq('author', userId);

  // if (error) throw new Error(error.message);

  return companions;
};

export const newCompanionPermissions = async () => {
  const { userId, has } = await auth();
  // const supabase = createSupabaseClient();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  let limit = 0;

  if (has({ plan: 'pro' })) {
    return true;
  } else if (has({ feature: '3_companion_limit' })) {
    limit = 3;
  } else if (has({ feature: '10_companion_limit' })) {
    limit = 10;
  }

  const currentCompanionCount = await db.$count(
    companions,
    eq(companions.author, userId)
  );

  // console.log('Current companion count:', currentCompanionCount);

  // const { data, error } = await supabase
  //   .from('companions')
  //   .select('id', { count: 'exact' })
  //   .eq('author', userId);

  // if (error) throw new Error(error.message);

  // const companionCount = data?.length;
  // console.log('Companion count from Supabase:', companionCount);

  if (currentCompanionCount >= limit) {
    return false;
  } else {
    return true;
  }
};

// Bookmarks
export const addBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;

  await db.transaction(async (tx) => {
    // If no existing bookmark, insert a new one
    await tx.insert(bookmarks).values({
      companionId,
      userId,
    });

    // Update the companion's bookmarked status to true
    await tx
      .update(companions)
      .set({ isBookmarked: true })
      .where(eq(companions.id, companionId));
  });

  revalidatePath(path);

  // const supabase = createSupabaseClient();
  // const { data, error } = await supabase.from('bookmarks').insert({
  //   companion_id: companionId,
  //   user_id: userId,
  // });

  // // find the companion by id to update the bookmarked status true
  // await supabase
  //   .from('companions')
  //   .update({ bookmarked: true })
  //   .eq('id', companionId);
  // if (error) {
  //   throw new Error(error.message);
  // }
  // // Revalidate the path to force a re-render of the page

  // revalidatePath(path);
  // return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;

  await db.transaction(async (tx) => {
    // Delete the bookmark
    await tx.delete(bookmarks).where(eq(bookmarks.companionId, companionId));

    // Update the companion's bookmarked status to false
    await tx
      .update(companions)
      .set({ isBookmarked: false })
      .where(eq(companions.id, companionId));
  });

  // const supabase = createSupabaseClient();
  // const { data, error } = await supabase
  //   .from('bookmarks')
  //   .delete()
  //   .eq('companion_id', companionId)
  //   .eq('user_id', userId);

  // // find the companion by id to update the bookmarked status false
  // await supabase
  //   .from('companions')
  //   .update({ bookmarked: false })
  //   .eq('id', companionId);

  // if (error) {
  //   throw new Error(error.message);
  // }
  revalidatePath(path);
  // return data;
};

// It's almost the same as getUserCompanions, but it's for the bookmarked companions
export const getBookmarkedCompanions = async (userId: string) => {
  const bookmarkedCompanions = await db.query.bookmarks.findMany({
    where(fields, operators) {
      return operators.eq(fields.userId, userId);
    },
    with: {
      companion: true,
    },
  });

  // const supabase = createSupabaseClient();
  // const { data, error } = await supabase
  //   .from('bookmarks')
  //   .select(`companions:companion_id (*)`) // Notice the (*) to get all the companion data
  //   .eq('user_id', userId);
  // if (error) {
  //   throw new Error(error.message);
  // }
  // We don't need the bookmarks data, so we return only the companions
  // return data.map(({ companions }) => companions);
  return bookmarkedCompanions.map((bookmark) => bookmark.companion);
};
