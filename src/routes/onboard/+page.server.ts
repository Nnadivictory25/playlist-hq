import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { checkIsOnboarded } from '$lib/server/db/utils';

export const load = (async ({ locals }) => {
    const { user } = locals;

    if (!user) {
        throw redirect(302, '/sign-in');
    }

    const isOnboarded = await checkIsOnboarded(user.id);

    if (isOnboarded) {
        throw redirect(302, '/playlists');
    }

    return { isOnboarded };
}) satisfies PageServerLoad;