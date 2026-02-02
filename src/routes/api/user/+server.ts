import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isUsernameTaken, updateUser } from '$lib/server/db/utils';
import { unauthorized } from '$lib/server/api-helpers';

export const GET: RequestHandler = async ({ url, locals }) => {
	const username = url.searchParams.get('username');
	if (!username) {
		return json({ success: false, error: 'Username parameter required' }, { status: 400 });
	}

	const taken = await isUsernameTaken(username, locals.user?.id);
	return json({ available: !taken });
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	const { user } = locals;
	if (!user) {
		return unauthorized();
	}

	try {
		const { username } = (await request.json()) as { username: string };

		if (!username || username.trim().length === 0) {
			return json({ success: false, error: 'Username is required' }, { status: 400 });
		}

		await updateUser({ userId: user.id, username: username.trim() });

		return json({ success: true, message: 'Username updated successfully' });
	} catch (error: any) {
		console.error('Error updating user:', error);
		return json(
			{
				success: false,
				error: error?.message || 'Failed to update username'
			},
			{ status: 500 }
		);
	}
};
