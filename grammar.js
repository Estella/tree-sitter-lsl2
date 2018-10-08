module.exports = grammar({
  name: "lsl",

  extras: $ => [$.comment, /\s/],

  rules: {
    script: $ => seq(),
    comment: $ => /\/\/.*/
  }
});
