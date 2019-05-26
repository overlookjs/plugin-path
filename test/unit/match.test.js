/* --------------------
 * @overlook/router-path module
 * Tests
 * [MATCH] method
 * ------------------*/

'use strict';

// Modules
const {Route} = require('@overlook/core'),
	routerPath = require('../../index'),
	{MATCH, PATH_PART, PATH_UNCONSUMED} = routerPath;

// Init
require('../support');

// Tests

const RoutePath = Route.extend(routerPath);

let route;
beforeEach(() => {
	route = new RoutePath();
});

describe('[MATCH]', () => {
	describe('at root of path', () => {
		describe('root route', () => {
			beforeEach(() => {
				route[PATH_PART] = '/';
			});

			describe('when exact match, returns', () => {
				let ret;
				beforeEach(() => {
					ret = route[MATCH]({path: '/'});
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=/', () => {
					expect(ret.pathConsumed).toBe('/');
				});
			});

			describe('when part match, returns', () => {
				let ret;
				beforeEach(() => {
					ret = route[MATCH]({path: '/abc'});
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=false', () => {
					expect(ret.exact).toBeFalse();
				});

				it('.pathConsumed=/', () => {
					expect(ret.pathConsumed).toBe('/');
				});
			});
		});

		describe('wildcard route', () => {
			beforeEach(() => {
				route[PATH_PART] = '*';
			});

			describe('root path, returns', () => {
				let ret;
				beforeEach(() => {
					ret = route[MATCH]({path: '/'});
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it(".pathConsumed='/'", () => {
					expect(ret.pathConsumed).toBe('/');
				});

				it(".params={'*': '/'}", () => {
					expect(ret.params).toEqual({'*': '/'});
				});
			});

			describe('longer path, returns', () => {
				let ret;
				beforeEach(() => {
					ret = route[MATCH]({path: '/abc'});
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path>', () => {
					expect(ret.pathConsumed).toBe('/abc');
				});

				it(".params={'*': <path>}", () => {
					expect(ret.params).toEqual({'*': '/abc'});
				});
			});
		});

		describe('named route', () => {
			beforeEach(() => {
				route[PATH_PART] = 'abc';
			});

			it('when root path, returns null', () => {
				const ret = route[MATCH]({path: '/'});
				expect(ret).toBeNull();
			});

			it('when longer path, returns null', () => {
				const ret = route[MATCH]({path: '/abc'});
				expect(ret).toBeNull();
			});
		});

		describe('param route', () => {
			beforeEach(() => {
				route[PATH_PART] = ':id';
			});

			it('when root path, returns null', () => {
				const ret = route[MATCH]({path: '/'});
				expect(ret).toBeNull();
			});

			it('when longer path, returns null', () => {
				const ret = route[MATCH]({path: '/abc'});
				expect(ret).toBeNull();
			});
		});
	});

	describe('at base of path', () => {
		it('when no match, returns null', () => {
			route[PATH_PART] = 'abc';
			const ret = route[MATCH]({path: 'def'});
			expect(ret).toBeNull();
		});

		describe('when named exact match', () => {
			describe('no trailing slash, returns', () => {
				let ret;
				beforeEach(() => {
					route[PATH_PART] = 'abc';
					ret = route[MATCH]({path: 'abc'});
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path part>', () => {
					expect(ret.pathConsumed).toBe('abc');
				});
			});

			describe('trailing slash, returns', () => {
				let ret;
				beforeEach(() => {
					route[PATH_PART] = 'abc';
					ret = route[MATCH]({path: 'abc/'});
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path part>/', () => {
					expect(ret.pathConsumed).toBe('abc/');
				});
			});
		});

		describe('when named part match, returns', () => {
			let ret;
			beforeEach(() => {
				route[PATH_PART] = 'abc';
				ret = route[MATCH]({path: 'abc/def'});
			});

			it('object', () => {
				expect(ret).toBeObject();
			});

			it('.exact=false', () => {
				expect(ret.exact).toBeFalse();
			});

			it('.pathConsumed=<path part>/', () => {
				expect(ret.pathConsumed).toBe('abc/');
			});
		});

		describe('when param exact match', () => {
			describe('no trailing slash, returns', () => {
				let ret;
				beforeEach(() => {
					route[PATH_PART] = ':id';
					ret = route[MATCH]({path: 'abc'});
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path part>', () => {
					expect(ret.pathConsumed).toBe('abc');
				});

				it('.params={<param name>: <path part>}', () => {
					expect(ret.params).toEqual({id: 'abc'});
				});
			});

			describe('trailing slash, returns', () => {
				let ret;
				beforeEach(() => {
					route[PATH_PART] = ':id';
					ret = route[MATCH]({path: 'abc/'});
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path part>/', () => {
					expect(ret.pathConsumed).toBe('abc/');
				});

				it('.params={<param name>: <path part>}', () => {
					expect(ret.params).toEqual({id: 'abc'});
				});
			});
		});

		describe('when param part match, returns', () => {
			let ret;
			beforeEach(() => {
				route[PATH_PART] = ':id';
				ret = route[MATCH]({path: 'abc/def'});
			});

			it('object', () => {
				expect(ret).toBeObject();
			});

			it('.exact=false', () => {
				expect(ret.exact).toBeFalse();
			});

			it('.pathConsumed=<path part>/', () => {
				expect(ret.pathConsumed).toBe('abc/');
			});

			it('.params={<param name>: <path part>}', () => {
				expect(ret.params).toEqual({id: 'abc'});
			});
		});

		describe('when wildcard match', () => {
			describe('when 1 part remaining, returns', () => {
				let ret;
				beforeEach(() => {
					route[PATH_PART] = '*';
					ret = route[MATCH]({path: 'abc'});
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path>', () => {
					expect(ret.pathConsumed).toBe('abc');
				});

				it(".params={'*': <path>}", () => {
					expect(ret.params).toEqual({'*': 'abc'});
				});
			});

			describe('when multiple parts remaining, returns', () => {
				let ret;
				beforeEach(() => {
					route[PATH_PART] = '*';
					ret = route[MATCH]({path: 'a/b/c'});
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path>', () => {
					expect(ret.pathConsumed).toBe('a/b/c');
				});

				it(".params={'*': <path>}", () => {
					expect(ret.params).toEqual({'*': 'a/b/c'});
				});
			});
		});
	});

	describe('when parts of path already consumed', () => {
		function createReq(path) {
			// Consume with first path part consumed
			return {
				path,
				[PATH_UNCONSUMED]: path.slice(path.indexOf('/', 1) + 1)
			};
		}

		it('when no match, returns null', () => {
			const req = createReq('/abc/def');
			route[PATH_PART] = 'abc';
			const ret = route[MATCH](req);
			expect(ret).toBeNull();
		});

		describe('when named exact match', () => {
			describe('no trailing slash, returns', () => {
				let ret;
				beforeEach(() => {
					const req = createReq('/abc/def');
					route[PATH_PART] = 'def';
					ret = route[MATCH](req);
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path part>', () => {
					expect(ret.pathConsumed).toBe('def');
				});
			});

			describe('trailing slash, returns', () => {
				let ret;
				beforeEach(() => {
					const req = createReq('/abc/def/');
					route[PATH_PART] = 'def';
					ret = route[MATCH](req);
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path part>/', () => {
					expect(ret.pathConsumed).toBe('def/');
				});
			});
		});

		describe('when named part match, returns', () => {
			let ret;
			beforeEach(() => {
				const req = createReq('/abc/def/ghi');
				route[PATH_PART] = 'def';
				ret = route[MATCH](req);
			});

			it('object', () => {
				expect(ret).toBeObject();
			});

			it('.exact=false', () => {
				expect(ret.exact).toBeFalse();
			});

			it('.pathConsumed=<path part>/', () => {
				expect(ret.pathConsumed).toBe('def/');
			});
		});

		describe('when param exact match', () => {
			describe('no trailing slash, returns', () => {
				let ret;
				beforeEach(() => {
					const req = createReq('/abc/def');
					route[PATH_PART] = ':id';
					ret = route[MATCH](req);
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path part>', () => {
					expect(ret.pathConsumed).toBe('def');
				});

				it('.params={<param name>: <path part>}', () => {
					expect(ret.params).toEqual({id: 'def'});
				});
			});

			describe('trailing slash, returns', () => {
				let ret;
				beforeEach(() => {
					const req = createReq('/abc/def/');
					route[PATH_PART] = ':id';
					ret = route[MATCH](req);
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path part>/', () => {
					expect(ret.pathConsumed).toBe('def/');
				});

				it('.params={<param name>: <path part>}', () => {
					expect(ret.params).toEqual({id: 'def'});
				});
			});
		});

		describe('when param part match, returns', () => {
			let ret;
			beforeEach(() => {
				const req = createReq('/abc/def/ghi');
				route[PATH_PART] = ':id';
				ret = route[MATCH](req);
			});

			it('object', () => {
				expect(ret).toBeObject();
			});

			it('.exact=false', () => {
				expect(ret.exact).toBeFalse();
			});

			it('.pathConsumed=<path part>/', () => {
				expect(ret.pathConsumed).toBe('def/');
			});

			it('.params={<param name>: <path part>}', () => {
				expect(ret.params).toEqual({id: 'def'});
			});
		});

		describe('when wildcard match', () => {
			describe('when 1 part remaining, returns', () => {
				let ret;
				beforeEach(() => {
					const req = createReq('/abc/def');
					route[PATH_PART] = '*';
					ret = route[MATCH](req);
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path>', () => {
					expect(ret.pathConsumed).toBe('def');
				});

				it(".params={'*': <path>}", () => {
					expect(ret.params).toEqual({'*': 'def'});
				});
			});

			describe('when multiple parts remaining, returns', () => {
				let ret;
				beforeEach(() => {
					const req = createReq('/a/b/c/d');
					route[PATH_PART] = '*';
					ret = route[MATCH](req);
				});

				it('object', () => {
					expect(ret).toBeObject();
				});

				it('.exact=true', () => {
					expect(ret.exact).toBeTrue();
				});

				it('.pathConsumed=<path>', () => {
					expect(ret.pathConsumed).toBe('b/c/d');
				});

				it(".params={'*': <path>}", () => {
					expect(ret.params).toEqual({'*': 'b/c/d'});
				});
			});
		});
	});
});