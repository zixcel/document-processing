# Text capacity and source spans

All three adapters count JavaScript UTF-16 code units. The bounded source is at most
262,144 units and each node value at most 65,536. Boundaries never split an existing
surrogate pair. The node/relation budgets remain 4,096/8,192; limits are not raised.

Long text observations become ordered sibling chunks. Subsequent chunks carry the
`text-continuation` format trait and `follows` edges; visibleSurfaceText rejoins these
without inventing spaces. Chunks retain valueType/traits and source attribution.
Plain text spans are exact substring offsets. HTML/CommonMark normalize text, so
all chunks retain their original contributing AST source extent, not invented
character offsets within decoded or whitespace-normalized text.

If node/relation capacity is exhausted, only an attached ordered prefix is kept and
truncated is true. Oversized non-text references are omitted and reported truncated;
a URL is never split into multiple invented references. Input clipping, parser depth
and output budgets all propagate truncation. Structural extraction does not evaluate
meaning or execute embedded content.

The implementations and shared construction logic are TypeScript. Generated ESM and
declarations are built into each package's dist/ before packing; runtime dependencies
remain registry versions. No new schema or backward-compatibility decoder is added.

Use `pnpm -r --include-workspace-root build`, `pnpm -r --include-workspace-root test`,
`pnpm typecheck`, then `node scripts/verify-packed-consumer.mjs`. Tests cover all three
formats at 65,536/65,537/262,144/262,145 units, surrogate boundaries, capacity pressure,
content/order/span/truncation and fresh packed consumer behavior.
