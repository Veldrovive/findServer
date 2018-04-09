'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

require('babel-polyfill');

var _package = require('../../package.json');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _facets = require('./facets');

var _facets2 = _interopRequireDefault(_facets);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
	var config = _ref.config,
	    db = _ref.db;

	var web = (0, _express.Router)();
	var webDirectory = __dirname + '../../../web/';

	// mount the facets resource
	web.use('/facets', (0, _facets2.default)({ config: config, db: db }));

	// use static directory
	web.use('/static', _express2.default.static(_path2.default.join(webDirectory, "public")));

	// perhaps expose some API metadata at the root
	web.get('/', function (req, res) {
		res.sendFile(_path2.default.join(webDirectory, "index.html"));
	});

	return web;
};
//# sourceMappingURL=index.js.map