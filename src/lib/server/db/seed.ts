import { Database } from 'bun:sqlite';
const db = new Database(process.env.DATABASE_URL);

// Only run seeding if this file is executed directly
// @ts-ignore
if (process.argv[1] === import.meta.path || process.argv[1] === new URL(import.meta.url).pathname) {
	// Clean up existing data
	db.run('DELETE FROM playlists');
	db.run('DELETE FROM playlist_likes');

	// Insert dummy playlists
	const playlists = [
		{
			name: 'Afrobeat Vibes',
			description:
				'Groovy rhythms from West Africa. A curated collection of Afrobeat classics and contemporary hits.',
			song_count: 25,
			image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
			platform: 'spotify',
			genre: JSON.stringify(['Afrobeat', 'World']),
			url: 'https://spotify.com/playlist/1',
			user_id: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs'
		},
		{
			name: 'Rock Classics',
			description:
				'Timeless rock hits from the golden age. Perfect for road trips and rocking out.',
			song_count: 30,
			image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
			platform: 'youtube music',
			genre: JSON.stringify(['Rock']),
			url: 'https://youtube.com/playlist/2',
			user_id: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs'
		},
		{
			name: 'Jazz Lounge',
			description:
				'Smooth jazz for relaxing. Perfect ambiance for intimate dinners and late-night reading.',
			song_count: 20,
			image_url: 'https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?w=400',
			platform: 'apple music',
			genre: JSON.stringify(['Jazz']),
			url: 'https://music.apple.com/playlist/3',
			user_id: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs'
		},
		{
			name: 'Pop Hits 2023',
			description:
				'Top pop songs of the year. Chart-topping hits and viral sensations from the biggest artists.',
			song_count: 40,
			image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
			platform: 'spotify',
			genre: JSON.stringify(['Pop', 'Dance']),
			url: 'https://spotify.com/playlist/4',
			user_id: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs'
		},
		{
			name: 'Hip-Hop Essentials',
			description: 'Must-hear hip-hop tracks. From golden age pioneers to modern innovators.',
			song_count: 35,
			image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
			platform: 'youtube music',
			genre: JSON.stringify(['Hip-Hop', 'Rap']),
			url: 'https://youtube.com/playlist/5',
			user_id: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs'
		},
		{
			name: 'Country Roads',
			description:
				'Feel-good country tunes. Classic storytelling ballads and modern country-pop crossovers.',
			song_count: 28,
			image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
			platform: 'apple music',
			genre: JSON.stringify(['Country', 'Folk']),
			url: 'https://music.apple.com/playlist/6',
			user_id: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs'
		},
		{
			name: 'Electronic Beats',
			description: 'High-energy electronic music. From deep house grooves to techno bangers.',
			song_count: 22,
			image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
			platform: 'spotify',
			genre: JSON.stringify(['Electronic', 'Techno']),
			url: 'https://spotify.com/playlist/7',
			user_id: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs'
		},
		{
			name: 'Blues Legends',
			description:
				'Classic blues guitar. From Delta blues origins to Chicago electric blues masters.',
			song_count: 18,
			image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
			platform: 'youtube music',
			genre: JSON.stringify(['Blues', 'Rock']),
			url: 'https://youtube.com/playlist/8',
			user_id: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs'
		},
		{
			name: 'Reggae Rhythms',
			description: 'Island vibes and chill beats. Smooth basslines and positive reggae vibes.',
			song_count: 32,
			image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
			platform: 'apple music',
			genre: JSON.stringify(['Reggae', 'World']),
			url: 'https://music.apple.com/playlist/9',
			user_id: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs'
		},
		{
			name: 'Indie Discoveries',
			description: 'Fresh indie artists. Discover emerging talents and established indie darlings.',
			song_count: 27,
			image_url: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400',
			platform: 'spotify',
			genre: JSON.stringify(['Indie', 'Alternative']),
			url: 'https://spotify.com/playlist/10',
			user_id: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs'
		}
	];

	const playlistIds: number[] = [];
	for (const playlist of playlists) {
		const result = db.run(
			`INSERT INTO playlists (name, description, song_count, image_url, platform, genre, url, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch('subsecond') * 1000, unixepoch('subsecond') * 1000)`,
			[
				playlist.name,
				playlist.description,
				playlist.song_count,
				playlist.image_url,
				playlist.platform,
				playlist.genre,
				playlist.url,
				playlist.user_id
			]
		).lastInsertRowid;
		playlistIds.push(Number(result));
	}

	// Insert dummy likes (e.g., user likes some playlists)
	const likes = [
		{ playlistId: playlistIds[0], userId: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs' },
		{ playlistId: playlistIds[1], userId: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs' },
		{ playlistId: playlistIds[3], userId: 'pzWcOBdUPKoXHC4kXhWT03SPUZMh5Ygs' }
	];

	for (const like of likes) {
		db.run(
			`INSERT INTO playlist_likes (playlist_id, user_id, created_at, updated_at) VALUES (?, ?, unixepoch('subsecond') * 1000, unixepoch('subsecond') * 1000)`,
			[like.playlistId, like.userId]
		);
	}

	console.log('Seeded playlists ✅');
}
