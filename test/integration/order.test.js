/* --------------------
 * @overlook/router-path module
 * Tests
 * Ordering integration tests
 * ------------------*/

'use strict';

// Modules
const Overlook = require('@overlook/core'),
	{Route} = Overlook,
	each = require('jest-each').default,
	routerPath = require('../../index'),
	{PATH_PART} = routerPath;

// Init
require('../support');

// Tests

const RoutePath = Route.extend(routerPath);

describe('Ordering', () => { // eslint-disable-line jest/lowercase-name
	describe('routes are ordered with', () => {
		function pathPartType(pathPart) {
			if (pathPart === '*') return 'wildcard';
			if (pathPart === '/') return 'root';
			if (pathPart[0] === ':') return 'param';
			return 'named';
		}

		const cases = [
			['b', 'a'],
			[':id', 'a', true],
			['a', ':id'],
			[':id', ':id2'],
			['*', 'a', true],
			['a', '*'],
			['*', ':id', true],
			[':id', '*'],
			['*', '*']
		].map(([pathPart1, pathPart2, reorders]) => [
			pathPartType(pathPart2),
			reorders ? 'before' : 'after',
			pathPartType(pathPart1),
			pathPart1,
			pathPart2,
			!!reorders
		]);

		each(cases).it('%s route %s %s route', (_1, _2, _3, pathPart1, pathPart2, reorders) => {
			const router = new Route(),
				route1 = new RoutePath({[PATH_PART]: pathPart1}),
				route2 = new RoutePath({[PATH_PART]: pathPart2});
			router.attachChild(route1);
			router.attachChild(route2);

			const app = new Overlook();
			app.attachRouter(router);
			app.init();

			expect(router.children).toBeArrayOfSize(2);
			expect(router.children[0]).toBe(reorders ? route2 : route1);
			expect(router.children[1]).toBe(reorders ? route1 : route2);
		});
	});
});
