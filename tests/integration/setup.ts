// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import { chai } from 'mochainon';
import * as memoize from 'memoizee';
import type * as BalenaSdk from '../../';
import type { AnyObject } from '../../typings/utils';
import { toWritable } from '../../lib/util/types';
import { getInitialOrganization } from './utils';
// tslint:disable-next-line:no-var-requires
chai.use(require('chai-samsam'));

const { expect } = chai;

export const IS_BROWSER = typeof window !== 'undefined' && window !== null;

let apiUrl: string;
let env: AnyObject;
export let balenaSdkExports: typeof BalenaSdk;
let opts: BalenaSdk.SdkOptions;
if (IS_BROWSER) {
	// tslint:disable-next-line:no-var-requires
	require('js-polyfills/es6');
	balenaSdkExports = window.balenaSdk;
	// @ts-expect-error
	env = window.__env__;

	apiUrl = env.TEST_API_URL || 'https://api.balena-cloud.com';
	opts = {
		apiUrl,
		builderUrl: env.TEST_BUILDER_URL || apiUrl.replace('api.', 'builder.'),
	};
} else {
	// tslint:disable-next-line:no-var-requires
	balenaSdkExports = require('../..');
	// tslint:disable-next-line:no-var-requires
	const settings = require('balena-settings-client');
	({ env } = process);

	apiUrl = env.TEST_API_URL || settings.get('apiUrl');
	opts = {
		apiUrl,
		builderUrl: env.TEST_BUILDER_URL || apiUrl.replace('api.', 'builder.'),
		dataDirectory: settings.get('dataDirectory'),
	};
}

_.assign(opts, {
	isBrowser: IS_BROWSER,
	retries: 3,
});

console.log(`Running SDK tests against: ${opts.apiUrl}`);
console.log(`TEST_USERNAME: ${env?.TEST_USERNAME}`);

const buildCredentials = function () {
	if (!env) {
		throw new Error('Missing environment object?!');
	}

	const creds = {
		email: env.TEST_EMAIL,
		password: env.TEST_PASSWORD,
		username: env.TEST_USERNAME,
		member: {
			email: env.TEST_MEMBER_EMAIL,
			password: env.TEST_MEMBER_PASSWORD,
			username: env.TEST_MEMBER_USERNAME,
		},
		paid: {
			email: env.TEST_PAID_EMAIL,
			password: env.TEST_PAID_PASSWORD,
		},
		register: {
			email: env.TEST_REGISTER_EMAIL,
			password: env.TEST_REGISTER_PASSWORD,
			username: env.TEST_REGISTER_USERNAME,
		},
	};
	if (
		// TODO: this should include the paid account eventually as well
		![creds.email, creds.register.email].every(
			(email) => email == null || email.includes('+testsdk'),
		)
	) {
		throw new Error(
			'Missing environment credentials, all emails must include `+testsdk` to avoid accidental deletion',
		);
	}

	if (
		!_.every([
			creds.email != null,
			creds.password != null,
			creds.username != null,
			creds.member.email != null,
			creds.member.password != null,
			creds.member.username != null,
			creds.register.email != null,
			creds.register.password != null,
			creds.register.username != null,
		])
	) {
		throw new Error('Missing environment credentials');
	}

	return creds;
};

export const getSdk = balenaSdkExports.getSdk;
export { opts as sdkOpts };
export const balena = getSdk(opts);

export async function resetUser() {
	const isLoggedIn = await balena.auth.isLoggedIn();
	if (!isLoggedIn) {
		return;
	}
	return Promise.all([
		balena.pine.delete({
			resource: 'application',
			options: {
				$filter: { 1: 1 },
			},
		}),

		balena.pine.delete({
			resource: 'user__has__public_key',
			options: {
				$filter: { 1: 1 },
			},
		}),

		balena.pine
			.delete<BalenaSdk.ApiKey>({
				resource: 'api_key',
				// only delete named user api keys
				options: {
					$filter: {
						name: {
							$ne: null,
						},
					},
				},
			})
			.catch(_.noop),

		resetInitialOrganization(),

		resetTestOrgs(),
	]);
}

export const credentials = buildCredentials();

export function givenLoggedInUserWithApiKey(beforeFn: Mocha.HookFunction) {
	beforeFn(async () => {
		await balena.auth.login({
			email: credentials.email,
			password: credentials.password,
		});
		const { body } = await balena.request.send({
			method: 'POST',
			url: '/api-key/user/full',
			baseUrl: opts.apiUrl,
			body: {
				name: 'apiKey',
			},
		});
		await balena.auth.logout();
		await balena.auth.loginWithToken(body);
		await resetUser();
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(() => resetUser());
}

export function givenLoggedInUser(beforeFn: Mocha.HookFunction) {
	beforeFn(async () => {
		await balena.auth.login({
			email: credentials.email,
			password: credentials.password,
		});
		await resetUser();
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(() => resetUser());
}

export function loginPaidUser() {
	return balena.auth.login({
		email: credentials.paid.email,
		password: credentials.paid.password,
	});
}

async function resetInitialOrganization() {
	const userId = await balena.auth.getUserId();
	const initialOrg = await getInitialOrganization();
	await balena.pine.delete({
		resource: 'organization_membership',
		options: {
			$filter: {
				user: { $ne: userId },
				is_member_of__organization: initialOrg.id,
			},
		},
	});
}

export function givenInitialOrganization(beforeFn: Mocha.HookFunction) {
	beforeFn(async function () {
		this.initialOrg = await getInitialOrganization();
	});
}

const getDeviceType = memoize(
	(deviceTypeId: number) =>
		balena.pine.get({
			resource: 'device_type',
			id: deviceTypeId,
			options: {
				$select: 'slug',
			},
		}),
	{
		promise: true,
		primitive: true,
	},
);

const TEST_ORGANIZATION_NAME = 'FooBar sdk test created organization';

async function resetTestOrgs() {
	const orgs = await balena.pine.get({
		resource: 'organization',
		options: {
			$select: 'id',
			$filter: {
				name: TEST_ORGANIZATION_NAME,
			},
		},
	});

	await Promise.all(
		orgs.map(({ id }) =>
			balena.pine.delete({
				resource: 'organization',
				id,
			}),
		),
	);
}

export function givenAnOrganization(beforeFn: Mocha.HookFunction) {
	let orgId;
	beforeFn(async function () {
		// make sure we start with a clean state
		const orgs = await balena.models.organization.getAll({
			$select: ['id', 'name'],
			$filter: {
				name: TEST_ORGANIZATION_NAME,
			},
		});
		// just make sure we didn't accidentaly fetched more than intended
		orgs.forEach(({ name }) => expect(name).to.equal(TEST_ORGANIZATION_NAME));
		await Promise.all(
			orgs.map(({ id }) => balena.models.organization.remove(id)),
		);

		const organization = await balena.models.organization.create({
			name: TEST_ORGANIZATION_NAME,
		});
		this.organization = organization;
		orgId = organization.id;
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(async () => {
		await balena.pine.delete({
			resource: 'organization',
			id: orgId,
		});
	});
}

export function givenAnApplication(beforeFn: Mocha.HookFunction) {
	givenInitialOrganization(beforeFn);

	beforeFn(async function () {
		const application = await balena.models.application.create({
			name: 'FooBar',
			applicationType: 'microservices-starter',
			deviceType: 'raspberry-pi',
			organization: this.initialOrg.id,
		});
		expect(application)
			.to.be.an('object')
			.that.has.property('id')
			.that.is.a('number');
		this.application = application;

		expect(application.is_for__device_type)
			.to.be.an('object')
			.that.has.property('__id')
			.that.is.a('number');
		this.applicationDeviceType = await getDeviceType(
			this.application.is_for__device_type.__id,
		);
		expect(this.applicationDeviceType)
			.to.be.an('object')
			.that.has.property('slug')
			.that.is.a('string');
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(async () => {
		await balena.pine.delete({
			resource: 'application',
			options: {
				$filter: { 1: 1 },
			},
		});
	});
}

const resetDevices = () =>
	balena.pine.delete({
		resource: 'device',
		options: {
			$filter: { 1: 1 },
		},
	});

export const testDeviceOsInfo = {
	os_variant: 'prod',
	os_version: 'balenaOS 2.48.0+rev1',
	supervisor_version: '10.8.0',
};

export function givenADevice(
	beforeFn: Mocha.HookFunction,
	extraDeviceProps?: BalenaSdk.PineSubmitBody<BalenaSdk.Device>,
) {
	beforeFn(async function () {
		const uuid = balena.models.device.generateUniqueKey();
		const deviceInfo = await balena.models.device.register(
			this.application.app_name,
			uuid,
		);

		if (this.currentRelease?.commit) {
			await balena.pine.patch<BalenaSdk.Device>({
				resource: 'device',
				body: {
					is_running__release: this.currentRelease.id,
				},
				options: {
					$filter: {
						uuid: deviceInfo.uuid,
					},
				},
			});
		}
		if (extraDeviceProps) {
			await balena.pine.patch<BalenaSdk.Device>({
				resource: 'device',
				body: extraDeviceProps,
				options: {
					$filter: {
						uuid: deviceInfo.uuid,
					},
				},
			});
		}

		const device = await balena.models.device.get(deviceInfo.uuid);
		this.device = device;

		if (!this.currentRelease || !this.currentRelease.commit) {
			return;
		}

		const [oldWebInstall, newWebInstall, , newDbInstall] = await Promise.all([
			// Create image installs for the images on the device
			balena.pine.post<BalenaSdk.ImageInstall>({
				resource: 'image_install',
				body: {
					installs__image: this.oldWebImage.id,
					is_provided_by__release: this.oldRelease.id,
					device: device.id,
					download_progress: null,
					status: 'Running',
					install_date: '2017-10-01',
				},
			}),
			balena.pine.post<BalenaSdk.ImageInstall>({
				resource: 'image_install',
				body: {
					installs__image: this.newWebImage.id,
					is_provided_by__release: this.currentRelease.id,
					device: device.id,
					download_progress: 50,
					status: 'Downloading',
					install_date: '2017-10-30',
				},
			}),
			balena.pine.post<BalenaSdk.ImageInstall>({
				resource: 'image_install',
				body: {
					installs__image: this.oldDbImage.id,
					is_provided_by__release: this.oldRelease.id,
					device: device.id,
					download_progress: 100,
					status: 'deleted',
					install_date: '2017-09-30',
				},
			}),
			balena.pine.post<BalenaSdk.ImageInstall>({
				resource: 'image_install',
				body: {
					installs__image: this.newDbImage.id,
					is_provided_by__release: this.currentRelease.id,
					device: device.id,
					download_progress: null,
					status: 'Running',
					install_date: '2017-10-30',
				},
			}),
		]);
		this.oldWebInstall = oldWebInstall;
		this.newWebInstall = newWebInstall;
		this.newDbInstall = newDbInstall;
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(resetDevices);
}

export function givenMulticontainerApplicationWithADevice(
	beforeFn: Mocha.HookFunction,
) {
	givenMulticontainerApplication(beforeFn);
	givenADevice(beforeFn);
}

export function givenMulticontainerApplication(beforeFn: Mocha.HookFunction) {
	givenAnApplication(beforeFn);

	beforeFn(async function () {
		const userId = await balena.auth.getUserId();
		const oldDate = new Date('2017-01-01').toISOString();
		const now = new Date().toISOString();
		const [webService, dbService, [oldRelease, newRelease]] = await Promise.all(
			[
				// Register web & DB services
				balena.pine.post<BalenaSdk.Service>({
					resource: 'service',
					body: {
						application: this.application.id,
						service_name: 'web',
					},
				}),
				balena.pine.post<BalenaSdk.Service>({
					resource: 'service',
					body: {
						application: this.application.id,
						service_name: 'db',
					},
				}),
				// Register an old & new release of this application
				(async () => {
					return [
						await balena.pine.post<BalenaSdk.Release>({
							resource: 'release',
							body: {
								belongs_to__application: this.application.id,
								is_created_by__user: userId,
								commit: 'old-release-commit',
								status: 'success' as const,
								source: 'cloud',
								composition: '{}',
								start_timestamp: oldDate,
							},
						}),
						await balena.pine.post<BalenaSdk.Release>({
							resource: 'release',
							body: {
								belongs_to__application: this.application.id,
								is_created_by__user: userId,
								commit: 'new-release-commit',
								status: 'success' as const,
								source: 'cloud',
								composition: '{}',
								start_timestamp: now,
							},
						}),
					];
				})(),
			],
		);
		this.webService = webService;
		this.dbService = dbService;
		this.oldRelease = oldRelease;
		this.currentRelease = newRelease;

		const [
			oldWebImage,
			newWebImage,
			oldDbImage,
			newDbImage,
		] = await Promise.all([
			// Register an old & new web image build from the old and new
			// releases, a db build in the new release only
			balena.pine.post<BalenaSdk.Image>({
				resource: 'image',
				body: {
					is_a_build_of__service: webService.id,
					project_type: 'dockerfile',
					content_hash: 'abc',
					build_log: 'old web log',
					start_timestamp: oldDate,
					push_timestamp: oldDate,
					status: 'success',
				},
			}),
			balena.pine.post<BalenaSdk.Image>({
				resource: 'image',
				body: {
					is_a_build_of__service: webService.id,
					project_type: 'dockerfile',
					content_hash: 'def',
					build_log: 'new web log',
					start_timestamp: now,
					push_timestamp: now,
					status: 'success',
				},
			}),
			balena.pine.post<BalenaSdk.Image>({
				resource: 'image',
				body: {
					is_a_build_of__service: dbService.id,
					project_type: 'dockerfile',
					content_hash: 'jkl',
					build_log: 'old db log',
					start_timestamp: oldDate,
					push_timestamp: oldDate,
					status: 'success',
				},
			}),
			balena.pine.post<BalenaSdk.Image>({
				resource: 'image',
				body: {
					is_a_build_of__service: dbService.id,
					project_type: 'dockerfile',
					content_hash: 'ghi',
					build_log: 'new db log',
					start_timestamp: now,
					push_timestamp: now,
					status: 'success',
				},
			}),
		]);
		this.oldWebImage = oldWebImage;
		this.newWebImage = newWebImage;
		this.oldDbImage = oldDbImage;
		this.newDbImage = newDbImage;
		await Promise.all([
			// Tie the images to their corresponding releases
			balena.pine.post<BalenaSdk.ReleaseImage>({
				resource: 'image__is_part_of__release',
				body: {
					image: oldWebImage.id,
					is_part_of__release: oldRelease.id,
				},
			}),
			balena.pine.post<BalenaSdk.ReleaseImage>({
				resource: 'image__is_part_of__release',
				body: {
					image: oldDbImage.id,
					is_part_of__release: oldRelease.id,
				},
			}),
			balena.pine.post<BalenaSdk.ReleaseImage>({
				resource: 'image__is_part_of__release',
				body: {
					image: newWebImage.id,
					is_part_of__release: newRelease.id,
				},
			}),
			balena.pine.post<BalenaSdk.ReleaseImage>({
				resource: 'image__is_part_of__release',
				body: {
					image: newDbImage.id,
					is_part_of__release: newRelease.id,
				},
			}),
		]);
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(function () {
		return (this.currentRelease = null);
	});
}

export function givenASupervisorRelease(
	beforeFn: Mocha.HookFunction,
	version = 'v11.12.4',
) {
	beforeFn(async function () {
		const supervisorRelease = await balena.pine.get({
			resource: 'supervisor_release',
			options: {
				$filter: {
					supervisor_version: version,
					is_for__device_type: this.application.is_for__device_type.__id,
				},
			},
		});
		this.supervisorRelease = supervisorRelease[0];
	});
}

export const applicationRetrievalFields = toWritable([
	'id',
	'app_name',
	'slug',
	'uuid',
] as const);
export const deviceUniqueFields = toWritable(['id', 'uuid'] as const);
