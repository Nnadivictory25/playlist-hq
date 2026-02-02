import { createQuery } from '@tanstack/svelte-query';

export type UsernameCheckResult = {
	available: boolean;
};

export function useUsernameAvailability(username: () => string, currentUsername?: string) {
	return createQuery(() => {
		const trimmed = username().trim();
		const isValidLength = trimmed.length >= 3 && trimmed.length <= 15;
		const isCurrentUser = currentUsername && trimmed === currentUsername;

		return {
			queryKey: ['username-availability', trimmed],
			queryFn: async (): Promise<UsernameCheckResult> => {
				if (isCurrentUser) {
					return { available: true };
				}
				const res = await fetch(`/api/user?username=${encodeURIComponent(trimmed)}`);
				return res.json();
			},
			enabled: isValidLength && trimmed.length > 0,
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 10 // 10 minutes
		};
	});
}
