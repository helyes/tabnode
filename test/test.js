/*global describe, it, xit */
/*jshint expr: true */
/*exported should */
'use strict';
var should = require('should');
var tabnode = require('../');

describe('tab dividend calculator', function () {
    
    it('must calculate dividends correctly', function (done) {
       //I'd write temp files on demand in a real project
        tabnode.calculateDividends('test/inputfiles/testbets.txt', 'R:2:3:1:4')
            .then(
            function (result) {
                //console.log('Dividends: ', JSON.stringify(result));
                (result !== null).should.be.true;
                result.should.be.an.instanceOf(Array);
                result.length.should.be.exactly(6);

                var expected = {
                    Win: 2.61,
                    Place2: 1.06,
                    Place3: 1.27,
                    Place1: 2.13,
                    Exacta: 2.43,
                    Quinella: 2.18
                };
		
		//check result agains expected values
                for (var i = 0; i < result.length; i++) {
                    if (result[i].name === 'Place') {
                        result[i].dividend.should.be.approximately(expected[result[i].name+result[i].winner], 0.1);
                    } else {
                        result[i].dividend.should.be.approximately(expected[result[i].name], 0.1);
                    }
                }

                done();
            },
            function (error) {
                console.error("Can not calculate dividends", error);
                done(error);
            }
        );

    });

    it('should accepts files with less than 4 types of product', function (done) {
        tabnode.calculateDividends('test/inputfiles/testbetsw.txt', 'R:2:3:1:4')
            .then(
            function (result) {
                //console.log('Dividends: ', JSON.stringify(result));
                (result !== null).should.be.true;
                result.should.be.an.instanceOf(Array);
                console.log(result.length);
                result.length.should.be.exactly(1);
                result[0].dividend.should.be.approximately(2.61, 0.1);
                done();
            },
            function (error) {
                console.error("Can not calculate dividends", error);
                done(error);
            }
        );
    });

    xit('should not freak out if given file is empty', function (done) {
       done();
    });

   xit('should digest line with # only (without a real bet entry)', function (done) {
       done();
   });
   
   xit('should handle empty lines gracefully', function (done) {
       done();
    });

   xit('should handle missing line break', function (done) {
       done();
    });

   xit('should load entries with windows and linux line feed', function (done) {
       done();
    });

   xit('should load entries with windows and linux line feed', function (done) {
       done();
    });

   xit('should validate result entry', function (done) {
       done();
    });
   
   
});
