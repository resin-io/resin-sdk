// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as m from 'mochainon';
import * as parallel from 'mocha.parallel';
import { balena, givenAnApplication, givenLoggedInUser } from '../setup';
import { assertDeepMatchAndLength, timeSuite } from '../../util';
const { expect } = m.chai;

describe('API Key model', function () {
	timeSuite(before);

	describe('balena.models.apiKey.create()', function () {
		givenLoggedInUser(before);

		parallel('', function () {
			it('should be able to create a new api key', async function () {
				const key = await balena.models.apiKey.create('apiKey');
				expect(key).to.be.a('string');
			});

			it('should be able to create a new api key with description', async function () {
				const key = await balena.models.apiKey.create(
					'apiKey2',
					'apiKeyDescription',
				);
				expect(key).to.be.a('string');
			});
		});
	});

	describe('balena.models.apiKey.getAll()', function () {
		givenLoggedInUser(before);

		describe('given no named api keys', () => {
			it('should retrieve an empty array', async function () {
				const apiKeys = await balena.models.apiKey.getAll({
					$filter: {
						is_of__actor: await balena.auth.getUserActorId(),
						name: { $ne: null },
					},
				});
				expect(apiKeys).to.be.an('array');
				expect(apiKeys).to.have.lengthOf(0);
			});
		});

		describe('given two named api keys', function () {
			before(() =>
				Promise.all([
					balena.models.apiKey.create('apiKey1'),
					balena.models.apiKey.create('apiKey2', 'apiKey2Description'),
				]),
			);

			it('should be able to retrieve all api keys created', async function () {
				const apiKeys = await balena.models.apiKey.getAll({
					$filter: {
						is_of__actor: await balena.auth.getUserActorId(),
						name: { $ne: null },
					},
				});
				expect(apiKeys).to.be.an('array');
				assertDeepMatchAndLength(apiKeys, [
					{
						name: 'apiKey1',
						description: null,
					},
					{
						name: 'apiKey2',
						description: 'apiKey2Description',
					},
				]);
				apiKeys.forEach(function (apiKey) {
					expect(apiKey).to.have.property('id').that.is.a('number');
					expect(apiKey).to.have.property('created_at').that.is.a('string');
				});
			});
		});
	});

	describe('balena.models.apiKey.getAllNamedUserApiKeys()', function () {
		givenLoggedInUser(before);

		describe('given no named api keys', () => {
			it('should retrieve an empty array', async function () {
				const apiKeys = await balena.models.apiKey.getAllNamedUserApiKeys();
				expect(apiKeys).to.be.an('array');
				expect(apiKeys).to.have.lengthOf(0);
			});
		});

		describe('given two named api keys', function () {
			before(() =>
				Promise.all([
					balena.models.apiKey.create('apiKey1'),
					balena.models.apiKey.create('apiKey2', 'apiKey2Description'),
				]),
			);

			it('should be able to retrieve all api keys created', async function () {
				const apiKeys = await balena.models.apiKey.getAllNamedUserApiKeys();
				expect(apiKeys).to.be.an('array');
				assertDeepMatchAndLength(apiKeys, [
					{
						name: 'apiKey1',
						description: null,
					},
					{
						name: 'apiKey2',
						description: 'apiKey2Description',
					},
				]);
				apiKeys.forEach(function (apiKey) {
					expect(apiKey).to.have.property('id').that.is.a('number');
					expect(apiKey).to.have.property('created_at').that.is.a('string');
				});
			});
		});
	});

	describe('balena.models.apiKey.getProvisioningApiKeysByApplication', function () {
		givenLoggedInUser(before);
		givenAnApplication(before);

		before(async function () {
			const apiKey = await balena.models.application.generateProvisioningKey(
				this.application.id,
			);
			expect(apiKey).to.be.a('string').that.has.length(32);

			this.apiKey = apiKey;
		});

		it('should fail when the application does not exist', async function () {
			const error = await expect(
				balena.models.apiKey.getProvisioningApiKeysByApplication(
					'nonExistentOrganization/nonExistentApp',
				),
			).to.be.rejected;
			expect(error).to.have.property('code', 'BalenaApplicationNotFound');
		});

		it('should be able to retrieve the provisioning api keys of an application', async function () {
			const apiKeys =
				await balena.models.apiKey.getProvisioningApiKeysByApplication(
					this.application.id,
				);
			expect(apiKeys).to.be.an('array');
			expect(apiKeys).to.have.lengthOf(1);
			expect(apiKeys[0].name).to.equal(null);
		});
	});

	describe('given a named user api key [contained scenario]', function () {
		givenLoggedInUser(before);

		before(async function () {
			await balena.models.apiKey.create(
				'apiKeyToBeUpdated',
				'apiKeyDescriptionToBeUpdated',
			);
			const [apiKey] = await balena.models.apiKey.getAll({
				$filter: { name: 'apiKeyToBeUpdated' },
			});
			this.apiKey = apiKey;
		});

		describe('balena.models.apiKey.update()', () => {
			it('should not be able to update the name of an api key to null', function () {
				return expect(
					balena.models.apiKey.update(this.apiKey.id, { name: null as any }),
				).to.be.rejected;
			});

			it('should not be able to update the name of an api key to an empty string', function () {
				return expect(balena.models.apiKey.update(this.apiKey.id, { name: '' }))
					.to.be.rejected;
			});

			it('should be able to update the name of an api key', async function () {
				await balena.models.apiKey.update(this.apiKey.id, {
					name: 'updatedApiKeyName',
				});
				const [apiKey] = await balena.models.apiKey.getAll({
					$filter: { id: this.apiKey.id },
				});
				expect(apiKey).to.deep.match({
					name: 'updatedApiKeyName',
					description: 'apiKeyDescriptionToBeUpdated',
				});
			});

			it('should be able to update the description of an api key to a non empty string', async function () {
				await balena.models.apiKey.update(this.apiKey.id, {
					description: 'updatedApiKeyDescription',
				});
				const [apiKey] = await balena.models.apiKey.getAll({
					$filter: { id: this.apiKey.id },
				});
				expect(apiKey).to.deep.match({
					name: 'updatedApiKeyName',
					description: 'updatedApiKeyDescription',
				});
			});

			it('should be able to update the description of an api key to an empty string', async function () {
				await balena.models.apiKey.update(this.apiKey.id, { description: '' });
				const [apiKey] = await balena.models.apiKey.getAll({
					$filter: { id: this.apiKey.id },
				});
				expect(apiKey).to.deep.match({
					name: 'updatedApiKeyName',
					description: '',
				});
			});

			it('should be able to update the description of an api key to null', async function () {
				await balena.models.apiKey.update(this.apiKey.id, {
					description: null,
				});
				const [apiKey] = await balena.models.apiKey.getAll({
					$filter: { id: this.apiKey.id },
				});
				expect(apiKey).to.deep.match({
					name: 'updatedApiKeyName',
					description: null,
				});
			});

			it('should be able to update the name & description of an api key', async function () {
				await balena.models.apiKey.update(this.apiKey.id, {
					name: 'newllyUpdatedApiKeyName',
					description: 'newllyUpdatedApiKeyDescription',
				});
				const [apiKey] = await balena.models.apiKey.getAll({
					$filter: { id: this.apiKey.id },
				});
				expect(apiKey).to.deep.match({
					name: 'newllyUpdatedApiKeyName',
					description: 'newllyUpdatedApiKeyDescription',
				});
			});
		});

		describe('balena.models.apiKey.revoke()', () => {
			it('should be able to revoke an exising api key', async function () {
				await expect(balena.models.apiKey.revoke(this.apiKey.id)).to.not.be
					.rejected;
				const apiKeys = await balena.models.apiKey.getAllNamedUserApiKeys();
				expect(apiKeys).to.be.an('array');
				expect(apiKeys).to.have.lengthOf(0);
			});
		});
	});
});
