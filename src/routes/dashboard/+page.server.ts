import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getUserPlaylists,
	getUserLikedPlaylists,
	getUserLikedPlaylistsCount,
	getUserLikedPlaylistsData
} from '$lib/server/db/utils';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = (async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		redirect(302, '/sign-in');
	}

	// Fetch all data concurrently including username
	const [[userData], userPlaylists, userLikedPlaylistsIds, likedPlaylistsData, likedCount] =
		await Promise.all([
			db.select({ username: users.username }).from(users).where(eq(users.id, user.id)),
			getUserPlaylists(user.id),
			getUserLikedPlaylists(user.id),
			getUserLikedPlaylistsData(user.id),
			getUserLikedPlaylistsCount(user.id)
		]);

	const userWithUsername = {
		...user,
		username: userData?.username || undefined
	};

	const uploadedCount = userPlaylists.length;

	return {
		dashboardResult: {
			userPlaylists,
			likedPlaylists: likedPlaylistsData,
			userLikedPlaylistsIds,
			uploadedCount,
			likedCount
		},
		user: userWithUsername
	};
}) satisfies PageServerLoad;
