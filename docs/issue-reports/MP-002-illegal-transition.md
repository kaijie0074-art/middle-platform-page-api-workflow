# [MP-002] 非法状态流转造成副作用

- 状态：`Verified`
- 类型：`transition`
- 复现入口：`illegal-transition`

## 现象

新任务处于 `draft` 时直接点击 Submit。若服务先写 audit 或先改状态再验证，任务可能半变更，后续无法解释。

## 预期 / 实际

- 预期：返回 409 `INVALID_TRANSITION`，state 仍是 draft，audit 仍为空。
- 实际：缺少集中状态机时可能返回 200、写入错误 audit 或跳过 validate。

## 模拟修复

- `FIX-MP-002`：`transition` 先查表、再构造 event，成功后才写 state/audit。

## 回归

- `npm test`
- 断言：非法 submit 后再次 GET，state/audit 均未变化。
