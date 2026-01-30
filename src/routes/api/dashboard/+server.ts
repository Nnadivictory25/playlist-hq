import type { RequestHandler } from './$types';
import {
	getUserPlaylists,
	getUserLikedPlaylists,
	getUserLikedPlaylistsCount,
	getUserLikedPlaylistsData
} from '$lib/server/db/utils';
import { json } from '@sveltejs/kit';
import { unauthorized } from '$lib/server/api-helpers';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = locals.user;
		if (!user) {
			return unauthorized();
		}

		const [userPlaylists, userLikedPlaylistsIds, likedPlaylistsData, likedCount] =
			await Promise.all([
				getUserPlaylists(user.id),
				getUserLikedPlaylists(user.id),
				getUserLikedPlaylistsData(user.id),
				getUserLikedPlaylistsCount(user.id)
			]);

		const uploadedCount = userPlaylists.length;

		return json({
			success: true,
			data: {
				userPlaylists,
				likedPlaylists: likedPlaylistsData,
				userLikedPlaylistsIds,
				uploadedCount,
				likedCount
			}
		});
	} catch (error) {
		console.error('API Error:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
};
