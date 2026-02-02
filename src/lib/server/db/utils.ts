import { DEFAULT_LIMIT } from '$lib/app-utils';
import type { Genre } from '$lib/filters';
import { and, count, desc, eq, inArray, like, or, sql } from 'drizzle-orm';
import { db } from '.';
import { playlistLikes, playlists, type NewPlaylist, type Playlist, users } from './schema';

type GetPlaylistsParams = {
	userId?: string;
	platforms?: string[];
	search?: string;
	genres?: Genre[];
	limit?: number;
	offset?: number;
	sortBy?: 'latest' | 'popular';
};

export type PlaylistWithUsername = Playlist & { username: string | null };

export async function getPlaylists(params: GetPlaylistsParams) {
	const { limit, offset, userId, search, genres, platforms, sortBy } = params;

	// Build search conditions
	let whereConditions = undefined;
	const conditions = [];

	// Add genre filter
	if (genres && genres.length > 0) {
		// Filter playlists that have at least one of the specified genres
		// Using exact JSON array matching - more efficient than LIKE
		const genreConditions = genres.map((genre) =>
			sql.raw(
				`EXISTS (SELECT 1 FROM json_each(genre) WHERE json_each.value = '${genre.replace(/'/g, "''")}')`
			)
		);
		conditions.push(or(...genreConditions));
	}

	// Add platform filter
	if (platforms && platforms.length > 0) {
		const platformConditions = platforms.map(
			(platform) => sql`${playlists.platform} = ${platform}`
		);
		conditions.push(or(...platformConditions));
	}

	// Add search conditions
	if (search) {
		const searchTerm = `%${search}%`;
		const searchConditions = or(
			like(playlists.name, searchTerm),
			like(playlists.description, searchTerm),
			// Search within JSON array for genres
			sql`${playlists.genre} LIKE ${searchTerm}`
		);
		conditions.push(searchConditions);
	}

	if (conditions.length > 0) {
		whereConditions = and(...conditions);
	}

	// Build order by clause based on sortBy parameter
	let orderBy;
	if (sortBy === 'popular') {
		orderBy = [desc(playlists.likes), desc(playlists.createdAt)];
	} else {
		// Default to 'latest' (when sortBy is 'latest')
		orderBy = [desc(playlists.createdAt)];
	}

	const [playlistsRaw, userLikedLikes, [totalLikes]] = await Promise.all([
		db
			.select({ playlist: playlists, username: users.username })
			.from(playlists)
			.leftJoin(users, eq(playlists.userId, users.id))
			.where(whereConditions)
			.orderBy(...orderBy)
			.limit(limit ?? DEFAULT_LIMIT)
			.offset(offset ?? 0),
		userId
			? db
					.select({ playlistId: playlistLikes.playlistId })
					.from(playlistLikes)
					.where(eq(playlistLikes.userId, userId))
			: Promise.resolve([]),
		db.select({ count: count() }).from(playlistLikes)
	]);

	const playlistsData = playlistsRaw.map(({ playlist, username }) => ({ ...playlist, username }));

	const userLikedPlaylistsIds = userLikedLikes.map((like) => like.playlistId);

	return {
		playlists: playlistsData as PlaylistWithUsername[],
		userLikedPlaylistsIds,
		totalLikes: totalLikes.count
	};
}

export async function getUserPlaylists(userId: string) {
	const data = await db
		.select({ playlist: playlists, username: users.username })
		.from(playlists)
		.leftJoin(users, eq(playlists.userId, users.id))
		.where(eq(playlists.userId, userId));
	return data.map(({ playlist, username }) => ({
		...playlist,
		username
	})) as PlaylistWithUsername[];
}

export async function getUserLikedPlaylists(userId: string) {
	const userLikedLikes = await db
		.select({ playlistId: playlistLikes.playlistId })
		.from(playlistLikes)
		.where(eq(playlistLikes.userId, userId));
	return userLikedLikes.map((like) => like.playlistId);
}

export async function getUserLikedPlaylistsData(userId: string) {
	const likedPlaylistIds = await getUserLikedPlaylists(userId);
	if (likedPlaylistIds.length === 0) {
		return [];
	}
	const data = await db
		.select({ playlist: playlists, username: users.username })
		.from(playlists)
		.leftJoin(users, eq(playlists.userId, users.id))
		.where(inArray(playlists.id, likedPlaylistIds));
	return data.map(({ playlist, username }) => ({
		...playlist,
		username
	})) as PlaylistWithUsername[];
}

export async function getUserLikedPlaylistsCount(userId: string) {
	const [result] = await db
		.select({ count: count() })
		.from(playlistLikes)
		.where(eq(playlistLikes.userId, userId));
	return result.count;
}

export async function getUserPlaylistsTotalLikes(userId: string) {
	const userPlaylistsData = await db
		.select({ id: playlists.id })
		.from(playlists)
		.where(eq(playlists.userId, userId));

	if (userPlaylistsData.length === 0) {
		return 0;
	}

	const playlistIds = userPlaylistsData.map((p) => p.id);
	const [result] = await db
		.select({ count: count() })
		.from(playlistLikes)
		.where(inArray(playlistLikes.playlistId, playlistIds));
	return result.count;
}

export async function storePlaylist(playlist: NewPlaylist) {
	await db.insert(playlists).values(playlist);
}

export async function updatePlaylist({ playlist, userId }: { playlist: Playlist; userId: string }) {
	const result = await db
		.update(playlists)
		.set(playlist)
		.where(and(eq(playlists.id, playlist.id), eq(playlists.userId, userId)))
		.returning();
	if (result.length === 0) {
		throw new Error('Playlist not found');
	}
}

export async function deletePlaylist({ id, userId }: { id: number; userId: string }) {
	const result = await db
		.delete(playlists)
		.where(and(eq(playlists.id, id), eq(playlists.userId, userId)))
		.returning();
	if (result.length === 0) {
		throw new Error('Playlist not found');
	}
}

export async function toggleLike({
	playlistId,
	userId
}: {
	playlistId: number;
	userId: string;
}): Promise<'liked' | 'unliked'> {
	const existing = await db
		.select()
		.from(playlistLikes)
		.where(and(eq(playlistLikes.playlistId, playlistId), eq(playlistLikes.userId, userId)));

	if (existing.length > 0) {
		await db
			.delete(playlistLikes)
			.where(and(eq(playlistLikes.playlistId, playlistId), eq(playlistLikes.userId, userId)));
		return 'unliked';
	} else {
		await db.insert(playlistLikes).values({ playlistId, userId });
		return 'liked';
	}
}

export async function checkIsOnboarded(userId: string) {
	const [{ username }] = await db
		.select({ username: users.username })
		.from(users)
		.where(eq(users.id, userId));
	return !!username;
}

export async function updateUser({ userId, username }: { userId: string; username: string }) {
	const result = await db.update(users).set({ username }).where(eq(users.id, userId)).returning();
	if (result.length === 0) {
		throw new Error('User not found');
	}
	return result[0];
}
