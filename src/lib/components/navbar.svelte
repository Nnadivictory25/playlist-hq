<script lang="ts">
	import logo from '$lib/assets/playlist-hq-logo.png';
	import { Music } from '@lucide/svelte';
	let { isSignedIn }: { isSignedIn: boolean } = $props();
</script>

<nav
	class="fixed top-10 left-1/2 z-50 mx-auto flex w-[90%] max-w-[550px] -translate-x-1/2 items-center justify-between rounded-full border border-gray-300/30 bg-white/30 px-8 py-3 backdrop-blur-lg"
>
	<a href="/" class="flex items-center gap-1" aria-label="PlaylistHQ Home" title="PlaylistHQ Home">
		<div
			class="flex size-9 items-center justify-center rounded-md bg-primary text-white"
			role="img"
			aria-label="PlaylistHQ logo"
		>
			<Music size={25} aria-hidden="true" focusable="false" />
		</div>
		<span class="hidden text-lg font-medium lg:block">PlaylistHQ</span>
	</a>
	<ul class="z-20 flex items-center gap-4 text-sm font-medium">
		<li><a href="/playlists" class="hover:underline">Playlists</a></li>
		{#if isSignedIn}
			<li><a href="/dashboard" class="primary rounded-full">Dashboard</a></li>
		{:else}
			<li><a href="/sign-in" class="primary w-full rounded-full px-4!">Sign In</a></li>
		{/if}
	</ul>
</nav>

<style>
	@import 'tailwindcss/theme';

	a {
		@apply transition-all duration-100 hover:opacity-80;
	}
</style>
