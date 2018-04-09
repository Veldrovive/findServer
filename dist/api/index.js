'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _package = require('../../package.json');

var _express = require('express');

var _functions = require('./functions.js');

var _functions2 = _interopRequireDefault(_functions);

var _facets = require('./facets');

var _facets2 = _interopRequireDefault(_facets);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function (_ref) {
	var config = _ref.config,
	    db = _ref.db;

	var family = new _functions2.default(config.family, 10000);
	var api = (0, _express.Router)();

	// mount the facets resource
	api.use('/facets', (0, _facets2.default)({ config: config, db: db }));

	// perhaps expose some API metadata at the root
	api.get('/', function (req, res) {
		res.json({ version: _package.version });
	});

	api.get('/ping', function (req, res) {
		res.send("pong");
	});

	api.get("/createList/:family/:interTime", function () {
		var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
			return regeneratorRuntime.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							family = new _functions2.default(req.params.family, req.params.interTime);
							res.send("Creating");

						case 2:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, undefined);
		}));

		return function (_x, _x2) {
			return _ref2.apply(this, arguments);
		};
	}());

	api.get("/getInfo", function () {
		var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
			return regeneratorRuntime.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							res.json({ data: family.deviceList, err: '', success: true });

						case 1:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, undefined);
		}));

		return function (_x3, _x4) {
			return _ref3.apply(this, arguments);
		};
	}());

	api.get("/getProbs", function () {
		var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
			return regeneratorRuntime.wrap(function _callee3$(_context3) {
				while (1) {
					switch (_context3.prev = _context3.next) {
						case 0:
							family.getProb();
							res.send("Starting");

						case 2:
						case 'end':
							return _context3.stop();
					}
				}
			}, _callee3, undefined);
		}));

		return function (_x5, _x6) {
			return _ref4.apply(this, arguments);
		};
	}());

	api.get("/deviceList", function () {
		var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
			return regeneratorRuntime.wrap(function _callee4$(_context4) {
				while (1) {
					switch (_context4.prev = _context4.next) {
						case 0:
							res.json({ devices: family.returnDevices(), success: true });

						case 1:
						case 'end':
							return _context4.stop();
					}
				}
			}, _callee4, undefined);
		}));

		return function (_x7, _x8) {
			return _ref5.apply(this, arguments);
		};
	}());

	api.get("/device/:name", function () {
		var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res) {
			return regeneratorRuntime.wrap(function _callee5$(_context5) {
				while (1) {
					switch (_context5.prev = _context5.next) {
						case 0:
							_context5.t0 = res;
							_context5.next = 3;
							return family.returnDevice(req.params.name);

						case 3:
							_context5.t1 = _context5.sent;

							_context5.t0.json.call(_context5.t0, _context5.t1);

						case 5:
						case 'end':
							return _context5.stop();
					}
				}
			}, _callee5, undefined);
		}));

		return function (_x9, _x10) {
			return _ref6.apply(this, arguments);
		};
	}());

	api.get("/updateDevices", function () {
		var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
			return regeneratorRuntime.wrap(function _callee6$(_context6) {
				while (1) {
					switch (_context6.prev = _context6.next) {
						case 0:
							_context6.t0 = res;
							_context6.next = 3;
							return family.getDevices();

						case 3:
							_context6.t1 = _context6.sent;

							_context6.t0.json.call(_context6.t0, _context6.t1);

						case 5:
						case 'end':
							return _context6.stop();
					}
				}
			}, _callee6, undefined);
		}));

		return function (_x11, _x12) {
			return _ref7.apply(this, arguments);
		};
	}());

	return api;
};
//# sourceMappingURL=index.js.map