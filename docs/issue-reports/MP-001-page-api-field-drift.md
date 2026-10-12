# [MP-001] 页面与 API 字段命名漂移

- 状态：`Verified`
- 类型：`contract`
- 复现入口：`create-detail-contract`、`page-workflow`

## 现象

页面需要 `state`、`audit`、`error`，但如果创建响应使用另一套字段或页面保留本地状态，创建后详情会显示错误，流程按钮也会失效。

## 预期 / 实际

- 预期：创建、详情和动作响应使用同一 RetrievalJob 契约。
- 实际：无契约时页面/API 各自演化，字段漂移只能在浏览器操作中发现。

## 模拟修复

- `FIX-MP-001`：把字段约束集中于 `src/contracts.mjs`，页面动作完成后重新读取详情。

## 回归

- `npm test`
- 断言：create 返回 draft；每次动作返回同名 state/audit/error；页面最终显示 succeeded。
