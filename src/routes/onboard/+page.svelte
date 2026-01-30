<script lang="ts">
	import { goto } from '$app/navigation';
	import kittyGif from '$lib/assets/kitty.gif';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { useOnboardMutation } from '$lib/hooks/useOnboardMutation';
	import { ArrowRight } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { fly } from 'svelte/transition';

	const { mutateAsync: onboard, isPending } = useOnboardMutation();

	let username = $state('');

	function handleSkip(e: MouseEvent) {
		e.preventDefault();
		goto('/playlists');
	}

	const isValidUsername = $derived(username.trim().length >= 3 && username.trim().length <= 15);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!isValidUsername) {
			toast.error('Username must be between 3 and 15 characters');
			return;
		}
		try {
			await onboard({ username: username.trim() });
			toast.success(`Welcome, ${username.trim()}! 🎉`);
			goto('/playlists');
		} catch (error) {
			toast.error((error as Error).message);
		}
	}
</script>

<div class="grid-bg fixed inset-0 -z-20"></div>
<section class="relative flex h-[95vh] md:h-[90vh] flex-col items-center justify-center">
	<Card.Root class="shadow-none">
		<div in:fly={{ x: -50, duration: 500 }}>
			<h1 class="text-center text-xl font-semibold">🫷 One more thing... 🫸</h1>
			<p class="mx-auto px-3 text-center text-sm text-muted-foreground md:max-w-[45%]">
				Let people know the amazing person behind those fire playlists you are about to share.
			</p>
		</div>
		<Card.Content class="grid gap-4 md:grid-cols-2">
			<div class="col-span-1 flex flex-col items-center justify-center">
				<img
					src={kittyGif}
					alt="Kitty"
					class="h-full w-full object-cover"
					in:fly={{ y: 100, duration: 600, delay: 300 }}
				/>
			</div>

			<form
				class="col-span-1 flex flex-col items-stretch justify-center gap-2"
				in:fly={{ x: 20, duration: 700, delay: 400 }}
				onsubmit={handleSubmit}
			>
				<div class="mb-2 flex justify-end">
					<button
						type="button"
						class="rounded border border-border bg-background px-3 py-1 text-sm transition-all hover:bg-muted"
						onclick={handleSkip}
					>
						Skip for now
					</button>
				</div>
				<Label for="username" class="text-left">Username</Label>
				<Input
					id="username"
					type="text"
					name="username"
					placeholder="Enter your username"
					bind:value={username}
					disabled={isPending}
				/>
				<Button type="submit" class="w-full" disabled={isPending || !username.trim()}>
					{#if isPending}
						<Spinner size="sm" /> Updating...
					{:else}
						Continue <ArrowRight size={16} />
					{/if}
				</Button>
				<p class="mx-auto text-center text-xs text-muted-foreground md:w-[65%]">
					By continuing, you agree to <span class="font-medium text-primary"
						>upload your best playlists</span
					> to the platform 🫵
				</p>
			</form>
		</Card.Content>
	</Card.Root>
</section>
