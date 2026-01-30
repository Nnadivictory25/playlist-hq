import { createMutation, useQueryClient } from '@tanstack/svelte-query';

type OnboardData = {
	username: string;
};

export function useOnboardMutation() {
	const queryClient = useQueryClient();

	return createMutation(() => ({
		mutationFn: async (data: OnboardData) => {
			const res = await fetch('/api/user', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			const json = await res.json();
			if (!json.success) throw new Error(json.error);
			return json;
		},
		onSuccess: () => {
			// Invalidate user-related queries
			queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
		}
	}));
}

