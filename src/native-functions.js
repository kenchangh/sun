var exports = module.exports;

exports.rand = function rand() {
  min = 0;
  max = 32767;
  return Math.floor(Math.random() * (max - min)) + min;
};
