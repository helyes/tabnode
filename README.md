#  [![Build Status](https://secure.travis-ci.org/helyes/tabnode.png?branch=master)](http://travis-ci.org/helyes/tabnode)

> Simple divident calculator

Parses listfile containing bets and calculates dividends for given result.

### Supported product types

* W (Win)
* P (Place)
* E (Exacta)
* Q (Quinella)


### Bet file record layout

```
W:1:3
P:1:31
E:1,2:13
Q:1,2:19
```

### Result format
```
R:2:3:1:4
```
See test folder for examples.


## Install

```sh
$ npm install --save helyes/tabnode
```


## Usage

```js
var tabnode = require('tabnode');

tabnode.calculateDividends(<file>, <result>)

```

```sh
$ npm install --global helyes/tabnode
$ tabnode --help

```

## Running tests
```sh
$ grunt mochacli

```


## License

MIT © [Andras Helyes]()
