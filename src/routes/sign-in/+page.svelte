<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { authClient } from '@/lib/auth-client';
	import { ArrowRight } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let isLoading = $state(false);

	function signInWithGoogle() {
		isLoading = true;
		authClient.signIn
			.social({
				provider: 'google',
				callbackURL: '/onboard'
			})
			.catch((error) => {
				toast.error(error.message);
				isLoading = false;
			});
	}

	$effect(() => {
		return () => {
			isLoading = false;
		};
	});
</script>

<section class="flex min-h-[65vh] items-center justify-center pt-20">
	<Card.Root class="-my-4 w-full max-w-sm">
		<Card.Header>
			<Card.Title>SIgn In to your account</Card.Title>
			<Card.Description
				>Don't worry, if you don't have an account, we'll create one for you.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<Button
				onclick={signInWithGoogle}
				variant="outline"
				class="w-full cursor-pointer"
				disabled={isLoading}
			>
				<img src="/icons8-google.svg" alt="google" class="size-5" />
				{#if isLoading}
					Signing in...
				{:else}
					Continue with Google
				{/if}
				<ArrowRight size={16} />
			</Button>
		</Card.Content>
	</Card.Root>
</section>
