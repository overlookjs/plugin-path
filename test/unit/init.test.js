/* --------------------
 * @overlook/plugin-path module
 * Tests
 * [INIT_ROUTE] method
 * ------------------*/

'use strict';

// Modules
const Overlook = require('@overlook/core'),
	Route = require('@overlook/route'),
	{INIT_ROUTE} = Route,
	pathPlugin = require('@overlook/plugin-path'),
	{PATH_PART} = pathPlugin;

// Init
require('../support/index.js');

// Tests

const RoutePath = Route.extend(pathPlugin);

describe('[INIT_ROUTE]', () => {
	let route;
	beforeEach(() => {
		route = new RoutePath();
	});

	it("[PATH_PART] defaults to '' if is root route", () => {
		const app = new Overlook();
		app.attachRouter(route);
		route[INIT_ROUTE]();
		expect(route[PATH_PART]).toBe('');
	});

	it("[PATH_PART] defaults to '' if no path route above", () => {
		const app = new Overlook();
		const parent = new Route();
		app.attachRouter(parent);
		parent.attachChild(route);
		route[INIT_ROUTE]();
		expect(route[PATH_PART]).toBe('');
	});

	it('inherits [PATH_PART] from .name', () => {
		const parent = new RoutePath();
		parent.attachChild(route);
		route.name = 'abc';
		route[INIT_ROUTE]();
		expect(route[PATH_PART]).toBe('abc');
	});

	it('throws error if [PATH_PART] is undefined and another path route above', () => {
		const parent = new RoutePath();
		parent.attachChild(route);
		expect(() => {
			route.init();
		}).toThrowWithMessage(
			Error, '[plugin-path.PATH_PART] must be set on a path route (router path /?)'
		);
	});

	it('throws error if [PATH_PART] is null', () => {
		route[PATH_PART] = null;
		expect(() => {
			route.init();
		}).toThrowWithMessage(
			Error, '[plugin-path.PATH_PART] must be set on a path route (router path /)'
		);
	});

	it('throws error if [PATH_PART] is not a string', () => {
		route[PATH_PART] = 123;
		expect(() => {
			route.init();
		}).toThrowWithMessage(
			Error, '[plugin-path.PATH_PART] must be a string (router path /)'
		);
	});
});
