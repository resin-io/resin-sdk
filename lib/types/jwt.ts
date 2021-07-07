export interface JWTUser {
	account_type?: string;
	actualUser?: number;
	company?: string;
	created_at: string;
	email?: string;
	features?: string[];
	first_name?: string;
	hasPasswordSet?: boolean;
	has_disabled_newsletter?: boolean;
	must_be_verified?: boolean;
	is_verified?: boolean;
	id: number;
	intercomUserName?: string;
	intercomUserHash?: string;
	jwt_secret: string;
	last_name?: string;
	loginAs?: boolean;
	needsPasswordReset?: boolean;
	permissions?: string[];
	public_key?: boolean;
	twoFactorRequired?: boolean;
	username: string;

	social_service_account?: SocialServiceAccount[];
}

export interface SocialServiceAccount {
	provider: string;
	display_name: string;
}
