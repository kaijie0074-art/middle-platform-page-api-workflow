# 贡献指南

1. 先更新 `docs/state-machine.md` 和 `docs/api-contract.md`，再改代码。
2. 所有状态写入必须经过 `src/workflow.mjs`，页面不得自行伪造状态。
3. 新错误必须有稳定 `error.code`、HTTP status 和可定位 details。
4. 每个问题至少有 `MP-*` 报告、`FIX-MP-*` 引用、一个 API 或页面回归。
5. 运行 `npm test` 与 `npm run check` 后再更新回归记录。

不提交真实用户、密钥、Cookie、生产接口地址或 Playwright trace。
