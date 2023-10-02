import search from '.';

import { RestClient } from '@utils/restClient';
import { MercadoPagoConfig } from '@src/mercadoPagoConfig';

jest.mock('@utils/restClient');

describe('Testing customer, search', () => {
	test('should pass foward request options from search to RestClient.fetch', async () => {
		const client = new MercadoPagoConfig({ accessToken: 'token', options: { timeout: 5000 } });

		await search({ options: { email: 'john.doe@example.com' }, config: client });
		const spyFetch = jest.spyOn(RestClient, 'fetch');
		expect(spyFetch).toHaveBeenCalledWith('/v1/customers/search', {
			'headers': { 'Authorization': 'Bearer token' },
			'queryParams': { 'email': 'john.doe@example.com' },
			'timeout': 5000 });
	});
});
