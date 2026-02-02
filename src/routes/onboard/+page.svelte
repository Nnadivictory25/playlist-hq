<script lang="ts">
	import { goto } from '$app/navigation';
	import kittyGif from '$lib/assets/kitty.gif';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { useOnboardMutation } from '$lib/hooks/useOnboardMutation';
	import { useUsernameAvailability } from '$lib/hooks/useUsernameAvailability';
	import { ArrowRight, Check, X } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { fly } from 'svelte/transition';

	const { mutateAsync: onboard, isPending } = useOnboardMutation();

	let username = $state('');
	let debouncedUsername = $state('');
	let debounceTimeout: ReturnType<typeof setTimeout>;

	const usernameQuery = useUsernameAvailability(() => debouncedUsername);

	const isValidLength = $derived(username.trim().length >= 3 && username.trim().length <= 15);
	const status = $derived(
		!isValidLength
			? 'idle'
			: usernameQuery.isLoading
				? 'checking'
				: usernameQuery.data?.available
					? 'available'
					: 'taken'
	);
	const canSubmit = $derived(isValidLength && status === 'available');

	function handleInput() {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			debouncedUsername = username;
		}, 300);
	}

	function handleSkip(e: MouseEvent) {
		e.preventDefault();
		goto('/playlists');
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!canSubmit) {
			if (status === 'taken') toast.error('Username is already taken');
			else toast.error('Username must be between 3 and 15 characters');
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
<section class="relative flex h-[95vh] flex-col items-center justify-center md:h-[90vh]">
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
				<div class="relative">
					<Input
						id="username"
						type="text"
						name="username"
						placeholder="Enter your username"
						bind:value={username}
						oninput={handleInput}
						disabled={isPending}
						class={status === 'taken'
							? 'border-red-500'
							: status === 'available'
								? 'border-green-500'
								: ''}
					/>
					{#if status === 'checking'}
						<Spinner size="sm" class="absolute top-1/2 right-3 -translate-y-1/2" />
					{:else if status === 'available'}
						<Check size={16} class="absolute top-1/2 right-3 -translate-y-1/2 text-green-500" />
					{:else if status === 'taken'}
						<X size={16} class="absolute top-1/2 right-3 -translate-y-1/2 text-red-500" />
					{/if}
				</div>
				{#if status === 'taken'}
					<p class="text-xs text-red-500">Username is already taken</p>
				{/if}
				<Button type="submit" class="w-full" disabled={isPending || !canSubmit}>
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
