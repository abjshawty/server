import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { env } from "../helpers";
import { client } from '../db';
import provider from "./provider";
const auth = betterAuth({
	database: prismaAdapter(client, {
		provider: provider.format_url(env.database_url)
	}),
	emailAndPassword: {
		enabled: env.authEnabled,
		disableSignUp: false,
		requireEmailVerification: true,
		maxPasswordLength: 100,
		minPasswordLength: 8,
	},
	socialProviders: {
		...(env.githubClientId && env.githubClientSecret && {
			github: {
				enabled: env.authEnabled,
				clientId: env.githubClientId,
				clientSecret: env.githubClientSecret,
			},
		}),
		...(env.gitlabClientId && env.gitlabClientSecret && {
			gitlab: {
				enabled: env.authEnabled,
				clientId: env.gitlabClientId,
				clientSecret: env.gitlabClientSecret,
			},
		}),
		...(env.googleClientId && env.googleClientSecret && {
			google: {
				enabled: env.authEnabled,
				clientId: env.googleClientId,
				clientSecret: env.googleClientSecret,
			},
		}),
		...(env.discordClientId && env.discordClientSecret && {
			discord: {
				enabled: env.authEnabled,
				clientId: env.discordClientId,
				clientSecret: env.discordClientSecret,
			},
		}),
	}

});

export default auth;