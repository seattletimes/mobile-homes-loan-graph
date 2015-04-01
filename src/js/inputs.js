var qsa = require("./qsa");

var onBlur = function() {
  var format = this.getAttribute("data-format");
  if (!format) return;
  var value = format == "dollars" ? `$${(this.value * 1).toLocaleString()}` : `${this.value}%`;
  this.value = value;
};

var onFocus = function() {
  this.value = this.value.replace(/\$|,|%/g, "");
  this.setSelectionRange(0, this.value.length);
};

var inputs = qsa("input[type=text]");
inputs.forEach(input => input.addEventListener("focus", onFocus));
inputs.forEach(input => input.addEventListener("blur", onBlur));

module.exports = {
  blur: onBlur,
  focus: onFocus
}