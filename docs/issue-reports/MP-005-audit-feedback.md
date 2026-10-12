# [MP-005] 页面不展示失败原因和审计轨迹

- 状态：`Verified`
- 类型：`page`
- 复现入口：`page-workflow`

## 现象

任务失败时页面只显示“失败”，没有 error code、动作链和 actor；定位依赖服务器日志，用户无法知道卡在哪一步。

## 预期 / 实际

- 预期：详情区显示 `RETRIEVAL_FAILED`，audit 显示从 draft 到 failed 的完整动作链。
- 实际：缺少详情刷新或局部状态时，页面可能停在 running 或清空错误。

## 模拟修复

- `FIX-MP-005`：每次动作重新 GET 详情并渲染 audit/error。
- `FIX-MP-006`：API 和页面使用同一 store 详情，不复制旧对象。

## 回归

- `npm test`
- 断言：成功页面显示完整 audit；失败 API 保留 error.code，终态动作被拒绝。
