# HTMLの文書構造adapter

[English](README.md)

parse5と現行document-structureを使い、HTML fragmentをboundedなnode/relationへ整理します。script/style/templateを意味として採用せず、入力・深さ・node数等の上限と出典を保持します。製品の金額/商品候補は作りません。

公開importは@zixcel/document-htmlのparseHtmlSurfaceです。正式registry依存と開発workspaceを区別し、[playground](../../playground/parse-documents/README.ja.md)でTGZの独立利用を確認します。旧製品Schemaはroot validatorが拒否します。LICENSE/NOTICEを保持します。
