module.exports = grammar({
  name: "lsl",

  extras: $ => [$.comment, /\s/],

  rules: {
    script: $ => seq(repeat($._global_declaration)),
    _global_declaration: $ =>
      choice($.variable_declaration, $.function_declaration),
    _expression: $ => choice($.identifier, $._literal),
    _statement: $ => choice($.variable_declaration, $._expression),

    variable_declaration: $ =>
      seq($.type_name, $.identifier, optional(seq("=", $._expression)), ";"),
    function_declaration: $ =>
      seq(
        optional($.type_name),
        $.identifier,
        $.function_parameters,
        $.statement_block
      ),
    function_parameters: $ =>
      seq("(", commaSeparated(seq($.type_name, $.identifier)), ")"),
    statement_block: $ => seq("{", repeat($._statement), "}"),

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
