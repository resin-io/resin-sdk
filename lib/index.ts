/*
Copyright 2016 Balena

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import type {
	Pine as PineBase,
	PineStrict as PineStrictBase,
} from '../typings/balena-pine';
import type { BalenaRequest, Interceptor } from '../typings/balena-request';
import type { ResourceTypeMap } from './types/models';

import { globalEnv } from './util/global-env';

export type Pine = PineBase<ResourceTypeMap>;
export type PineStrict = PineStrictBase<ResourceTypeMap>;

export * from './types/models';
export * from './types/jwt';
export * from './types/contract';

export type { Interceptor };
export type {
	WithId,
	PineDeferred,
	NavigationResource,
	OptionalNavigationResource,
	ReverseNavigationResource,
	ParamsObj as PineParams,
	ParamsObjWithId as PineParamsWithId,
	Filter as PineFilter,
	Expand as PineExpand,
	ODataOptions as PineOptions,
	SubmitBody as PineSubmitBody,
	ODataOptionsWithFilter as PineOptionsWithFilter,
	ODataOptionsWithSelect as PineOptionsWithSelect,
	SelectableProps as PineSelectableProps,
	ExpandableProps as PineExpandableProps,
	ExpandResultObject as PineExpandResultObject,
	TypedResult as PineTypedResult,
} from '../typings/pinejs-client-core';

export type { ApplicationMembershipCreationOptions } from './models/application-membership';
export type { ApplicationInviteOptions } from './models/application-invite';
export type {
	BankAccountBillingInfo,
	BillingAccountAddressInfo,
	BillingAccountInfo,
	BillingAddonPlanInfo,
	BillingInfo,
	BillingInfoType,
	BillingPlanBillingInfo,
	BillingPlanInfo,
	CardBillingInfo,
	InvoiceInfo,
	PlanChangeOptions,
	TokenBillingSubmitInfo,
} from './models/billing';
export type { GaConfig, Config, DeviceTypeJson } from './models/config';
export type {
	DeviceState,
	DeviceMetrics,
	OverallStatus,
	SupervisorStatus,
} from './models/device';
export type {
	OsTypes,
	OsLines,
	OsVersion,
	OsVersionsByDeviceType,
} from './models/hostapp';
export type { ReleaseWithImageDetails } from './models/release';
export type { OrganizationMembershipCreationOptions } from './models/organization-membership';
export type { OrganizationInviteOptions } from './models/organization-invite';
export type {
	ImgConfigOptions,
	OsVersions,
	OsUpdateVersions,
} from './models/os';
export type { OsUpdateActionResult } from './util/device-actions/os-update';
export type { BuilderUrlDeployOptions } from './util/builder';
export type {
	CurrentService,
	CurrentServiceWithCommit,
	CurrentGatewayDownload,
	DeviceWithServiceDetails,
} from './util/device-service-details';
export type {
	BaseLog,
	ServiceLog,
	SystemLog,
	LogMessage,
	LogsSubscription,
	LogsOptions,
} from './logs';

export interface InjectedDependenciesParam {
	sdkInstance: BalenaSDK;
	settings: {
		get(key: string): string;
		getAll(): { [key: string]: string };
	};
	request: BalenaRequest;
	auth: import('balena-auth').default;
	pine: Pine;
	pubsub: import('./util/pubsub').PubSub;
}

export interface SdkOptions {
	apiUrl?: string;
	builderUrl?: string;
	dashboardUrl?: string;
	dataDirectory?: string;
	isBrowser?: boolean;
	debug?: boolean;
	deviceUrlsBase?: string;
}

export interface InjectedOptionsParam extends SdkOptions {
	apiUrl: string;
	apiVersion: string;
}

// These constants are used to create globals for sharing defualt options between
// multiple instances of the SDK.
// See the `setSharedOptions()` and `fromSharedOptions()` methods.
const BALENA_SDK_SHARED_OPTIONS = 'BALENA_SDK_SHARED_OPTIONS';
const BALENA_SDK_HAS_USED_SHARED_OPTIONS = 'BALENA_SDK_HAS_USED_SHARED_OPTIONS';
const BALENA_SDK_HAS_SET_SHARED_OPTIONS = 'BALENA_SDK_HAS_SET_SHARED_OPTIONS';

const sdkTemplate = {
	auth() {
		const { addCallbackSupportToModuleFactory } =
			require('./util/callbacks') as typeof import('./util/callbacks');
		return addCallbackSupportToModuleFactory(
			(require('./auth') as typeof import('./auth')).default,
		);
	},
	models() {
		// don't try to add callbacks for this, since it's just a namespace
		// and it would otherwise break lazy loading since it would enumerate
		// all properties
		return require('./models') as typeof import('./models');
	},
	logs() {
		const { addCallbackSupportToModuleFactory } =
			require('./util/callbacks') as typeof import('./util/callbacks');
		return addCallbackSupportToModuleFactory(
			(require('./logs') as typeof import('./logs')).default,
		);
	},
	settings() {
		const { addCallbackSupportToModuleFactory } =
			require('./util/callbacks') as typeof import('./util/callbacks');
		return addCallbackSupportToModuleFactory(
			(require('./settings') as typeof import('./settings')).default,
		);
	},
};

export type BalenaSDK = {
	[key in keyof typeof sdkTemplate]: ReturnType<
		ReturnType<typeof sdkTemplate[key]>
	>;
} & {
	interceptors: Interceptor[];
	request: BalenaRequest;
	pine: Pine;
	errors: typeof import('balena-errors');
	version: string;
};

/**
 * @namespace balena
 */

/**
 * @module balena-sdk
 */

/**
 * @summary Creates a new SDK instance using the default or the provided options.
 *
 * @description
 * The module exports a single factory function.
 *
 * @example
 * // with es6 imports
 * import { getSdk } from 'balena-sdk';
 * // or with node require
 * const { getSdk } = require('balena-sdk');
 *
 * const balena = getSdk({
 * 	apiUrl: "https://api.balena-cloud.com/",
 * 	dataDirectory: "/opt/local/balena"
 * });
 */
export const getSdk = function ($opts?: SdkOptions) {
	const opts: InjectedOptionsParam = {
		apiUrl: 'https://api.balena-cloud.com/',
		builderUrl: 'https://builder.balena-cloud.com/',
		isBrowser: typeof window !== 'undefined' && window !== null,
		// API version is configurable but only do so if you know what you're doing,
		// as the SDK is directly tied to a specific version.
		apiVersion: 'v6',
		...$opts,
	};

	const version = (
		require('./util/sdk-version') as typeof import('./util/sdk-version')
	).default;
	const { getRequest } = require('balena-request') as {
		getRequest: (
			opts: SdkOptions & { auth: InjectedDependenciesParam['auth'] },
		) => BalenaRequest;
	};
	const BalenaAuth = (require('balena-auth') as typeof import('balena-auth'))
		.default;
	const { BalenaPine } = require('balena-pine') as typeof import('balena-pine');
	const errors = require('balena-errors') as typeof import('balena-errors');
	const { PubSub } = require('./util/pubsub') as typeof import('./util/pubsub');

	/**
	 * @namespace models
	 * @memberof balena
	 */

	/**
	 * @namespace auth
	 * @memberof balena
	 */

	/**
	 * @namespace logs
	 * @memberof balena
	 */

	/**
	 * @namespace settings
	 * @memberof balena
	 */

	let settings: InjectedDependenciesParam['settings'];
	if (opts.isBrowser) {
		const { notImplemented } = require('./util') as typeof import('./util');
		settings = {
			get: notImplemented,
			getAll: notImplemented,
		};
	} else {
		settings =
			require('balena-settings-client') as typeof import('balena-settings-client') as InjectedDependenciesParam['settings'];
		if (opts.dataDirectory == null) {
			opts.dataDirectory = settings.get('dataDirectory');
		}
	}

	if ('apiKey' in opts) {
		// to prevent exposing it to balena-request directly
		// which would add it as a query sting option
		// @ts-expect-error
		delete opts.apiKey;
	}

	const auth = new BalenaAuth(opts);
	const request = getRequest({ ...opts, auth });
	const pine = new BalenaPine(
		{},
		{ ...opts, auth, request },
	) as unknown as Pine;
	const pubsub = new PubSub();

	const sdk = {} as BalenaSDK;
	const deps: InjectedDependenciesParam = {
		settings,
		request,
		auth,
		pine,
		pubsub,
		sdkInstance: sdk,
	};

	Object.keys(sdkTemplate).forEach(function (
		moduleName: keyof typeof sdkTemplate,
	) {
		Object.defineProperty(sdk, moduleName, {
			enumerable: true,
			configurable: true,
			get() {
				const moduleFactory = sdkTemplate[moduleName]();
				// We need the delete first as the current property is read-only
				// and the delete removes that restriction
				delete this[moduleName];
				return (this[moduleName] = moduleFactory(deps, opts));
			},
		});
	});

	/**
	 * @typedef Interceptor
	 * @type {object}
	 * @memberof balena.interceptors
	 *
	 * @description
	 * An interceptor implements some set of the four interception hook callbacks.
	 * To continue processing, each function should return a value or a promise that
	 * successfully resolves to a value.
	 *
	 * To halt processing, each function should throw an error or return a promise that
	 * rejects with an error.
	 *
	 * @property {function} [request] - Callback invoked before requests are made. Called with
	 * the request options, should return (or resolve to) new request options, or throw/reject.
	 *
	 * @property {function} [response] - Callback invoked before responses are returned. Called with
	 * the response, should return (or resolve to) a new response, or throw/reject.
	 *
	 * @property {function} [requestError] - Callback invoked if an error happens before a request.
	 * Called with the error itself, caused by a preceeding request interceptor rejecting/throwing
	 * an error for the request, or a failing in preflight token validation. Should return (or resolve
	 * to) new request options, or throw/reject.
	 *
	 * @property {function} [responseError] - Callback invoked if an error happens in the response.
	 * Called with the error itself, caused by a preceeding response interceptor rejecting/throwing
	 * an error for the request, a network error, or an error response from the server. Should return
	 * (or resolve to) a new response, or throw/reject.
	 */

	/**
	 * @summary Array of interceptors
	 * @member {Interceptor[]} interceptors
	 * @public
	 * @memberof balena
	 *
	 * @description
	 * The current array of interceptors to use. Interceptors intercept requests made
	 * internally and are executed in the order they appear in this array for requests,
	 * and in the reverse order for responses.
	 *
	 * @example
	 * balena.interceptors.push({
	 * 	responseError: function (error) {
	 * 		console.log(error);
	 * 		throw error;
	 * 	})
	 * });
	 */
	Object.defineProperty(sdk, 'interceptors', {
		get(): Interceptor[] {
			return request.interceptors;
		},
		set(interceptors: Interceptor[]) {
			return (request.interceptors = interceptors);
		},
	});

	const versionHeaderInterceptor: Interceptor = {
		request($request) {
			let { url } = $request;

			if (typeof url !== 'string') {
				return $request;
			}

			if (typeof $request.baseUrl === 'string') {
				url = $request.baseUrl + url;
			}

			if (url.indexOf(opts.apiUrl) === 0) {
				$request.headers['X-Balena-Client'] = `balena-sdk/${version}`;
			}

			return $request;
		},
	};

	sdk.interceptors.push(versionHeaderInterceptor);

	/**
	 * @summary Balena request instance
	 * @member {Object} request
	 * @public
	 * @memberof balena
	 *
	 * @description
	 * The balena-request instance used internally. This should not be necessary
	 * in normal usage, but can be useful if you want to make an API request directly,
	 * using the same token and hooks as the SDK.
	 *
	 * @example
	 * balena.request.send({ url: 'http://api.balena-cloud.com/ping' });
	 */
	sdk.request = request;

	/**
	 * @summary Balena pine instance
	 * @member {Object} pine
	 * @public
	 * @memberof balena
	 *
	 * @description
	 * The balena-pine instance used internally. This should not be necessary
	 * in normal usage, but can be useful if you want to directly make pine
	 * queries to the api for some resource that isn't directly supported
	 * in the SDK.
	 *
	 * @example
	 * balena.pine.get({
	 * 	resource: 'release',
	 * 	options: {
	 * 		$count: {
	 * 			$filter: { belongs_to__application: applicationId }
	 * 		}
	 * 	}
	 * });
	 */
	sdk.pine = pine;

	/**
	 * @summary Balena errors module
	 * @member {Object} errors
	 * @public
	 * @memberof balena
	 *
	 * @description
	 * The balena-errors module used internally. This is provided primarily for
	 * convenience, and to avoid the necessity for separate balena-errors
	 * dependencies. You'll want to use this if you need to match on the specific
	 * type of error thrown by the SDK.
	 *
	 * @example
	 * balena.models.device.get(123).catch(function (error) {
	 *   if (error.code === balena.errors.BalenaDeviceNotFound.code) {
	 *     ...
	 *   } else if (error.code === balena.errors.BalenaRequestError.code) {
	 *     ...
	 *   }
	 * });
	 */
	sdk.errors = errors;

	sdk.version = version;

	return sdk;
};

/**
 * @summary Set shared default options
 * @public
 * @function
 *
 * @description
 * Set options that are used by calls to `fromSharedOptions()`.
 * The options accepted are the same as those used in the main SDK factory function.
 * If you use this method, it should be called as soon as possible during app
 * startup and before any calls to `fromSharedOptions()` are made.
 *
 * @param {Object} options - The shared default options
 * @param {String} [options.apiUrl='https://api.balena-cloud.com/'] - the balena API url to use.
 * @param {String} [options.builderUrl='https://builder.balena-cloud.com/'] - the balena builder url to use.
 * @param {String} [options.deviceUrlsBase='balena-devices.com'] - the base balena device API url to use.
 * @param {String} [options.dataDirectory='$HOME/.balena'] - *ignored in the browser*, the directory where the user settings are stored, normally retrieved like `require('balena-settings-client').get('dataDirectory')`.
 * @param {Boolean} [options.isBrowser] - the flag to tell if the module works in the browser. If not set will be computed based on the presence of the global `window` value.
 * @param {Boolean} [options.debug] - when set will print some extra debug information.
 *
 * @example
 * import { setSharedOptions } from 'balena-sdk';
 * setSharedOptions({
 * 	apiUrl: 'https://api.balena-cloud.com/',
 * 	builderUrl: 'https://builder.balena-cloud.com/',
 * 	isBrowser: true,
 * });
 */
export const setSharedOptions = function (options: SdkOptions) {
	if (globalEnv[BALENA_SDK_HAS_USED_SHARED_OPTIONS]) {
		console.error(
			'Shared SDK options have already been used. You may have a race condition in your code.',
		);
	}

	if (globalEnv[BALENA_SDK_HAS_SET_SHARED_OPTIONS]) {
		console.error(
			'Shared SDK options have already been set. You may have a race condition in your code.',
		);
	}

	globalEnv[BALENA_SDK_SHARED_OPTIONS] = options;
	globalEnv[BALENA_SDK_HAS_SET_SHARED_OPTIONS] = true;
};

/**
 * @summary Create an SDK instance using shared default options
 * @public
 * @function
 *
 * @description
 * Create an SDK instance using shared default options set using the `setSharedOptions()` method.
 * If options have not been set using this method, then this method will use the
 * same defaults as the main SDK factory function.
 *
 * @example
 * import { fromSharedOptions } from 'balena-sdk';
 * const sdk = fromSharedOptions();
 */
export const fromSharedOptions = function () {
	const sharedOpts = globalEnv[BALENA_SDK_SHARED_OPTIONS];

	globalEnv[BALENA_SDK_HAS_USED_SHARED_OPTIONS] = true;

	return getSdk(sharedOpts);
};
