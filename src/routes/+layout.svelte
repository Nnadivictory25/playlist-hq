<script lang="ts">
	import './layout.css';
	import logo from '$lib/assets/playlist-hq-logo.png';
	import { NuqsAdapter } from 'nuqs-svelte/adapters/svelte-kit';
	import '@fontsource-variable/rubik';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import Navbar from '$lib/components/navbar.svelte';
	import type { LayoutProps } from './$types';
	import { browser } from '$app/environment';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});

	let { data, children }: LayoutProps = $props();
	const title = 'PlaylistHQ - Discover and share your favorite playlists';
	const description =
		'Explore new music, get inspired by others, and add your own playlists to the community.';
</script>

<svelte:head>
	<link rel="icon" href={logo} />
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="https://playlisthq.online/og.png" />
	<link rel="canonical" href="https://playlisthq.online" />
	<meta property="og:image" content="https://playlisthq.online/og.png" />
	<meta property="og:url" content="https://playlisthq.online" />
	<meta name="twitter:image" content="https://playlisthq.online/og.png" />
	<link rel="canonical" href="https://playlisthq.online" />

	<script type="text/javascript">
		(function (c, l, a, r, i, t, y) {
			c[a] =
				c[a] ||
				function () {
					(c[a].q = c[a].q || []).push(arguments);
				};
			t = l.createElement(r);
			t.async = 1;
			t.src = 'https://www.clarity.ms/tag/' + i;
			y = l.getElementsByTagName(r)[0];
			y.parentNode.insertBefore(t, y);
		})(window, document, 'clarity', 'script', 'utmccmsjwo');
	</script>
</svelte:head>

<Toaster />
<main class="mx-auto max-w-7xl px-7 pt-10 pb-10">
	<Navbar isSignedIn={data.isSignedIn} />
	<NuqsAdapter>
		<QueryClientProvider client={queryClient}>
			{@render children()}
		</QueryClientProvider>
	</NuqsAdapter>
</main>
