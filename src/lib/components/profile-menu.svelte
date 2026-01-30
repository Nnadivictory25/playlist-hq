<script lang="ts">
	import { authClient } from '@/lib/auth-client';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Spinner } from './ui/spinner/index.js';
	import { cn } from '$lib/utils';
	import { buttonVariants } from './ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { goto, invalidateAll } from '$app/navigation';
	import { User, LogOut, Pencil } from '@lucide/svelte';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { validateUsername } from '$lib/app-utils';

	let { user }: { user: { id: string; email: string; username?: string } } = $props();

	const queryClient = useQueryClient();

	// Popover state
	let popoverOpen = $state(false);

	// Edit profile dialog state
	let editDialogOpen = $state(false);
	let newUsername = $state('');
	let isUpdating = $state(false);

	// Initialize newUsername when dialog opens
	$effect(() => {
		if (editDialogOpen) {
			newUsername = user.username || '';
		}
	});

	// Logout dialog state
	let logoutDialogOpen = $state(false);
	let isLoggingOut = $state(false);

	async function handleUpdateUsername() {
		const validation = validateUsername(newUsername);
		if (!validation.isValid) {
			toast.error(validation.error || 'Invalid username');
			return;
		}

		isUpdating = true;
		try {
			const res = await fetch('/api/user', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: newUsername.trim() })
			});

			const json = await res.json();
			if (!json.success) {
				throw new Error(json.error || 'Failed to update username');
			}

			// Update local user data
			user.username = newUsername.trim();

			// Invalidate dashboard queries to refresh playlists with new username
			queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
			queryClient.invalidateQueries({ queryKey: ['playlists'] });

			toast.success('Username updated successfully!');
			editDialogOpen = false;
		} catch (error) {
			toast.error((error as Error).message || 'Failed to update username');
		} finally {
			isUpdating = false;
		}
	}

	async function handleLogout() {
		isLoggingOut = true;
		try {
			await authClient.signOut();
			await goto('/playlists', { invalidateAll: true, replaceState: true });
			toast.success('Logged out');
		} catch (error) {
			console.error('Logout failed:', error);
			toast.error('Failed to logout');
		} finally {
			isLoggingOut = false;
			logoutDialogOpen = false;
			popoverOpen = false;
		}
	}
</script>

<!-- Profile Popover -->
<Popover.Root bind:open={popoverOpen}>
	<Popover.Trigger
		class={buttonVariants({ variant: 'outline', size: 'default' }) + ' h-8 cursor-pointer gap-2'}
	>
		<User size={16} />
		<span class="hidden sm:inline">Profile</span>
	</Popover.Trigger>
	<Popover.Content class="w-56 p-0" align="end">
		<div class="p-3">
			<!-- User Info Section -->
			<div class="mb-3 border-b pb-2">
				<p class="text-xs text-muted-foreground">Email</p>
				<p class="truncate text-sm font-medium">{user.email}</p>

				<div class="mt-2 flex items-center justify-between">
					<div>
						<p class="text-xs text-muted-foreground">Username</p>
						{#if user.username}
							<p class="text-sm font-medium text-primary">@{user.username}</p>
						{:else}
							<p class="text-sm text-muted-foreground italic">Not set</p>
						{/if}
					</div>
					<button
						class="text-muted-foreground transition-colors hover:text-primary"
						onclick={() => {
							popoverOpen = false;
							editDialogOpen = true;
							newUsername = user.username || '';
						}}
						title="Edit username"
					>
						<Pencil size={14} />
					</button>
				</div>
			</div>

			<!-- Logout Button -->
			<Button
				variant="destructive"
				class="w-full justify-start gap-2"
				onclick={() => {
					popoverOpen = false;
					logoutDialogOpen = true;
				}}
			>
				<LogOut size={14} />
				Logout
			</Button>
		</div>
	</Popover.Content>
</Popover.Root>

<!-- Edit Profile Dialog -->
<Dialog.Root bind:open={editDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleUpdateUsername();
			}}
		>
			<Dialog.Header>
				<Dialog.Title>Edit Profile</Dialog.Title>
				<Dialog.Description>
					Update your username. This will be displayed on your playlists.
				</Dialog.Description>
			</Dialog.Header>

			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="username">Username</Label>
					<Input
						id="username"
						type="text"
						placeholder="Enter your username"
						bind:value={newUsername}
						disabled={isUpdating}
					/>
					<p class="text-xs text-muted-foreground">3-15 characters, no spaces</p>
				</div>
			</div>

			<Dialog.Footer>
				<Button
					type="button"
					variant="outline"
					onclick={() => (editDialogOpen = false)}
					disabled={isUpdating}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isUpdating}>
					{#if isUpdating}
						<Spinner size="sm" />
						Updating...
					{:else}
						Save Changes
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Logout Confirmation Dialog -->
<AlertDialog.Root bind:open={logoutDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure you want to logout?</AlertDialog.Title>
			<AlertDialog.Description>
				You will be signed out of your account and redirected to the playlists page.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				class={cn(buttonVariants({ variant: 'destructive' }))}
				onclick={handleLogout}
				disabled={isLoggingOut}
			>
				{#if isLoggingOut}
					<Spinner size="sm" />
					Logging out...
				{:else}
					Logout
				{/if}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
