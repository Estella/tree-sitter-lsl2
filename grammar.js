const PREC = {
  OR: 1,
  AND: 2,
  PLUS: 3,
  REL: 4,
  TIMES: 5,
  NOT: 6,
  NEG: 7,
  UPD: 8
};

module.exports = grammar({
  name: "lsl",

  extras: $ => [$.comment, /\s/],

  rules: {
    script: $ =>
      seq(
        repeat($._global_declaration),
        $.default_state,
        repeat($.state_declaration)
      ),
    _global_declaration: $ =>
      choice($.variable_declaration, $.function_declaration),
    _expression: $ =>
      choice(
        $.identifier,
        $._literal,
        $.unary_expression,
        $.binary_expression,
        $.update_expression
      ),
    _statement: $ =>
      choice(
        $.variable_declaration,
        seq($._expression, ";"),
        $.statement_block,
        $.return_statement,
        $.if_statement
      ),

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

    // Control statements
    if_statement: $ =>
      prec.right(
        seq(
          "if",
          $.parenthesized_expression,
          seq($._statement, optional(seq("else", $._statement)))
        )
      ),

    parenthesized_expression: $ => seq("(", $._expression, ")"),

    default_state: $ => seq("default", $.event_block),
    state_declaration: $ => seq("state", $.identifier, $.event_block),
    event_block: $ =>
      seq(
        "{",
        repeat(seq($.identifier, $.function_parameters, $.statement_block)),
        "}"
      ),

    return_statement: $ => seq("return", optional($._expression), ";"),

    // Expressions
    unary_expression: $ =>
      choice(
        ...[["!", PREC.NOT], ["~", PREC.NOT], ["-", PREC.NEG]].map(
          ([operator, precedence]) =>
            prec.left(precedence, seq(operator, $._expression))
        )
      ),

    binary_expression: $ =>
      choice(
        ...[
          ["&&", PREC.AND],
          ["||", PREC.OR],
          [">>", PREC.TIMES],
          ["<<", PREC.TIMES],
          ["&", PREC.AND],
          ["^", PREC.OR],
          ["|", PREC.OR],
          ["+", PREC.PLUS],
          ["-", PREC.PLUS],
          ["*", PREC.TIMES],
          ["/", PREC.TIMES],
          ["%", PREC.TIMES],
          ["<", PREC.REL],
          ["<=", PREC.REL],
          ["==", PREC.REL],
          ["!=", PREC.REL],
          [">=", PREC.REL],
          [">", PREC.REL]
        ].map(([operator, precedence]) =>
          prec.left(precedence, seq($._expression, operator, $._expression))
        )
      ),

    update_expression: $ =>
      prec.left(
        PREC.UPD,
        choice(
          seq($._lvalue, "++"),
          seq($._lvalue, "--"),
          seq("++", $._lvalue),
          seq("--", $._lvalue),
          seq($._lvalue, "=", $._expression),
          seq($._lvalue, "+=", $._expression),
          seq($._lvalue, "-=", $._expression),
          seq($._lvalue, "*=", $._expression),
          seq($._lvalue, "/=", $._expression),
          seq($._lvalue, "%=", $._expression)
        )
      ),

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
    _lvalue: $ =>
      choice($.identifier, seq($.identifier, ".", choice("x", "y", "z", "s"))),
    comment: $ => /\/\/.*/,

    type_name: $ =>
      choice("integer", "float", "key", "string", "list", "vector", "rotation")
  }
});

function commaSeparated(rule) {
  return optional(seq(rule, repeat(seq(",", rule))));
}
