'use strict';

var app = require('../..');
import request from 'supertest';

describe('Authentication API: Google', function () {

	describe('GET /auth/google/client', function () {
		it('should respond 400 if no access_token', function (done) {
			request(app)
				.get('/auth/google/client')
				.expect(400)
				.expect('Content-Type', /json/)
				.end(done);
		});

		it('should respond 401 if no bad access_token', function (done) {
			request(app)
				.get('/auth/google/client?access_token=myTokenValue')
				.expect(401)
				.expect('Content-Type', /json/)
				.end(done);
		});

		it.skip('should respond 200 if no bad access_token', function (done) {
			var token = 'ya29.rQJWzgxUUTE5QYFT8XQTMMXyuV9a7-Hqx6CZIHaJ2b8MSN_54ip4YhOG9XBheMZMnWI';
			request(app)
				.get('/auth/google/client?access_token=' + token)
				.expect(200)
				.expect('Content-Type', /json/)
				.end(done);
		});
	});

});
