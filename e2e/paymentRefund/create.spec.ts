import { PaymentCreateData } from '@src/clients/payment/create/types';
import { PaymentRefundCreateData } from '@src/clients/paymentRefund/create/types';
import MercadoPago, { Payment, PaymentRefund } from '@src/index';
import fetch from 'node-fetch';
import { config } from '../e2e.config';

describe('IT refunds, create', () => {
	test('should successfully make a request with partial amount', async () => {
		const client = new MercadoPago({ accessToken: config.access_token, options: { timeout: 5000 } });
		const refund = new PaymentRefund(client);
		const payment = new Payment(client);

		const cardToken = await createCardToken();
		expect(cardToken).toHaveProperty('id');
		const paymentBody = createPayment(cardToken.id);

		const createdPayment = await payment.create(paymentBody);
		expect(createdPayment).toHaveProperty('id');

		const request: PaymentRefundCreateData = {
			payment_id: String(createdPayment.id),
			body: {
				amount: 5
			},
		};

		const refunded = await refund.create(request);
		expect(refunded).toHaveProperty('id');
		expect(refunded).toHaveProperty('payment_id', Number(request.payment_id));
		expect(refunded).toHaveProperty('amount', request.body.amount);
		expect(refunded).toEqual(expect.objectContaining({
			payment_id: expect.any(Number),
			date_created: expect.any(String),
			id: expect.any(Number),
			amount: expect.any(Number),
			source: expect.objectContaining({
				id: expect.any(String),
				name: expect.any(String),
				type: expect.any(String),
			}),
			refund_mode: expect.any(String),
			adjustment_amount: expect.any(Number),
			status: expect.any(String),
			amount_refunded_to_payer: expect.any(Number),
		}));

	});


	function createPayment(token: string): PaymentCreateData {
		const body = {
			body: {
				'additional_info': {
					'items': [
						{
							'id': 'MLB2907679857',
							'title': 'Point Mini',
							'quantity': 1,
							'unit_price': 58.8
						}
					]
				},
				'payer': {
					'email': 'test_user_123@testuser.com',
				},
				'transaction_amount': 110.00,
				'installments': 1,
				'token': token,
				'payment_method_id': 'master',
			}
		};
		return body;
	}

	async function createCardToken() {
		const response = await fetch('https://api.mercadopago.com/v1/card_tokens', {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + config.access_token,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				card_number: '5031433215406351',
				expiration_year: '2025',
				expiration_month: '11',
				security_code: '123',
				cardholder: {
					identification: {
						type: 'CPF',
						number: '01234567890'
					},
					name: 'APRO'
				}
			})
		});
		return await response.json();
	}
});
