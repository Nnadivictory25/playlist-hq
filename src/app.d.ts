import type { Session, User } from 'better-auth';
import type { PlaylistWithUsername } from '$lib/server/db/utils';
import type { Genre, Platform } from '$lib/filters';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session?: Session;
			user?: User & { username?: string | null };
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	type GetPlaylistsResult = {
		playlists: PlaylistWithUsername[];
		userLikedPlaylistsIds: number[];
		totalLikes?: number;
	};

	type GetUserDashboardResult = {
		userPlaylists: PlaylistWithUsername[];
		likedPlaylists: PlaylistWithUsername[];
		userLikedPlaylistsIds: number[];
		uploadedCount: number;
		likedCount: number;
	};

	type PlaylistInfoResult = {
		title: string;
		description: string;
		imageUrl: string;
		songCount: number;
	};

	// YouTube Music API Types
	type YouTubePlaylistItem = {
		id: string;
		snippet: {
			title: string;
			description: string;
			thumbnails: {
				medium: {
					url: string;
				};
			};
		};
		contentDetails: {
			itemCount: number;
		};
	};

	type YouTubePlaylistListResponse = {
		items: YouTubePlaylistItem[];
	};

	type PlaylistUploadFormData = {
		playlistName: string;
		playlistDescription: string;
		playlistUrl: string;
		selectedGenres: Genre[];
		selectedPlatform: Platform | undefined;
	};
}

export {};
