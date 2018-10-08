module.exports = grammar({
  name: "lsl",

  extras: $ => [$.comment, /\s/],

  rules: {
    script: $ => seq(repeat($._global)),
    _global: $ => choice($.variable_declaration),
    variable_declaration: $ => seq($.type_name, $.identifier, ";"),
    type_name: $ =>
      choice("integer", "float", "key", "string", "list", "vector", "rotation"),
    identifier: $ => /[_A-Za-z]\w*/,
    comment: $ => /\/\/.*/
  }
});
