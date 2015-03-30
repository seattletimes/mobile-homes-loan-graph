var t = 
  "transform" in document.body.style ? "transform" :
  "webkitTransform" in document.body.style ? "webkitTransform" :
  "msTransform" in document.body.style ? "msTransform" :
  "mozTransform";

module.exports = {
  setXY(element, x, y) {
    element.style[t] = `translateX(${x}px) translateY(${y}px)`;
  }
}