import * as _ from 'lodash';
import * as m from 'mochainon';
import * as parallel from 'mocha.parallel';
import * as superagent from 'superagent';

import {
	balena,
	deviceUniqueFields,
	givenADevice,
	givenASupervisorRelease,
	givenAnApplication,
	givenLoggedInUser,
	givenMulticontainerApplication,
	givenInitialOrganization,
	sdkOpts,
	IS_BROWSER,
	applicationRetrievalFields,
	testDeviceOsInfo,
} from '../setup';
import { timeSuite } from '../../util';
import {
	itShouldSetGetAndRemoveTags,
	itShouldGetAllTagsByResource,
} from './tags';

const { expect } = m.chai;

const makeRequest = (url) =>
	new Promise((resolve) =>
		superagent.get(url).end(
			(
				err,
				res, // have to normalize because of different behaviour in the browser and node
			) =>
				resolve({
					status: res?.status || err.status || 0,
					isError: !!err,
					response: res?.text,
				}),
		),
	);

describe('Device Model', function () {
	timeSuite(before);
	givenLoggedInUser(before);
	givenInitialOrganization(before);

	describe('given no applications', function () {
		parallel('balena.models.device.getManifestBySlug()', function () {
			it('should become the manifest if the slug is valid', async () => {
				const manifest = await balena.models.device.getManifestBySlug(
					'raspberry-pi',
				);
				expect(_.isPlainObject(manifest)).to.be.true;
				expect(manifest.slug).to.exist;
				expect(manifest.name).to.exist;
				return expect(manifest.options).to.exist;
			});

			it('should be rejected if the device slug is invalid', function () {
				const promise = balena.models.device.getManifestBySlug('foobar');
				return expect(promise).to.be.rejectedWith(
					'Invalid device type: foobar',
				);
			});

			it('should become the manifest given a device type alias', async () => {
				const manifest = await balena.models.device.getManifestBySlug(
					'raspberrypi',
				);
				return expect(manifest.slug).to.equal('raspberry-pi');
			});
		});
	});

	describe('given an application', function () {
		givenAnApplication(before);

		describe('given no device [contained scenario]', function () {
			describe('[read operations]', function () {
				let ctx = null;

				before(function () {
					ctx = this;
				});

				describe('balena.models.device.getAll()', () =>
					it('should become an empty array', function () {
						const promise = balena.models.device.getAll();
						return expect(promise).to.become([]);
					}));

				describe('balena.models.device.getAllByApplication()', () =>
					it('should become an empty array', function () {
						const promise = balena.models.device.getAllByApplication(
							ctx.application.id,
						);
						return expect(promise).to.become([]);
					}));

				parallel('balena.models.device.generateUniqueKey()', function () {
					it('should generate a valid uuid', function () {
						const uuid = balena.models.device.generateUniqueKey();

						expect(uuid).to.be.a('string');
						expect(uuid).to.have.length(32);
						return expect(uuid).to.match(/^[a-z0-9]{32}$/);
					});

					it('should generate different uuids', function () {
						const one = balena.models.device.generateUniqueKey();
						const two = balena.models.device.generateUniqueKey();
						const three = balena.models.device.generateUniqueKey();

						expect(one).to.not.equal(two);
						return expect(two).to.not.equal(three);
					});
				});

				parallel(
					'balena.models.device.getManifestByApplication()',
					function () {
						applicationRetrievalFields.forEach((prop) =>
							it(`should return the appropriate manifest for an application ${prop}`, async function () {
								const manifest =
									await balena.models.device.getManifestByApplication(
										ctx.application[prop],
									);
								return expect(manifest.slug).to.equal(
									ctx.applicationDeviceType.slug,
								);
							}),
						);

						it('should be rejected if the application name does not exist', function () {
							const promise =
								balena.models.device.getManifestByApplication('HelloWorldApp');
							return expect(promise).to.be.rejectedWith(
								'Application not found: HelloWorldApp',
							);
						});

						it('should be rejected if the application id does not exist', function () {
							const promise =
								balena.models.device.getManifestByApplication(999999);
							return expect(promise).to.be.rejectedWith(
								'Application not found: 999999',
							);
						});
					},
				);
			});

			describe('balena.models.device.register()', function () {
				it('should be rejected if the application name does not exist', function () {
					const uuid = balena.models.device.generateUniqueKey();
					const promise = balena.models.device.register('HelloWorldApp', uuid);
					return expect(promise).to.be.rejectedWith(
						'Application not found: HelloWorldApp',
					);
				});

				it('should be rejected if the application id does not exist', function () {
					const uuid = balena.models.device.generateUniqueKey();
					const promise = balena.models.device.register(999999, uuid);
					return expect(promise).to.be.rejectedWith(
						'Application not found: 999999',
					);
				});

				describe('[mutating operations]', function () {
					after(async function () {
						await balena.pine.delete({
							resource: 'device',
							options: {
								$filter: {
									belongs_to__application: this.application.id,
								},
							},
						});
					});

					applicationRetrievalFields.forEach((prop, i) => {
						it(`should be able to register a device to a valid application ${prop}`, async function () {
							const uuid = balena.models.device.generateUniqueKey();
							await balena.models.device.register(this.application[prop], uuid);
							const apps = await balena.models.device.getAllByApplication(
								this.application.app_name,
							);
							expect(apps).to.have.length(i + 1);
						});
					});

					it('should become valid device registration info', async function () {
						const uuid = balena.models.device.generateUniqueKey();
						const deviceInfo = await balena.models.device.register(
							this.application.id,
							uuid,
						);
						expect(deviceInfo.uuid).to.equal(uuid);
						expect(deviceInfo.api_key).to.be.a('string');
					});
				});
			});
		});

		describe('given a single offline device', function () {
			describe('[read operations]', function () {
				givenADevice(before);

				let ctx = null;
				before(function () {
					ctx = this;
				});

				parallel('balena.models.device.getAll()', function () {
					it('should become the device', async function () {
						const devices = await balena.models.device.getAll();
						expect(devices).to.have.length(1);
						return expect(devices[0].id).to.equal(ctx.device.id);
					});

					it('should support arbitrary pinejs options', async function () {
						const [device] = await balena.models.device.getAll({
							$select: ['id'],
						});
						expect(device.id).to.equal(ctx.device.id);
						return expect(device.device_name).to.equal(undefined);
					});

					it('should be able to retrieve computed terms', async () => {
						const [device] = await balena.models.device.getAll({
							$select: ['overall_status', 'overall_progress'],
						});
						return expect(device).to.deep.match({
							overall_status: 'inactive',
							overall_progress: null,
						});
					});
				});

				parallel('balena.models.device.getAllByApplication()', function () {
					applicationRetrievalFields.forEach((prop) =>
						it(`should get the device given the right application ${prop}`, async function () {
							const devices = await balena.models.device.getAllByApplication(
								ctx.application[prop],
							);
							expect(devices).to.have.length(1);
							return expect(devices[0].id).to.equal(ctx.device.id);
						}),
					);

					it('should be rejected if the application name does not exist', function () {
						const promise =
							balena.models.device.getAllByApplication('HelloWorldApp');
						return expect(promise).to.be.rejectedWith(
							'Application not found: HelloWorldApp',
						);
					});

					it('should be rejected if the application id does not exist', function () {
						const promise = balena.models.device.getAllByApplication(999999);
						return expect(promise).to.be.rejectedWith(
							'Application not found: 999999',
						);
					});

					it('should support arbitrary pinejs options', async function () {
						const [device] = await balena.models.device.getAllByApplication(
							ctx.application.id,
							{ $select: ['id'] },
						);
						expect(device.id).to.equal(ctx.device.id);
						return expect(device.device_name).to.equal(undefined);
					});

					it('should be able to retrieve computed terms', async function () {
						const [device] = await balena.models.device.getAllByApplication(
							ctx.application.id,
							{
								$select: ['overall_status', 'overall_progress'],
							},
						);
						return expect(device).to.deep.match({
							overall_status: 'inactive',
							overall_progress: null,
						});
					});
				});

				parallel('balena.models.device.get()', function () {
					it('should be able to get the device by uuid', async function () {
						const device = await balena.models.device.get(ctx.device.uuid);
						return expect(device.id).to.equal(ctx.device.id);
					});

					it('should be able to get the device by id', async function () {
						const device = await balena.models.device.get(ctx.device.id);
						return expect(device.id).to.equal(ctx.device.id);
					});

					it('should be rejected if the device name does not exist', function () {
						const promise = balena.models.device.get('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.get(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});

					it('should be able to use a shorter uuid', async function () {
						const device = await balena.models.device.get(
							ctx.device.uuid.slice(0, 8),
						);
						return expect(device.id).to.equal(ctx.device.id);
					});

					it('should support arbitrary pinejs options', async function () {
						const device = await balena.models.device.get(ctx.device.id, {
							$select: ['id'],
						});
						expect(device.id).to.equal(ctx.device.id);
						return expect(device.device_name).to.equal(undefined);
					});

					it('should be able to retrieve computed terms', async function () {
						const device = await balena.models.device.get(ctx.device.uuid, {
							$select: ['overall_status', 'overall_progress'],
						});
						return expect(device).to.deep.match({
							overall_status: 'inactive',
							overall_progress: null,
						});
					});
				});

				parallel('balena.models.device.getByName()', function () {
					it('should be able to get the device', async function () {
						const devices = await balena.models.device.getByName(
							ctx.device.device_name,
						);
						expect(devices).to.have.length(1);
						return expect(devices[0].id).to.equal(ctx.device.id);
					});

					it('should be rejected if the device does not exist', function () {
						const promise = balena.models.device.getByName('HelloWorldDevice');
						return expect(promise).to.be.rejectedWith(
							'Device not found: HelloWorldDevice',
						);
					});

					it('should support arbitrary pinejs options', async function () {
						const [device] = await balena.models.device.getByName(
							ctx.device.device_name,
							{ $select: ['id'] },
						);
						expect(device.id).to.equal(ctx.device.id);
						return expect(device.device_name).to.equal(undefined);
					});
				});

				parallel('balena.models.device.getName()', function () {
					it('should get the correct name by uuid', async function () {
						const name = await balena.models.device.getName(ctx.device.uuid);
						return expect(name).to.equal(ctx.device.device_name);
					});

					it('should get the correct name by id', async function () {
						const name = await balena.models.device.getName(ctx.device.id);
						return expect(name).to.equal(ctx.device.device_name);
					});

					it('should be rejected if the device uuid does not exist', function () {
						const promise = balena.models.device.getName('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.getName(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				parallel('balena.models.device.getApplicationName()', function () {
					it('should get the correct application name from a device uuid', function () {
						const promise = balena.models.device.getApplicationName(
							ctx.device.uuid,
						);
						return expect(promise).to.eventually.equal(
							ctx.application.app_name,
						);
					});

					it('should get the correct application name from a device id', function () {
						const promise = balena.models.device.getApplicationName(
							ctx.device.id,
						);
						return expect(promise).to.eventually.equal(
							ctx.application.app_name,
						);
					});

					it('should be rejected if the device uuid does not exist', function () {
						const promise =
							balena.models.device.getApplicationName('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.getApplicationName(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				parallel('balena.models.device.has()', function () {
					it('should eventually be true if the device uuid exists', function () {
						const promise = balena.models.device.has(ctx.device.uuid);
						return expect(promise).to.eventually.be.true;
					});

					it('should eventually be true if the device id exists', function () {
						const promise = balena.models.device.has(ctx.device.id);
						return expect(promise).to.eventually.be.true;
					});

					it('should return false if the device id is undefined', function () {
						// @ts-expect-error
						const promise = balena.models.application.has(undefined);
						return expect(promise).to.eventually.be.false;
					});

					it('should eventually be false if the device uuid does not exist', function () {
						const promise = balena.models.device.has('asdfghjkl');
						return expect(promise).to.eventually.be.false;
					});

					it('should eventually be false if the device id does not exist', function () {
						const promise = balena.models.device.has(999999);
						return expect(promise).to.eventually.be.false;
					});
				});

				parallel('balena.models.device.isOnline()', function () {
					it('should eventually be false if the device uuid is offline', function () {
						const promise = balena.models.device.isOnline(ctx.device.uuid);
						return expect(promise).to.eventually.be.false;
					});

					it('should eventually be false if the device id is offline', function () {
						const promise = balena.models.device.isOnline(ctx.device.id);
						return expect(promise).to.eventually.be.false;
					});

					it('should be rejected if the device uuid does not exist', function () {
						const promise = balena.models.device.isOnline('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.isOnline(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				parallel('balena.models.device.getLocalIPAddresses()', function () {
					it('should be rejected with an offline error if the device uuid is offline', function () {
						const promise = balena.models.device.getLocalIPAddresses(
							ctx.device.uuid,
						);
						return expect(promise).to.be.rejectedWith(
							`The device is offline: ${ctx.device.uuid}`,
						);
					});

					it('should be rejected with an offline error if the device id is offline', function () {
						const promise = balena.models.device.getLocalIPAddresses(
							ctx.device.id,
						);
						return expect(promise).to.be.rejectedWith(
							`The device is offline: ${ctx.device.id}`,
						);
					});

					it('should be rejected if the device uuid does not exist', function () {
						const promise =
							balena.models.device.getLocalIPAddresses('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.getLocalIPAddresses(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				parallel('balena.models.device.getMACAddresses()', function () {
					it('should be rejected if the device uuid does not exist', async function () {
						const promise = balena.models.device.getMACAddresses('asdfghjkl');
						await expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', async function () {
						const promise = balena.models.device.getMACAddresses(999999);
						await expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});

					deviceUniqueFields.forEach((field) =>
						it(`should retrieve a empty list of mac addresses by ${field}`, async function () {
							const result = await balena.models.device.getMACAddresses(
								ctx.device[field],
							);
							expect(result).to.deep.equal([]);
						}),
					);
				});

				parallel('balena.models.device.getMetrics()', function () {
					it('should be rejected if the device uuid does not exist', async function () {
						const promise = balena.models.device.getMetrics('asdfghjkl');
						await expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', async function () {
						const promise = balena.models.device.getMetrics(999999);
						await expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});

					deviceUniqueFields.forEach((field) =>
						it(`should retrieve an empty device metrics object by ${field}`, async function () {
							const result = await balena.models.device.getMetrics(
								ctx.device[field],
							);
							expect(result).to.deep.equal({
								memory_usage: null,
								memory_total: null,
								storage_block_device: null,
								storage_usage: null,
								storage_total: null,
								cpu_usage: null,
								cpu_temp: null,
								cpu_id: null,
								is_undervolted: false,
							});
						}),
					);
				});

				describe('balena.models.device.getAllByParentDevice()', function () {
					before(async function () {
						const [userId, childApplication] = await Promise.all([
							balena.auth.getUserId(),
							balena.models.application.create({
								name: 'ChildApp',
								applicationType: 'microservices-starter',
								deviceType: 'generic',
								organization: this.initialOrg.id,
								parent: this.application.id,
							}),
						]);
						// We don't use the built-in .register or resin-register-device,
						// because they don't yet support parent devices.
						this.childApplication = childApplication;
						this.childDevice = await balena.pine.post({
							resource: 'device',
							body: {
								belongs_to__user: userId,
								belongs_to__application: this.childApplication.id,
								is_of__device_type:
									this.childApplication.is_for__device_type.__id,
								uuid: balena.models.device.generateUniqueKey(),
								is_managed_by__device: this.device.id,
							},
						});
						ctx = this;
					});

					after(() => balena.models.application.remove('ChildApp'));

					parallel('', function () {
						it('should get the device given the right parent uuid', async function () {
							const childDevices =
								await balena.models.device.getAllByParentDevice(
									ctx.device.uuid,
								);
							expect(childDevices).to.have.length(1);
							expect(childDevices[0].id).to.equal(ctx.childDevice.id);
						});

						it('should get the device given the right parent id', async function () {
							const childDevices =
								await balena.models.device.getAllByParentDevice(ctx.device.id);
							expect(childDevices).to.have.length(1);
							expect(childDevices[0].id).to.equal(ctx.childDevice.id);
						});

						it('should be empty if the parent device has no children', async function () {
							const childDevices =
								await balena.models.device.getAllByParentDevice(
									ctx.childDevice.id,
								);
							expect(childDevices).to.have.length(0);
						});

						it('should be rejected if the parent device does not exist', function () {
							const promise =
								balena.models.device.getAllByParentDevice('asdfghjkl');
							expect(promise).to.be.rejectedWith('Device not found: asdfghjkl');
						});

						it('should support arbitrary pinejs options', async function () {
							const [childDevice] =
								await balena.models.device.getAllByParentDevice(ctx.device.id, {
									$select: ['id'],
								});
							expect(childDevice.id).to.equal(ctx.childDevice.id);
							expect(childDevice.device_name).to.equal(undefined);
						});
					});
				});

				describe('balena.models.device.getMACAddresses()', function () {
					givenADevice(before, {
						mac_address: '00:11:22:33:44:55 66:77:88:99:AA:BB',
					});

					before(function () {
						ctx = this;
					});

					parallel('', function () {
						deviceUniqueFields.forEach((field) =>
							it(`should be able to retrieve the device mac addresses by ${field}`, async function () {
								const result = await balena.models.device.getMACAddresses(
									ctx.device[field],
								);
								expect(result).to.deep.equal([
									'00:11:22:33:44:55',
									'66:77:88:99:AA:BB',
								]);
							}),
						);
					});
				});

				describe('balena.models.device.getMetrics()', function () {
					givenADevice(before, {
						cpu_usage: 34,
						memory_usage: 1000, // 1GB in MiB
						memory_total: 4000, // 4GB in MiB
						storage_block_device: '/dev/mmcblk0',
						storage_usage: 1000, // 1GB in MiB
						storage_total: 64000, // 64GB in MiB
						cpu_temp: 56,
						is_undervolted: true,
						cpu_id: 'a CPU string',
					});

					before(function () {
						ctx = this;
					});

					parallel('', function () {
						deviceUniqueFields.forEach((field) =>
							it(`should be able to retrieve the device metrics by ${field}`, async function () {
								const result = await balena.models.device.getMetrics(
									ctx.device[field],
								);
								expect(result).to.deep.equal({
									cpu_usage: 34,
									memory_usage: 1000, // 1GB in MiB
									memory_total: 4000, // 4GB in MiB
									storage_block_device: '/dev/mmcblk0',
									storage_usage: 1000, // 1GB in MiB
									storage_total: 64000, // 64GB in MiB
									cpu_temp: 56,
									is_undervolted: true,
									cpu_id: 'a CPU string',
								});
							}),
						);
					});
				});
			});

			describe('[contained scenario]', function () {
				givenADevice(before);

				describe('balena.models.device.rename()', function () {
					it('should be rejected if the device uuid does not exist', function () {
						const promise = balena.models.device.rename('asdfghjkl', 'Foo Bar');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.rename(999999, 'Foo Bar');
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});

					describe('[contained scenario]', function () {
						it('should be able to rename the device by uuid', async function () {
							await balena.models.device.rename(
								this.device.uuid,
								'FooBarDeviceByUuid',
							);
							const name = await balena.models.device.getName(this.device.uuid);
							return expect(name).to.equal('FooBarDeviceByUuid');
						});

						it('should be able to rename the device by id', async function () {
							await balena.models.device.rename(
								this.device.id,
								'FooBarDeviceById',
							);
							const name = await balena.models.device.getName(this.device.id);
							return expect(name).to.equal('FooBarDeviceById');
						});

						it('should be able to rename the device using a shorter uuid', async function () {
							await balena.models.device.rename(
								this.device.uuid.slice(0, 7),
								'FooBarDeviceByShortUuid',
							);
							const name = await balena.models.device.getName(this.device.uuid);
							return expect(name).to.equal('FooBarDeviceByShortUuid');
						});
					});
				});

				describe('balena.models.device.setCustomLocation()', function () {
					it('should be able to set the location of a device by uuid', async function () {
						await balena.models.device.setCustomLocation(this.device.uuid, {
							latitude: 41.383333,
							longitude: 2.183333,
						});
						const device = await balena.models.device.get(this.device.id, {
							$select: ['custom_latitude', 'custom_longitude'],
						});
						expect(device.custom_latitude).to.equal('41.383333');
						return expect(device.custom_longitude).to.equal('2.183333');
					});

					it('should be able to set the location of a device by id', async function () {
						await balena.models.device.setCustomLocation(this.device.id, {
							latitude: 42.383333,
							longitude: 2.283333,
						});
						const device = await balena.models.device.get(this.device.id, {
							$select: ['custom_latitude', 'custom_longitude'],
						});
						expect(device.custom_latitude).to.equal('42.383333');
						return expect(device.custom_longitude).to.equal('2.283333');
					});

					it('should be rejected if the device uuid does not exist', function () {
						const promise = balena.models.device.setCustomLocation(
							'asdfghjkl',
							{
								latitude: 43.383333,
								longitude: 2.383333,
							},
						);
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.setCustomLocation(999999, {
							latitude: 44.383333,
							longitude: 2.483333,
						});
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				describe('balena.models.device.unsetCustomLocation()', function () {
					beforeEach(function () {
						return balena.models.device.setCustomLocation(this.device.id, {
							latitude: 41.383333,
							longitude: 2.183333,
						});
					});

					it('should be able to unset the location of a device by uuid', async function () {
						await balena.models.device.unsetCustomLocation(this.device.uuid);
						const device = await balena.models.device.get(this.device.id, {
							$select: ['custom_latitude', 'custom_longitude'],
						});
						expect(device.custom_latitude).to.equal('');
						return expect(device.custom_longitude).to.equal('');
					});

					it('should be able to unset the location of a device by id', async function () {
						await balena.models.device.unsetCustomLocation(this.device.id);
						const device = await balena.models.device.get(this.device.id, {
							$select: ['custom_latitude', 'custom_longitude'],
						});
						expect(device.custom_latitude).to.equal('');
						return expect(device.custom_longitude).to.equal('');
					});

					it('should be rejected if the device uuid does not exist', function () {
						const promise =
							balena.models.device.unsetCustomLocation('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.unsetCustomLocation(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				describe('balena.models.device.note()', function () {
					it('should be rejected if the device uuid does not exist', function () {
						const promise = balena.models.device.note('asdfghjkl', 'My note');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.note(999999, 'My note');
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});

					describe('[contained scenario]', function () {
						it('should be able to note a device by uuid', async function () {
							await balena.models.device.note(
								this.device.uuid,
								'What you do today can improve all your tomorrows by uuid',
							);
							const device = await balena.models.device.get(this.device.uuid);
							return expect(device.note).to.equal(
								'What you do today can improve all your tomorrows by uuid',
							);
						});

						it('should be able to note a device by id', async function () {
							await balena.models.device.note(
								this.device.id,
								'What you do today can improve all your tomorrows by id',
							);
							const device = await balena.models.device.get(this.device.id);
							return expect(device.note).to.equal(
								'What you do today can improve all your tomorrows by id',
							);
						});
					});
				});

				describe('balena.models.device.grantSupportAccess()', function () {
					it('should throw an error if the expiry time stamp is in the past', function () {
						const expiryTimestamp = Date.now() - 3600 * 1000;

						return expect(
							balena.models.device.grantSupportAccess(
								this.device.id,
								expiryTimestamp,
							),
						).to.be.rejected;
					});

					it('should throw an error if the expiry time stamp is undefined', function () {
						return expect(
							// @ts-expect-error
							balena.models.device.grantSupportAccess(this.device.id),
						).to.be.rejected;
					});

					it('should grant support access for the correct amount of time', async function () {
						const expiryTimestamp = Date.now() + 3600 * 1000;
						await balena.models.device.grantSupportAccess(
							this.device.id,
							expiryTimestamp,
						);
						const { is_accessible_by_support_until__date } =
							await balena.models.device.get(this.device.id, {
								$select: 'is_accessible_by_support_until__date',
							});
						return expect(
							Date.parse(is_accessible_by_support_until__date ?? '0'),
						).to.equal(expiryTimestamp);
					});
				});

				describe('balena.models.device.revokeSupportAccess()', function () {
					before(async function () {
						const { is_accessible_by_support_until__date } =
							await balena.models.device.get(this.device.id, {
								$select: 'is_accessible_by_support_until__date',
							});
						expect(is_accessible_by_support_until__date).to.not.be.null;
					});

					it('...should revoke support access', async function () {
						await balena.models.device.revokeSupportAccess(this.device.id);
						const { is_accessible_by_support_until__date } =
							await balena.models.device.get(this.device.id, {
								$select: 'is_accessible_by_support_until__date',
							});
						return expect(is_accessible_by_support_until__date).to.be.null;
					});
				});

				describe('balena.models.device.generateDeviceKey()', function () {
					it('should be able to generate a device key by uuid', async function () {
						const deviceApiKey = await balena.models.device.generateDeviceKey(
							this.device.uuid,
						);
						expect(deviceApiKey).to.be.a('string');
						return expect(deviceApiKey).to.have.length(32);
					});

					it('should be able to generate a device key by id', async function () {
						const deviceApiKey = await balena.models.device.generateDeviceKey(
							this.device.id,
						);
						expect(deviceApiKey).to.be.a('string');
						return expect(deviceApiKey).to.have.length(32);
					});

					it('should be rejected if the device name does not exist', function () {
						const promise = balena.models.device.generateDeviceKey('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.generateDeviceKey(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});

					it('should be able to use a shorter uuid', async function () {
						const deviceApiKey = await balena.models.device.generateDeviceKey(
							this.device.uuid.slice(0, 8),
						);
						expect(deviceApiKey).to.be.a('string');
						return expect(deviceApiKey).to.have.length(32);
					});
				});
			});

			describe('balena.models.device.remove()', function () {
				it('should be rejected if the device uuid does not exist', function () {
					const promise = balena.models.device.remove('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device id does not exist', function () {
					const promise = balena.models.device.remove(999999);
					return expect(promise).to.be.rejectedWith('Device not found: 999999');
				});

				describe('[mutating operations]', function () {
					givenADevice(beforeEach);

					it('should be able to remove the device by uuid', async function () {
						await balena.models.device.remove(this.device.uuid);
						const devices = await balena.models.device.getAll();
						return expect(devices).to.deep.equal([]);
					});

					it('should be able to remove the device by id', async function () {
						await balena.models.device.remove(this.device.id);
						const devices = await balena.models.device.getAll();
						return expect(devices).to.deep.equal([]);
					});

					it('should be able to remove the device using a shorter uuid', async function () {
						await balena.models.device.remove(this.device.uuid.slice(0, 7));
						const devices = await balena.models.device.getAll();
						return expect(devices).to.deep.equal([]);
					});
				});
			});

			describe('balena.models.device.hasDeviceUrl()', function () {
				givenADevice(before);

				it('should be rejected if the device uuid does not exist', function () {
					const promise = balena.models.device.hasDeviceUrl('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device id does not exist', function () {
					const promise = balena.models.device.hasDeviceUrl(999999);
					return expect(promise).to.be.rejectedWith('Device not found: 999999');
				});

				describe('given device url is disabled', function () {
					it('should eventually be false given a device uuid', function () {
						const promise = balena.models.device.hasDeviceUrl(this.device.uuid);
						return expect(promise).to.eventually.be.false;
					});

					it('should eventually be false given a device id', function () {
						const promise = balena.models.device.hasDeviceUrl(this.device.id);
						return expect(promise).to.eventually.be.false;
					});
				});

				describe('given device url is enabled', function () {
					before(function () {
						return balena.models.device.enableDeviceUrl(this.device.id);
					});

					it('should eventually be true given a device uuid', function () {
						const promise = balena.models.device.hasDeviceUrl(this.device.uuid);
						return expect(promise).to.eventually.be.true;
					});

					it('should eventually be true given a device id', function () {
						const promise = balena.models.device.hasDeviceUrl(this.device.id);
						return expect(promise).to.eventually.be.true;
					});
				});
			});

			describe('balena.models.device.getDeviceUrl()', function () {
				givenADevice(before);

				describe('given a newly created device', function () {
					it('should be rejected if the device uuid does not exist', function () {
						const promise = balena.models.device.getDeviceUrl('asdfghjkl');
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should be rejected if the device id does not exist', function () {
						const promise = balena.models.device.getDeviceUrl(999999);
						return expect(promise).to.be.rejectedWith(
							'Device not found: 999999',
						);
					});
				});

				describe('given device url is disabled', function () {
					it('should be rejected with an error given a device uuid', function () {
						const promise = balena.models.device.getDeviceUrl(this.device.uuid);
						return expect(promise).to.be.rejectedWith(
							`Device is not web accessible: ${this.device.uuid}`,
						);
					});

					it('should be rejected with an error given a device id', function () {
						const promise = balena.models.device.getDeviceUrl(this.device.id);
						return expect(promise).to.be.rejectedWith(
							`Device is not web accessible: ${this.device.id}`,
						);
					});
				});

				describe('given device url is enabled', function () {
					before(function () {
						return balena.models.device.enableDeviceUrl(this.device.id);
					});

					it('should eventually return the correct device url given a shorter uuid', async function () {
						const deviceUrl = await balena.models.device.getDeviceUrl(
							this.device.uuid.slice(0, 7),
						);
						return expect(deviceUrl).to.match(/[a-z0-9]{32}/);
					});

					it('should eventually return the correct device url given an id', async function () {
						const deviceUrl = await balena.models.device.getDeviceUrl(
							this.device.id,
						);
						return expect(deviceUrl).to.match(/[a-z0-9]{32}/);
					});

					it('should eventually be an absolute url given a uuid', async function () {
						const url = await balena.models.device.getDeviceUrl(
							this.device.uuid,
						);
						const response = await makeRequest(url);
						expect(response.isError).to.equal(true);
						// in the browser we don't get the details
						// honestly it's unclear why, as it works for other services
						if (IS_BROWSER) {
							return;
						}
						// Because the device is not online
						expect(response.status).to.equal(503);
						return expect(response.response).to.match(/Device Public URLs/);
					});
				});
			});

			describe('balena.models.device.enableDeviceUrl()', function () {
				it('should be rejected if the device uuid does not exist', function () {
					const promise = balena.models.device.enableDeviceUrl('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device id does not exist', function () {
					const promise = balena.models.device.enableDeviceUrl(999999);
					return expect(promise).to.be.rejectedWith('Device not found: 999999');
				});

				describe('given the device url is disabled', function () {
					givenADevice(beforeEach);

					it('should be able to enable web access using a uuid', async function () {
						await balena.models.device.enableDeviceUrl(this.device.uuid);
						const promise = balena.models.device.hasDeviceUrl(this.device.id);
						return expect(promise).to.eventually.be.true;
					});

					it('should be able to enable web access using an id', async function () {
						await balena.models.device.enableDeviceUrl(this.device.id);
						const promise = balena.models.device.hasDeviceUrl(this.device.id);
						return expect(promise).to.eventually.be.true;
					});

					it('should be able to enable web access using a shorter uuid', async function () {
						await balena.models.device.enableDeviceUrl(
							this.device.uuid.slice(0, 7),
						);
						const promise = balena.models.device.hasDeviceUrl(this.device.id);
						return expect(promise).to.eventually.be.true;
					});
				});
			});

			describe('balena.models.device.disableDeviceUrl()', function () {
				it('should be rejected if the device uuid does not exist', function () {
					const promise = balena.models.device.disableDeviceUrl('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device id does not exist', function () {
					const promise = balena.models.device.disableDeviceUrl(999999);
					return expect(promise).to.be.rejectedWith('Device not found: 999999');
				});

				describe('given device url is enabled', function () {
					givenADevice(before);

					beforeEach(async function () {
						await balena.models.device.enableDeviceUrl(this.device.id);
						const hasDeviceUrl = await balena.models.device.hasDeviceUrl(
							this.device.id,
						);
						expect(hasDeviceUrl).to.be.true;
					});

					it('should be able to disable web access using a uuid', async function () {
						await balena.models.device.disableDeviceUrl(this.device.uuid);
						const promise = balena.models.device.hasDeviceUrl(this.device.id);
						return expect(promise).to.eventually.be.false;
					});

					it('should be able to disable web access using an id', async function () {
						await balena.models.device.disableDeviceUrl(this.device.id);
						const promise = balena.models.device.hasDeviceUrl(this.device.id);
						return expect(promise).to.eventually.be.false;
					});

					it('should be able to disable web access using a shorter uuid', async function () {
						await balena.models.device.disableDeviceUrl(
							this.device.uuid.slice(0, 7),
						);
						const promise = balena.models.device.hasDeviceUrl(this.device.id);
						return expect(promise).to.eventually.be.false;
					});
				});
			});

			describe('Given a device with a production image', function () {
				givenADevice(before, {
					is_online: true,
					...testDeviceOsInfo,
					os_variant: 'prod',
					last_connectivity_event: '2019-05-13T16:14',
				});

				describe('balena.models.device.getLocalModeSupport()', () =>
					it('should identify the device as not supported', function () {
						return expect(
							balena.models.device.getLocalModeSupport(this.device),
						).to.deep.equal({
							supported: false,
							message:
								'Local mode is only supported on development OS versions',
						});
					}));

				describe('balena.models.device.isInLocalMode()', function () {
					it('should be false by default for a device retrieved by uuid', async function () {
						const isInLocalMode = await balena.models.device.isInLocalMode(
							this.device.uuid,
						);
						return expect(isInLocalMode).to.be.false;
					});

					it('should be false by default for a device retrieved by id', async function () {
						const isInLocalMode = await balena.models.device.isInLocalMode(
							this.device.id,
						);
						return expect(isInLocalMode).to.be.false;
					});
				});

				describe('balena.models.device.enableLocalMode()', function () {
					it('should not be able to enable local mode by uuid', function () {
						const promise = balena.models.device.enableLocalMode(
							this.device.uuid,
						);
						return expect(promise).to.be.rejectedWith(
							'Local mode is only supported on development OS versions',
						);
					});

					it('should not be able to enable local mode by id', function () {
						const promise = balena.models.device.enableLocalMode(
							this.device.id,
						);
						return expect(promise).to.be.rejectedWith(
							'Local mode is only supported on development OS versions',
						);
					});
				});
			});

			describe('Given a device with a development image', function () {
				givenADevice(before, {
					is_online: true,
					...testDeviceOsInfo,
					os_variant: 'dev',
					last_connectivity_event: '2019-05-13T16:14',
				});

				describe('balena.models.device.getLocalModeSupport()', () =>
					it('should identify the device as supported', function () {
						return expect(
							balena.models.device.getLocalModeSupport(this.device),
						).to.deep.equal({
							supported: true,
							message: 'Supported',
						});
					}));

				describe('[mutating operations]', () =>
					deviceUniqueFields.forEach(function (deviceParam) {
						describe('balena.models.device.isInLocalMode()', function () {
							it(`should be false by default for a device retrieved by ${deviceParam}`, async function () {
								const isInLocalMode = await balena.models.device.isInLocalMode(
									this.device[deviceParam],
								);
								return expect(isInLocalMode).to.be.false;
							});

							it(`should be rejected if a device with that ${deviceParam} does not exist`, function () {
								const deviceParamValue =
									deviceParam === 'id' ? 999999 : 'asdfghjkl';
								const promise =
									balena.models.device.isInLocalMode(deviceParamValue);
								return expect(promise).to.be.rejectedWith(
									`Device not found: ${deviceParamValue}`,
								);
							});
						});

						describe('balena.models.device.enableLocalMode()', function () {
							it(`should be able to enable local mode by ${deviceParam}`, async function () {
								await balena.models.device.enableLocalMode(
									this.device[deviceParam],
								);
								const isInLocalMode = await balena.models.device.isInLocalMode(
									this.device[deviceParam],
								);
								return expect(isInLocalMode).to.be.true;
							});

							it(`should be rejected if a device with that ${deviceParam} does not exist`, function () {
								const deviceParamValue =
									deviceParam === 'id' ? 999999 : 'asdfghjkl';
								const promise =
									balena.models.device.enableLocalMode(deviceParamValue);
								return expect(promise).to.be.rejectedWith(
									`Device not found: ${deviceParamValue}`,
								);
							});
						});

						describe('balena.models.device.disableLocalMode()', function () {
							it(`should be able to disable local mode by ${deviceParam}`, async function () {
								await balena.models.device.disableLocalMode(
									this.device[deviceParam],
								);
								const isInLocalMode = await balena.models.device.isInLocalMode(
									this.device[deviceParam],
								);
								return expect(isInLocalMode).to.be.false;
							});

							it(`should be rejected if a device with that ${deviceParam} does not exist`, function () {
								const deviceParamValue =
									deviceParam === 'id' ? 999999 : 'asdfghjkl';
								const promise =
									balena.models.device.disableLocalMode(deviceParamValue);
								return expect(promise).to.be.rejectedWith(
									`Device not found: ${deviceParamValue}`,
								);
							});
						});
					}));
			});

			describe('balena.models.device.hasLockOverride()', function () {
				givenADevice(before);

				deviceUniqueFields.forEach(function (deviceParam) {
					it(`should be false by default for a device retrieved by ${deviceParam}`, async function () {
						const hasLockOverride = await balena.models.device.hasLockOverride(
							this.device[deviceParam],
						);
						return expect(hasLockOverride).to.be.false;
					});
				});

				const OVERRIDE_LOCK_ENV_VAR = 'RESIN_OVERRIDE_LOCK';

				it('should be true for a device that has the device config var set to 0 and no app config var', async function () {
					await balena.models.device.configVar.set(
						this.device.uuid,
						OVERRIDE_LOCK_ENV_VAR,
						'0',
					);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					return expect(hasLockOverride).to.be.false;
				});

				it('should be true for a device that has the device config var set to 1 and no app config var', async function () {
					await balena.models.device.configVar.set(
						this.device.uuid,
						OVERRIDE_LOCK_ENV_VAR,
						'1',
					);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					return expect(hasLockOverride).to.be.true;
				});

				it('should be true for a device that has the app config var set to 0 and no device config var', async function () {
					await balena.models.application.configVar.set(
						this.application.id,
						OVERRIDE_LOCK_ENV_VAR,
						'0',
					);
					await balena.models.device.configVar.remove(
						this.device.uuid,
						OVERRIDE_LOCK_ENV_VAR,
					);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					return expect(hasLockOverride).to.be.false;
				});

				it('should be true for a device that has the app config var set to 1 and no device config var', async function () {
					await balena.models.application.configVar.set(
						this.application.id,
						OVERRIDE_LOCK_ENV_VAR,
						'1',
					);
					await balena.models.device.configVar.remove(
						this.device.uuid,
						OVERRIDE_LOCK_ENV_VAR,
					);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					return expect(hasLockOverride).to.be.true;
				});

				it('should be false for a device that has the app config var set to 1 and the device config var set to 0', async function () {
					await balena.models.application.configVar.set(
						this.application.id,
						OVERRIDE_LOCK_ENV_VAR,
						'1',
					);
					await balena.models.device.configVar.set(
						this.device.uuid,
						OVERRIDE_LOCK_ENV_VAR,
						'0',
					);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					return expect(hasLockOverride).to.be.false;
				});

				it('should be true for a device that has the app config var set to 0 and the device config var set to 1', async function () {
					await balena.models.application.configVar.set(
						this.application.id,
						OVERRIDE_LOCK_ENV_VAR,
						'0',
					);
					await balena.models.device.configVar.set(
						this.device.uuid,
						OVERRIDE_LOCK_ENV_VAR,
						'1',
					);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					return expect(hasLockOverride).to.be.true;
				});
			});

			describe('balena.models.device.enableLockOverride()', function () {
				givenADevice(beforeEach);

				deviceUniqueFields.forEach(function (deviceParam) {
					it(`should be able to enable lock override by ${deviceParam}`, async function () {
						await balena.models.device.enableLockOverride(
							this.device[deviceParam],
						);
						const hasLockOverride = await balena.models.device.hasLockOverride(
							this.device[deviceParam],
						);
						return expect(hasLockOverride).to.be.true;
					});
				});
			});

			describe('balena.models.device.disableLockOverride()', function () {
				givenADevice(before);

				beforeEach(async function () {
					await balena.models.device.enableLockOverride(this.device.uuid);
					const hasLockOverride = await balena.models.device.hasLockOverride(
						this.device.uuid,
					);
					expect(hasLockOverride).to.be.true;
				});

				deviceUniqueFields.forEach(function (deviceParam) {
					it(`should be able to disable lock override by ${deviceParam}`, async function () {
						await balena.models.device.disableLockOverride(
							this.device[deviceParam],
						);
						const hasLockOverride = await balena.models.device.hasLockOverride(
							this.device[deviceParam],
						);
						return expect(hasLockOverride).to.be.false;
					});
				});
			});

			describe('balena.models.device.getOsUpdateStatus()', function () {
				givenADevice(before);

				it('should be able to get the current OS update status', async function () {
					const status = await balena.models.device.getOsUpdateStatus(
						this.device.uuid,
					);
					return expect(status).to.deep.match({
						status: 'idle',
					});
				});

				it('should be rejected if the device does not exist', function () {
					const promise = balena.models.device.getOsUpdateStatus('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});
			});

			describe('balena.models.device.startOsUpdate()', function () {
				givenADevice(before);

				describe('given an offline device w/o os info', function () {
					it('should be rejected if the device does not exist', function () {
						const promise = balena.models.device.startOsUpdate(
							'asdfghjkl',
							'2.29.2+rev1.prod',
						);
						return expect(promise).to.be.rejectedWith(
							'Device not found: asdfghjkl',
						);
					});

					it('should not be able to start an OS update without providing a targetOsVersion parameter', function () {
						// @ts-expect-error
						const promise = balena.models.device.startOsUpdate(
							this.device.uuid,
						);
						return expect(promise).to.be.rejected.and.eventually.have.property(
							'code',
							'BalenaInvalidParameterError',
						);
					});

					it('should not be able to start an OS update for an offline device', function () {
						const promise = balena.models.device.startOsUpdate(
							this.device.uuid,
							'2.29.2+rev1.prod',
						);
						return expect(promise).to.be.rejectedWith(
							`The device is offline: ${this.device.uuid}`,
						);
					});
				});

				describe('given an online device w/o os info', function () {
					before(function () {
						return balena.pine.patch({
							resource: 'device',
							id: this.device.id,
							body: { is_online: true },
						});
					});

					it('should not be able to start an OS update for a device that has not yet reported its current version', function () {
						const promise = balena.models.device.startOsUpdate(
							this.device.uuid,
							'2.29.2+rev1.prod',
						);
						return expect(promise).to.be.rejectedWith(
							`The current os version of the device is not available: ${this.device.uuid}`,
						);
					});
				});

				describe('given an online device with os info', function () {
					before(function () {
						return balena.pine.patch({
							resource: 'device',
							id: this.device.id,
							body: {
								is_online: true,
								...testDeviceOsInfo,
							},
						});
					});

					it('should not be able to start an OS update when the target os version is not specified', function () {
						// @ts-expect-error
						const promise = balena.models.device.startOsUpdate(
							this.device.uuid,
						);
						return expect(promise)
							.to.be.rejectedWith(
								"undefined is not a valid value for parameter 'targetOsVersion'",
							)
							.and.eventually.have.property(
								'code',
								'BalenaInvalidParameterError',
							);
					});

					it('should not be able to start an OS update when the target os version does not exist', function () {
						const promise = balena.models.device.startOsUpdate(
							this.device.uuid,
							'2.49.0+rev1.prod',
						);
						return expect(promise)
							.to.be.rejectedWith(
								"2.49.0+rev1.prod is not a valid value for parameter 'targetOsVersion'",
							)
							.and.eventually.have.property(
								'code',
								'BalenaInvalidParameterError',
							);
					});

					// just to confirm that the above checks do not give false positives,
					// allow the request to reach the actions server and document the current error
					it('should not be able to start an OS update for a fake device', function () {
						const promise = balena.models.device.startOsUpdate(
							this.device.uuid,
							'2.54.2+rev1.prod',
						);
						return expect(promise).to.be.rejected.then(function (error) {
							expect(error).to.have.property('statusCode', 500);
							expect(error).to.have.property(
								'message',
								'Request error: [object Object]',
							);
							return expect(error.code).to.not.equal(
								'BalenaInvalidParameterError',
							);
						});
					});
				});
			});

			describe('balena.models.device.tags', function () {
				givenADevice(before);

				const appTagTestOptions = {
					// prettier-ignore
					model:
						/** @type {import('./tags').TagModelBase<import('../../../').DeviceTag>} */ (balena .models.device.tags),
					modelNamespace: 'balena.models.device.tags',
					resourceName: 'application',
					uniquePropertyNames: applicationRetrievalFields,
				};

				const deviceTagTestOptions = {
					// prettier-ignore
					model:
						/** @type {import('./tags').TagModelBase<import('../../../').DeviceTag>} */ (balena.models.device.tags),
					modelNamespace: 'balena.models.device.tags',
					resourceName: 'device',
					uniquePropertyNames: deviceUniqueFields,
				};

				before(function () {
					appTagTestOptions.resourceProvider = () => this.application;
					deviceTagTestOptions.resourceProvider = () => this.device;
					// used for tag creation during the
					// device.tags.getAllByApplication() test
					appTagTestOptions.setTagResourceProvider = () => this.device;
				});

				itShouldSetGetAndRemoveTags(deviceTagTestOptions);

				describe('balena.models.device.tags.getAllByApplication()', function () {
					itShouldGetAllTagsByResource(appTagTestOptions);
				});

				describe('balena.models.device.tags.getAllByDevice()', function () {
					itShouldGetAllTagsByResource(deviceTagTestOptions);
				});
			});

			describe('balena.models.device.configVar', function () {
				givenADevice(before);

				const configVarModel = balena.models.device.configVar;

				deviceUniqueFields.forEach(function (deviceParam) {
					const deviceParamUpper = deviceParam.toUpperCase();

					it(`can create a variable by ${deviceParam}`, function () {
						const promise = configVarModel.set(
							this.device[deviceParam],
							`BALENA_EDITOR_${deviceParamUpper}`,
							'vim',
						);
						return expect(promise).to.not.be.rejected;
					});

					it(`...can retrieve a created variable by ${deviceParam}`, async function () {
						const result = await configVarModel.get(
							this.device[deviceParam],
							`BALENA_EDITOR_${deviceParamUpper}`,
						);
						return expect(result).to.equal('vim');
					});

					it(`...can update and retrieve a variable by ${deviceParam}`, async function () {
						await configVarModel.set(
							this.device[deviceParam],
							`BALENA_EDITOR_${deviceParamUpper}`,
							'emacs',
						);
						const result = await configVarModel.get(
							this.device[deviceParam],
							`BALENA_EDITOR_${deviceParamUpper}`,
						);
						return expect(result).to.equal('emacs');
					});

					it(`...can delete and then fail to retrieve a variable by ${deviceParam}`, async function () {
						await configVarModel.remove(
							this.device[deviceParam],
							`BALENA_EDITOR_${deviceParamUpper}`,
						);
						const result = await configVarModel.get(
							this.device[deviceParam],
							`BALENA_EDITOR_${deviceParamUpper}`,
						);
						return expect(result).to.equal(undefined);
					});

					it(`can create and then retrieve multiple variables by ${deviceParamUpper}`, async function () {
						await Promise.all([
							configVarModel.set(
								this.device[deviceParam],
								`BALENA_A_${deviceParamUpper}`,
								'a',
							),
							configVarModel.set(
								this.device[deviceParam],
								`BALENA_B_${deviceParamUpper}`,
								'b',
							),
						]);
						const result = await configVarModel.getAllByDevice(
							this.device[deviceParam],
						);
						expect(_.find(result, { name: `BALENA_A_${deviceParamUpper}` }))
							.to.be.an('object')
							.that.has.property('value', 'a');
						expect(_.find(result, { name: `BALENA_B_${deviceParamUpper}` }))
							.to.be.an('object')
							.that.has.property('value', 'b');
						return await Promise.all([
							configVarModel.remove(
								this.device[deviceParam],
								`BALENA_A_${deviceParamUpper}`,
							),
							configVarModel.remove(
								this.device[deviceParam],
								`BALENA_B_${deviceParamUpper}`,
							),
						]);
					});
				});

				it('can create and then retrieve multiple variables by application', async function () {
					await Promise.all([
						configVarModel.set(this.device.id, 'BALENA_A_BY_APPLICATION', 'a'),
						configVarModel.set(this.device.id, 'BALENA_B_BY_APPLICATION', 'b'),
					]);
					const result = await configVarModel.getAllByApplication(
						this.application.id,
					);
					expect(_.find(result, { name: 'BALENA_A_BY_APPLICATION' }))
						.to.be.an('object')
						.that.has.property('value', 'a');
					expect(_.find(result, { name: 'BALENA_B_BY_APPLICATION' }))
						.to.be.an('object')
						.that.has.property('value', 'b');
					return await Promise.all([
						configVarModel.remove(this.device.id, 'BALENA_A_BY_APPLICATION'),
						configVarModel.remove(this.device.id, 'BALENA_B_BY_APPLICATION'),
					]);
				});
			});

			describe('balena.models.device.envVar', function () {
				givenADevice(before);

				const envVarModel = balena.models.device.envVar;

				deviceUniqueFields.forEach(function (deviceParam) {
					it(`can create a variable by ${deviceParam}`, function () {
						const promise = envVarModel.set(
							this.device[deviceParam],
							`EDITOR_BY_${deviceParam}`,
							'vim',
						);
						return expect(promise).to.not.be.rejected;
					});

					it(`...can retrieve a created variable by ${deviceParam}`, async function () {
						const result = await envVarModel.get(
							this.device[deviceParam],
							`EDITOR_BY_${deviceParam}`,
						);
						return expect(result).to.equal('vim');
					});

					it(`...can update and retrieve a variable by ${deviceParam}`, async function () {
						await envVarModel.set(
							this.device[deviceParam],
							`EDITOR_BY_${deviceParam}`,
							'emacs',
						);
						const result = await envVarModel.get(
							this.device[deviceParam],
							`EDITOR_BY_${deviceParam}`,
						);
						return expect(result).to.equal('emacs');
					});

					it(`...can delete and then fail to retrieve a variable by ${deviceParam}`, async function () {
						await envVarModel.remove(
							this.device[deviceParam],
							`EDITOR_BY_${deviceParam}`,
						);
						const result = await envVarModel.get(
							this.device[deviceParam],
							`EDITOR_BY_${deviceParam}`,
						);
						return expect(result).to.equal(undefined);
					});

					it(`can create and then retrieve multiple variables by ${deviceParam}`, async function () {
						await Promise.all([
							envVarModel.set(
								this.device[deviceParam],
								`A_BY_${deviceParam}`,
								'a',
							),
							envVarModel.set(
								this.device[deviceParam],
								`B_BY_${deviceParam}`,
								'b',
							),
						]);
						const result = await envVarModel.getAllByDevice(
							this.device[deviceParam],
						);
						expect(_.find(result, { name: `A_BY_${deviceParam}` }))
							.to.be.an('object')
							.that.has.property('value', 'a');
						expect(_.find(result, { name: `B_BY_${deviceParam}` }))
							.to.be.an('object')
							.that.has.property('value', 'b');
						return await Promise.all([
							envVarModel.remove(
								this.device[deviceParam],
								`A_BY_${deviceParam}`,
							),
							envVarModel.remove(
								this.device[deviceParam],
								`B_BY_${deviceParam}`,
							),
						]);
					});
				});

				it('can create and then retrieve multiple variables by application', async function () {
					await Promise.all([
						envVarModel.set(this.device.id, 'A_BY_APPLICATION', 'a'),
						envVarModel.set(this.device.id, 'B_BY_APPLICATION', 'b'),
					]);
					const result = await envVarModel.getAllByApplication(
						this.application.id,
					);
					expect(_.find(result, { name: 'A_BY_APPLICATION' }))
						.to.be.an('object')
						.that.has.property('value', 'a');
					expect(_.find(result, { name: 'B_BY_APPLICATION' }))
						.to.be.an('object')
						.that.has.property('value', 'b');
					return await Promise.all([
						envVarModel.remove(this.device.id, 'A_BY_APPLICATION'),
						envVarModel.remove(this.device.id, 'B_BY_APPLICATION'),
					]);
				});
			});

			describe('balena.models.device.getSupervisorTargetState()', function () {
				givenADevice(before);

				it('should be rejected if the device does not exist', function () {
					const promise =
						balena.models.device.getSupervisorTargetState('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it("should reflect the device's target state", async function () {
					const state = await balena.models.device.getSupervisorTargetState(
						this.device.id,
					);
					// first, check the name
					expect(state.local.name).to.be.a('string');
					expect(state.local.name).to.equal(this.device.device_name);

					// next, check application types and some values
					expect(state.local.apps).to.be.an('object');
					expect(state.local.apps[this.application.id].name).to.equal(
						this.application.app_name,
					);
					expect(state.local.apps[this.application.id].name).to.be.a('string');
					expect(state.local.apps[this.application.id].services).to.be.an(
						'object',
					);
					expect(state.local.apps[this.application.id].volumes).to.be.an(
						'object',
					);
					expect(state.local.apps[this.application.id].networks).to.be.an(
						'object',
					);

					// finally, check configuration type and values
					expect(state.local.config).to.be.an('object');
					expect(state.local.config['RESIN_SUPERVISOR_NATIVE_LOGGER']).to.equal(
						'true',
					);
					return expect(
						state.local.config['RESIN_SUPERVISOR_POLL_INTERVAL'],
					).to.equal('900000');
				});
			});

			describe('balena.models.device.getSupervisorState()', function () {
				givenADevice(before);

				it('should be rejected if the device does not exist', function () {
					const promise = balena.models.device.getSupervisorState('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device exists but is inaccessible', function () {
					const promise = balena.models.device.getSupervisorState(
						this.device.id,
					);
					return expect(promise).to.be.rejectedWith(
						'No online device(s) found',
					);
				});
			});

			describe('balena.models.device.getStatus()', function () {
				givenADevice(before);

				// This tests that we give a sensible error for users of older SDK versions
				// that haven't migrated their code.
				it('should throw when passing an object as a parameter', async function () {
					const device = await balena.models.device.get(this.device.id);
					return expect(
						// @ts-expect-error
						balena.models.device.getStatus(device),
					).to.be.rejectedWith(
						"[object Object] is not a valid value for parameter 'uuidOrId'",
					);
				});

				describe('Given an inactive device', () =>
					deviceUniqueFields.forEach((prop) =>
						it(`should return inactive when retrieving by ${prop}`, function () {
							const promise = balena.models.device.getStatus(this.device[prop]);
							return expect(promise).to.eventually.equal('inactive');
						}),
					));

				describe('Given an online device', function () {
					before(function () {
						return balena.pine.patch({
							resource: 'device',
							id: this.device.id,
							body: {
								// this also activates the device
								is_online: true,
							},
						});
					});

					deviceUniqueFields.forEach((prop) =>
						it(`should return idle when retrieving by ${prop}`, function () {
							const promise = balena.models.device.getStatus(this.device[prop]);
							return expect(promise).to.eventually.equal('idle');
						}),
					);
				});

				describe('Given an offline device', function () {
					before(function () {
						return balena.pine.patch({
							resource: 'device',
							id: this.device.id,
							body: {
								is_online: false,
							},
						});
					});

					deviceUniqueFields.forEach((prop) =>
						it(`should return offline when retrieving by ${prop}`, function () {
							const promise = balena.models.device.getStatus(this.device[prop]);
							return expect(promise).to.eventually.equal('offline');
						}),
					);
				});
			});
		});

		describe('given an online device', function () {
			givenADevice(before, {
				is_online: true,
				...testDeviceOsInfo,
			});

			describe('balena.models.device.get()', function () {
				it('should be able to retrieve computed terms', async function () {
					const device = await balena.models.device.get(this.device.uuid, {
						$select: ['overall_status', 'overall_progress'],
					});
					return expect(device).to.deep.match({
						overall_status: 'idle',
						overall_progress: null,
					});
				});
			});

			describe('balena.models.device.deactivate()', function () {
				it('should be rejected if the device is online with statusCode 400', function () {
					const promise = balena.models.device.deactivate(this.device.uuid);
					return expect(promise).to.be.rejected.then(function (error) {
						expect(error).to.have.property('statusCode', 400);
						return expect(error).to.have.property(
							'message',
							'Request error: Devices must be offline in order to be deactivated.',
						);
					});
				});
			});
		});

		describe('given a device id whose shorter uuid is only numbers', function () {
			before(async function () {
				// Preceeding 1 is so that this can't start with a 0, so we get reversible parsing later
				this.shortUuid = '1' + Date.now().toString().slice(-6);
				const uuid =
					this.shortUuid + balena.models.device.generateUniqueKey().slice(7);
				const deviceInfo = await balena.models.device.register(
					this.application.app_name,
					uuid,
				);
				return (this.deviceInfo = deviceInfo);
			});

			describe('balena.models.device.get()', function () {
				it('should return the device given the shorter uuid as a string', async function () {
					const device = await balena.models.device.get(this.shortUuid);
					return expect(device.id).to.equal(this.deviceInfo.id);
				});

				it('should fail to find the device given the shorter uuid as a number', function () {
					const promise = balena.models.device.get(
						parseInt(this.shortUuid, 10),
					);
					return expect(promise).to.be.rejectedWith(
						`Device not found: ${this.shortUuid}`,
					);
				});
			});
		});

		describe('given two offline devices that share the same uuid root', function () {
			before(function () {
				this.uuidRoot = 'aaaaaaaaaaaaaaaa';
				const uuid1 =
					this.uuidRoot + balena.models.device.generateUniqueKey().slice(16);
				const uuid2 =
					this.uuidRoot + balena.models.device.generateUniqueKey().slice(16);

				return Promise.all([
					balena.models.device.register(this.application.app_name, uuid1),
					balena.models.device.register(this.application.app_name, uuid2),
				]);
			});

			describe('balena.models.device.get()', () =>
				it('should be rejected with an error if there is an ambiguation between shorter uuids', function () {
					const promise = balena.models.device.get(this.uuidRoot);

					return expect(promise).to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaAmbiguousDevice',
					);
				}));

			describe('balena.models.device.has()', () =>
				it('should be rejected with an error for an ambiguous shorter uuid', function () {
					const promise = balena.models.device.has(this.uuidRoot);

					return expect(promise).to.be.rejected.and.eventually.have.property(
						'code',
						'BalenaAmbiguousDevice',
					);
				}));
		});
	});

	describe('given a multicontainer application', function () {
		givenMulticontainerApplication(before);

		describe('given a single offline device', function () {
			givenADevice(before);

			describe('balena.models.device.getWithServiceDetails()', function () {
				it('should be rejected if the device name does not exist', function () {
					const promise =
						balena.models.device.getWithServiceDetails('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device id does not exist', function () {
					const promise = balena.models.device.getWithServiceDetails(999999);
					return expect(promise).to.be.rejectedWith('Device not found: 999999');
				});

				it('should be able to use a shorter uuid', async function () {
					const device = await balena.models.device.getWithServiceDetails(
						this.device.uuid.slice(0, 8),
					);
					return expect(device.id).to.equal(this.device.id);
				});

				it('should be able to get the device by uuid', async function () {
					const device = await balena.models.device.getWithServiceDetails(
						this.device.uuid,
					);
					return expect(device.id).to.equal(this.device.id);
				});

				it('should be able to get the device by id', async function () {
					const device = await balena.models.device.getWithServiceDetails(
						this.device.id,
					);
					return expect(device.id).to.equal(this.device.id);
				});

				it('should retrieve the current service details', async function () {
					const deviceDetails =
						await balena.models.device.getWithServiceDetails(this.device.id);
					expect(deviceDetails).to.deep.match({
						device_name: this.device.device_name,
						uuid: this.device.uuid,
						is_running__release: {
							__id: this.currentRelease.id,
						},
						current_services: {
							web: [
								{
									id: this.newWebInstall.id,
									service_id: this.webService.id,
									image_id: this.newWebImage.id,
									commit: 'new-release-commit',
									status: 'Downloading',
									download_progress: 50,
								},
								{
									id: this.oldWebInstall.id,
									service_id: this.webService.id,
									image_id: this.oldWebImage.id,
									commit: 'old-release-commit',
									status: 'Running',
									download_progress: null,
								},
							],
							db: [
								{
									id: this.newDbInstall.id,
									service_id: this.dbService.id,
									image_id: this.newDbImage.id,
									commit: 'new-release-commit',
									status: 'Running',
									download_progress: null,
								},
							],
						},
					});

					// Should include the Device model properties
					expect(deviceDetails.image_install).to.have.lengthOf(3);

					// Just to make TS happy, since we already checked its length.
					const imageInstalls = deviceDetails.image_install ?? [];
					imageInstalls.forEach((imageInstall) => {
						expect(imageInstall)
							.to.have.property('id')
							.that.is.oneOf([
								this.oldWebInstall.id,
								this.newWebInstall.id,
								this.newDbInstall.id,
							]);
						expect(imageInstall)
							.to.have.property('download_progress')
							.that.is.oneOf([50, null]);
						expect(imageInstall).to.have.property('image').that.has.length(1);
						expect(imageInstall)
							.to.have.property('is_provided_by__release')
							.that.has.length(1);
						expect(imageInstall)
							.to.have.property('install_date')
							.that.is.a('string');
						expect(imageInstall).to.have.property('status').that.is.a('string');
						expect(imageInstall).to.not.have.property('service_id');
						expect(imageInstall).to.not.have.property('image_id');
						expect(imageInstall).to.not.have.property('commit');
					});

					expect(deviceDetails.gateway_download).to.have.lengthOf(0);

					// Augmented properties
					// Should filter out deleted image installs
					expect(deviceDetails.current_services.db).to.have.lengthOf(1);
					// Should have an empty list of gateway downloads
					expect(deviceDetails.current_gateway_downloads).to.have.lengthOf(0);
				});

				it('should allow options to change the device fields returned', async function () {
					const deviceDetails =
						await balena.models.device.getWithServiceDetails(this.device.id, {
							$select: deviceUniqueFields,
							$expand: {
								belongs_to__application: {
									$select: ['id', 'app_name'],
								},
							},
						});
					expect(deviceDetails.device_name).to.be.undefined;
					expect(deviceDetails.current_services).not.to.be.undefined;
					return expect(deviceDetails.belongs_to__application[0]).to.deep.match(
						{
							id: this.application.id,
							app_name: this.application.app_name,
						},
					);
				});

				it('should return gateway downloads, if available', async function () {
					await Promise.all([
						balena.pine.post({
							resource: 'gateway_download',
							body: {
								image: this.newWebImage.id,
								status: 'Downloading',
								is_downloaded_by__device: this.device.id,
								download_progress: 50,
							},
						}),
						balena.pine.post({
							resource: 'gateway_download',
							body: {
								image: this.oldWebImage.id,
								status: 'deleted',
								is_downloaded_by__device: this.device.id,
								download_progress: 100,
							},
						}),
					]);
					const deviceDetails =
						await balena.models.device.getWithServiceDetails(this.device.id);
					expect(deviceDetails.current_gateway_downloads).to.have.lengthOf(1);
					return expect(
						deviceDetails.current_gateway_downloads[0],
					).to.deep.match({
						service_id: this.webService.id,
						image_id: this.newWebImage.id,
						status: 'Downloading',
						download_progress: 50,
					});
				});
			});

			describe('balena.models.device.serviceVar', function () {
				const varModel = balena.models.device.serviceVar;

				deviceUniqueFields.forEach(function (deviceParam) {
					it(`can create a variable by ${deviceParam}`, function () {
						const promise = varModel.set(
							this.device[deviceParam],
							this.webService.id,
							`EDITOR_BY_${deviceParam}`,
							'vim',
						);
						return expect(promise).to.not.be.rejected;
					});

					it(`...can retrieve a created variable by ${deviceParam}`, async function () {
						const result = await varModel.get(
							this.device[deviceParam],
							this.webService.id,
							`EDITOR_BY_${deviceParam}`,
						);
						return expect(result).to.equal('vim');
					});

					it(`...can update and retrieve a variable by ${deviceParam}`, async function () {
						await varModel.set(
							this.device[deviceParam],
							this.webService.id,
							`EDITOR_BY_${deviceParam}`,
							'emacs',
						);
						const result = await varModel.get(
							this.device[deviceParam],
							this.webService.id,
							`EDITOR_BY_${deviceParam}`,
						);
						return expect(result).to.equal('emacs');
					});

					it(`...can delete and then fail to retrieve a variable by ${deviceParam}`, async function () {
						await varModel.remove(
							this.device[deviceParam],
							this.webService.id,
							`EDITOR_BY_${deviceParam}`,
						);
						const result = await varModel.get(
							this.device[deviceParam],
							this.webService.id,
							`EDITOR_BY_${deviceParam}`,
						);
						return expect(result).to.equal(undefined);
					});

					it(`can create and then retrieve multiple variables by ${deviceParam}`, async function () {
						await Promise.all([
							varModel.set(
								this.device[deviceParam],
								this.webService.id,
								`A_BY_${deviceParam}`,
								'a',
							),
							varModel.set(
								this.device[deviceParam],
								this.dbService.id,
								`B_BY_${deviceParam}`,
								'b',
							),
						]);
						const result = await varModel.getAllByDevice(
							this.device[deviceParam],
						);
						expect(_.find(result, { name: `A_BY_${deviceParam}` }))
							.to.be.an('object')
							.that.has.property('value', 'a');
						expect(_.find(result, { name: `B_BY_${deviceParam}` }))
							.to.be.an('object')
							.that.has.property('value', 'b');
						return await Promise.all([
							varModel.remove(
								this.device[deviceParam],
								this.webService.id,
								`A_BY_${deviceParam}`,
							),
							varModel.remove(
								this.device[deviceParam],
								this.dbService.id,
								`B_BY_${deviceParam}`,
							),
						]);
					});
				});

				it('can create and then retrieve multiple variables by application', async function () {
					await Promise.all([
						varModel.set(
							this.device.id,
							this.webService.id,
							'A_BY_APPLICATION',
							'a',
						),
						varModel.set(
							this.device.id,
							this.dbService.id,
							'B_BY_APPLICATION',
							'b',
						),
					]);
					const result = await varModel.getAllByApplication(
						this.application.id,
					);
					expect(_.find(result, { name: 'A_BY_APPLICATION' }))
						.to.be.an('object')
						.that.has.property('value', 'a');
					expect(_.find(result, { name: 'B_BY_APPLICATION' }))
						.to.be.an('object')
						.that.has.property('value', 'b');
					return await Promise.all([
						varModel.remove(
							this.device.id,
							this.webService.id,
							'A_BY_APPLICATION',
						),
						varModel.remove(
							this.device.id,
							this.dbService.id,
							'B_BY_APPLICATION',
						),
					]);
				});
			});

			describe('balena.models.device.isTrackingApplicationRelease()', function () {
				it('should be tracking the latest release, using the device id', function () {
					const promise = balena.models.device.isTrackingApplicationRelease(
						this.device.id,
					);
					return expect(promise).to.eventually.be.true;
				});

				it('should be tracking the latest release, using the device uuid', function () {
					const promise = balena.models.device.isTrackingApplicationRelease(
						this.device.uuid,
					);
					return expect(promise).to.eventually.be.true;
				});
			});

			describe('balena.models.device.getTargetReleaseHash()', function () {
				it('should retrieve the commit hash of the tracked application release, using the device id', function () {
					const promise = balena.models.device.getTargetReleaseHash(
						this.device.id,
					);
					return expect(promise).to.eventually.equal('new-release-commit');
				});

				it('should retrieve the commit hash of the tracked application release, using the device uuid', function () {
					const promise = balena.models.device.getTargetReleaseHash(
						this.device.uuid,
					);
					return expect(promise).to.eventually.equal('new-release-commit');
				});
			});

			describe('balena.models.device.deactivate()', function () {
				it('should be rejected if the device uuid does not exist', function () {
					const promise = balena.models.device.deactivate('asdfghjkl');
					return expect(promise).to.be.rejectedWith(
						'Device not found: asdfghjkl',
					);
				});

				it('should be rejected if the device id does not exist', function () {
					const promise = balena.models.device.deactivate(999999);
					return expect(promise).to.be.rejectedWith('Device not found: 999999');
				});

				it('should be rejected if the device is in a Strarter application with statusCode 400', function () {
					const promise = balena.models.device.deactivate(this.device.uuid);
					return expect(promise).to.be.rejected.then(function (error) {
						expect(error).to.have.property('statusCode', 400);
						return expect(error).to.have.property(
							'message',
							'Request error: Cannot deactivate devices of Starter applications.',
						);
					});
				});
			});
		});

		describe('given a single online device on the downloading state', function () {
			givenADevice(before, {
				is_online: true,
				...testDeviceOsInfo,
				last_connectivity_event: '2019-05-13T16:14',
			});

			describe('balena.models.device.getStatus()', () =>
				it('should properly retrieve the status', function () {
					const promise = balena.models.device.getStatus(this.device.uuid);
					return expect(promise).to.eventually.equal('updating');
				}));

			describe('balena.models.device.getProgress()', () =>
				it('should properly retrieve the progress', async function () {
					const result = await balena.models.device.getProgress(
						this.device.uuid,
					);
					expect(result).to.be.a('number');
					return expect(result).to.equal(75);
				}));
		});

		describe('given a newly registered offline device', function () {
			givenADevice(beforeEach);

			describe('balena.models.device.pinToRelease()', function () {
				it('should set the device to a specific release, using the device id & release commit', async function () {
					await balena.models.device.pinToRelease(
						this.device.id,
						'old-release-commit',
					);
					const releaseHash = await balena.models.device.getTargetReleaseHash(
						this.device.id,
					);
					expect(releaseHash).to.equal('old-release-commit');
					const isTracking =
						await balena.models.device.isTrackingApplicationRelease(
							this.device.id,
						);
					return expect(isTracking).to.be.false;
				});

				it('should set the device to a specific release, using the device id & release id', async function () {
					await balena.models.device.pinToRelease(
						this.device.id,
						this.oldRelease.id,
					);
					const releaseHash = await balena.models.device.getTargetReleaseHash(
						this.device.id,
					);
					expect(releaseHash).to.equal('old-release-commit');
					const isTracking =
						await balena.models.device.isTrackingApplicationRelease(
							this.device.id,
						);
					return expect(isTracking).to.be.false;
				});

				it('should set the device to a specific release, using the device uuid & release commit', async function () {
					await balena.models.device.pinToRelease(
						this.device.uuid,
						'old-release-commit',
					);
					const releaseHash = await balena.models.device.getTargetReleaseHash(
						this.device.id,
					);
					expect(releaseHash).to.equal('old-release-commit');
					const isTracking =
						await balena.models.device.isTrackingApplicationRelease(
							this.device.id,
						);
					return expect(isTracking).to.be.false;
				});

				it('should set the device to a specific release, using the device uuid & release id', async function () {
					await balena.models.device.pinToRelease(
						this.device.uuid,
						this.oldRelease.id,
					);
					const releaseHash = await balena.models.device.getTargetReleaseHash(
						this.device.id,
					);
					expect(releaseHash).to.equal('old-release-commit');
					const isTracking =
						await balena.models.device.isTrackingApplicationRelease(
							this.device.id,
						);
					return expect(isTracking).to.be.false;
				});
			});

			describe('balena.models.device.trackApplicationRelease()', function () {
				it('should set the device to track the current application release, using the device id', async function () {
					await balena.models.device.pinToRelease(
						this.device.id,
						'old-release-commit',
					);
					await balena.models.device.trackApplicationRelease(this.device.id);
					const isTracking =
						await balena.models.device.isTrackingApplicationRelease(
							this.device.id,
						);
					return expect(isTracking).to.be.true;
				});

				it('should set the device to track the current application release, using the device uuid', async function () {
					await balena.models.device.pinToRelease(
						this.device.id,
						'old-release-commit',
					);
					await balena.models.device.trackApplicationRelease(this.device.uuid);
					const isTracking =
						await balena.models.device.isTrackingApplicationRelease(
							this.device.id,
						);
					return expect(isTracking).to.be.true;
				});
			});
		});

		describe('given a device that supports multicontainer', function () {
			givenADevice(beforeEach, {
				...testDeviceOsInfo,
			});

			describe('balena.models.device.setSupervisorRelease()', function () {
				givenASupervisorRelease(before);

				it('should set the device to a specific supervisor release, using the device id & target version', async function () {
					await balena.models.device.setSupervisorRelease(
						this.device.id,
						this.supervisorRelease.supervisor_version,
					);
					const device = await balena.models.device.get(this.device.id);
					expect(
						device.should_be_managed_by__supervisor_release,
					).to.have.deep.property('__id', this.supervisorRelease.id);
				});

				it('should set the device to a specific supervisor release, using the device id & supervisor release id', async function () {
					await balena.models.device.setSupervisorRelease(
						this.device.id,
						this.supervisorRelease.id,
					);
					const device = await balena.models.device.get(this.device.id);
					expect(
						device.should_be_managed_by__supervisor_release,
					).to.have.deep.property('__id', this.supervisorRelease.id);
				});

				it('should fail to set the device to a specific non-existent supervisor release', function () {
					const badRelease = 'nonexistent-supervisor-version';
					const promise = balena.models.device.setSupervisorRelease(
						this.device.id,
						badRelease,
					);
					return expect(promise).to.be.rejectedWith(
						`Release not found: ${badRelease}`,
					);
				});
			});
		});

		describe('given a device that does not support multicontainer', function () {
			const hostOS = 'Resin OS 2.7.8+rev1';
			givenADevice(before, {
				os_version: hostOS,
			});

			describe('balena.models.device.setSupervisorRelease()', function () {
				givenASupervisorRelease(before);

				it('should fail to set the target supervisor for a pre-multicontainer device', function () {
					const promise = balena.models.device.setSupervisorRelease(
						this.device.id,
						this.supervisorRelease.id,
					);
					return expect(promise).to.be.rejectedWith(
						`Incompatible host OS version: ${hostOS} - must be >= 2.12.0`,
					);
				});
			});
		});

		describe('given services with weird names', function () {
			before(function () {
				return Promise.all([
					balena.pine.patch({
						resource: 'service',
						id: this.webService.id,
						body: {
							service_name: 'hasOwnProperty',
						},
					}),
					balena.pine.patch({
						resource: 'service',
						id: this.dbService.id,
						body: {
							service_name: '__proto__',
						},
					}),
				]);
			});

			describe('given a single offline device', function () {
				givenADevice(before);

				describe('balena.models.device.getWithServiceDetails()', () =>
					it('should retrieve the current service details', async function () {
						const deviceDetails =
							await balena.models.device.getWithServiceDetails(this.device.id);
						expect(deviceDetails).to.deep.match({
							device_name: this.device.device_name,
							uuid: this.device.uuid,
							is_running__release: {
								__id: this.currentRelease.id,
							},
						});

						expect(
							Object.keys(deviceDetails.current_services).sort(),
						).to.deep.equal(['__proto__', 'hasOwnProperty']);

						// it seems that deep.match doesn't work with objects with a custom __proto__ property
						expect(deviceDetails.current_services.hasOwnProperty).to.deep.match(
							[
								{
									id: this.newWebInstall.id,
									service_id: this.webService.id,
									image_id: this.newWebImage.id,
									commit: 'new-release-commit',
									status: 'Downloading',
									download_progress: 50,
								},
								{
									id: this.oldWebInstall.id,
									service_id: this.webService.id,
									image_id: this.oldWebImage.id,
									commit: 'old-release-commit',
									status: 'Running',
									download_progress: null,
								},
							],
						);

						return expect(
							deviceDetails.current_services.__proto__,
						).to.deep.match([
							{
								id: this.newDbInstall.id,
								service_id: this.dbService.id,
								image_id: this.newDbImage.id,
								commit: 'new-release-commit',
								status: 'Running',
								download_progress: null,
							},
						]);
					}));
			});
		});
	});

	describe('given three compatible & one incompatible applications and a single device', function () {
		before(async function () {
			const [
				application1,
				applicationSameDT,
				applicationCompatibleDT,
				applicationIncompatibleDT,
			] = await Promise.all([
				balena.models.application.create({
					name: 'FooBar',
					applicationType: 'microservices-starter',
					deviceType: 'raspberrypi3',
					organization: this.initialOrg.id,
				}),
				balena.models.application.create({
					name: 'BarBaz',
					applicationType: 'microservices-starter',
					deviceType: 'raspberrypi3',
					organization: this.initialOrg.id,
				}),
				balena.models.application.create({
					name: 'BazFoo',
					applicationType: 'microservices-starter',
					deviceType: 'raspberry-pi2',
					organization: this.initialOrg.id,
				}),
				balena.models.application.create({
					name: 'BarBazNuc',
					applicationType: 'microservices-starter',
					deviceType: 'intel-nuc',
					organization: this.initialOrg.id,
				}),
			]);
			this.application1 = application1;
			this.applicationSameDT = applicationSameDT;
			this.applicationCompatibleDT = applicationCompatibleDT;
			this.applicationIncompatibleDT = applicationIncompatibleDT;

			const uuid = balena.models.device.generateUniqueKey();
			this.deviceInfo = await balena.models.device.register(
				this.application1.app_name,
				uuid,
			);
		});

		after(function () {
			return balena.pine.delete({
				resource: 'application',
				options: {
					$filter: {
						id: {
							$in: [
								this.application1.id,
								this.applicationSameDT.id,
								this.applicationCompatibleDT.id,
								this.applicationIncompatibleDT.id,
							],
						},
					},
				},
			});
		});

		afterEach(async function () {
			await balena.models.device.move(this.deviceInfo.id, this.application1.id);
		});

		describe('balena.models.device.move()', function () {
			describe('when trying to move between applications of the same device type', function () {
				applicationRetrievalFields.forEach((prop) =>
					it(`should be able to move a device by device uuid and application ${prop}`, async function () {
						await balena.models.device.move(
							this.deviceInfo.uuid,
							this.applicationSameDT[prop],
						);
						const applicationName =
							await balena.models.device.getApplicationName(
								this.deviceInfo.uuid,
							);
						return expect(applicationName).to.equal(
							this.applicationSameDT.app_name,
						);
					}),
				);

				it('should be able to move a device using shorter uuids', async function () {
					await balena.models.device.move(
						this.deviceInfo.uuid.slice(0, 7),
						this.applicationSameDT.id,
					);
					const applicationName = await balena.models.device.getApplicationName(
						this.deviceInfo.id,
					);
					return expect(applicationName).to.equal(
						this.applicationSameDT.app_name,
					);
				});
			});

			it('should be able to move a device to an application of the same architecture', async function () {
				await balena.models.device.move(
					this.deviceInfo.id,
					this.applicationCompatibleDT.id,
				);
				const applicationName = await balena.models.device.getApplicationName(
					this.deviceInfo.id,
				);
				return expect(applicationName).to.equal(
					this.applicationCompatibleDT.app_name,
				);
			});

			describe('when trying to move to an incompatible application', function () {
				it('should be rejected with an incompatibility error', function () {
					const promise = balena.models.device.move(
						this.deviceInfo.uuid,
						this.applicationIncompatibleDT.app_name,
					);
					return expect(promise).to.be.rejectedWith(
						`Incompatible application: ${this.applicationIncompatibleDT.app_name}`,
					);
				});
			});
		});
	});

	describe('given applications of different architectures with a device on each', function () {
		before(async function () {
			const apps = await Promise.all([
				balena.models.application.create({
					name: 'FooBarArmv6',
					applicationType: 'microservices-starter',
					deviceType: 'raspberry-pi',
					organization: this.initialOrg.id,
				}),
				balena.models.application.create({
					name: 'FooBar32',
					applicationType: 'microservices-starter',
					deviceType: 'raspberrypi3',
					organization: this.initialOrg.id,
				}),
				balena.models.application.create({
					name: 'BarBaz64',
					applicationType: 'microservices-starter',
					deviceType: 'raspberrypi3-64',
					organization: this.initialOrg.id,
				}),
			]);
			this.apps = {
				rpi: apps[0],
				armv7hf: apps[1],
				aarch64: apps[2],
			};

			const devices = await Promise.all(
				apps.map((app) =>
					balena.models.device.register(
						app.id,
						balena.models.device.generateUniqueKey(),
					),
				),
			);
			this.devices = {
				rpi: devices[0],
				armv7hf: devices[1],
				aarch64: devices[2],
			};
		});

		after(function () {
			return balena.pine.delete({
				resource: 'application',
				options: {
					$filter: {
						id: {
							$in: _.map(this.apps, 'id'),
						},
					},
				},
			});
		});

		describe('balena.models.device.move()', function () {
			[
				['rpi', 'armv7hf'],
				['rpi', 'aarch64'],
				['armv7hf', 'aarch64'],
			].forEach(function ([deviceArch, appArch]) {
				it(`should be rejected with an incompatibility error when trying to move an ${deviceArch} device to an ${appArch} application`, function () {
					const device = this.devices[deviceArch];
					const app = this.apps[appArch];
					const promise = balena.models.device.move(device.uuid, app.app_name);
					return expect(promise).to.be.rejectedWith(
						`Incompatible application: ${app.app_name}`,
					);
				});
			});

			[
				['aarch64', 'armv7hf'],
				['aarch64', 'rpi'],
				['armv7hf', 'rpi'],
			].forEach(function ([deviceArch, appArch]) {
				it(`should be able to move an ${deviceArch} device to an ${appArch} application`, async function () {
					const device = this.devices[deviceArch];
					const app = this.apps[appArch];
					await balena.models.device.move(device.id, app.id);
					const applicationName = await balena.models.device.getApplicationName(
						device.id,
					);
					return expect(applicationName).to.equal(app.app_name);
				});
			});
		});
	});

	describe('helpers', function () {
		describe('balena.models.device.getDashboardUrl()', function () {
			it('should return the respective DashboardUrl when a device uuid is provided', function () {
				// prettier-ignore
				const dashboardUrl = (/** @type {string} */ (sdkOpts.apiUrl))
					.replace(/api/, 'dashboard');
				return expect(
					balena.models.device.getDashboardUrl(
						'af1150f1b1734c428fb1606a4cddec6c',
					),
				).to.equal(
					`${dashboardUrl}/devices/af1150f1b1734c428fb1606a4cddec6c/summary`,
				);
			});

			it('should throw when a device uuid is not a string', () =>
				expect(() =>
					// @ts-expect-error
					balena.models.device.getDashboardUrl(1234567),
				).to.throw());

			it('should throw when a device uuid is not provided', () =>
				// @ts-expect-error
				expect(() => balena.models.device.getDashboardUrl()).to.throw());
		});

		describe('balena.models.device.lastOnline()', function () {
			it('should return the string "Connecting..." if the device has no `last_connectivity_event`', () =>
				expect(
					balena.models.device.lastOnline({
						last_connectivity_event: null,
						is_online: false,
					}),
				).to.equal('Connecting...'));

			it('should return the correct time string if the device is online', function () {
				const mockDevice = {
					last_connectivity_event: new Date(
						Date.now() - 1000 * 60 * 5,
					).toUTCString(),
					is_online: true,
				};

				return expect(balena.models.device.lastOnline(mockDevice)).to.equal(
					'Online (for 5 minutes)',
				);
			});

			it('should return the correct time string if the device is offline', function () {
				const mockDevice = {
					last_connectivity_event: new Date(
						Date.now() - 1000 * 60 * 5,
					).toUTCString(),
					is_online: false,
				};

				return expect(balena.models.device.lastOnline(mockDevice)).to.equal(
					'5 minutes ago',
				);
			});
		});

		describe('balena.models.device.getLocalModeSupport()', function () {
			it('should identify a device w/o a supervisor_version as not supported', () =>
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'dev',
						os_version: 'Resin OS 2.7.8+rev1',
						supervisor_version: '',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Device is not yet fully provisioned',
				}));

			it('should identify a device w/o a last_connectivity_event as not supported', () =>
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'dev',
						os_version: 'Resin OS 2.7.8+rev1',
						supervisor_version: '6.4.2',
						last_connectivity_event: null,
					}),
				).to.deep.equal({
					supported: false,
					message: 'Device is not yet fully provisioned',
				}));

			it('should identify a device w/o an os_version as not supported', () =>
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'dev',
						os_version: null,
						supervisor_version: '6.4.2',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Device OS version does not support local mode',
				}));

			it('should identify a device with an invalid os_version as not supported', () =>
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'dev',
						os_version: 'ResinOS 2.7.8.9+rev1',
						supervisor_version: '6.4.2',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Device OS version does not support local mode',
				}));

			it('should identify a device with a v1 OS as not supported', () =>
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: '',
						os_version: 'Resin OS 1.26.0',
						supervisor_version: '6.4.2',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Device OS version does not support local mode',
				}));

			it('should identify a device with an old supervisor as not supported', () =>
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'dev',
						os_version: 'Resin OS 2.0.0+rev1',
						supervisor_version: '3.99.99',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Device supervisor version does not support local mode',
				}));

			it('should identify a device w/o an os_variant as not supported', () =>
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: '',
						os_version: 'Resin OS 2.7.8+rev1',
						supervisor_version: '6.4.2',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Local mode is only supported on development OS versions',
				}));

			it('should identify a device with a production image as not supported', () =>
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'prod',
						os_version: 'Resin OS 2.7.8+rev1',
						supervisor_version: '6.4.2',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: false,
					message: 'Local mode is only supported on development OS versions',
				}));

			it('should identify a device with a development image as supported', () =>
				expect(
					balena.models.device.getLocalModeSupport({
						is_online: true,
						os_variant: 'dev',
						os_version: 'Resin OS 2.7.8+rev1',
						supervisor_version: '6.4.2',
						last_connectivity_event: '2019-05-13T16:14',
					}),
				).to.deep.equal({
					supported: true,
					message: 'Supported',
				}));
		});

		describe('balena.models.device.getOsVersion()', function () {
			it('should not parse invalid semver versions', () =>
				_.forEach(
					[
						['Resin OS ', 'dev'],
						['Resin OS ', 'prod'],
						['Resin OS 2.0-beta.8', ''],
					],
					function ([osVersion, osVariant]) {
						return expect(
							balena.models.device.getOsVersion({
								os_version: osVersion,
								os_variant: osVariant,
							}),
						).to.equal(null);
					},
				));

			it('should parse plain os versions w/o variant', () =>
				_.forEach(
					[
						['Resin OS 1.2.1', '', '1.2.1'],
						['Resin OS 1.6.0', '', '1.6.0'],
						['Resin OS 2.0.0-beta.1', '', '2.0.0-beta.1'],
						['Resin OS 2.0.0-beta.3', '', '2.0.0-beta.3'],
						['Resin OS 2.0.0-beta11.rev1', '', '2.0.0-beta11.rev1'],
						['Resin OS 2.0.0-beta.8', '', '2.0.0-beta.8'],
						['Resin OS 2.0.0-rc1.rev1', '', '2.0.0-rc1.rev1'],
						['Resin OS 2.0.0-rc1.rev2', '', '2.0.0-rc1.rev2'],
						['Resin OS 2.0.1-beta.4', '', '2.0.1-beta.4'],
						['Resin OS 2.0.1.rev1', '', '2.0.1+rev1'],
						['Resin OS 2.0.2-beta.2', '', '2.0.2-beta.2'],
						['Resin OS 2.0.2-beta.7', '', '2.0.2-beta.7'],
						['Resin OS 2.0.2+rev2', '', '2.0.2+rev2'],
						['Resin OS 2.0.6+rev2', '', '2.0.6+rev2'],
					],
					function ([osVersion, osVariant, expectation]) {
						return expect(
							balena.models.device.getOsVersion({
								os_version: osVersion,
								os_variant: osVariant,
							}),
						).to.equal(expectation);
					},
				));

			it('should properly combine the plain os version & variant', () =>
				_.forEach(
					[
						['Resin OS 2.0.0-beta.8', 'prod', '2.0.0-beta.8+prod'],
						['balenaOS 2.0.0-beta12.rev1', 'prod', '2.0.0-beta12.rev1+prod'],
						['Resin OS 2.0.0-rc1.rev2', 'prod', '2.0.0-rc1.rev2+prod'],
						['Resin OS 2.0.0+rev2', 'prod', '2.0.0+rev2.prod'],
						['Resin OS 2.0.0+rev3', 'prod', '2.0.0+rev3.prod'],
						['Resin OS 2.0.2+rev2', 'dev', '2.0.2+rev2.dev'],
						['Resin OS 2.0.3+rev1', 'dev', '2.0.3+rev1.dev'],
						['Resin OS 2.0.3+rev1', 'prod', '2.0.3+rev1.prod'],
						['Resin OS 2.0.4+rev1', 'dev', '2.0.4+rev1.dev'],
						['Resin OS 2.0.4+rev1', 'prod', '2.0.4+rev1.prod'],
						['Resin OS 2.0.4+rev2', 'prod', '2.0.4+rev2.prod'],
						['Resin OS 2.0.5', 'dev', '2.0.5+dev'],
						['Resin OS 2.0.5+rev1', 'dev', '2.0.5+rev1.dev'],
						['Resin OS 2.0.5+rev1', 'prod', '2.0.5+rev1.prod'],
						['Resin OS 2.0.6+rev1', 'dev', '2.0.6+rev1.dev'],
						['Resin OS 2.0.6+rev1', 'prod', '2.0.6+rev1.prod'],
						['Resin OS 2.0.6+rev2', 'dev', '2.0.6+rev2.dev'],
						['Resin OS 2.0.6+rev2', 'prod', '2.0.6+rev2.prod'],
						['Resin OS 2.1.0+rev1', 'dev', '2.1.0+rev1.dev'],
						['Resin OS 2.1.0+rev1', 'prod', '2.1.0+rev1.prod'],
						['Resin OS 2.2.0+rev1', 'dev', '2.2.0+rev1.dev'],
						['Resin OS 2.2.0+rev1', 'prod', '2.2.0+rev1.prod'],
						['Resin OS 2.9.0-multi1+rev1', 'dev', '2.9.0-multi1+rev1.dev'],
						['Resin OS 2.9.7+rev1', 'dev', '2.9.7+rev1.dev'],
						['Resin OS 2.9.7+rev1', 'prod', '2.9.7+rev1.prod'],
						['Resin OS 2.12.0+rev1', 'dev', '2.12.0+rev1.dev'],
						['Resin OS 2.12.0+rev1', 'prod', '2.12.0+rev1.prod'],
						['Resin OS 2.12.1+rev1', 'dev', '2.12.1+rev1.dev'],
						['Resin OS 2.12.1+rev1', 'prod', '2.12.1+rev1.prod'],
						['Resin OS 2.12.3', 'dev', '2.12.3+dev'],
						['Resin OS 2.12.3+rev1', 'dev', '2.12.3+rev1.dev'],
						['balenaOS 2.26.0', 'dev', '2.26.0+dev'],
						['balenaOS 2.26.0+rev1', 'dev', '2.26.0+rev1.dev'],
						['balenaOS 2.26.0+rev1', 'prod', '2.26.0+rev1.prod'],
						['balenaOS 2.28.0-beta1.rev1', 'prod', '2.28.0-beta1.rev1+prod'],
						['balenaOS 2.28.0+rev1', 'dev', '2.28.0+rev1.dev'],
					],
					function ([osVersion, osVariant, expectation]) {
						return expect(
							balena.models.device.getOsVersion({
								os_version: osVersion,
								os_variant: osVariant,
							}),
						).to.equal(expectation);
					},
				));

			it('should properly parse the os_version with variant suffix w/o os_variant', () =>
				_.forEach(
					[
						['Resin OS 2.0.0-rc6.rev1 (prod)', '', '2.0.0-rc6.rev1+prod'],
						['Resin OS 2.0.0.rev1 (prod)', '', '2.0.0+rev1.prod'],
						['Resin OS 2.0.0+rev2 (prod)', '', '2.0.0+rev2.prod'],
						['Resin OS 2.0.0+rev3 (dev)', '', '2.0.0+rev3.dev'],
						['Resin OS 2.0.0+rev3 (prod)', '', '2.0.0+rev3.prod'],
						['Resin OS 2.0.0+rev4 (prod)', '', '2.0.0+rev4.prod'],
						['Resin OS 2.0.0+rev5 (dev)', '', '2.0.0+rev5.dev'],
					],
					function ([osVersion, osVariant, expectation]) {
						return expect(
							balena.models.device.getOsVersion({
								os_version: osVersion,
								os_variant: osVariant,
							}),
						).to.equal(expectation);
					},
				));

			it('should properly combine the os_version with variant suffix & os_variant', () =>
				_.forEach(
					[
						['Resin OS 2.0.0.rev1 (prod)', 'prod', '2.0.0+rev1.prod'],
						['Resin OS 2.0.0+rev2 (prod)', 'prod', '2.0.0+rev2.prod'],
						['Resin OS 2.0.0+rev3 (dev)', 'dev', '2.0.0+rev3.dev'],
						['Resin OS 2.0.0+rev3 (prod)', 'prod', '2.0.0+rev3.prod'],
						['Resin OS 2.0.0+rev4 (prod)', 'prod', '2.0.0+rev4.prod'],
						['Resin OS 2.0.0+rev5 (prod)', 'prod', '2.0.0+rev5.prod'],
					],
					function ([osVersion, osVariant, expectation]) {
						return expect(
							balena.models.device.getOsVersion({
								os_version: osVersion,
								os_variant: osVariant,
							}),
						).to.equal(expectation);
					},
				));
		});

		describe('balena.models.device._checkOsUpdateTarget()', function () {
			const uuid = balena.models.device.generateUniqueKey();

			const { _checkOsUpdateTarget } = balena.models.device;

			it('should throw when the current os version is invalid', () =>
				[
					['Resin OS ', 'dev'],
					['Resin OS ', 'prod'],
					['Resin OS 2.0-beta.8', ''],
				].forEach(function ([osVersion, osVariant]) {
					// prettier-ignore
					const mockDevice = {
						uuid,
						is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'raspberrypi3' }]),
						is_online: true,
						os_version: osVersion,
						os_variant: osVariant,
					};

					return expect(() =>
						_checkOsUpdateTarget(mockDevice, '2.29.2+rev1.prod'),
					).to.throw('Invalid current balenaOS version');
				}));

			it('should throw when the device is offline', () =>
				[
					['Resin OS 1.21.0', '', '1.28.0'],
					['Resin OS 1.30.1', '', '2.5.0+rev1'],
					['balenaOS 2.26.0+rev1', 'prod', '2.29.2+rev1.prod'],
				].forEach(function ([osVersion, osVariant, targetOsVersion]) {
					// prettier-ignore
					const mockDevice = {
						uuid,
						is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'raspberrypi3' }]),
						is_online: false,
						os_version: osVersion,
						os_variant: osVariant,
					};

					return expect(() =>
						_checkOsUpdateTarget(mockDevice, targetOsVersion),
					).to.throw('The device is offline');
				}));

			it('should throw for upgrades from prod -> dev', () =>
				[
					['Resin OS 2.0.0+rev3 (prod)', 'prod'],
					['Resin OS 2.0.0+rev3 (prod)', ''],
					['Resin OS 2.0.4+rev1', 'prod'],
					['Resin OS 2.0.5', 'prod'],
					['Resin OS 2.12.1+rev1', 'prod'],
					['Resin OS 2.12.3', 'prod'],
					['Resin OS 2.12.3+rev1', 'prod'],
					['balenaOS 2.26.0', 'prod'],
					['balenaOS 2.28.0+rev1', 'prod'],
				].forEach(function ([osVersion, osVariant]) {
					// prettier-ignore
					const mockDevice = {
						uuid,
						is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'raspberrypi3' }]),
						is_online: true,
						os_version: osVersion,
						os_variant: osVariant,
					};

					return expect(() =>
						_checkOsUpdateTarget(mockDevice, '2.29.2+rev1.dev'),
					).to.throw(
						'Updates cannot be performed between development and production balenaOS variants',
					);
				}));

			it('should throw for upgrades from dev -> prod', () =>
				[
					['Resin OS 2.0.0+rev3 (dev)', 'dev'],
					['Resin OS 2.0.0+rev5 (dev)', ''],
					['Resin OS 2.0.4+rev1', 'dev'],
					['Resin OS 2.0.5', 'dev'],
					['Resin OS 2.0.5+rev1', 'dev'],
					['Resin OS 2.0.6+rev2', 'dev'],
					['Resin OS 2.9.7+rev1', 'dev'],
					['Resin OS 2.12.0+rev1', 'dev'],
					['Resin OS 2.12.1+rev1', 'dev'],
					['Resin OS 2.12.3', 'dev'],
					['balenaOS 2.26.0', 'dev'],
					['balenaOS 2.26.0+rev1', 'dev'],
					['balenaOS 2.28.0+rev1', 'dev'],
				].forEach(function ([osVersion, osVariant]) {
					// prettier-ignore
					const mockDevice = {
						uuid,
						is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'raspberrypi3' }]),
						is_online: true,
						os_version: osVersion,
						os_variant: osVariant,
					};

					return expect(() =>
						_checkOsUpdateTarget(mockDevice, '2.29.2+rev1.prod'),
					).to.throw(
						'Updates cannot be performed between development and production balenaOS variants',
					);
				}));

			it('should throw when the device is running a pre-release version', () =>
				[
					['Resin OS 2.0.0-beta.1', ''],
					['Resin OS 2.0.0-beta.3', ''],
					['Resin OS 2.0.0-beta11.rev1', ''],
					['Resin OS 2.0.0-beta.8', ''],
					['Resin OS 2.0.0-beta.8', 'prod'],
					['balenaOS 2.0.0-beta12.rev1', 'prod'],
					['Resin OS 2.0.0-rc1.rev1', ''],
					['Resin OS 2.0.0-rc1.rev2', 'prod'],
					['Resin OS 2.0.0-rc1.rev2', ''],
					['Resin OS 2.0.0-rc6.rev1 (prod)', ''],
					['Resin OS 2.0.1-beta.4', ''],
					['Resin OS 2.0.2-beta.2', ''],
					['Resin OS 2.0.2-beta.7', ''],
					['Resin OS 2.9.0-multi1+rev1', 'dev'],
					['balenaOS 2.28.0-beta1.rev1', 'prod'],
				].forEach(function ([osVersion, osVariant]) {
					// prettier-ignore
					const mockDevice = {
						uuid,
						is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'raspberrypi3' }]),
						is_online: true,
						os_version: osVersion,
						os_variant: osVariant,
					};

					return expect(() =>
						_checkOsUpdateTarget(mockDevice, '2.29.2+rev1.prod'),
					).to.throw(
						'Updates cannot be performed on pre-release balenaOS versions',
					);
				}));

			describe('v1 -> v1 hup', () =>
				['raspberrypi3', 'intel-nuc'].forEach((deviceType) =>
					describe(`given a ${deviceType}`, function () {
						it('should throw when current os version is < 1.8.0', () =>
							[
								['Resin OS 1.2.1', ''],
								['Resin OS 1.6.0', ''],
								['Resin OS 1.7.2', ''],
							].forEach(function ([osVersion, osVariant]) {
								// prettier-ignore
								const mockDevice = {
									uuid,
									is_of__device_type:  /** @type [{ slug: string; }] */ ([{ slug: deviceType }]),
									is_online: true,
									os_version: osVersion,
									os_variant: osVariant,
								};

								return expect(() =>
									_checkOsUpdateTarget(mockDevice, '1.26.0'),
								).to.throw('Current OS version must be >= 1.8.0');
							}));

						it('should throw when the target os version is below the min supported v1 version', () =>
							[
								['Resin OS 1.8.0', ''],
								['Resin OS 1.10.0', ''],
								['Resin OS 1.19.0', ''],
								['Resin OS 1.21.0', ''],
							].forEach(function ([osVersion, osVariant]) {
								// prettier-ignore
								const mockDevice = {
									uuid,
									is_of__device_type:  /** @type [{ slug: string; }] */ ([{ slug: deviceType }]),
									is_online: true,
									os_version: osVersion,
									os_variant: osVariant,
								};

								return expect(() =>
									_checkOsUpdateTarget(mockDevice, '1.25.0'),
								).to.throw('Target OS version must be >= 1.26.0');
							}));

						it('should not throw when it is a valid v1 -> v1 hup', () =>
							[
								['Resin OS 1.8.0', ''],
								['Resin OS 1.10.0', ''],
								['Resin OS 1.19.0', ''],
								['Resin OS 1.21.0', ''],
							].forEach(function ([osVersion, osVariant]) {
								// prettier-ignore
								const mockDevice = {
									uuid,
									is_of__device_type:  /** @type [{ slug: string; }] */ ([{ slug: deviceType }]),
									is_online: true,
									os_version: osVersion,
									os_variant: osVariant,
								};

								return expect(() =>
									_checkOsUpdateTarget(mockDevice, '1.28.0'),
								).to.not.throw();
							}));
					}),
				));

			describe('v1 -> v2 hup', function () {
				describe('given a raspberrypi3', function () {
					it('should throw when current os version is < 1.8.0', () =>
						[
							['Resin OS 1.2.1', ''],
							['Resin OS 1.6.0', ''],
							['Resin OS 1.7.2', ''],
						].forEach(function ([osVersion, osVariant]) {
							// prettier-ignore
							const mockDevice = {
								uuid,
								is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'raspberrypi3' }]),
								is_online: true,
								os_version: osVersion,
								os_variant: osVariant,
							};

							return expect(() =>
								_checkOsUpdateTarget(mockDevice, '2.5.0+rev1'),
							).to.throw('Current OS version must be >= 1.8.0');
						}));

					it('should not throw when it is a valid v1 -> v2 hup', () =>
						[
							['Resin OS 1.8.0', ''],
							['Resin OS 1.10.0', ''],
							['Resin OS 1.19.0', ''],
							['Resin OS 1.21.0', ''],
							['Resin OS 1.26.1', ''],
							['Resin OS 1.30.1', ''],
						].forEach(function ([osVersion, osVariant]) {
							// prettier-ignore
							const mockDevice = {
								uuid,
								is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'raspberrypi3' }]),
								is_online: true,
								os_version: osVersion,
								os_variant: osVariant,
							};

							return expect(() =>
								_checkOsUpdateTarget(mockDevice, '2.5.0+rev1'),
							).to.not.throw();
						}));
				});

				describe('given a beaglebone-black', function () {
					it('should throw when current os version is < 1.30.1', () =>
						[
							['Resin OS 1.2.1', ''],
							['Resin OS 1.6.0', ''],
							['Resin OS 1.7.2', ''],
							['Resin OS 1.8.0', ''],
							['Resin OS 1.10.0', ''],
							['Resin OS 1.19.0', ''],
							['Resin OS 1.21.0', ''],
							['Resin OS 1.26.1', ''],
						].forEach(function ([osVersion, osVariant]) {
							// prettier-ignore
							const mockDevice = {
								uuid,
								is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'beaglebone-black' }]),
								is_online: true,
								os_version: osVersion,
								os_variant: osVariant,
							};

							return expect(() =>
								_checkOsUpdateTarget(mockDevice, '2.5.0+rev1'),
							).to.throw('Current OS version must be >= 1.30.1');
						}));

					it('should not throw when it is a valid v1 -> v2 hup', () =>
						[['Resin OS 1.30.1', '']].forEach(function ([
							osVersion,
							osVariant,
						]) {
							// prettier-ignore
							const mockDevice = {
								uuid,
								is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'beaglebone-black' }]),
								is_online: true,
								os_version: osVersion,
								os_variant: osVariant,
							};

							return expect(() =>
								_checkOsUpdateTarget(mockDevice, '2.5.0+rev1'),
							).to.not.throw();
						}));
				});
			});

			describe('v2 -> v2 hup', function () {
				describe('given a raspberrypi3', function () {
					it('should throw when current os version is < 2.0.0+rev1', () =>
						[['Resin OS 2.0.0.rev0 (prod)', 'prod']].forEach(function ([
							osVersion,
							osVariant,
						]) {
							// prettier-ignore
							const mockDevice = {
								uuid,
								is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'raspberrypi3' }]),
								is_online: true,
								os_version: osVersion,
								os_variant: osVariant,
							};

							return expect(() =>
								_checkOsUpdateTarget(mockDevice, '2.1.0+rev1.prod'),
							).to.throw('Current OS version must be >= 2.0.0+rev1');
						}));

					it('should not throw when it is a valid v2 -> v2 hup', () =>
						[
							['Resin OS 2.0.0.rev1 (prod)', 'prod'],
							['Resin OS 2.0.0.rev1 (prod)', ''],
							['Resin OS 2.0.0+rev2', 'prod'],
							['Resin OS 2.0.0+rev2 (prod)', 'prod'],
							['Resin OS 2.0.0+rev2 (prod)', ''],
							['Resin OS 2.0.0+rev3', 'prod'],
							['Resin OS 2.0.0+rev3 (prod)', 'prod'],
							['Resin OS 2.0.0+rev3 (prod)', ''],
							['Resin OS 2.0.0+rev4 (prod)', 'prod'],
							['Resin OS 2.0.0+rev4 (prod)', ''],
							['Resin OS 2.0.0+rev5 (prod)', 'prod'],
							['Resin OS 2.0.1.rev1', ''],
							['Resin OS 2.0.2+rev2', ''],
							['Resin OS 2.0.3+rev1', 'prod'],
							['Resin OS 2.0.4+rev1', 'prod'],
							['Resin OS 2.0.4+rev2', 'prod'],
							['Resin OS 2.0.5+rev1', 'prod'],
							['Resin OS 2.0.6+rev1', 'prod'],
							['Resin OS 2.0.6+rev2', 'prod'],
							['Resin OS 2.0.6+rev2', ''],
							['Resin OS 2.1.0+rev1', 'prod'],
							['Resin OS 2.2.0+rev1', 'prod'],
							['Resin OS 2.9.7+rev1', 'prod'],
							['Resin OS 2.12.0+rev1', 'prod'],
							['Resin OS 2.12.1+rev1', 'prod'],
							['balenaOS 2.26.0+rev1', 'prod'],
						].forEach(function ([osVersion, osVariant]) {
							// prettier-ignore
							const mockDevice = {
								uuid,
								is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'raspberrypi3' }]),
								is_online: true,
								os_version: osVersion,
								os_variant: osVariant,
							};

							return expect(() =>
								_checkOsUpdateTarget(mockDevice, '2.29.2+rev1.prod'),
							).to.not.throw();
						}));
				});

				describe('given a jetson-tx2', function () {
					it('should throw when current os version is < 2.7.4', () =>
						[
							['Resin OS 2.0.0.rev1 (prod)', 'prod'],
							['Resin OS 2.0.0.rev1 (prod)', ''],
							['Resin OS 2.0.0+rev2', 'prod'],
							['Resin OS 2.0.0+rev2 (prod)', 'prod'],
							['Resin OS 2.0.0+rev2 (prod)', ''],
							['Resin OS 2.0.0.rev1 (prod)', 'prod'],
							['Resin OS 2.0.0.rev1 (prod)', ''],
							['Resin OS 2.0.0+rev2', 'prod'],
							['Resin OS 2.0.0+rev2 (prod)', 'prod'],
							['Resin OS 2.0.0+rev2 (prod)', ''],
							['Resin OS 2.0.0+rev3', 'prod'],
							['Resin OS 2.0.0+rev3 (prod)', 'prod'],
							['Resin OS 2.0.0+rev3 (prod)', ''],
							['Resin OS 2.0.0+rev4 (prod)', 'prod'],
							['Resin OS 2.0.0+rev4 (prod)', ''],
							['Resin OS 2.0.0+rev5 (prod)', 'prod'],
							['Resin OS 2.0.1.rev1', ''],
							['Resin OS 2.0.2+rev2', ''],
							['Resin OS 2.0.3+rev1', 'prod'],
							['Resin OS 2.0.4+rev1', 'prod'],
							['Resin OS 2.0.4+rev2', 'prod'],
							['Resin OS 2.0.5+rev1', 'prod'],
							['Resin OS 2.0.6+rev1', 'prod'],
							['Resin OS 2.0.6+rev2', 'prod'],
							['Resin OS 2.0.6+rev2', ''],
							['Resin OS 2.1.0+rev1', 'prod'],
							['Resin OS 2.2.0+rev1', 'prod'],
							['Resin OS 2.3.0+rev1', 'prod'],
							['Resin OS 2.3.0+rev2', 'prod'],
							['Resin OS 2.4.1+rev1', 'prod'],
							['Resin OS 2.4.2+rev1', 'prod'],
							['Resin OS 2.6.0+rev1', 'prod'],
							['Resin OS 2.7.2+rev1', 'prod'],
						].forEach(function ([osVersion, osVariant]) {
							// prettier-ignore
							const mockDevice = {
								uuid,
								is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'jetson-tx2' }]),
								is_online: true,
								os_version: osVersion,
								os_variant: osVariant,
							};

							return expect(() =>
								_checkOsUpdateTarget(mockDevice, '2.29.2+rev1.prod'),
							).to.throw('Current OS version must be >= 2.7.4');
						}));

					it('should not throw when it is a valid v2 -> v2 prod variant hup', () =>
						[
							['Resin OS 2.7.4+rev1', 'prod'],
							['Resin OS 2.7.4+rev2', 'prod'],
							['Resin OS 2.7.5+rev1', 'prod'],
							['Resin OS 2.7.5+rev2', 'prod'],
							['Resin OS 2.7.6+rev1', 'prod'],
							['Resin OS 2.7.8+rev1', 'prod'],
							['Resin OS 2.7.8+rev2', 'prod'],
							['Resin OS 2.9.7+rev1', 'prod'],
							['Resin OS 2.12.0+rev1', 'prod'],
							['Resin OS 2.12.1+rev1', 'prod'],
							['balenaOS 2.26.0+rev1', 'prod'],
						].forEach(function ([osVersion, osVariant]) {
							// prettier-ignore
							const mockDevice = {
								uuid,
								is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'jetson-tx2' }]),
								is_online: true,
								os_version: osVersion,
								os_variant: osVariant,
							};

							return expect(() =>
								_checkOsUpdateTarget(mockDevice, '2.29.2+rev1.prod'),
							).to.not.throw();
						}));

					it('should not throw when it is a valid v2 -> v2 dev variant hup', () =>
						[
							['Resin OS 2.7.4+rev1.dev', 'dev'],
							['Resin OS 2.9.7+rev2.dev', 'dev'],
							['balenaOS 2.26.0+rev1.dev', 'dev'],
						].forEach(function ([osVersion, osVariant]) {
							// prettier-ignore
							const mockDevice = {
								uuid,
								is_of__device_type: /** @type [{ slug: string; }] */ ([{ slug: 'jetson-tx2' }]),
								is_online: true,
								os_version: osVersion,
								os_variant: osVariant,
							};

							return expect(() =>
								_checkOsUpdateTarget(mockDevice, '2.29.2+rev1.dev'),
							).to.not.throw();
						}));
				});
			});
		});
	});
});
