'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDevice = exports.getDeviceList = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.allParse = allParse;

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _lodash = require('lodash.findindex');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function allParse(json) {
  if (json !== null && (typeof json === 'undefined' ? 'undefined' : _typeof(json)) === 'object') {
    return json;
  } else if (typeof json === 'string') {
    return JSON.parse(json);
  } else {
    return json;
  }
};

//Queries find3 api to get all devices for a family
var getDeviceList = exports.getDeviceList = function getDeviceList(family) {
  return new Promise(function (resolve) {
    (0, _request2.default)("https://cloud.internalpositioning.com/api/v1/devices/" + family, function (err, resp, body) {
      body = allParse(body);
      if (body.success === false) {
        resolve(false);
      } else {
        resolve({ devices: body.devices });
      }
    });
  });
};

//Queries find3 api to get prob data for a device
var getDevice = exports.getDevice = function getDevice(family, name) {
  return new Promise(function (resolve, reject) {
    if (name !== undefined) {
      (0, _request2.default)("https://cloud.internalpositioning.com/api/v1/location/" + family + "/" + name, function (err, resp, body) {
        body = allParse(body);
        if (body.success === false) {
          reject(false);
        } else {
          resolve(body.analysis.guesses);
        }
      });
    } else {
      (0, _request2.default)("https://cloud.internalpositioning.com/api/v1/locations/" + family, function (err, resp, body) {
        body = allParse(body);
        if (body.success === false) {
          reject(false);
        } else {
          resolve(body.locations);
        }
      });
    }
  });
};

var familyIterator = function () {
  function familyIterator(family, interTime) {
    var _this = this;

    _classCallCheck(this, familyIterator);

    this.family = family || "aidantest2";
    this.interTime = interTime || 60000;
    this.interTime = this.interTime < 9999 ? 10000 : this.interTime;

    this.interList = [];

    //Format: {name: "pi", probs: [{loc: "lc1", prob: 82}, loc: "lc2", prob: 2]}
    this.deviceList = [];
    this.getDevices().then(function () {
      _this.getProb().then(function () {
        return _this.startInter();
      });
    });
    return;
  }

  _createClass(familyIterator, [{
    key: 'startInter',
    value: function startInter() {
      var _this2 = this;

      this.interList.push(setInterval(function () {
        _this2.getProb();
      }, this.interTime));
    }
  }, {
    key: 'stopInter',
    value: function stopInter() {
      this.interList.forEach(function (inter) {
        clearInterval(inter);
      });
    }
  }, {
    key: 'returnDevices',
    value: function returnDevices() {
      return this.deviceList.map(function (o) {
        return o.name;
      });
    }
  }, {
    key: 'returnDevice',
    value: function returnDevice(name) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var index = (0, _lodash2.default)(_this3.deviceList, function (o) {
          return o.name === name;
        });
        if (index === -1) return resolve({ data: undefined, err: "Device does not exist", success: false });
        return resolve({ data: _this3.deviceList[index], err: '', success: true });
      });
    }
  }, {
    key: 'getDevices',
    value: function getDevices() {
      var _this4 = this;

      return new Promise(function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
          var deviceList;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return getDeviceList(_this4.family);

                case 2:
                  deviceList = _context.sent;

                  if (!(deviceList === false)) {
                    _context.next = 5;
                    break;
                  }

                  return _context.abrupt('return', reject(false));

                case 5:
                  deviceList = deviceList.devices;
                  deviceList.forEach(function (device) {
                    if ((0, _lodash2.default)(_this4.deviceList, function (o) {
                      return o.name === device;
                    }) === -1) {
                      _this4.deviceList.push({ name: device, probs: [] });
                    }
                  });
                  return _context.abrupt('return', resolve(_this4.deviceList));

                case 8:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this4);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: 'getProb',
    value: function getProb(devName) {
      var _this5 = this;

      return new Promise(function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve, reject) {
          var devicesProbs, deviceIndex, device, probs;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  if (!(devName === undefined)) {
                    _context3.next = 7;
                    break;
                  }

                  _context3.next = 3;
                  return getDevice(_this5.family);

                case 3:
                  devicesProbs = _context3.sent;

                  devicesProbs.forEach(function () {
                    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(device) {
                      var name, probs, deviceIndex, currentDevice;
                      return regeneratorRuntime.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              name = device.device;
                              probs = device.analysis.guesses;
                              deviceIndex = (0, _lodash2.default)(_this5.deviceList, function (o) {
                                return o.name === name;
                              });

                              if (!(_lodash2.default === -1)) {
                                _context2.next = 7;
                                break;
                              }

                              _context2.next = 6;
                              return _this5.getDevices();

                            case 6:
                              deviceIndex = (0, _lodash2.default)(_this5.deviceList, function (o) {
                                return o.name === name;
                              });

                            case 7:
                              currentDevice = _this5.deviceList[deviceIndex];

                              probs.forEach(function (prob) {
                                var locIndex = (0, _lodash2.default)(currentDevice.probs, function (o) {
                                  return o.loc === prob.location;
                                });
                                if (locIndex != -1) {
                                  currentDevice.probs[locIndex].prob = prob.probability || 0;
                                } else {
                                  currentDevice.probs.push({ loc: prob.location, prob: prob.probability || 0 });
                                }
                              });
                              return _context2.abrupt('return', resolve({ success: true, err: '' }));

                            case 10:
                            case 'end':
                              return _context2.stop();
                          }
                        }
                      }, _callee2, _this5);
                    }));

                    return function (_x5) {
                      return _ref3.apply(this, arguments);
                    };
                  }());
                  _context3.next = 16;
                  break;

                case 7:
                  deviceIndex = (0, _lodash2.default)(_this5.deviceList, function (o) {
                    return o.name === devName;
                  });

                  if (!(deviceIndex == -1)) {
                    _context3.next = 10;
                    break;
                  }

                  return _context3.abrupt('return', reject({ success: false, err: 'Device does not exist' }));

                case 10:
                  device = _this5.deviceList[deviceIndex];
                  _context3.next = 13;
                  return getDevice(_this5.family, devName);

                case 13:
                  probs = _context3.sent;

                  probs.forEach(function (prob) {
                    var locIndex = (0, _lodash2.default)(device.probs, function (o) {
                      return o.loc === prob.location;
                    });
                    if (locIndex != -1) {
                      device.probs[locIndex].prob = prob.probability || 0;
                    } else {
                      device.probs.push({ loc: prob.location, prob: prob.probability || 0 });
                    }
                  });
                  return _context3.abrupt('return', resolve({ success: true, err: '' }));

                case 16:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, _this5);
        }));

        return function (_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }());
    }
  }]);

  return familyIterator;
}();

exports.default = familyIterator;
//# sourceMappingURL=functions.js.map