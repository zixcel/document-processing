# Document Processing

文書の構造・解析・変換・出力を一つの機能monorepoで保守します。NodeとRustの実装境界、read/write capability、製品の意味付けを分けます。

[配置と利用手順](README.md)。既存package名・wire/schema ID・独立consumer・LICENSE/NOTICE・Git履歴を維持します。新patch版は正式registry照合までは候補です。公開は検証jobで作ったimmutable archiveだけをOIDC jobへ渡し、OIDC jobで再packしません。

# 文書構造の解析と検証

[English](README.md)

意味の採用前にsource evidenceを保持するboundedな文書構造ライブラリです。plain text、HTML、CommonMarkを扱い、金額/商品候補等の業務解釈は製品に残します。

| package | 責務 |
| --- | --- |
| document-structure | 現行model、plain text、構築/検証 |
| document-html | WHATWG HTML adapter |
| document-markdown | CommonMark adapter |

0.12.0は現行model zixcel.document.structure/0.11.0だけを受理します。releaseとmodelの版は別で、現行fields/上限は維持し、旧sem-lang形式の受理/型を撤去しました。過去配布物や製品DBを変更する処理ではありません。

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm run typecheck
pnpm -r --include-workspace-root test
pnpm test:consumer
```

[playground](playground/parse-documents/README.ja.md)は3TGZをcheckout外へ導入し、公開型・解析・旧形式拒否を確認します。依存は正式registry版、source linkは開発時のみで、private管理repo/除外archiveは不要です。

公開はownerのpublish-npm.ymlがreview済みhash・source/consumer test・OIDCを確認します。採用前に公式archive/provenanceを照合します。公開と製品受入/配備は別で、実account/DBへ接続しません。LICENSE/NOTICEを保持します。
