module.exports = function(s) {
  return Array.prototype.slice.call(document.querySelectorAll(s));
};