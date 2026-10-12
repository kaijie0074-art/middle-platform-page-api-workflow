# 模拟修复引用

`FIX-MP-*` 是本项目内部引用，不是外部项目真实修复。

| 修复 ID | 报告 | 位置 | 修复动作 | 回归 |
| --- | --- | --- | --- | --- |
| FIX-MP-001 | MP-001 | `src/contracts.mjs`、`public/app.js` | 页面和 API 使用同一字段命名与响应解析 | `create-detail-contract` |
| FIX-MP-002 | MP-002 | `src/workflow.mjs` | 非法迁移先拒绝，再写入状态；失败不产生 audit | `illegal-transition` |
| FIX-MP-003 | MP-003 | `src/server.mjs` | 统一 HTTP status/error.code/details | `error-envelope` |
| FIX-MP-004 | MP-004 | `src/workflow.mjs`、`public/app.js` | 终态不可重复执行，按钮按 state 禁用 | `terminal-guard` |
| FIX-MP-005 | MP-005 | `public/app.js` | 每次动作后刷新详情并渲染 audit/error | `page-workflow` |
| FIX-MP-006 | MP-006 | `src/job-store.mjs` | 同一对象作为 API 与页面详情来源，避免 stale copy | `detail-refresh` |

只有 `npm test` 和 `npm run check` 同时通过，报告才可标记 `Verified`。
