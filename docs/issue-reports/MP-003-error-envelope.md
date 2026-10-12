# [MP-003] API 错误没有稳定 code

- 状态：`Verified`
- 类型：`error`
- 复现入口：`input-error-envelope`

## 现象

输入非法或动作非法时，若只返回字符串/堆栈，页面无法按错误类型提示，回归也无法区分输入问题、资源不存在和状态冲突。

## 预期 / 实际

- 预期：HTTP status 与 `error.code/message/details` 稳定对应。
- 实际：未集中处理时，不同路由返回不同结构。

## 模拟修复

- `FIX-MP-003`：使用 `DomainError` 和 `errorEnvelope` 集中生成错误响应；未知异常不返回堆栈。

## 回归

- `npm test`
- 断言：空 query 返回 422 `INVALID_JOB_INPUT`；非法状态返回 409 `INVALID_TRANSITION`。
