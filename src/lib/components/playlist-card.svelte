<script lang="ts">
	import { page } from '$app/state';
	import { formatTime, getQueryParams, platformImages } from '$lib/app-utils';
	import Action from '$lib/components/action.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { Platform } from '$lib/filters';
	import { useMutateLike } from '$lib/hooks/useMutateLike';
	import type { PlaylistWithUsername } from '$lib/server/db/utils';
	import { ArrowUpRightIcon, Clock, Music } from '@lucide/svelte';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { fade, fly } from 'svelte/transition';
	import Badge from './ui/badge/badge.svelte';
	import { cn } from '../utils';
	import Button from './ui/button/button.svelte';

	const MAX_GENRES = 4;

	type PlaylistCardProps = {
		playlist: PlaylistWithUsername;
		userId: string;
		isLiked: boolean;
	};

	let { playlist, userId, isLiked }: PlaylistCardProps = $props();

	const queryClient = useQueryClient();

	const { mutate: toggleLike } = useMutateLike({
		// svelte-ignore state_referenced_locally
		userId,
		queryClient
	});

	let isAnimating = $state(false);

	let descriptionEl: HTMLParagraphElement | undefined = $state();

	let isClamped = $derived(
		descriptionEl ? descriptionEl.scrollHeight > descriptionEl.clientHeight : false
	);
	let isDescriptionExpanded = $state(false);
	let isGenresExpanded = $state(false);

	function toggleDescriptionExpanded() {
		isDescriptionExpanded = !isDescriptionExpanded;
	}

	function toggleGenresExpanded() {
		isGenresExpanded = !isGenresExpanded;
	}

	const handleLike = () => {
		if (!userId) {
			toast.error('You must be logged in to like a playlist');
			return;
		}
		isAnimating = true;
		toggleLike(playlist.id);
		setTimeout(() => (isAnimating = false), 600);
	};
</script>

<div transition:fade={{ duration: 100 }}>
	<Card.Root class="group relative h-full overflow-hidden p-0 shadow-none!">
		<Action {playlist} />
		<div class="relative flex h-full flex-col px-0">
			<img
				src={platformImages[playlist.platform as Platform]}
				alt={playlist.platform}
				class="absolute top-2 left-2 z-10 size-8 rounded-full bg-white p-1 shadow-md"
				loading="lazy"
			/>
			<div class="group/image relative h-[190px] overflow-hidden">
				<img
					src={playlist.imageUrl}
					alt={playlist.name}
					class="h-full w-full object-cover transition-all duration-300 group-hover/image:scale-105"
					loading="lazy"
				/>
				<div class="absolute inset-0 bg-black/15"></div>
			</div>
			<div class="flex flex-1 flex-col justify-between p-3">
				<div>
					<p class="text-base font-medium">{playlist.name}</p>
					<div class="relative">
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<p
							title={playlist.description}
							bind:this={descriptionEl}
							onclick={toggleDescriptionExpanded}
							class={cn(
								'line-clamp-2 text-sm text-gray-700',
								isDescriptionExpanded && 'line-clamp-none'
							)}
						>
							{playlist.description ?? ''}
						</p>
					</div>
					<div class="mt-5 flex flex-wrap gap-2">
						{#each playlist.genre.slice(0, isGenresExpanded ? playlist.genre.length : MAX_GENRES) as genre, i (genre)}
							<div in:fly={{ y: -10, delay: i * 20 }}>
								<Badge variant="outline" class="border-none bg-primary/10 text-xs text-primary">
									#{genre}
								</Badge>
							</div>
						{/each}
						{#if playlist.genre.length > MAX_GENRES}
							<Badge
								variant="outline"
								class="w-fit cursor-pointer border! border-primary bg-primary/10 text-xs text-primary hover:bg-primary/20"
								onclick={toggleGenresExpanded}
							>
								{isGenresExpanded ? 'Show less' : `+${playlist.genre.length - MAX_GENRES}`}
							</Badge>
						{/if}
					</div>
				</div>

				<div class="mt-auto pt-5">
					<!-- Middle Row -->
					<div class="flex justify-between p-0">
						<div
							class="flex items-center gap-1 rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary"
						>
							<Music size={16} />
							<p class="font-medium">{playlist.songCount} songs</p>
						</div>

						<div class="flex items-center gap-[2px] text-xs">
							{#if playlist.username}
								<span class="font-medium text-gray-600">@{playlist.username}</span>
								<span class="text-gray-400">•</span>
							{/if}
							<span class="text-gray-500">{formatTime(new Date(playlist.createdAt))}</span>
						</div>
					</div>

					<!-- Bottom Row -->
					<div class="mt-3 grid grid-cols-2 gap-2">
						<div class="flex items-center gap-1 text-xs">
							<button
								aria-label="Like playlist"
								title={isLiked ? 'Unlike playlist' : 'Like playlist'}
								class="group cursor-pointer rounded-sm bg-primary/5 px-2 py-1"
								onclick={handleLike}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill={isLiked ? 'currentColor' : 'none'}
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class={`text-red-500 transition-all duration-150 hover:scale-110 hover:text-red-600 active:scale-75 ${isAnimating ? 'animate-heart-pop' : ''}`}
								>
									<path
										d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
									/>
								</svg>
							</button>
							<p>{playlist.likes} likes</p>
						</div>

						<a
							href={playlist.url}
							target="_blank"
							rel="noopener noreferrer"
							class="group/link flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-primary px-2 py-1 text-xs font-medium text-primary transition-all duration-150 hover:bg-primary hover:text-primary-foreground"
						>
							View Playlist
							<ArrowUpRightIcon
								size={14}
								strokeWidth={2.5}
								class="group-hover/link:text-primary-foreground"
							/>
						</a>
					</div>
				</div>
			</div>
		</div>
	</Card.Root>
</div>
