//Use CommonJS style via browserify to load other modules
require("./lib/social");
require("./lib/ads");

/*
 
  Known values:
    Interest rate (i)
    Sticker price
    Other costs
    Down payment
    Term of loan

  Generate three curves:
    Remaining amount
    Total paid
    Current value

*/

var { generateCurves, morphCurves, graphCurves } = require("./curves");
var finance = require("./finance")

var b = generateCurves(100882.54, 12.5, 4.9, finance.mobileValuation(96005.56));

var animation = {
  blend: 0,
  frame() {
    this.blend += .01;
    if (this.blend > 1) this.blend = 1;
    this.current = morphCurves(this.a, this.b, this.blend);
    graphCurves(this.current);
    if (this.blend == 1) return;
    this.raf = requestAnimationFrame(this.frame.bind(this));
  },
  raf: null,
  a: generateCurves(1, 1, 0, finance.stableValuation(0)),
  b: null,
  current: null,
  animateTo(dest) {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.blend = 0;
    if (this.current) this.a = this.current;
    this.b = dest;
    this.frame();
  }
};

graphCurves(animation.a);
animation.animateTo(b);

var gather = function() {
  var form = {};
  var inputs = [].slice.call(document.querySelectorAll(".params input"));
  inputs.forEach(function(input) {
    form[input.name] = input.value * 1;
  });
  var deltaSelect = document.querySelector(".params .delta");
  form.delta = deltaSelect.value == "mobile-home" ? finance.mobileValuation : finance.stableValuation;
  return form;
};

document.querySelector(".ready").addEventListener("click", function() {
  var params = gather();
  var dest = generateCurves(params.price + params.other, params.interest, params.down, params.delta(params.price));
  animation.animateTo(dest);
});