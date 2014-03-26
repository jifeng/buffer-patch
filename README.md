buffer-patch
============

Buffer的多结构序列化模块,解决一块buffer中同时存在string,number和buffer的解析问题，提高解析性能


## 应用场景

一个数据结构如下:

```js
var obj = {
	size: 156,
	name: 'jifeng',
	buffer: new Buffer('hell world')
}
```

常用的序列化方式是,先将当中的buffer转化为字符串,再做JSON序列化.反序列的时候,就是JSON的反序列化,然后再将字符串转化为buffer

这样的缺点非常明显,就是buffer转字符串,字符串转buffer消耗还是比较大的

buffer-patch 的作用就是解决这个问题,它自己定义一套的格式,可以对直接这种对象进行序列化和反序列化,减少性能消耗

不足: 现在出于性能考虑，现在暂且只支持一层结构的object

## 安装

```bash
npm install buffer-patch
```

## 用法

```js

var bufferPatch = require('buffer-patch');
var obj = {
	size: 156,
	name: 'jifeng',
	buffer: new Buffer('hell world')
}

var buff = bufferPatch.encode(obj);

var newObj = bufferPatch.decode(buff)
```


