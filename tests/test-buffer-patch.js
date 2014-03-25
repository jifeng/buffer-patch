//mocha
'use strict';
var bufferPatch = require(__dirname + '/../');
var e = require('expect.js');

describe('buffer-patch', function () {
  describe('encode, decode', function () {
      var cases = [
      { key: 'jifeng' },
      { key: new Date() },
      { key: 1 },
      { key: 1.5 },
      { key: [1, 2, 'jifeng']},
      [{ key: new Buffer('buffer')}, 'buffer { key: new Buffer("buffer")'],
      [{ key: 'jfieng', buf: new Buffer('jifeng')}, '{key: "jfieng", buf: new Buffer("jifeng")}' ]
    ];

    cases.forEach(function (item) {
      var desc = JSON.stringify(item);
      if (Array.isArray(item)) {
        desc = item[1];
        item = item[0];
      }
      it(desc, function () {
        var b = bufferPatch.encode(item);
        var d = bufferPatch.decode(b);
        e(d).to.eql(item);
      });
    });

  });
  it('encode(undefined)', function () {
    var b = bufferPatch.encode(undefined);
    e(b).to.be.null;
  });

  it('decode(undefined)', function () {
    e(bufferPatch.decode(undefined)).to.be.null;
  });

  it('encode not object', function () {
    var b = bufferPatch.encode('xxxxxx');
    e(b).to.eql('xxxxxx');
  });

  it('decode invalide buffer new Buffer("FOAJFOAIJ")', function () {
    var b = new Buffer('FOAJFOAIJ');
    var error = undefined;
    try {
      bufferPatch.decode(b);
    } catch (err) {
      error = err;
    }
    e(error).not.to.be.undefined;
  });

  it('decode invalide buffer new Buffer(1)', function () {
    var b = new Buffer(1);
    var error = undefined;
    try {
      bufferPatch.decode(b);
    } catch (err) {
      error = err;
    }
    e(error).not.to.be.undefined;
  });
});
