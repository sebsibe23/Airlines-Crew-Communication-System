const isNumber = (str) => {
  const objNotNumberPattern = /[^0-9.-]/;
  const objTwoDotPattern = /[0-9]*[.][0-9]*[.][0-9]*/;
  const objTwoMinusPattern = /[0-9]*[-][0-9]*[-][0-9]*/;
  const strValidRealPattern = "^([-]|[.]|[-.]|[0-9])[0-9]*[.]*[0-9]+$";
  const strValidIntegerPattern = "^([-]|[0-9])[0-9]*$";
  const objNumberPattern = new RegExp(`(${strValidRealPattern})|(${strValidIntegerPattern})`);

  return !objNotNumberPattern.test(str) && !objTwoDotPattern.test(str) && !objTwoMinusPattern.test(str) && objNumberPattern.test(str);
};

module.exports = {
  isNumber
};