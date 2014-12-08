'use strict';

//Read input file line by line for small memory footprint
var lineByLineReader = require('line-by-line');
var q = require('q');
var fs = require('fs');

/**
 * A dividend containing raw value for further processing
 * 
 * <pre>
 * {@code
 * {"name":"Win","winner":"2","dividend":2.611818181818182}
 * }
 * </pre>
 */
var Dividend = function (name, winner, dividend) {
    this.name = name;
    this.winner =  winner;
    this.dividend = dividend;
};


/**
 * Base class of all products and related bets.  <br>
 * Includes aggregated bets per horse.
 * 
 * <pre>
 * {@code
 * {  
 *   "W":{  
 *       "name":"Win",
 *       "commission":15,
 *       "sum":338,
 *       "bets":{  
 *         "1":{  
 *            "amount":61,
 *            "count":3
 *         },
 *         "2":{  
 *            "amount":110,
 *            "count":3
 *         },
 *         "3":{  
 *            "amount":90,
 *            "count":3
 *         },
 *         "4":{  
 *            "amount":77,
 *            "count":3
 *         }
 *      }
 *   }
 * }
 * }
 * </pre>
 */

function Product(name, commission) {
  this.name = name;
  this.commission = commission;
  this.sum = 0;
  this.bets = {};
  
  this.placeBet = function(bet){
     if (!this.bets[bet.number]) {
      this.bets[bet.number] = {amount: 0, count: 0 };  
    }
    
    this.bets[bet.number].amount = this.bets[bet.number].amount + bet.amount;
    this.bets[bet.number].count = this.bets[bet.number].count + 1;
    this.sum   = this.sum + bet.amount;
  };
}


/**
 * Win product.
 * 
 */
function W() {
  Product.call(this, 'Win', 15);
  this.calculatedividends = function (result) {
     if (this.sum === 0) {return null;}
     var winnerproducts = this.bets[result[0]];
     var dividend = this.sum * ((100 - this.commission) / 100) / winnerproducts.amount;
     //this.logdividend(result[0], dividend);
     console.log('      %s\t - Runner %d - $%s', this.name, result[0], dividend.toFixed(2));
     return new Dividend(this.name, result[0], dividend);
  };
}
W.prototype = Object.create(Product.prototype);


/**
 * Place product.
 * 
 */
function P() {
  Product.call(this, 'Place', 12);
  this.calculatedividends = function (result) {
     if (this.sum === 0) {return null;}
     var poolPerPosition =  this.sum / 3;
     var dividends = [];
     for (var i = 0; i< 3; i++) {
        var winnerproducts = this.bets[result[i]];
        var dividend = poolPerPosition * ((100 - this.commission) / 100) / winnerproducts.amount;
        console.log('      %s\t - Runner %d - $%s', this.name, result[i], dividend.toFixed(2));
        dividends.push(new Dividend(this.name, result[i], dividend));
     }
      return dividends;
  };
}
P.prototype = Object.create(Product.prototype);

/**
 * Exacta product.
 * 
 */
function E() {
  Product.call(this, 'Exacta', 18);
  this.calculatedividends = function (result) {
      if (this.sum === 0) {return null;}
     //get the winner entry
     var winnerKey = result.slice(0, 2);
     var winnerproducts = this.bets[winnerKey];
     var dividend = this.sum * ((100 - this.commission) / 100) / winnerproducts.amount;
     console.log('      %s\t - Runner %s - $%s', this.name, winnerKey, dividend.toFixed(2));
      return new Dividend(this.name, winnerKey, dividend);
  };
}
E.prototype = Object.create(Product.prototype);

/**
 * Quinella product.
 * 
 */
function Q() {
  Product.call(this, 'Quinella', 18);
  this.calculatedividends = function (result) {
     if (this.sum === 0) {return null;}
     //get the winner entry
     var winnerKey = result.slice(0, 2);
     winnerKey.sort(function(a,b){return a - b;});
     var winnerproducts = this.bets[winnerKey];
     var dividend = this.sum * ((100 - this.commission) / 100) / winnerproducts.amount;
     console.log('      %s\t - Runner %s - $%s', this.name, winnerKey, dividend.toFixed(2));
      return new Dividend(this.name, winnerKey, dividend);
  };

  /**
   * The horse numbers are ordered to ensure that order of winners is irrevelant.<br>
   * For example, bets on 3,9 or 9,3 saved as 3,9
   */
  this.placeBet = function(bet){
    //TODO: this is not dry enough plus number format needs ot be validated against
    var numbers = bet.number.split(',');
    numbers.sort(function(a,b){return a - b;});
    bet.number = numbers.toString();
    
    if (!this.bets[bet.number]) {
      this.bets[bet.number] = {amount: 0, count: 0 };  
    }
    
    this.bets[bet.number].amount = this.bets[bet.number].amount + bet.amount;
    this.bets[bet.number].count = this.bets[bet.number].count + 1;
    this.sum  = this.sum + bet.amount;
  };
}
Q.prototype = Object.create(Product.prototype);


/**
 * Calculates the actual dividents per product <br>
 * Runs through given products object and calls <pre>calculatedividends</pre> on each product
 * 
 * @return list of dividends
 */
var calculate = function (products, result) {
  console.log('\nCalculating dividends for result %s ...', result);
  //validate result entry
  var resultList =  result.substring(2).split(':');
  var dividends = [];
  //run through all products
  for (var key in products) {
      //call calculatedividends on product if its defined
      if (products[key] instanceof Product && typeof(products[key].calculatedividends) === 'function') {
         var div = products[key].calculatedividends(resultList);
         if (div instanceof Array) {
            dividends.push.apply(dividends, div);
         } else if (div!=null){
            dividends.push(div);
         } else {
	   //sink it atm
	   //console.log('Calculated dividend for %s is null');
	}

      }
  }
  return dividends;
};

/**
 * Module entry point. <br>
 * Loads bets from file and calculate dividends based on given result entry<br><br>
 * Supports W,P,E and Q products
 */
module.exports.calculateDividends = function (filepath, result) {
    console.log('\nLoading \'%s\'...', filepath);
    var deferred = q.defer();

    if (!fs.existsSync(filepath)) {
        console.log('File does not exist or can not be read: %s', filepath);
        //deferred.reject(new Error({error: 'File does not exist'}));
        deferred.reject('File does not exist');
    }

    var products = {
        W: new W(),
        P: new P(),
        E: new E(),
        Q: new Q()
    };

    var lr = new lineByLineReader(filepath);
    var successCounter = 0, errorCounter = 0, invalidCounter = 0, readCounter = 0;
    
    lr.on('error', function (err) {
	     errorCounter++;
	     console.log('Error: %s', JSON.stringify(err));
         deferred.reject(new Error(err));

    });

    lr.on('line', function (line) {
        readCounter++;
        //ignore everything from # 
      	line = line.split("#")[0].trim();
     	
	//validate record. Invalid records quietly ignored.
        if (!/(([EQ]:\d,\d)|([WP]:(\d))):\d{1,5}/.test(line)) {
          console.log('Invalid entry at line %d: \'%s\'', readCounter , line);
          invalidCounter++;
          return;
        }
         
         var fields = line.split(':');
         products[fields[0]].placeBet({ type: fields[0].toUpperCase(),  number: fields[1], amount: Number(fields[2])});
      	 successCounter++;
    });
    
    //Calculates dividends and prints a simple report 
    lr.on('end', function () {
      console.log('\n\n%s loaded', filepath);
      console.log(new Array(filepath.length + 11).join('-'));
      console.log('Lines read:       %d', readCounter );
      console.log('      processed:  %d', successCounter );
      console.log('      invalid:    %d', invalidCounter);
      console.log('      error:      %d', errorCounter);
      //console.log('\n\n%s', JSON.stringify(products));
      deferred.resolve(calculate(products, result));
    });
    return deferred.promise.nodeify();

};
