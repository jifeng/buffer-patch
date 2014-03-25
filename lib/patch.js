'use strict';
/*!
 * buffer-patch Buffer的扩展方法
 * dxpweb - lib/buffer-path.js
 * Copyright(c) 2013 Taobao.com
 * Author: jifeng.zjd <jifeng.zjd@taobao.com>
 * 备注：处于性能考虑，现在暂且只支持一层结构的object
 */


//buffer格式
//klen \ key \ vtype \ vlen \ value \.......
var settings = [
  ['buffer' , 10],
  ['number', 20],
  ['string', 30],
  ['date', 40],
  ['array', 50]
];
var type2code = {};
var code2type = {};
for (var i = 0; i < settings.length; i++) {
  var item = settings[i];
  type2code[item[0]] = item[1];
  code2type[item[1]] = item[0];
}

var TYPE_LEN = 1;
var DATA_LEN = 4;
var TYPE_DATA_LEN = TYPE_LEN + 2 * DATA_LEN;

function _serialize(key, value) {
  var obj = null;
  //buffer
  if (Buffer.isBuffer(value)) {
    obj = { type: 'buffer', value: value, length: value.length };
  } else if ( 'string' === typeof value) { //string
    obj = { type: 'string', value: value, length: Buffer.byteLength(value) };
  } else if ('number' === typeof value) { //number
    value = value.toString();
    obj = { type: 'number', value: value, length: Buffer.byteLength(value) };
  } else if ( value instanceof Date) {//date
    value = value.getTime().toString();
    obj = { type: 'date', value: value, length: Buffer.byteLength(value) };
  } else if (Array.isArray(value)) {
    value = JSON.stringify(value);
    obj = {type: 'array', value: value, length: Buffer.byteLength(value)};
  }
  if (obj) {
    obj.key = key;
  }
  return obj;
}

function _deserialize(buffer, type) {
  if (type === 'string') {
    buffer = buffer.toString();
  } else if (type === 'number') {
    buffer = Number(buffer);
  } else if (type === 'date') {
    buffer = new Date(Number(buffer));
  } else if (type === 'array') {
    buffer = JSON.parse(buffer.toString());
  }
  return buffer;
}

exports.encode = function (object) {
  if (!object) {
    return null;
  }
  if ('object' !== typeof object) {
    return object;
  }
  var rows = [];
  var len = 0;
  var row, key, value;
  for (key in object) {
    value = object[key];
    row = _serialize(key, value);
    if (!row) {
      continue;
    }
    rows.push(row);
    len += row.length + Buffer.byteLength(key) + TYPE_DATA_LEN;
  }
  var allBuffer = new Buffer(len);
  var offset = 0, type, klen;
  for (var i = 0; i < rows.length; i++) {
    row = rows[i];
    key = row.key;
    value = row.value;
    len = row.length;
    type = row.type;
    klen = Buffer.byteLength(key);

    allBuffer.writeUInt32LE(klen, offset);
    allBuffer.write(key, offset += DATA_LEN);
    allBuffer.writeUInt8(type2code[type], offset += klen);
    allBuffer.writeUInt32LE(len, offset += TYPE_LEN);
    offset += DATA_LEN;

    if (type === 'buffer') {
      value.copy(allBuffer, offset);
    } else {
      allBuffer.write(value, offset);
    }
    offset += len;
  }
  return allBuffer;
};

exports.decode = function (buffer) {
  if (!buffer) {
    return null;
  }
  var obj = {};
  var offset = 0;
  var klen, key, type, vlen, vBuffer, value;
  while(offset < buffer.length) {
    klen = buffer.readUInt32LE(offset);
    offset += DATA_LEN;

    key = buffer.slice(offset, offset + klen).toString();
    offset += klen;

    type = code2type[buffer.readUInt8(offset)];
    offset += TYPE_LEN;

    vlen = buffer.readUInt32LE(offset);
    offset += DATA_LEN;

    vBuffer = buffer.slice(offset, offset + vlen);
    offset += vlen;

    value = _deserialize(vBuffer, type);
    obj[key] = value;
  }
  return obj;
};

