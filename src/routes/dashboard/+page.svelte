<script lang="ts">
	import PlaylistCard from '@/lib/components/playlist-card.svelte';
	import { useUserDashboard } from '@/lib/hooks/useUserDashboard';
	import type { PageProps } from './$types';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import UploadPlaylist from '@/lib/components/upload-playlist.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { parseAsString } from 'nuqs-svelte';
	import { useQueryState } from 'nuqs-svelte';
	import ProfileMenu from '$lib/components/profile-menu.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const { dashboardResult, user } = data;

	const activeTab = useQueryState('tab', parseAsString.withDefault('uploaded'));

	const dashboardQuery = useUserDashboard({
		initialData: dashboardResult,
		user
	});

	const playlists = $derived(
		activeTab.current === 'uploaded'
			? (dashboardQuery.data?.userPlaylists ?? [])
			: (dashboardQuery.data?.likedPlaylists ?? [])
	);

	const emptyMessage = $derived(
		activeTab.current === 'uploaded' ? 'No playlists uploaded yet' : 'No liked playlists yet'
	);
</script>

<svelte:head>
	<title>Dashboard - PlaylistHQ</title>
</svelte:head>

<section class="pt-20">
	<div class="flex flex-wrap items-center justify-between gap-5">
		<div>
			<h1 class="text-2xl font-bold">Dashboard</h1>
			<p class="text-sm text-gray-500">View your uploaded playlists.</p>
		</div>
		<div class="md:hidden">
			<ProfileMenu {user} />
		</div>

		<div class="flex items-center gap-2">
			<UploadPlaylist />
			<div class="hidden md:block">
				<ProfileMenu {user} />
			</div>
		</div>
	</div>

	<Tabs.Root bind:value={activeTab.current}>
		<Tabs.List class="mt-8 bg-primary/5">
			<Tabs.Trigger
				value="uploaded"
				class="data-[state=active]:bg-primary data-[state=active]:text-white"
			>
				My Playlists
				<span
					class={activeTab.current === 'uploaded'
						? 'text-sm text-gray-200'
						: 'text-sm text-gray-700'}
				>
					({dashboardQuery.data?.uploadedCount ?? 0})
				</span>
			</Tabs.Trigger>
			<Tabs.Trigger
				value="liked"
				class="data-[state=active]:bg-primary data-[state=active]:text-white"
			>
				Liked
				<span
					class={activeTab.current === 'liked' ? 'text-sm text-gray-200' : 'text-sm text-gray-700'}
				>
					({dashboardQuery.data?.likedCount ?? 0})
				</span>
			</Tabs.Trigger>
		</Tabs.List>

		{#each ['uploaded', 'liked'] as tabValue}
			<Tabs.Content value={tabValue} class="mt-8">
				<div class="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
					{#if dashboardQuery.isLoading}
						{#each Array.from({ length: 5 }) as _, index (index)}
							<Skeleton class="h-[360px] w-full bg-slate-300" />
						{/each}
					{:else if dashboardQuery.error}
						<p>Something went wrong: {dashboardQuery.error.message}</p>
					{:else if playlists.length > 0}
						{@const { userLikedPlaylistsIds } = dashboardQuery.data!}
						{#each playlists as playlist, index (index)}
							{@const isLiked = userLikedPlaylistsIds.includes(playlist.id)}
							<PlaylistCard {playlist} userId={user?.id ?? ''} {isLiked} />
						{/each}
					{:else}
						<p>{emptyMessage}</p>
					{/if}
				</div>
			</Tabs.Content>
		{/each}
	</Tabs.Root>
</section>
