import * as bSemver from 'balena-semver';
import type { InjectedDependenciesParam } from '..';
import type {
	ResourceTagBase,
	ApplicationTag,
	Application,
	Release,
	DeviceType,
} from '../types/models';
import { Dictionary } from '../../typings/utils';
import { getAuthDependentMemoize } from '../util/cache';
import { maxSatisfying } from 'semver';

const RELEASE_POLICY_TAG_NAME = 'release-policy';
const ESR_NEXT_TAG_NAME = 'esr-next';
const ESR_CURRENT_TAG_NAME = 'esr-current';
const ESR_SUNSET_TAG_NAME = 'esr-sunset';
const VARIANT_TAG_NAME = 'variant';
const VERSION_TAG_NAME = 'version';
const BASED_ON_VERSION_TAG_NAME = 'meta-balena-base';

export enum OsTypes {
	DEFAULT = 'default',
	ESR = 'esr',
}

export type OsLines = 'next' | 'current' | 'sunset' | 'outdated' | undefined;

export interface OsVersion {
	id: number;
	rawVersion: string;
	strippedVersion: string;
	basedOnVersion?: string;
	osType: string;
	line?: OsLines;
	variant?: string;

	formattedVersion: string;
	isRecommended?: boolean;
}

export interface OsVersionsByDeviceType {
	[deviceTypeSlug: string]: OsVersion[];
}

const getHostappModel = function (deps: InjectedDependenciesParam) {
	const { pine, pubsub } = deps;

	type HostAppTagSet = ReturnType<typeof getOsAppTags>;
	type AppWithDeviceType = Application & {
		is_for__device_type: [{ slug: DeviceType['slug'] }];
	};

	const sortVersions = (a: OsVersion, b: OsVersion) => {
		return bSemver.rcompare(a.rawVersion, b.rawVersion);
	};

	const getTagValue = (tags: ResourceTagBase[], tagKey: string) => {
		return tags.find((tag) => tag.tag_key === tagKey)?.value;
	};

	const getOsAppTags = (applicationTag: ApplicationTag[]) => {
		return {
			osType:
				getTagValue(applicationTag, RELEASE_POLICY_TAG_NAME) ?? OsTypes.DEFAULT,
			nextLineVersionRange:
				getTagValue(applicationTag, ESR_NEXT_TAG_NAME) ?? '',
			currentLineVersionRange:
				getTagValue(applicationTag, ESR_CURRENT_TAG_NAME) ?? '',
			sunsetLineVersionRange:
				getTagValue(applicationTag, ESR_SUNSET_TAG_NAME) ?? '',
		};
	};

	const getOsVersionReleaseLine = (version: string, appTags: HostAppTagSet) => {
		// All patches belong to the same line.
		if (bSemver.satisfies(version, `^${appTags.nextLineVersionRange}`)) {
			return 'next';
		}
		if (bSemver.satisfies(version, `^${appTags.currentLineVersionRange}`)) {
			return 'current';
		}
		if (bSemver.satisfies(version, `^${appTags.sunsetLineVersionRange}`)) {
			return 'sunset';
		}

		if (appTags.osType?.toLowerCase() === OsTypes.ESR) {
			return 'outdated';
		}
	};

	const normalizeVariant = (variant: string) => {
		switch (variant) {
			case 'production':
				return 'prod';
			case 'development':
				return 'dev';
			default:
				return variant;
		}
	};

	const getOsVersionsFromReleases = (
		releases: Release[],
		appTags: HostAppTagSet,
	): OsVersion[] => {
		return releases.map((release) => {
			// The variant in the tags is a full noun, such as `production` and `development`.
			const variant =
				getTagValue(release.release_tag!, VARIANT_TAG_NAME) ?? 'production';
			const normalizedVariant = normalizeVariant(variant);
			const version = getTagValue(release.release_tag!, VERSION_TAG_NAME) ?? '';
			const basedOnVersion =
				getTagValue(release.release_tag!, BASED_ON_VERSION_TAG_NAME) ?? version;
			const line = getOsVersionReleaseLine(version, appTags);
			const lineFormat = line ? ` (${line})` : '';

			// TODO: Don't append the variant and sent it as a separate parameter when requesting a download when we don't use /device-types anymore and the API and image maker can handle it. Also rename `rawVersion` -> `versionWithVariant` if it is needed (it might not be needed anymore).
			// The version coming from release tags doesn't contain the variant, so we append it here
			return {
				id: release.id,
				osType: appTags.osType,
				line,
				strippedVersion: version,
				rawVersion: `${version}.${normalizedVariant}`,
				basedOnVersion,
				variant: normalizedVariant,
				formattedVersion: `v${version}${lineFormat}`,
			};
		});
	};

	const transformHostApps = (apps: AppWithDeviceType[]) => {
		const res: OsVersionsByDeviceType = apps.reduce(
			(osVersionsByDeviceType: OsVersionsByDeviceType, hostApp) => {
				if (!hostApp) {
					return osVersionsByDeviceType;
				}

				const hostAppDeviceType = hostApp.is_for__device_type[0].slug;

				if (!hostAppDeviceType) {
					return osVersionsByDeviceType;
				}

				let osVersions = osVersionsByDeviceType[hostAppDeviceType];
				if (!osVersions) {
					osVersions = [];
				}

				const appTags = getOsAppTags(hostApp.application_tag ?? []);
				osVersions = osVersions.concat(
					getOsVersionsFromReleases(hostApp.owns__release ?? [], appTags),
				);
				osVersionsByDeviceType[hostAppDeviceType] = osVersions;

				return osVersionsByDeviceType;
			},
			{},
		);

		return res;
	};

	const mapVersions = (versions: OsVersion[], type: OsTypes) => {
		return versions
			.filter((version) => version.osType === type)
			.map((v) => v.strippedVersion);
	};

	// This mutates the passed object.
	const transformVersionSets = (
		osVersionsByDeviceType: OsVersionsByDeviceType,
	) => {
		Object.keys(osVersionsByDeviceType).forEach((deviceType) => {
			osVersionsByDeviceType[deviceType].sort(sortVersions);
			const recommendedPerOsType: Dictionary<boolean> = {};

			// Note: the recommended version settings might come from the server in the future, for now we just set it to the latest version for each os type.
			osVersionsByDeviceType[deviceType].forEach((version) => {
				if (!recommendedPerOsType[version.osType]) {
					if (
						version.variant !== 'dev' &&
						!bSemver.prerelease(version.rawVersion)
					) {
						const additionalFormat = version.line
							? ` (${version.line}, recommended)`
							: ' (recommended)';

						version.isRecommended = true;
						version.formattedVersion = `v${version.strippedVersion}${additionalFormat}`;
						recommendedPerOsType[version.osType] = true;
					}
				}
			});
		});

		return osVersionsByDeviceType;
	};

	const getOsVersions = (deviceTypes: string[]) => {
		return pine.get<AppWithDeviceType>({
			resource: 'application',
			options: {
				$filter: {
					is_host: true,
					is_for__device_type: {
						$any: {
							$alias: 'dt',
							$expr: {
								dt: {
									slug: { $in: deviceTypes },
								},
							},
						},
					},
				},
				$select: ['id', 'app_name'],
				$expand: {
					application_tag: {
						$select: ['id', 'tag_key', 'value'],
					},
					is_for__device_type: {
						$select: ['slug'],
					},
					owns__release: {
						$select: ['id'],
						$expand: {
							release_tag: {
								$select: ['id', 'tag_key', 'value'],
							},
						},
						$filter: {
							is_invalidated: false,
						},
					},
				},
			},
		});
	};

	const getTransformedOsVersions = async (deviceTypes: string[]) => {
		const hostapps = await getOsVersions(deviceTypes);
		return transformVersionSets(transformHostApps(hostapps));
	};

	const memoizedGetTransformedOsVersions = getAuthDependentMemoize(pubsub)(
		getTransformedOsVersions,
	);

	/**
	 * @summary Get all OS versions for the passed device types
	 * @name getAllOsVersions
	 * @public
	 * @function
	 * @memberof balena.models.hostapp
	 *
	 * @param {String[]} deviceTypes - device type slugs
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.hostapp.getAllOsVersions(['fincm3', 'raspberrypi3']);
	 */
	const getAllOsVersions = async (
		deviceTypes: string[],
	): Promise<OsVersionsByDeviceType> => {
		const sortedDeviceTypes = deviceTypes.sort();
		return memoizedGetTransformedOsVersions(sortedDeviceTypes);
	};

	/**
	 * @summary Get latest OS versions for the passed device types
	 * @name getLatestOsVersions
	 * @public
	 * @function
	 * @memberof balena.models.hostapp
	 *
	 * @param {String[]} deviceTypes - device type slugs
	 * @returns {Promise}
	 *
	 * @example
	 * balena.models.hostapp.getLatestOsVersions(['fincm3', 'raspberrypi3']);
	 */
	const getLatestOsVersions = async (
		deviceTypes: string[],
	): Promise<OsVersionsByDeviceType> => {
		const allOsVersions = await getAllOsVersions(deviceTypes);
		return Object.entries(allOsVersions).reduce(
			(osVersionsByDeviceType: OsVersionsByDeviceType, [key, versions]) => {
				const latestOSVersion = maxSatisfying(
					mapVersions(versions, OsTypes.DEFAULT),
					'>0.0.0',
				);
				const latestESRVersion = maxSatisfying(
					mapVersions(versions, OsTypes.ESR),
					'>0.0.0',
				);
				const filteredVersions = versions.filter(
					(v) =>
						v.strippedVersion === latestOSVersion ||
						v.strippedVersion === latestESRVersion,
				)!;
				osVersionsByDeviceType[key] = filteredVersions;
				return osVersionsByDeviceType;
			},
			{},
		);
	};

	return {
		OsTypes,
		getAllOsVersions,
		getLatestOsVersions,
	};
};

export default getHostappModel;
