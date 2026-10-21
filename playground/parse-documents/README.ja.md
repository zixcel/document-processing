# 公開APIによる文書解析

[English](README.md)

3つの実TGZを隔離consumerへ導入し、擬似plain text/HTML/Markdownを解析します。scriptは実行せず出典を保持し、旧製品Schema IDは変換せず拒否します。

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm -r --include-workspace-root test
pnpm test:consumer
```

runnerは空npm設定、public依存、公開exportsを使い、型と旧Schemaの拒否、demo.mtsの実行を確認します。生成した一時consumerだけを片付け、製品DB/実account/providerには接続しません。

package 0.12.0は唯一の現行model zixcel.document.structure/0.11.0を扱います。release版とmodel版は別で、現行fieldsは維持し旧形式受理を撤去しました。金額/商品候補の意味採用は製品側で、過去releaseは変更しません。
