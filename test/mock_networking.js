const debug = require('debug')('mdns:test:mock_MockNetworking');
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const dns = require('dns-js');
const DNSPacket = dns.DNSPacket;

const MockNetworking = module.exports = function (options) {
  this.options = options || {};
  this.created = 0;
  this.connections = [];
  this.started = false;
  this.users = [];
  this.interfaces = {'Ethernet': [{internal: false, address: '127.0.0.10' }]};
  this.INADDR_ANY = typeof this.options.INADDR_ANY === 'undefined' ?
    true : this.options.INADDR_ANY;
};

util.inherits(MockNetworking, EventEmitter);


MockNetworking.prototype.start = function () {
  debug('start');
  if (!this.started) {
    this.started = true;
    process.nextTick(() => {
      this.emit('ready');
    });
  }
};

MockNetworking.prototype.stop = function () {
  debug('stop');
  this.started = false;
};


MockNetworking.prototype.send = function (packet) {
  debug('sending faked packet');
  var buf = DNSPacket.toBuffer(packet);
  this.emit('send', {packet: packet, buffer: buf});
};

MockNetworking.prototype.addUsage = function (browser, next) {
  debug('addUsage');
  this.users.push(browser);
  this.startRequest(next);
};

MockNetworking.prototype.startRequest = function (callback) {
  if (this.started) {
    debug('startRequest:started');
    return process.nextTick(callback());
  }
  this.start();
  this.once('ready', function () {
    debug('startRequest:ready');
    if (typeof callback === 'function') {
      callback();
    }
  });
};


MockNetworking.prototype.receive = function (packets) {
  debug('receive %s packets', packets.length);
  this.emit('packets', packets);
};
