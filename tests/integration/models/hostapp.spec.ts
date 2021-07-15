// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as m from 'mochainon';
import * as parallel from 'mocha.parallel';
import { balena } from '../setup';
import { timeSuite } from '../../util';
import type * as BalenaSdk from '../../..';
const { expect } = m.chai;

const containsVersion = (
	versions: BalenaSdk.OsVersion[],
	expected: Partial<BalenaSdk.OsVersion>,
) => {
	const os = _.find(versions, expected);
	expect(os).to.not.be.undefined;
};

describe('Hostapp model', function () {
	timeSuite(before);
	parallel('balena.models.hostapp.getAllOsVersions()', function () {
		it("should contain both balenaOS and balenaOS ESR OS types'", async () => {
			const res = await balena.models.hostapp.getAllOsVersions([
				'fincm3',
				'raspberrypi3',
			]);

			containsVersion(res['fincm3'], {
				strippedVersion: '2.29.0+rev1',
				variant: 'dev',
			});
			containsVersion(res['fincm3'], {
				strippedVersion: '2.29.0+rev1',
				variant: 'prod',
			});
			containsVersion(res['fincm3'], {
				strippedVersion: '2020.04.0',
				variant: 'dev',
			});
			containsVersion(res['fincm3'], {
				strippedVersion: '2020.04.0',
				variant: 'prod',
			});

			containsVersion(res['raspberrypi3'], {
				strippedVersion: '2.29.0+rev1',
				variant: 'dev',
			});
			containsVersion(res['raspberrypi3'], {
				strippedVersion: '2.29.0+rev1',
				variant: 'prod',
			});
			containsVersion(res['raspberrypi3'], {
				strippedVersion: '2020.04.0',
				variant: 'dev',
			});
			containsVersion(res['raspberrypi3'], {
				strippedVersion: '2020.04.0',
				variant: 'prod',
			});
		});

		it('should return an empty object for non-existent DTs', async () => {
			const res = await balena.models.hostapp.getAllOsVersions(['blahbleh']);

			return expect(res).to.deep.equal({});
		});

		it('should cache the results', async () => {
			const firstRes = await balena.models.hostapp.getAllOsVersions([
				'raspberrypi3',
			]);
			const secondRes = await balena.models.hostapp.getAllOsVersions([
				'raspberrypi3',
			]);
			expect(firstRes).to.equal(secondRes);
		});
	});

	parallel('balena.models.hostapp.getLatestOsVersions()', function () {
		it('should contain latest balenaOS and balenaOS ESR OS types', async () => {
			const res = await balena.models.hostapp.getLatestOsVersions([
				'fincm3',
				'raspberrypi3',
			]);

			['fincm3', 'raspberrypi3'].forEach((key) => {
				expect(res[key]).to.be.an('Array');
				expect(res[key]).to.have.lengthOf(4);
				expect(res[key].filter((r) => r.osType === 'esr')).to.have.lengthOf(2);
				expect(res[key].filter((r) => r.osType === 'default')).to.have.lengthOf(
					2,
				);
			});
		});
	});
});
