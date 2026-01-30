<script lang="ts">
	import { playlistsQueryParser } from '$lib/app-utils';
	import SearchFilter from '$lib/components/search-filter.svelte';
	import PlaylistCard from '@/lib/components/playlist-card.svelte';
	import { usePlaylists } from '@/lib/hooks/usePlaylists';
	import { useQueryStates } from 'nuqs-svelte';
	import type { PageProps } from './$types';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const { playlistsResult, user } = data;

	let queryParams = useQueryStates(playlistsQueryParser, {
		shallow: false,
		clearOnDefault: true
	});

	const playlistsQuery = usePlaylists({
		initialData: playlistsResult,
		user,
		queryParams: () => ({
			limit: queryParams.limit.current,
			offset: queryParams.offset.current,
			search: queryParams.search.current,
			genres: queryParams.genres.current,
			platforms: queryParams.platforms.current,
			sortBy: queryParams.sortBy.current as 'latest' | 'popular'
		})
	});
</script>

<svelte:head>
	<title>Playlists - PlaylistHQ</title>
</svelte:head>

<section class="pt-20">
	<h1 class="text-2xl font-bold">Playlists</h1>
	<p class="text-sm text-gray-500">Discover and share your favorite playlists.</p>

	<SearchFilter query={queryParams} />

	<div class="mt-15 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
		{#if playlistsQuery.isLoading}
			{#each Array.from({ length: 5 }) as _, index (index)}
				<Skeleton class="h-[360px] w-full bg-slate-300" />
			{/each}
		{:else if playlistsQuery.error}
			<p>Something went wrong: {playlistsQuery.error.message}</p>
		{:else if playlistsQuery.data?.playlists.length && playlistsQuery.data.playlists.length > 0}
			{@const { userLikedPlaylistsIds, playlists } = playlistsQuery.data}
			{#each playlists as playlist, index (index)}
				{@const isLiked = userLikedPlaylistsIds.includes(playlist.id)}
				<PlaylistCard {playlist} userId={user?.id ?? ''} {isLiked} />
			{/each}
		{:else}
			<p>No playlists found {queryParams.search.current ? 'for your search' : ''}</p>
		{/if}
	</div>
</section>
