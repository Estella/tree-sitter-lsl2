module.exports = grammar({
  name: "lsl",

  extras: $ => [$.comment, /\s/],

  rules: {
    script: $ => seq(repeat($._global)),
    _global: $ => choice($.variable_declaration),
    _expression: $ => choice($.identifier, $._literal),

    variable_declaration: $ =>
      seq($.type_name, $.identifier, optional(seq("=", $._expression)), ";"),

    // Literals
    _literal: $ =>
      choice(
        $.integer_literal,
        $.float_literal,
        $.string_literal,
        $.list_literal,
        $.vector_literal,
        $.quaternion_literal
      ),
    integer_literal: $ => /\d+/,
    float_literal: $ => /(\d+\.\d*|\d*\.\d+)/,
    string_literal: $ => seq('"', repeat(choice(/[^"\\]+/, /\\./)), '"'),
    list_literal: $ => seq("[", commaSeparated($._expression), "]"),
    vector_literal: $ =>
      seq("<", $._expression, ",", $._expression, ",", $._expression, ">"),
    quaternion_literal: $ =>
      seq(
        "<",
        $._expression,
        ",",
        $._expression,
        ",",
        $._expression,
        ",",
        $._expression,
        ">"
      ),

    identifier: $ => /[_A-Za-z]\w*/,
    comment: $ => /\/\/.*/,

    type_name: $ =>
      choice("integer", "float", "key", "string", "list", "vector", "rotation")
  }
});

function commaSeparated(rule) {
  return optional(seq(rule, repeat(seq(",", rule))));
}
