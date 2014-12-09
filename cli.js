#!/usr/bin/env node
'use strict';
var meow = require('meow');
var tabnode = require('./');

var cli = meow({
    help: [
        'Usage',
        'tabnode <input> <result>',
        '',
        'Example',
        'tabnode bets.txt R:2:3:1:4'
    ].join('\n')
});

tabnode.calculateDividends(cli.input[0], cli.input[1]);

