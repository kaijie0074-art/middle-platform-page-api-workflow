# 状态机

```text
draft --validate--> validated --submit--> queued --run--> running
running --complete(success)--> succeeded
running --complete(failure)--> failed
```

## 不变量

1. 新任务只能从 `draft` 开始。
2. 每次合法迁移恰好追加一个 audit event。
3. 非法迁移返回 `INVALID_TRANSITION`，不得改变 state 或 audit。
4. `succeeded`、`failed` 是终态，不允许再次 validate/submit/run/complete。
5. 页面展示必须读取 API 返回的 state 和 audit，不保留第二份状态机。
6. `failed` 必须携带 `error.code`，但不得把堆栈返回给浏览器。
