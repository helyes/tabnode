#  [![Build Status](https://secure.travis-ci.org/helyes/tabnode.png?branch=master)](http://travis-ci.org/helyes/tabnode)

> Simple divident calculator

Parses listfile containing bets and calculates dividends for given result.

### Supported product types

* W (Win)
* P (Place)
* E (Exacta)
* Q (Quinella)

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

## Bet file record layout

```
W:1:3
P:1:31
E:1,2:13
Q:1,2:19
```

## Result format
```
R:2:3:1:4
```
See test folder for examples.

## Example output
```
$ tabnode bets.txt R:1:2:3:4

Loading 'bets.txt'...


test.txt loaded
--------------------
Lines read:       48
      processed:  48
      invalid:    0
      error:      0

Calculating dividends for result R:1:2:3:4 ...
      Win  		- Runner 1 - $4.71
      Place		- Runner 1 - $2.13
      Place		- Runner 2 - $1.06
      Place		- Runner 3 - $1.27
      Exacta   	- Runner 1,2 - $5.06
      Quinella 	- Runner 1,2 - $5.33

```




## License

MIT © [Andras Helyes]()
