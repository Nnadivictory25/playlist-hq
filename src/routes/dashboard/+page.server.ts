import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getUserPlaylists,
	getUserLikedPlaylists,
	getUserLikedPlaylistsCount,
	getUserLikedPlaylistsData
} from '$lib/server/db/utils';

export const load = (async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		redirect(302, '/sign-in');
	}

	// Fetch all data concurrently - username is now included in session automatically!
	const [userPlaylists, userLikedPlaylistsIds, likedPlaylistsData, likedCount] = await Promise.all([
		getUserPlaylists(user.id),
		getUserLikedPlaylists(user.id),
		getUserLikedPlaylistsData(user.id),
		getUserLikedPlaylistsCount(user.id)
	]);

	const uploadedCount = userPlaylists.length;

	return {
		dashboardResult: {
			userPlaylists,
			likedPlaylists: likedPlaylistsData,
			userLikedPlaylistsIds,
			uploadedCount,
			likedCount
		},
		user
	};
}) satisfies PageServerLoad;
