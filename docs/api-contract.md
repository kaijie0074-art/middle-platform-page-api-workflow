# API 契约

Base URL：`http://127.0.0.1:4172`。

## 错误包络

所有可预期错误使用：

```json
{
  "error": {
    "code": "INVALID_TRANSITION",
    "message": "job cannot submit from draft",
    "details": { "jobId": "job-1", "state": "draft", "action": "submit" }
  }
}
```

## 端点

| 方法 | 路径 | 成功 | 失败 |
| --- | --- | --- | --- |
| `GET` | `/api/health` | `200 {ok:true}` | — |
| `POST` | `/api/jobs` | `201`，创建 `draft` | `400 INVALID_JSON`、`422 INVALID_JOB_INPUT` |
| `GET` | `/api/jobs/:id` | `200`，详情/审计 | `404 JOB_NOT_FOUND` |
| `POST` | `/api/jobs/:id/validate` | `200`，`validated` | `409 INVALID_TRANSITION` |
| `POST` | `/api/jobs/:id/submit` | `200`，`queued` | `409 INVALID_TRANSITION` |
| `POST` | `/api/jobs/:id/run` | `200`，`running` | `409 INVALID_TRANSITION` |
| `POST` | `/api/jobs/:id/complete` | `200`，`succeeded` 或 `failed` | `400 INVALID_OUTCOME`、`409 INVALID_TRANSITION` |

## 创建请求

```json
{
  "query": "browser retrieval",
  "strategy": "strategy-v2",
  "owner": "demo-user"
}
```

响应中的 `id`、`state`、`createdAt`、`updatedAt`、`audit` 和 `error` 是页面所需的最小契约。
