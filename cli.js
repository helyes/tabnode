#!/usr/bin/env node
'use strict';
var meow = require('meow');
var tabnode = require('./');

var cli = meow({
    help: [
        'Usage',
        'node cli.js <input> <result>',
        '',
        'Example',
        'node cli.js bets.txt R:2:3:1:'
    ].join('\n')
});

tabnode.calculateDividends(cli.input[0], cli.input[1]);

