import { mathArtQuotes } from "../quotes/math-art.js";

const quoteById = new Map(mathArtQuotes.map((quote) => [quote.id, quote]));

const makeQuotePost = ({
  quoteId,
  headline,
  hook,
  reflection,
  question,
  caption,
  cta = "Visit The Number Garden",
  landingPath = "/membership",
  campaign = "math-is-beautiful",
}) => {
  const quote = quoteById.get(quoteId);
  if (!quote) {
    throw new Error(`Unknown quote id: ${quoteId}`);
  }

  return {
    id: quoteId,
    kind: "quote",
    campaign,
    headline,
    hook,
    reflection,
    question,
    quote,
    caption,
    cta,
    landingPath,
    themes: quote.themes,
  };
};

export const quoteSocialPosts = [
  makeQuotePost({
    quoteId: "hardy-maker-of-patterns",
    headline: "Mathematics is pattern-making.",
    hook: "Math is not just answer-getting.",
    reflection:
      "It is noticing, arranging, testing, and making patterns that hold together.",
    question: "What pattern did you notice today?",
    caption:
      "A reminder that mathematics is not just answer-getting. It is noticing, arranging, testing, and making patterns that hold together.",
  }),
  makeQuotePost({
    quoteId: "russell-mathematics-supreme-beauty",
    headline: "Truth can be beautiful.",
    caption:
      "Bertrand Russell's line belongs to a long tradition of people describing mathematics as something austere, exacting, and beautiful.",
  }),
  makeQuotePost({
    quoteId: "poincare-art-same-name",
    headline: "Abstraction is a kind of art.",
    caption:
      "Mathematics often begins when two different things suddenly reveal the same structure.",
  }),
  makeQuotePost({
    quoteId: "einstein-poetry-logical-ideas",
    headline: "Logic has poetry in it.",
    caption:
      "Einstein's tribute to Emmy Noether names something children can feel too: symbols can carry imagination.",
  }),
  makeQuotePost({
    quoteId: "carroll-symbolic-logic-mental-recreation",
    headline: "Logic can be play.",
    caption:
      "Lewis Carroll treated symbolic logic as a mental recreation: rigorous, yes, but also delightful.",
  }),
  makeQuotePost({
    quoteId: "lockhart-art-of-explanation",
    headline: "Mathematics explains.",
    caption:
      "A good proof does not just certify an answer. It changes what we can see.",
  }),
];
