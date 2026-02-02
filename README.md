# PlaylistHQ - Share and discover music playlists by others 🎵

PlaylistHQ is a platform to discover music playlists by others and also share yours !
Built this for my fellow music lovers who might be interested in discovering what others are listening across platforms (Apple Music, Spotify and YouTube Music)

🌐 **Live Site:** [playlisthq.online](https://playlisthq.online)

**Platforms Supported**

- ✅ YouTube Music
- ✅ Spotify
- ✅ Apple Music
- ❌ SoundCloud (not yet, soon)

**🛠️ Tech Stack**

- Sveltekit
- SQLite Database + Drizzle ORM
- Better-auth for auth
- Tanstack Query
- Nuqs for URL state management
- ShadCN UI + TailwindCSS

✨ **Nice Features**

- Search or filter by **genres** and **platform**
- Sort by **latest** or most **popular**
- Like your favorite playlist
- Personal dashboard to manage your uploaded and liked playlists
- Automatic playlist metadata extraction (title, description, cover art) from platform URLs
- Support for **29 different genres** including Afrobeat, Hip-Hop, Rock, Pop, Jazz, Electronic and more!

👨‍💻 **Some Technical Features**

- Optimistic likes on the UI using Tanstack Mutation query, so liking a playlist is instant on the UI and in the case an error occurs all updates are rolled back with some nice toast messages !
- Complete auth protection for user specific API routes, user session is checked and if unauthorized then action won't be done. Must be logged in to upload or like a playlist.
- Also composability in the code, good SOC practices and keeping the UI logic separate from the business logic
- URL state management with Nuqs for shareable filter/search states
- Server-side rendering with SvelteKit for fast initial loads
- Google OAuth authentication for easy sign-in experience

📸 **PREVIEWS**

## Homepage

![Homepage](demo-imgs/playlist-hq-homepage.png)

## Playlists View

![Playlists View](demo-imgs/playlists-view.png)

## Upload Playlist

![Upload Playlist](demo-imgs/upload-playlist.png)

## Filter Options

![Filter Options](demo-imgs/filter.jpg)

## Active Filters

![Active Filters](demo-imgs/filters-active.png)

🎵 **Supported Genres**

Afrobeat, Alternative, Ambient, Blues, Classical, Country, Dance, Electronic, Folk, Funk, Gospel, Hip-Hop, House, Indie, Jazz, Latin, Metal, Pop, Punk, R&B, Rap, Reggae, Rock, Soul, Techno, Trap, World
