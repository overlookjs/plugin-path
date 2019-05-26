/* --------------------
 * @overlook/router-path module
 * Entry point
 * ------------------*/

'use strict';

// Modules
const routerMatch = require('@overlook/router-match'),
	routerOrdered = require('@overlook/router-ordered'),
	{MATCH, HANDLE_MATCH} = routerMatch,
	{IS_BEFORE} = routerOrdered,
	{isString} = require('core-util-is');

// Imports
const symbols = require('./symbols'),
	{identifier, PATH_PART, PATH_UNCONSUMED, PARAMS} = symbols;

// Exports
function extend(Route) {
	// Extend class with router-match and router-ordered
	Route = Route.extend(routerMatch)
		.extend(routerOrdered);

	// Extend class
	return class RoutePath extends Route {
		initProps(props) {
			super.initProps(props);

			this[PATH_PART] = undefined;
		}

		initRoute(app) {
			super.initRoute(app);

			// Inherit path part from name (or '/' if this is top path route)
			let pathPart = this[PATH_PART];
			if (pathPart === undefined) {
				// Find path route above this one
				let parentPathRoute = this.parent;
				while (parentPathRoute && !parentPathRoute[identifier]) {
					parentPathRoute = parentPathRoute.parent;
				}

				if (!parentPathRoute) {
					pathPart = '/';
				} else {
					pathPart = this.name;
				}
				this[PATH_PART] = pathPart;
			}

			// Check path part valid
			if (pathPart == null) throw new Error('[routerPath.PATH_PART] must be set on a path route');
			if (!isString(pathPart)) throw new Error('[routerPath.PATH_PART] must be a string');
			if (pathPart === '') throw new Error('[routerPath.PATH_PART] cannot be empty string');
		}

		[MATCH](req) {
			// TODO Call `super[MATCH]` and deal with result

			// Get path to match against
			let path = req[PATH_UNCONSUMED];
			if (path === undefined) path = req.path;

			// Check if path matches
			const pathPart = this[PATH_PART];
			if (path[0] === '/') {
				// Handle root
				if (pathPart === '/') {
					return {
						exact: path === '/',
						pathConsumed: '/'
					};
				}
			} else if (pathPart[0] === ':') {
				// Handle param
				// NB Params do not match paths starting with slash
				const index = path.indexOf('/');
				if (index === -1) {
					// Exact match
					return {
						exact: true,
						pathConsumed: path,
						params: {[pathPart.slice(1)]: path}
					};
				}

				return {
					exact: index === path.length - 1,
					pathConsumed: path.slice(0, index + 1),
					params: {[pathPart.slice(1)]: path.slice(0, index)}
				};
			}

			// Handle wildcard
			if (pathPart === '*') {
				return {
					exact: true,
					pathConsumed: path,
					params: {'*': path}
				};
			}

			// Handle named match
			if (path.slice(0, pathPart.length) === pathPart) {
				if (path.length === pathPart.length) {
					return {
						exact: true,
						pathConsumed: path
					};
				}

				if (path[pathPart.length] === '/') {
					return {
						exact: path.length === pathPart.length + 1,
						pathConsumed: `${pathPart}/`
					};
				}
			}

			// No match
			return null;
		}

		[HANDLE_MATCH](req, match) {
			// Record that part consumed
			const pathUnconsumedOld = req[PATH_UNCONSUMED];
			req[PATH_UNCONSUMED] = (pathUnconsumedOld === undefined ? req.path : pathUnconsumedOld)
				.slice(match.pathConsumed.length);

			// Record params
			const {params} = match;
			let paramsOld;
			if (params) {
				paramsOld = req[PARAMS];
				req[PARAMS] = Object.assign({}, paramsOld, params);
			}

			// Call superclass method
			const ret = super[HANDLE_MATCH](req, match);

			// If not handled, reverse above to leave req as it was previously
			if (ret == null) {
				req[PATH_UNCONSUMED] = pathUnconsumedOld;
				if (params) req[PARAMS] = paramsOld;
			}

			// Return handle result
			return ret;
		}

		[IS_BEFORE](sibling) {
			// If super method returns a result, use it
			const before = super[IS_BEFORE](sibling);
			if (before !== null) return before;

			// If sibling is not a path router, no preference
			if (!sibling[identifier]) return null;

			// Determine which should go first
			const priorityRoute = priority(this),
				prioritySibling = priority(sibling);
			if (priorityRoute === prioritySibling) return null;
			return priorityRoute < prioritySibling;
		}
	};
}

// Expose symbols (including symbols from router-match and router-ordered)
Object.assign(extend, routerMatch, routerOrdered, symbols);

module.exports = extend;

// Helper functions
function priority(route) {
	const part = route[PATH_PART];
	if (part === '*') return 3;
	if (part[0] === ':') return 2;
	return 1;
}