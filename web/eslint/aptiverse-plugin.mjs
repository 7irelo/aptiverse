// Local ESLint rules that enforce Aptiverse house rules.
//
// - no-hex-colors: colour values live in src/styles/tokens.css only.
// - no-emoji-or-long-dash: no emojis and no em or en dashes in copy,
//   strings or comments. Use a comma, colon, full stop or "to" instead.

const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/;
// Extended_Pictographic covers emoji; U+2013 and U+2014 are en and em dash.
const EMOJI = /\p{Extended_Pictographic}/u;
const LONG_DASH = /[–—]/;

function textNodes(context, check) {
  return {
    Literal(node) {
      if (typeof node.value === "string") check(node, node.value);
    },
    TemplateElement(node) {
      check(node, node.value.cooked ?? node.value.raw);
    },
    JSXText(node) {
      check(node, node.value);
    },
  };
}

const noHexColors = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hex colour literals outside src/styles/tokens.css",
    },
    messages: {
      hex: "Hex colour '{{value}}' found. Use a token from src/styles/tokens.css (for example bg-primary or var(--citron-surface)).",
    },
    schema: [],
  },
  create(context) {
    return textNodes(context, (node, text) => {
      const match = HEX_COLOR.exec(text);
      if (match)
        context.report({ node, messageId: "hex", data: { value: match[0] } });
    });
  },
};

const noEmojiOrLongDash = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow emoji and em or en dashes in strings, JSX text and comments",
    },
    messages: {
      emoji:
        "Emoji are not allowed in Aptiverse code or copy. Use a Lucide icon for visuals.",
      dash: "Em and en dashes are not allowed. Use a comma, colon, full stop or the word 'to'.",
    },
    schema: [],
  },
  create(context) {
    const check = (node, text) => {
      if (EMOJI.test(text)) context.report({ node, messageId: "emoji" });
      if (LONG_DASH.test(text)) context.report({ node, messageId: "dash" });
    };
    return {
      ...textNodes(context, check),
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          check(comment, comment.value);
        }
      },
    };
  },
};

const plugin = {
  meta: { name: "aptiverse" },
  rules: {
    "no-hex-colors": noHexColors,
    "no-emoji-or-long-dash": noEmojiOrLongDash,
  },
};

export default plugin;
