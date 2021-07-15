import * as m from 'mochainon';
import * as packageJSON from '../../package.json';
import {
	balena,
	balenaSdkExports,
	getSdk,
	sdkOpts,
	givenLoggedInUser,
} from './setup';
import { timeSuite } from '../util';

const { expect } = m.chai;

const DIFFERENT_TEST_SERVER_URL = 'https://www.non-balena-api-domain.com/';

describe('Balena SDK', function () {
	timeSuite(before);

	const validKeys = ['auth', 'models', 'logs', 'settings', 'version'];

	describe('factory function', function () {
		describe('given no opts', () =>
			it('should return an object with valid keys', function () {
				const mockBalena = getSdk();
				return expect(mockBalena).to.include.keys(validKeys);
			}));

		describe('given empty opts', () =>
			it('should return an object with valid keys', function () {
				const mockBalena = getSdk({});
				return expect(mockBalena).to.include.keys(validKeys);
			}));

		describe('given opts', () =>
			it('should return an object with valid keys', function () {
				const mockBalena = getSdk(sdkOpts);
				return expect(mockBalena).to.include.keys(validKeys);
			}));

		describe('version', () =>
			it('should match the package.json version', function () {
				const mockBalena = getSdk();
				return expect(mockBalena).to.have.property(
					'version',
					packageJSON.version,
				);
			}));
	});

	it('should expose a balena-pine instance', () =>
		expect(balena.pine).to.exist);

	it('should expose an balena-errors instance', () =>
		expect(balena.errors).to.exist);

	describe('interception Hooks', function () {
		let originalInterceptors = null;

		before(function () {
			originalInterceptors = balena.interceptors.slice();
			return (balena.interceptors = originalInterceptors.slice());
		});

		afterEach(
			() =>
				// register this afterEach first, so that we
				// are able to clear the mock interceptor, before
				// all other requests that might happen in afterEach
				(balena.interceptors = originalInterceptors.slice()),
		);

		givenLoggedInUser(before);

		const ignoreWhoamiCalls = (fn) =>
			function (arg) {
				if (/\/user\/v1\/whoami/.test(arg.url)) {
					return arg;
				}
				return fn(arg);
			};

		it("should update if the array is set directly (not only if it's mutated)", function () {
			const interceptor = m.sinon.mock().returnsArg(0);
			balena.interceptors = [{ request: ignoreWhoamiCalls(interceptor) }];
			return balena.models.application
				.getAll({ $top: 1 })
				.then(() =>
					expect(interceptor.called).to.equal(
						true,
						'Interceptor set directly should have its request hook called',
					),
				);
		});

		describe('for request', () =>
			it('should be able to intercept requests', function () {
				const requestInterceptor = m.sinon.mock().returnsArg(0);
				balena.interceptors.push({ request: requestInterceptor });

				const promise = balena.models.application.getAll({ $top: 1 });

				return promise.then(() =>
					expect(requestInterceptor.called).to.equal(
						true,
						'Interceptor request hook should be called',
					),
				);
			}));

		describe('for requestError', () =>
			it('should intercept request errors from other interceptors', function () {
				const requestInterceptor = m.sinon.mock().throws(new Error('rejected'));
				const requestErrorInterceptor = m.sinon
					.mock()
					.throws(new Error('replacement error'));

				balena.interceptors.push({ request: requestInterceptor });
				balena.interceptors.push({ requestError: requestErrorInterceptor });

				const promise = balena.models.application.getAll({ $top: 1 });

				return expect(promise)
					.to.be.rejectedWith('replacement error')
					.then(() =>
						expect(requestErrorInterceptor.called).to.equal(
							true,
							'Interceptor requestError hook should be called',
						),
					);
			}));

		describe('for response', () =>
			it('should be able to intercept responses', function () {
				const responseInterceptor = m.sinon.mock().returnsArg(0);
				balena.interceptors.push({ response: responseInterceptor });
				const promise = balena.models.application.getAll({ $top: 1 });

				return promise.then(() =>
					expect(responseInterceptor.called).to.equal(
						true,
						'Interceptor response hook should be called',
					),
				);
			}));

		describe('for responseError', () =>
			it('should be able to intercept error responses', function () {
				let called = false;
				balena.interceptors.push({
					responseError(err) {
						called = true;
						throw err;
					},
				});

				const promise = balena.models.device.restartApplication(999999);

				return expect(promise).to.be.rejected.then(() =>
					expect(called).to.equal(
						true,
						'responseError should be called when request fails',
					),
				);
			}));

		describe('version header', function () {
			const getVersionHeaderResponseInterceptor = function () {
				var responseInterceptor = function (response) {
					responseInterceptor.callCount++;
					expect(response.request.headers).to.have.property(
						'X-Balena-Client',
						`${packageJSON.name}/${packageJSON.version}`,
					);
					return response;
				};

				responseInterceptor.callCount = 0;

				return responseInterceptor;
			};

			const getVersionHeaderResponseErrorInterceptor = function () {
				var responseInterceptor = function (err) {
					responseInterceptor.callCount++;
					expect(err.requestOptions.headers).to.not.have.property(
						'X-Balena-Client',
					);
					throw err;
				};

				responseInterceptor.callCount = 0;

				return responseInterceptor;
			};

			describe('model requests', () =>
				it('should include the version header', function () {
					const responseInterceptor = getVersionHeaderResponseInterceptor();
					balena.interceptors.push({ response: responseInterceptor });

					const promise = balena.models.application.getAll({ $top: 1 });

					return promise.then(() =>
						expect(responseInterceptor.callCount).to.equal(
							1,
							'Interceptor response hook should be called',
						),
					);
				}));

			describe('pine requests', () =>
				it('should include the version header', function () {
					const responseInterceptor = getVersionHeaderResponseInterceptor();
					balena.interceptors.push({ response: responseInterceptor });

					const promise = balena.pine.get({
						resource: 'application',
					});

					return promise.then(() =>
						expect(responseInterceptor.callCount).to.equal(
							1,
							'Interceptor response hook should be called',
						),
					);
				}));

			describe('plain requests', function () {
				describe('with a relative url & without a baseUrl', () =>
					it('should not include the version header', function () {
						const responseInterceptor =
							getVersionHeaderResponseErrorInterceptor();
						balena.interceptors.push({ responseError: responseInterceptor });

						const promise = balena.request.send({
							method: 'GET',
							url: '/v5/application',
						});

						return expect(promise).to.be.rejected.then(() =>
							expect(responseInterceptor.callCount).to.equal(
								1,
								'Interceptor response hook should be called',
							),
						);
					}));

				describe('with a baseUrl option', function () {
					describe('to the API', () =>
						it('should include the version header', function () {
							const responseInterceptor = getVersionHeaderResponseInterceptor();
							balena.interceptors.push({ response: responseInterceptor });

							const promise = balena.request.send({
								method: 'GET',
								url: '/v5/application',
								baseUrl: sdkOpts.apiUrl,
							});

							return promise.then(() =>
								expect(responseInterceptor.callCount).to.equal(
									1,
									'Interceptor response hook should be called',
								),
							);
						}));

					describe('to a differnet server', () =>
						it('should not include the version header', function () {
							const responseInterceptor =
								getVersionHeaderResponseErrorInterceptor();
							balena.interceptors.push({ responseError: responseInterceptor });

							const promise = balena.request.send({
								method: 'GET',
								url: '/v5/application',
								baseUrl: DIFFERENT_TEST_SERVER_URL,
							});

							return expect(promise).to.be.rejected.then(() =>
								expect(responseInterceptor.callCount).to.equal(
									1,
									'Interceptor response hook should be called',
								),
							);
						}));
				});

				describe('with a complete url option', function () {
					describe('to the API', () =>
						it('should include the version header', function () {
							const responseInterceptor = getVersionHeaderResponseInterceptor();
							balena.interceptors.push({ response: responseInterceptor });

							const promise = balena.request.send({
								method: 'GET',
								url: `${sdkOpts.apiUrl}/v5/application`,
							});

							return promise.then(() =>
								expect(responseInterceptor.callCount).to.equal(
									1,
									'Interceptor response hook should be called',
								),
							);
						}));

					describe('to a differnet server', () =>
						it('should not include the version header', function () {
							const responseInterceptor =
								getVersionHeaderResponseErrorInterceptor();
							balena.interceptors.push({ responseError: responseInterceptor });

							const promise = balena.request.send({
								method: 'GET',
								url: `${DIFFERENT_TEST_SERVER_URL}/v5/application`,
							});

							return expect(promise).to.be.rejected.then(() =>
								expect(responseInterceptor.callCount).to.equal(
									1,
									'Interceptor response hook should be called',
								),
							);
						}));
				});
			});
		});
	});

	describe('setSharedOptions()', () =>
		it('should set a global containing shared options', function () {
			const root =
				typeof window !== 'undefined' && window !== null ? window : global;
			const opts = { foo: 'bar' };

			// @ts-expect-error
			balenaSdkExports.setSharedOptions(opts);

			return expect(root['BALENA_SDK_SHARED_OPTIONS']).to.equal(opts);
		}));

	describe('fromSharedOptions()', () =>
		it('should return an object with valid keys', function () {
			const mockBalena = balenaSdkExports.fromSharedOptions();
			return expect(mockBalena).to.include.keys(validKeys);
		}));
	describe('constructor options', () =>
		describe('Given an apiKey', function () {
			givenLoggedInUser(before);

			before(function () {
				return balena.models.apiKey
					.create('apiKey', 'apiKeyDescription')
					.then((testApiKey) => {
						this.testApiKey = testApiKey;
						expect(this.testApiKey).to.be.a('string');
						return balena.auth.logout();
					});
			});

			it('should not be used in API requests', function () {
				expect(this.testApiKey).to.be.a('string');
				const testSdkOpts = Object.assign({}, sdkOpts, {
					apiKey: this.testApiKey,
				});
				const testSdk = getSdk(testSdkOpts);
				const promise = testSdk.models.apiKey.getAll({ $top: 1 });
				return expect(promise).to.be.rejected.and.eventually.have.property(
					'code',
					'BalenaNotLoggedIn',
				);
			});
		}));
});
