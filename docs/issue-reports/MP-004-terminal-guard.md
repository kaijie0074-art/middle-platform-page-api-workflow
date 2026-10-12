# [MP-004] 终态仍显示可执行动作

- 状态：`Verified`
- 类型：`transition`
- 复现入口：`terminal-guard`

## 现象

任务已 succeeded/failed 后，页面仍显示 Run 或 Complete；重复动作会制造重复审计，或把终态改回中间态。

## 预期 / 实际

- 预期：终态 API 返回 409，页面按钮禁用。
- 实际：没有共享状态机时，按钮状态和后端状态容易不一致。

## 模拟修复

- `FIX-MP-004`：后端终态无允许动作；前端按 API state 更新按钮。

## 回归

- `npm test`
- 断言：succeeded 后 Run 返回 409，Chromium 中 Run 按钮 disabled。
