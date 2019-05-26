/* --------------------
 * @overlook/router-path module
 * Tests
 * [IS_BEFORE] method
 * ------------------*/

'use strict';

// Modules
const {Route} = require('@overlook/core'),
	each = require('jest-each').default,
	routerPath = require('../../index'),
	{PATH_PART, IS_BEFORE} = routerPath;

// Init
require('../support');

// Tests

const RoutePath = Route.extend(routerPath);

describe('`[IS_BEFORE]()`', () => {
	it('comparing path route to non-path route, returns null', () => {
		const route = new RoutePath(),
			route2 = new Route();
		const ret = route[IS_BEFORE](route2);
		expect(ret).toBeNull();
	});

	const PATH_PARTS = {
		named: 'abc',
		param: ':id',
		wildcard: '*'
	};

	each([
		['named', [
			['named', null],
			['param', true],
			['wildcard', true]
		]],
		['param', [
			['named', false],
			['param', null],
			['wildcard', true]
		]],
		['wildcard', [
			['named', false],
			['param', false],
			['wildcard', null]
		]]
	]).describe('comparing %s route to', (type1, comparisons) => {
		each(comparisons).it('%s route returns %s', (type2, expected) => {
			const pathPart1 = PATH_PARTS[type1],
				pathPart2 = PATH_PARTS[type2];
			const route = new RoutePath({[PATH_PART]: pathPart1}),
				route2 = new RoutePath({[PATH_PART]: pathPart2});
			const ret = route[IS_BEFORE](route2);
			expect(ret).toBe(expected);
		});
	});
});