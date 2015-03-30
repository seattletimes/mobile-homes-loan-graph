var pmt = function(loan, interest, years) {
  var rate = interest / 1200;
  var months = years * 12;
  var total = loan * rate;
  var denom = 1 - (1 / Math.pow(1 + rate, months));
  return total / denom;
};

var schedule = function(loan, interest, years) {
  var payment = pmt(loan, interest, years);
  var monthly = interest / 1200;
  var principal = loan;
  var data = [];
  for (var i = 0; i <= years * 12; i++) {
    var ip = principal * monthly;
    var pp = payment - ip;
    principal -= pp;
    data.push({
      payment,
      remaining: principal,
      interest: ip,
      principal: pp,
      paid: payment * i
    });
  }
  return data;
};

var mobileValuation = function(amount) {
  return function(month) {
    if (month <= 12 * 3) {
      //first three years
      return amount - (amount * (.05 * month / 12));
    }
    //halved after that, up to 25 years
    if (month < 12 * 25) {
      return amount - (amount * (.15 + (.05 * (month - 36) / 24)));
    }
    return amount * .3;
  };
}

module.exports = {
  pmt,
  schedule,
  mobileValuation,
  stableValuation: function(amount) { return function() { return amount } }
}