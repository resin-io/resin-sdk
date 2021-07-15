import * as bSemver from 'balena-semver';
// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as m from 'mochainon';
import * as parallel from 'mocha.parallel';
import {
	balena,
	credentials,
	givenAnApplication,
	givenLoggedInUser,
	IS_BROWSER,
	applicationRetrievalFields,
} from '../setup';
import { timeSuite } from '../../util';
import type * as BalenaSdk from '../../..';
import type { Resolvable } from '../../../typings/utils';
const { expect } = m.chai;

const eventuallyExpectProperty = <T>(promise: Promise<T>, prop: string) =>
	expect(promise).to.eventually.have.property(prop);

const {
	_getDeviceTypes,
	_getOsVersions,
	_getDownloadSize,
	_getMaxSatisfyingVersion,
	_clearDeviceTypesEndpointCaches,
} = balena.models.os as ReturnType<
	typeof import('../../../lib/models/os').default
>;

// tslint:disable-next-line:variable-name
const itShouldClear_getDeviceTypesCache = (stepFn: () => Resolvable<void>) =>
	it('should clear the result cache of balena.models.os._getDeviceTypes()', async function () {
		const p1 = _getDeviceTypes();
		const result1 = await p1;
		await stepFn();

		const p2 = _getDeviceTypes();
		const result2 = await p2;

		// the endpoint doesn't sort the device types atm
		[result1, result2].forEach((dtArray) =>
			dtArray.sort((a, b) => a.slug.localeCompare(b.slug)),
		);

		expect(result1).to.deep.equal(result2);
		expect(p1).to.not.equal(p2);
	});

// tslint:disable-next-line:variable-name
const itShouldClear_getOsVersionsCache = (stepFn: () => Resolvable<void>) =>
	it('should clear the result cache of balena.models.os._getOsVersions()', async function () {
		const p1 = _getOsVersions('raspberry-pi');
		const result1 = await p1;
		await stepFn();

		const p2 = _getOsVersions('raspberry-pi');
		const result2 = await p2;

		expect(result1).to.deep.equal(result2);
		expect(p1).to.not.equal(p2);
	});

// tslint:disable-next-line:variable-name
const itShouldClear_getDownloadSizeCache = (stepFn: () => Resolvable<void>) =>
	it('should clear the result cache of balena.models.os._getDownloadSize()', async function () {
		const p1 = _getDownloadSize('raspberry-pi', '1.26.1');
		const result1 = await p1;
		await stepFn();

		const p2 = _getDownloadSize('raspberry-pi', '1.26.1');
		const result2 = await p2;

		expect(result1).to.deep.equal(result2);
		expect(p1).to.not.equal(p2);
	});

const describeAllAuthUserChanges = function (
	itFnWithStep: (fn: () => Resolvable<void>) => Mocha.Test,
) {
	describe('when not logged in', function () {
		beforeEach(() => balena.auth.logout());

		describe('balena.auth.logout()', () =>
			itFnWithStep(() => balena.auth.logout()));

		describe('balena.auth.login()', () =>
			itFnWithStep(() =>
				balena.auth.login({
					email: credentials.email,
					password: credentials.password,
				}),
			));

		describe('balena.auth.loginWithToken()', () =>
			itFnWithStep(() =>
				balena.auth.authenticate(credentials).then(balena.auth.loginWithToken),
			));
	});

	describe('when logged in with credentials', function () {
		givenLoggedInUser(beforeEach);

		afterEach(() => balena.auth.logout());

		describe('balena.auth.logout()', () =>
			itFnWithStep(() => balena.auth.logout()));

		describe('balena.auth.login()', () =>
			itFnWithStep(() =>
				balena.auth.login({
					email: credentials.email,
					password: credentials.password,
				}),
			));

		describe('balena.auth.loginWithToken()', () =>
			itFnWithStep(() =>
				balena.auth.authenticate(credentials).then(balena.auth.loginWithToken),
			));
	});
};

describe('OS model', function () {
	timeSuite(before);
	before(function () {
		return balena.auth.logout();
	});

	describe('balena.models.os._getMaxSatisfyingVersion()', function () {
		const osVersions = {
			versions: [
				'2.0.1+rev2.prod',
				'2.0.1+rev2.dev',
				'2.0.0.rev1',
				'2.0.0-rc1.rev2-dev',
				'2.0.0-rc1.rev2',
				'1.24.1',
				'1.24.0',
				'1.8.0',
			],
			recommended: '1.24.1',
			latest: '2.0.0.rev1',
			default: '1.24.1',
		};

		it("should support 'latest'", () =>
			expect(_getMaxSatisfyingVersion('latest', osVersions)).to.equal(
				osVersions.latest,
			));

		it("should support 'recommended'", () =>
			expect(_getMaxSatisfyingVersion('recommended', osVersions)).to.equal(
				osVersions.recommended,
			));

		it("should support 'default'", () =>
			expect(_getMaxSatisfyingVersion('default', osVersions)).to.equal(
				osVersions.default,
			));

		it('should support exact version', () =>
			expect(_getMaxSatisfyingVersion('1.24.1', osVersions)).to.equal(
				'1.24.1',
			));

		it('should support exact non-semver version', () =>
			expect(_getMaxSatisfyingVersion('2.0.0.rev1', osVersions)).to.equal(
				'2.0.0.rev1',
			));

		it('should return an exact match, if it exists, when given a specific version', () =>
			// Concern here is that semver says .dev is equivalent to .prod, but
			// we want provide an exact version and use _exactly_ that version.
			expect(_getMaxSatisfyingVersion('2.0.1+rev2.dev', osVersions)).to.equal(
				'2.0.1+rev2.dev',
			));

		it('should return an equivalent result, if no exact result exists, when given a specific version', () =>
			expect(_getMaxSatisfyingVersion('2.0.1+rev2', osVersions)).to.equal(
				'2.0.1+rev2.prod',
			));

		it('should support semver ranges', () =>
			expect(_getMaxSatisfyingVersion('^1.24.0', osVersions)).to.equal(
				'1.24.1',
			));

		it('should support non-semver version ranges', () =>
			expect(_getMaxSatisfyingVersion('^2.0.0.rev1', osVersions)).to.equal(
				'2.0.1+rev2.prod',
			));

		it('should drop unsupported exact versions', () =>
			expect(_getMaxSatisfyingVersion('1.24.5', osVersions)).to.equal(null));

		it('should drop unsupported semver ranges', () =>
			expect(_getMaxSatisfyingVersion('~1.30.0', osVersions)).to.equal(null));
	});

	describe('balena.models.os.getSupportedVersions()', function () {
		parallel('given a valid device slug', function () {
			const expectSorted = (
				array: string[],
				comparator: <T extends string | null | undefined>(a: T, b: T) => number, // re-sorting could fail when the system is not using a stable
			) =>
				// sorting algorithm, in which case items of the same value
				// might swap positions in the array
				array.forEach(function (item, i) {
					if (i === 0) {
						return;
					}

					const previousItem = array[i - 1];
					expect(comparator(previousItem, item)).to.be.lte(0);
				});

			const areValidVersions = function (osVersions: BalenaSdk.OsVersions) {
				expect(osVersions).to.be.an('object');
				expect(osVersions).to.have.property('versions').that.is.an('array');
				expect(osVersions.versions).to.not.have.lengthOf(0);

				expectSorted(osVersions.versions, bSemver.rcompare);

				expect(osVersions).to.have.property('latest').that.is.a('string');
				expect(osVersions).to.have.property('recommended').that.is.a('string');
				expect(osVersions).to.have.property('default').that.is.a('string');
				expect(osVersions.default).to.equal(osVersions.recommended);

				return true;
			};

			it('should eventually return the valid versions object', function () {
				const promise = balena.models.os.getSupportedVersions('raspberry-pi');
				return expect(promise).to.eventually.satisfy(areValidVersions);
			});

			it('should eventually return the valid versions object if passing a device type alias', function () {
				const promise = balena.models.os.getSupportedVersions('raspberrypi');
				return expect(promise).to.eventually.satisfy(areValidVersions);
			});

			it('should cache the results', () =>
				balena.models.os
					.getSupportedVersions('raspberry-pi')
					.then((result1) =>
						balena.models.os
							.getSupportedVersions('raspberry-pi')
							.then((result2) => expect(result1).to.equal(result2)),
					));

			it('should cache the supported versions independently for each device type', () =>
				Promise.all([
					balena.models.os.getSupportedVersions('raspberry-pi'),
					balena.models.os.getSupportedVersions('raspberrypi3'),
				]).then(function ([deviceType1Versions, deviceType2Versions]) {
					expect(deviceType1Versions).not.to.equal(deviceType2Versions);
				}));
		});

		describe('given an invalid device slug', () =>
			it('should be rejected with an error message', function () {
				const promise = balena.models.os.getSupportedVersions('foo-bar-baz');
				return expect(promise).to.be.rejectedWith('No such device type');
			}));
	});

	describe('balena.models.os._getDeviceTypes()', function () {
		it('should cache the results', function () {
			const p1 = _getDeviceTypes();
			return p1.then(function (result1) {
				const p2 = _getDeviceTypes();
				return p2.then(function (result2) {
					expect(result1).to.equal(result2);
					expect(p1).to.equal(p2);
				});
			});
		});

		describeAllAuthUserChanges(itShouldClear_getDeviceTypesCache);
	});

	describe('balena.models.os._getOsVersions()', function () {
		it('should cache the results', function () {
			const p1 = _getOsVersions('raspberry-pi');
			return p1.then(function (result1) {
				const p2 = _getOsVersions('raspberry-pi');
				return p2.then(function (result2) {
					expect(result1).to.equal(result2);
					expect(p1).to.equal(p2);
				});
			});
		});

		describeAllAuthUserChanges(itShouldClear_getOsVersionsCache);
	});

	describe('balena.models.os.getDownloadSize()', function () {
		parallel('given a valid device slug', function () {
			it('should eventually be a valid number', function () {
				const promise = balena.models.os.getDownloadSize('raspberry-pi');
				return expect(promise).to.eventually.be.a('number');
			});

			it('should eventually be a valid number if passing a device type alias', function () {
				const promise = balena.models.os.getDownloadSize('raspberrypi');
				return expect(promise).to.eventually.be.a('number');
			});
		});

		parallel('given a specific OS version', function () {
			it('should get a result for ResinOS v1', function () {
				const promise = balena.models.os.getDownloadSize(
					'raspberry-pi',
					'1.26.1',
				);
				return expect(promise).to.eventually.be.a('number');
			});

			it('should get a result for ResinOS v2', function () {
				const promise = balena.models.os.getDownloadSize(
					'raspberry-pi',
					'2.0.6+rev3.prod',
				);
				return expect(promise).to.eventually.be.a('number');
			});

			it('should cache the results', () =>
				balena.models.os
					.getDownloadSize('raspberry-pi', '1.26.1')
					.then((result1) =>
						balena.models.os
							.getDownloadSize('raspberry-pi', '1.26.1')
							.then((result2) => expect(result1).to.equal(result2)),
					));

			it('should cache download sizes independently for each version', () =>
				Promise.all([
					balena.models.os.getDownloadSize('raspberry-pi', '1.26.1'),
					balena.models.os.getDownloadSize('raspberry-pi', '2.0.6+rev3.prod'),
				]).then(function ([os1Size, os2Size]) {
					expect(os1Size).not.to.equal(os2Size);
				}));
		});

		describe('given an invalid device slug', () =>
			it('should be rejected with an error message', function () {
				const promise = balena.models.os.getDownloadSize('foo-bar-baz');
				return expect(promise).to.be.rejectedWith('No such device type');
			}));
	});

	describe('balena.models.os._getDownloadSize()', function () {
		it('should cache the results', function () {
			const p1 = _getDownloadSize('raspberry-pi', '1.26.1');
			return p1.then(function (result1) {
				const p2 = _getDownloadSize('raspberry-pi', '1.26.1');
				return p2.then(function (result2) {
					expect(result1).to.equal(result2);
					expect(p1).to.equal(p2);
				});
			});
		});

		describeAllAuthUserChanges(itShouldClear_getDownloadSizeCache);
	});

	describe('balena.models.os._clearDeviceTypesEndpointCaches()', function () {
		itShouldClear_getDeviceTypesCache(() => _clearDeviceTypesEndpointCaches());

		itShouldClear_getOsVersionsCache(() => _clearDeviceTypesEndpointCaches());

		itShouldClear_getDownloadSizeCache(() => _clearDeviceTypesEndpointCaches());
	});

	describe('balena.models.os.getLastModified()', function () {
		parallel('given a valid device slug', function () {
			it('should eventually be a valid Date instance', function () {
				const promise = balena.models.os.getLastModified('raspberry-pi');
				return expect(promise).to.eventually.be.an.instanceof(Date);
			});

			it('should eventually be a valid Date instance if passing a device type alias', function () {
				const promise = balena.models.os.getLastModified('raspberrypi');
				return expect(promise).to.eventually.be.an.instanceof(Date);
			});

			it('should be able to query for a specific version', function () {
				const promise = balena.models.os.getLastModified(
					'raspberrypi',
					'1.26.1',
				);
				return expect(promise).to.eventually.be.an.instanceof(Date);
			});

			it('should be able to query for a version containing a plus', function () {
				const promise = balena.models.os.getLastModified(
					'raspberrypi',
					'2.0.6+rev3.prod',
				);
				return expect(promise).to.eventually.be.an.instanceof(Date);
			});
		});

		describe('given an invalid device slug', () =>
			it('should be rejected with an error message', function () {
				const promise = balena.models.os.getLastModified('foo-bar-baz');
				return expect(promise).to.be.rejectedWith('No such device type');
			}));
	});

	describe('balena.models.os.download()', function () {
		if (IS_BROWSER) {
			return;
		}

		const rindle = require('rindle');
		const tmp = require('tmp');
		const fs = require('fs') as typeof import('fs');

		describe('given a valid device slug', function () {
			it('should contain a valid mime property', () =>
				balena.models.os
					.download('raspberry-pi')
					.then((stream) =>
						expect(stream.mime).to.equal('application/octet-stream'),
					));

			it('should contain a valid mime property if passing a device type alias', () =>
				balena.models.os
					.download('raspberrypi')
					.then((stream) =>
						expect(stream.mime).to.equal('application/octet-stream'),
					));

			it('should be able to download the image', function () {
				const tmpFile = tmp.tmpNameSync();
				return balena.models.os
					.download('raspberry-pi')
					.then((stream) => stream.pipe(fs.createWriteStream(tmpFile)))
					.then(rindle.wait)
					.then(() => fs.promises.stat(tmpFile))
					.then((stat) => expect(stat.size).to.not.equal(0))
					.finally(() => fs.promises.unlink(tmpFile));
			});
		});

		describe('given an invalid device slug', () =>
			it('should be rejected with an error message', function () {
				const promise = balena.models.os.download('foo-bar-baz');
				return expect(promise).to.be.rejectedWith('No such device type');
			}));

		describe('given well formed and malformed balenaOS versions', () => {
			it('should reject malformed versions with an error', async () => {
				const versions = [
					'2.60.1+foo',
					'2.60.1-foo',
					'2.60.1.foo',
					'2.60.1+rev',
					'2.60.1+rev1+foo',
					'2.60.1+rev1-foo',
					'2.60.1+rev1.foo',
					'2.60.1+rev1.dev.foo',
					'2.60.1+rev1.prod.foo',
				];
				for (const version of [...versions]) {
					versions.push(`v${version}`);
				}
				for (const version of versions) {
					await expect(
						balena.models.os.download('raspberry-pi', version),
					).to.be.rejectedWith(`Invalid balenaOS version format: ${version}`);
				}
			});

			it('should accept well formed versions', async () => {
				const versions = [
					'0.0.1',
					'0.0.1.dev',
					'0.0.1.prod',
					'0.0.1+rev1',
					'0.0.1+rev1.dev',
					'0.0.1+rev1.prod',
				];
				for (const version of [...versions]) {
					versions.push(`v${version}`);
				}
				for (const version of versions) {
					await expect(
						balena.models.os.download('raspberry-pi', version),
					).to.be.rejectedWith(`No such version for the device type`);
				}
			});
		});
	});

	describe('balena.models.os.isSupportedOsUpdate()', function () {
		describe('given an invalid device slug', () =>
			it('should be rejected with an error message', function () {
				const promise = balena.models.os.isSupportedOsUpdate(
					'foo-bar-baz',
					'2.0.0+rev1.prod',
					'2.29.2+rev1.prod',
				);
				return expect(promise).to.be.rejectedWith('No such device type');
			}));

		describe('given a valid device slug', function () {
			describe('given a unsupported low starting version number', () =>
				it('should return false', () =>
					expect(
						balena.models.os.isSupportedOsUpdate(
							'raspberrypi3',
							'2.0.0+rev0.prod',
							'2.2.0+rev2.prod',
						),
					).to.eventually.equal(false)));

			describe('given a unsupported low target version number', () =>
				it('should return false', () =>
					expect(
						balena.models.os.isSupportedOsUpdate(
							'raspberrypi3',
							'2.0.0+rev1.prod',
							'2.1.0+rev1.prod',
						),
					).to.eventually.equal(false)));

			describe('given a dev starting version number', () =>
				it('should return false', () =>
					expect(
						balena.models.os.isSupportedOsUpdate(
							'raspberrypi3',
							'2.0.0+rev1.dev',
							'2.2.0+rev2.prod',
						),
					).to.eventually.equal(false)));

			describe('given a dev target version number', () =>
				it('should return false', () =>
					expect(
						balena.models.os.isSupportedOsUpdate(
							'raspberrypi3',
							'2.0.0+rev1.prod',
							'2.1.0+rev1.dev',
						),
					).to.eventually.equal(false)));

			describe('given a supported os update path', () =>
				it('should return true', () =>
					expect(
						balena.models.os.isSupportedOsUpdate(
							'raspberrypi3',
							'2.0.0+rev1.prod',
							'2.2.0+rev2.prod',
						),
					).to.eventually.equal(true)));
		});
	});

	describe('balena.models.os.getSupportedOsUpdateVersions()', function () {
		describe('given an invalid device slug', () =>
			it('should be rejected with an error message', function () {
				const promise = balena.models.os.getSupportedOsUpdateVersions(
					'foo-bar-baz',
					'2.9.6+rev1.prod',
				);
				return expect(promise).to.be.rejectedWith('No such device type');
			}));

		describe('given a valid device slug', () =>
			it('should return the list of supported hup targets', () =>
				balena.models.os
					.getSupportedOsUpdateVersions('raspberrypi3', '2.9.6+rev1.prod')
					.then(function ({ current, recommended, versions }) {
						expect(current).to.equal('2.9.6+rev1.prod');
						expect(recommended).to.be.a('string');
						expect(versions).to.be.an('array');
						expect(versions).to.not.have.length(0);
						_.each(versions, function (v) {
							expect(v).to.be.a('string');
							expect(bSemver.gte(v, current)).to.be.true;
						});

						expect(versions.length > 2).to.be.true;
						const sortedVersions = versions.slice().sort(bSemver.rcompare);
						expect(versions).to.deep.equal(sortedVersions);
					})));
	});

	describe('when logged in as a user with a single application', function () {
		givenLoggedInUser(before);
		givenAnApplication(before);

		let ctx: Mocha.Context;
		before(function () {
			ctx = this;
		});

		parallel('balena.models.os.getConfig()', function () {
			const DEFAULT_OS_VERSION = '2.12.7+rev1.prod';

			it('should fail if no version option is provided', function () {
				return expect(
					(balena.models.os.getConfig as any)(ctx.application.id),
				).to.be.rejectedWith(
					'An OS version is required when calling os.getConfig',
				);
			});

			applicationRetrievalFields.forEach((prop) => {
				it(`should be able to get an application config by ${prop}`, function () {
					const promise = balena.models.os.getConfig(ctx.application[prop], {
						version: DEFAULT_OS_VERSION,
					});
					return Promise.all([
						eventuallyExpectProperty(promise, 'applicationId'),
						eventuallyExpectProperty(promise, 'apiKey'),
						eventuallyExpectProperty(promise, 'userId'),
						eventuallyExpectProperty(promise, 'deviceType'),
						eventuallyExpectProperty(promise, 'apiEndpoint'),
						eventuallyExpectProperty(promise, 'registryEndpoint'),
						eventuallyExpectProperty(promise, 'vpnEndpoint'),
						eventuallyExpectProperty(promise, 'listenPort'),
					]);
				});
			});

			it('should be rejected if the version is invalid', function () {
				const promise = balena.models.os.getConfig(ctx.application.id, {
					version: 'v1+foo',
				});
				return expect(promise).to.be.rejected.then((error) => {
					expect(error).to.have.property('message');
					expect(error.message.replace('&lt;', '<')).to.contain(
						'balenaOS versions <= 1.2.0 are no longer supported, please update',
					);
				});
			});

			it('should be rejected if the version is <= 1.2.0', function () {
				const promise = balena.models.os.getConfig(ctx.application.id, {
					version: '1.2.0',
				});
				return expect(promise).to.be.rejected.then((error) => {
					expect(error).to.have.property('message');
					expect(error.message.replace('&lt;', '<')).to.contain(
						'balenaOS versions <= 1.2.0 are no longer supported, please update',
					);
				});
			});

			it('should be able to configure v1 image parameters', function () {
				const configOptions = {
					appUpdatePollInterval: 72,
					network: 'wifi' as const,
					wifiKey: 'foobar',
					wifiSsid: 'foobarbaz',
					ip: '1.2.3.4',
					gateway: '5.6.7.8',
					netmask: '9.10.11.12',
					version: '1.26.1',
				};
				return balena.models.os
					.getConfig(ctx.application.id, configOptions)
					.then(function (config) {
						expect(config).to.deep.match({
							// NOTE: the interval is converted to ms in the config object
							appUpdatePollInterval:
								configOptions.appUpdatePollInterval * 60 * 1000,
							wifiKey: configOptions.wifiKey,
							wifiSsid: configOptions.wifiSsid,
						});
						expect(config)
							.to.have.property('files')
							.that.has.property('network/network.config')
							.that.includes(
								`${configOptions.ip}/${configOptions.netmask}/${configOptions.gateway}`,
							);
					});
			});

			it('should be able to configure v2 image parameters', function () {
				const configOptions = {
					appUpdatePollInterval: 72,
					network: 'wifi' as const,
					wifiKey: 'foobar',
					wifiSsid: 'foobarbaz',
					ip: '1.2.3.4',
					gateway: '5.6.7.8',
					netmask: '9.10.11.12',
					version: '2.0.8+rev1.prod',
				};
				return balena.models.os
					.getConfig(ctx.application.id, configOptions)
					.then(function (config) {
						expect(config).to.deep.match({
							// NOTE: the interval is converted to ms in the config object
							appUpdatePollInterval:
								configOptions.appUpdatePollInterval * 60 * 1000,
							wifiKey: configOptions.wifiKey,
							wifiSsid: configOptions.wifiSsid,
						});
						expect(config).to.not.have.property('files');
					});
			});

			it('should be rejected if the application id does not exist', function () {
				const promise = balena.models.os.getConfig(999999, {
					version: DEFAULT_OS_VERSION,
				});
				return expect(promise).to.be.rejectedWith(
					'Application not found: 999999',
				);
			});

			it('should be rejected if the application name does not exist', function () {
				const promise = balena.models.os.getConfig('foobarbaz', {
					version: DEFAULT_OS_VERSION,
				});
				return expect(promise).to.be.rejectedWith(
					'Application not found: foobarbaz',
				);
			});
		});
	});

	describe('helpers', () =>
		describe('balena.models.os.isArchitectureCompatibleWith()', function () {
			[
				['armv7hf', 'i386'],
				['aarch64', 'i386'],
				['i386', 'armv7hf'],
				['i386', 'aarch64'],
				['armv7hf', 'amd64'],
				['aarch64', 'amd64'],
				['amd64', 'armv7hf'],
				['amd64', 'aarch64'],
				['amd64', 'i386'],
				['i386', 'amd64'],
				// arm architectures
				['armv5e', 'rpi'],
				['armv5e', 'armv7hf'],
				['armv5e', 'aarch64'],
				['rpi', 'armv5e'],
				['rpi', 'armv7hf'],
				['rpi', 'aarch64'],
				['armv7hf', 'armv5e'],
				['armv7hf', 'aarch64'],
				['aarch64', 'armv5e'],
			].forEach(function ([deviceArch, appArch]) {
				it(`should return false when comparing ${deviceArch} and ${appArch} architectures`, () => expect(balena.models.os.isArchitectureCompatibleWith(deviceArch, appArch)).to.equal(false));
			});

			it('should return true when comparing the same architecture slugs', function () {
				expect(
					balena.models.os.isArchitectureCompatibleWith('rpi', 'rpi'),
				).to.equal(true);
				expect(
					balena.models.os.isArchitectureCompatibleWith('armv5e', 'armv5e'),
				).to.equal(true);
				expect(
					balena.models.os.isArchitectureCompatibleWith('armv7hf', 'armv7hf'),
				).to.equal(true);
				expect(
					balena.models.os.isArchitectureCompatibleWith('aarch64', 'aarch64'),
				).to.equal(true);
				expect(
					balena.models.os.isArchitectureCompatibleWith('i386', 'i386'),
				).to.equal(true);
				expect(
					balena.models.os.isArchitectureCompatibleWith('i386-nlp', 'i386-nlp'),
				).to.equal(true);
				expect(
					balena.models.os.isArchitectureCompatibleWith('amd64', 'amd64'),
				).to.equal(true);
			});

			return [
				['aarch64', 'armv7hf'],
				['aarch64', 'rpi'],
				['armv7hf', 'rpi'],
			].forEach(function ([deviceArch, appArch]) {
				it(`should return true when comparing ${deviceArch} and ${appArch} architectures`, () => expect(balena.models.os.isArchitectureCompatibleWith(deviceArch, appArch)).to.equal(true));
			});
		}));
});
