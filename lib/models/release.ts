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

import * as errors from 'balena-errors';
import once = require('lodash/once');
import type * as BalenaSdk from '..';
import type {
	InjectedDependenciesParam,
	InjectedOptionsParam,
	PineTypedResult,
} from '..';
import { isId, mergePineOptions } from '../util';
import { toWritable } from '../util/types';
import type { Application, ReleaseTag, Release, User } from '../types/models';
import type { BuilderUrlDeployOptions } from '../util/builder';

export interface ReleaseWithImageDetails extends Release {
	images: Array<{
		id: number;
		service_name: string;
	}>;
	user: Pick<User, 'id' | 'username'> | undefined;
}

const getReleaseModel = function (
	deps: InjectedDependenciesParam,
	opts: InjectedOptionsParam,
) {
	const { pine } = deps;
	const applicationModel = once(() =>
		(require('./application') as typeof import('./application')).default(
			deps,
			opts,
		),
	);

	const { addCallbackSupportToModule } =
		require('../util/callbacks') as typeof import('../util/callbacks');

	const { buildDependentResource } =
		require('../util/dependent-resource') as typeof import('../util/dependent-resource');
	const builderHelper = once(() => {
		const { BuilderHelper } =
			require('../util/builder') as typeof import('../util/builder');
		return new BuilderHelper(deps, opts);
	});

	const tagsModel = buildDependentResource<ReleaseTag>(
		{ pine },
		{
			resourceName: 'release_tag',
			resourceKeyField: 'tag_key',
			parentResourceName: 'release',
			getResourceId: async (commitOrId: string | number): Promise<number> =>
				(await get(commitOrId, { $select: 'id' })).id,
		},
	);

	/**
	 * @summary Get a specific release
	 * @name get
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number} commitOrId - release commit (string) or id (number)
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object} - release
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.get(123).then(function(release) {
	 * 	console.log(release);
	 * });
	 *
	 * @example
	 * balena.models.release.get('7cf02a6').then(function(release) {
	 * 	console.log(release);
	 * });
	 *
	 * @example
	 * balena.models.release.get(123, function(error, release) {
	 * 	if (error) throw error;
	 * 	console.log(release);
	 * });
	 */
	async function get(
		commitOrId: string | number,
		options: BalenaSdk.PineOptions<BalenaSdk.Release> = {},
	): Promise<BalenaSdk.Release> {
		if (commitOrId == null) {
			throw new errors.BalenaReleaseNotFound(commitOrId);
		}

		if (isId(commitOrId)) {
			const release = await pine.get({
				resource: 'release',
				id: commitOrId,
				options: mergePineOptions({}, options),
			});
			if (release == null) {
				throw new errors.BalenaReleaseNotFound(commitOrId);
			}
			return release;
		} else {
			const releases = await pine.get({
				resource: 'release',
				options: mergePineOptions(
					{
						$filter: {
							commit: { $startswith: commitOrId },
						},
					},
					options,
				),
			});
			if (releases.length === 0) {
				throw new errors.BalenaReleaseNotFound(commitOrId);
			}

			if (releases.length > 1) {
				throw new errors.BalenaAmbiguousRelease(commitOrId);
			}
			return releases[0];
		}
	}

	/**
	 * @summary Get a specific release with the details of the images built
	 * @name getWithImageDetails
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @description
	 * This method does not map exactly to the underlying model: it runs a
	 * larger prebuilt query, and reformats it into an easy to use and
	 * understand format. If you want significantly more control, or to see the
	 * raw model directly, use `release.get(id, options)` instead.
	 *
	 * @param {String|Number} commitOrId - release commit (string) or id (number)
	 * @param {Object} [options={}] - a map of extra pine options
	 * @param {Boolean} [options.release={}] - extra pine options for releases
	 * @param {Object} [options.image={}] - extra pine options for images
	 * @fulfil {Object} - release with image details
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.getWithImageDetails(123).then(function(release) {
	 * 	console.log(release);
	 * });
	 *
	 * @example
	 * balena.models.release.getWithImageDetails('7cf02a6').then(function(release) {
	 * 	console.log(release);
	 * });
	 *
	 * @example
	 * balena.models.release.getWithImageDetails(123, { image: { $select: 'build_log' } })
	 * .then(function(release) {
	 * 	console.log(release.images[0].build_log);
	 * });
	 *
	 * @example
	 * balena.models.release.getWithImageDetails(123, function(error, release) {
	 * 	if (error) throw error;
	 * 	console.log(release);
	 * });
	 */
	async function getWithImageDetails(
		commitOrId: string | number,
		options: {
			release?: BalenaSdk.PineOptions<BalenaSdk.Release>;
			image?: BalenaSdk.PineOptions<BalenaSdk.Image>;
		} = {},
	): Promise<BalenaSdk.ReleaseWithImageDetails> {
		const baseImageOptions = {
			$select: 'id',
			$expand: {
				is_a_build_of__service: {
					$select: 'service_name',
				},
			},
		} as const;

		const baseReleaseOptions = {
			$expand: {
				contains__image: {
					$expand: {
						image: mergePineOptions(
							baseImageOptions,
							options.image,
						) as typeof baseImageOptions,
					},
				},
				is_created_by__user: {
					$select: toWritable(['id', 'username'] as const),
				},
			},
		} as const;

		const rawRelease = (await get(
			commitOrId,
			mergePineOptions(baseReleaseOptions, options.release),
		)) as PineTypedResult<Release, typeof baseReleaseOptions>;
		const release = rawRelease as BalenaSdk.ReleaseWithImageDetails;

		// Squash .contains__image[x].image[0] into a simple array
		const images = rawRelease.contains__image.map(
			(imageJoin) => imageJoin.image[0],
		);
		delete release.contains__image;

		release.images = images
			.map(function ({ is_a_build_of__service, ...imageData }) {
				const image: BalenaSdk.ReleaseWithImageDetails['images'][number] = {
					...imageData,
					service_name: is_a_build_of__service[0].service_name,
				};
				return image;
			})
			.sort((a, b) => a.service_name.localeCompare(b.service_name));

		release.user = rawRelease.is_created_by__user[0];

		return release;
	}

	/**
	 * @summary Get all releases from an application
	 * @name getAllByApplication
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number} slugOrId - application slug (string) or id (number)
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object[]} - releases
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.getAllByApplication('myorganization/myapp').then(function(releases) {
	 * 	console.log(releases);
	 * });
	 *
	 * @example
	 * balena.models.release.getAllByApplication(123).then(function(releases) {
	 * 	console.log(releases);
	 * });
	 *
	 * @example
	 * balena.models.release.getAllByApplication('myorganization/myapp', function(error, releases) {
	 * 	if (error) throw error;
	 * 	console.log(releases);
	 * });
	 */
	async function getAllByApplication(
		slugOrId: string | number,
		options: BalenaSdk.PineOptions<BalenaSdk.Release> = {},
	): Promise<BalenaSdk.Release[]> {
		const { id } = await applicationModel().get(slugOrId, {
			$select: 'id',
		});
		return await pine.get({
			resource: 'release',
			options: mergePineOptions(
				{
					$filter: {
						belongs_to__application: id,
					},
					$orderby: 'created_at desc',
				},
				options,
			),
		});
	}

	/**
	 * @summary Get the latest successful release for an application
	 * @name getLatestByApplication
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number} slugOrId - application slug (string) or id (number)
	 * @param {Object} [options={}] - extra pine options to use
	 * @fulfil {Object|undefined} - release
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.getLatestByApplication('myorganization/myapp').then(function(releases) {
	 * 	console.log(releases);
	 * });
	 *
	 * @example
	 * balena.models.release.getLatestByApplication(123).then(function(releases) {
	 * 	console.log(releases);
	 * });
	 *
	 * @example
	 * balena.models.release.getLatestByApplication('myorganization/myapp', function(error, releases) {
	 * 	if (error) throw error;
	 * 	console.log(releases);
	 * });
	 */
	async function getLatestByApplication(
		slugOrId: string | number,
		options: BalenaSdk.PineOptions<BalenaSdk.Release> = {},
	): Promise<BalenaSdk.Release | undefined> {
		const [release] = await getAllByApplication(
			slugOrId,
			mergePineOptions(
				{
					$top: 1,
					$filter: {
						status: 'success',
					},
				},
				options,
			),
		);
		return release;
	}

	/**
	 * @summary Create a new release built from the source in the provided url
	 * @name createFromUrl
	 * @public
	 * @function
	 * @memberof balena.models.release
	 *
	 * @param {String|Number} slugOrId - application slug (string) or id (number)
	 * @param {Object} urlDeployOptions - builder options
	 * @param {String} urlDeployOptions.url - a url with a tarball of the project to build
	 * @param {Boolean} [urlDeployOptions.shouldFlatten=true] - Should be true when the tarball includes an extra root folder with all the content
	 * @fulfil {number} - release ID
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.release.createFromUrl('myorganization/myapp', { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	 * 	console.log(releaseId);
	 * });
	 *
	 * @example
	 * balena.models.release.createFromUrl(123, { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }).then(function(releaseId) {
	 * 	console.log(releaseId);
	 * });
	 *
	 * @example
	 * balena.models.release.createFromUrl('myorganization/myapp', { url: 'https://github.com/balena-io-projects/simple-server-node/archive/v1.0.0.tar.gz' }, function(error, releaseId) {
	 * 	if (error) throw error;
	 * 	console.log(releaseId);
	 * });
	 */
	async function createFromUrl(
		slugOrId: string | number,
		urlDeployOptions: BuilderUrlDeployOptions,
	): Promise<number> {
		const appOptions = {
			$select: 'app_name',
			$expand: {
				organization: {
					$select: 'handle',
				},
			},
		} as const;

		const { app_name, organization } = (await applicationModel().get(
			slugOrId,
			appOptions,
		)) as PineTypedResult<Application, typeof appOptions>;
		return await builderHelper().buildFromUrl(
			organization[0].handle,
			app_name,
			urlDeployOptions,
		);
	}

	/**
	 * @namespace balena.models.release.tags
	 * @memberof balena.models.release
	 */
	const tags = addCallbackSupportToModule({
		/**
		 * @summary Get all release tags for an application
		 * @name getAllByApplication
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {String|Number} slugOrId - application slug (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - release tags
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.getAllByApplication('myorganization/myapp').then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.release.tags.getAllByApplication(999999).then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.release.tags.getAllByApplication('myorganization/myapp', function(error, tags) {
		 * 	if (error) throw error;
		 * 	console.log(tags)
		 * });
		 */
		async getAllByApplication(
			slugOrId: string | number,
			options: BalenaSdk.PineOptions<BalenaSdk.ReleaseTag> = {},
		): Promise<BalenaSdk.ReleaseTag[]> {
			const { id } = await applicationModel().get(slugOrId, {
				$select: 'id',
			});
			return await tagsModel.getAll(
				mergePineOptions(
					{
						$filter: {
							release: {
								$any: {
									$alias: 'r',
									$expr: {
										r: {
											belongs_to__application: id,
										},
									},
								},
							},
						},
					},
					options,
				),
			);
		},

		/**
		 * @summary Get all release tags for a release
		 * @name getAllByRelease
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {String|Number} commitOrId - release commit (string) or id (number)
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - release tags
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.getAllByRelease(123).then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.release.tags.getAllByRelease('7cf02a6').then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.release.tags.getAllByRelease(123, function(error, tags) {
		 * 	if (error) throw error;
		 * 	console.log(tags)
		 * });
		 */
		async getAllByRelease(
			commitOrId: string | number,
			options: BalenaSdk.PineOptions<BalenaSdk.ReleaseTag> = {},
		): Promise<BalenaSdk.ReleaseTag[]> {
			const releaseOpts = {
				$select: 'id',
				$expand: {
					release_tag: mergePineOptions({ $orderby: 'tag_key asc' }, options),
				},
			} as const;

			const release = (await get(commitOrId, releaseOpts)) as PineTypedResult<
				Release,
				typeof releaseOpts
			>;
			return release.release_tag;
		},

		/**
		 * @summary Get all release tags
		 * @name getAll
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {Object} [options={}] - extra pine options to use
		 * @fulfil {Object[]} - release tags
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.getAll().then(function(tags) {
		 * 	console.log(tags);
		 * });
		 *
		 * @example
		 * balena.models.release.tags.getAll(function(error, tags) {
		 * 	if (error) throw error;
		 * 	console.log(tags)
		 * });
		 */
		getAll: tagsModel.getAll,

		/**
		 * @summary Set a release tag
		 * @name set
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {String|Number} commitOrId - release commit (string) or id (number)
		 * @param {String} tagKey - tag key
		 * @param {String|undefined} value - tag value
		 *
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.set(123, 'EDITOR', 'vim');
		 *
		 * @example
		 * balena.models.release.tags.set('7cf02a6', 'EDITOR', 'vim');
		 *
		 * @example
		 * balena.models.release.tags.set(123, 'EDITOR', 'vim', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		set: tagsModel.set,

		/**
		 * @summary Remove a release tag
		 * @name remove
		 * @public
		 * @function
		 * @memberof balena.models.release.tags
		 *
		 * @param {String|Number} commitOrId - release commit (string) or id (number)
		 * @param {String} tagKey - tag key
		 * @returns {Promise}
		 *
		 * @example
		 * balena.models.release.tags.remove(123, 'EDITOR');
		 *
		 * @example
		 * balena.models.release.tags.remove('7cf02a6', 'EDITOR');
		 *
		 * @example
		 * balena.models.release.tags.remove(123, 'EDITOR', function(error) {
		 * 	if (error) throw error;
		 * });
		 */
		remove: tagsModel.remove,
	});

	return {
		get,
		getAllByApplication,
		getLatestByApplication,
		getWithImageDetails,
		createFromUrl,
		tags,
	};
};

export default getReleaseModel;
