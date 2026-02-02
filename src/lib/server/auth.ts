import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { db } from './db';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
	throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set');
}

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		usePlural: true
	}),
	socialProviders: {
		google: {
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		}
	},
	user: {
		additionalFields: {
			username: {
				type: 'string',
				required: false,
				defaultValue: null
			}
		}
	},

	plugins: [sveltekitCookies(getRequestEvent)]
});
