import { parseAsInteger, parseAsString, createParser } from 'nuqs-svelte';
import { z } from 'zod';
import {
	genres,
	type Genre,
	platforms,
	type Platform,
	isValidPlatform,
	isValidGenre,
	urlToPlatform,
	platformToUrl
} from './filters';

export const platformImages: Record<Platform, string> = {
	spotify: '/icons8-spotify-48.png',
	'youtube music': '/icons8-youtube-music-48.png',
	'apple music': '/icons8-apple-music-48.png'
};

export function getQueryParams(url: URL): PlaylistsQueryParams {
	const rawParams: Record<string, string | string[] | undefined> = {};

	// Collect all query params
	for (const [key, value] of url.searchParams.entries()) {
		if (rawParams[key]) {
			// Handle multiple values for the same key
			const existing = rawParams[key];
			rawParams[key] = Array.isArray(existing) ? [...existing, value] : [existing as string, value];
		} else {
			rawParams[key] = value;
		}
	}

	// Parse and validate with Zod
	const result = playlistsQuerySchema.safeParse(rawParams);

	if (result.success) {
		return result.data;
	}

	// If validation fails, return defaults
	return playlistsQuerySchema.parse({});
}

export function objectToQueryParams(obj: Record<string, any>) {
	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(obj)) {
		if (value === undefined || value === null || value === '') continue;

		// Handle arrays
		if (Array.isArray(value)) {
			// Convert Platform values to URL-safe values
			const arrayValue = value
				.map((v) =>
					key === 'platforms' && typeof v === 'string' && isValidPlatform(v)
						? platformToUrl(v as Platform)
						: v
				)
				.join(',');
			if (arrayValue) {
				params.append(key, arrayValue);
			}
		} else {
			// Handle numbers, strings, etc.
			params.append(key, value.toString());
		}
	}

	return params.toString();
}

export function formatTime(date: Date): string {
	const now = new Date();
	const diffInMs = now.getTime() - date.getTime();
	const diffInSeconds = Math.floor(diffInMs / 1000);

	const intervals = [
		{ label: 'month', seconds: 2592000 }, // 30 days
		{ label: 'day', seconds: 86400 },
		{ label: 'hr', seconds: 3600 },
		{ label: 'min', seconds: 60 }
	];

	if (diffInSeconds < 60) {
		return 'just now';
	}

	for (const interval of intervals) {
		const count = Math.floor(diffInSeconds / interval.seconds);
		if (count >= 1) {
			return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
		}
	}

	return 'just now';
}

export const DEFAULT_LIMIT = 50;

// Zod schema for query parameters - using exported arrays from filters.ts
const genreEnum = z.enum(genres as [Genre, ...Genre[]]);
const platformEnum = z.enum(platforms as [Platform, ...Platform[]]);

export const playlistsQuerySchema = z.object({
	search: z.string().optional(),
	limit: z.coerce.number().int().positive().default(DEFAULT_LIMIT),
	offset: z.coerce.number().int().nonnegative().default(0),
	sortBy: z.enum(['latest', 'popular']).optional().default('popular'),
	genres: z
		.union([z.string(), z.array(genreEnum)])
		.transform((val) => {
			if (typeof val === 'string') {
				return val
					.split(',')
					.map((g) => g.trim())
					.filter((g) => isValidGenre(g))
					.map((g) => g as Genre);
			}
			return val;
		})
		.optional()
		.default([]),
	platforms: z
		.union([z.string(), z.array(platformEnum)])
		.transform((val) => {
			if (typeof val === 'string') {
				return val
					.split(',')
					.map((p) => p.trim())
					.map((p) => urlToPlatform(p)) // Convert URL-safe to Platform
					.filter((p): p is Platform => p !== null);
			}
			return val;
		})
		.optional()
		.default([]),
	userId: z.string().optional()
});

export type PlaylistsQueryParams = z.infer<typeof playlistsQuerySchema>;

/**
 * Creates a debounced version of a function that delays invoking the function
 * until after `delay` milliseconds have elapsed since the last time the
 * debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;

	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
}

// Custom parser for genres array
export const parseAsGenresArray = createParser({
	parse(query: string | string[] | undefined): Genre[] {
		if (!query) return [];

		// Handle both single string and array inputs
		const genreStrings = Array.isArray(query) ? query : [query];

		// Validate and filter to only valid genres
		return genreStrings
			.flatMap((g) => g.split(',')) // Handle comma-separated strings
			.map((g) => g.trim())
			.filter((g) => isValidGenre(g))
			.map((g) => g as Genre);
	},

	serialize(value: Genre[]): string {
		return (value.length === 0 ? null : value.join(',')) as string;
	}
})
	.withDefault([])
	.withOptions({ history: 'push', clearOnDefault: true });

export const parseAsPlatformsArray = createParser({
	parse(query: string | string[] | undefined): Platform[] {
		if (!query) return [];

		// Handle both single string and array inputs
		const platformStrings = Array.isArray(query) ? query : [query];

		// Convert URL-safe values to Platform values
		return platformStrings
			.flatMap((p) => p.split(',')) // Handle comma-separated strings
			.map((p) => p.trim())
			.map((p) => urlToPlatform(p)) // Convert URL-safe to Platform
			.filter((p): p is Platform => p !== null);
	},

	serialize(value: Platform[]): string {
		return (value.length === 0 ? null : value.map((p) => platformToUrl(p)).join(',')) as string;
	}
})
	.withDefault([])
	.withOptions({ history: 'push', clearOnDefault: true });

export const playlistsQueryParser = {
	search: parseAsString.withDefault(''),
	limit: parseAsInteger.withDefault(DEFAULT_LIMIT),
	offset: parseAsInteger.withDefault(0),
	sortBy: parseAsString.withDefault('popular'),
	genres: parseAsGenresArray,
	platforms: parseAsPlatformsArray
};

export function capitalize(str: string) {
	return str
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

export function getPlaylistIdFromUrl({ url, platform }: { url: string; platform: Platform }) {
	switch (platform) {
		case 'spotify':
			return url.split('/').pop();
		case 'youtube music':
			return new URL(url).searchParams.get('list');
		case 'apple music':
			return url.split('/').pop();
	}
}

/**
 * Validates a username according to platform rules
 * @param username - The username to validate
 * @returns Object with isValid flag and optional error message
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
	const trimmed = username.trim();

	if (!trimmed) {
		return { isValid: false, error: 'Username cannot be empty' };
	}

	if (trimmed.length < 3) {
		return { isValid: false, error: 'Username must be at least 3 characters' };
	}

	if (trimmed.length > 15) {
		return { isValid: false, error: 'Username must be at most 15 characters' };
	}

	// Check for valid characters (alphanumeric, underscore, hyphen)
	if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
		return {
			isValid: false,
			error: 'Username can only contain letters, numbers, underscores, and hyphens'
		};
	}

	return { isValid: true };
}

/**
 * Extracts username from user object, returning a formatted string or null
 * @param user - User object that may contain username
 * @returns Formatted username with @ prefix, or null if not set
 */
export function formatUsername(user: { username?: string | null }): string | null {
	if (!user.username) {
		return null;
	}
	return `@${user.username}`;
}
