import type { RequestHandler } from './$types';
import { getQueryParams } from '$lib/app-utils';
import { getPlaylists } from '$lib/server/db/utils';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const params = getQueryParams(url);
		const { limit, offset, search, sortBy, genres, platforms } = params;
		const userId = locals.user?.id;

		const data = await getPlaylists({
			userId,
			search,
			sortBy,
			platforms: platforms && platforms.length > 0 ? platforms : undefined,
			genres: genres && genres.length > 0 ? genres : undefined,
			limit,
			offset
		});

		return json({ success: true, data });
	} catch (error) {
		console.error('API Error:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
};
