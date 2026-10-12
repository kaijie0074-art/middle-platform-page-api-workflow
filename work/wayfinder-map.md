# 中台页面、接口和流程开发：Wayfinder Map

> 状态：已验证，待远程仓库创建与最终一致性核对
> 建立日期：2026-10-12
> 项目中文名：中台页面接口和流程开发
> 仓库目标：`middle-platform-page-api-workflow`

## Destination

交付一个可本地启动的检索任务中台：操作员可创建任务、校验参数、提交排队、推进运行、查看详情和处理失败；页面、HTTP API 和状态机使用同一份契约。

## Notes

- 领域对象：RetrievalJob（检索任务）。
- 状态：`draft -> validated -> queued -> running -> succeeded | failed`；终态不可直接回退。
- 参考基线：React Admin 的 admin data provider 组织方式、Temporal workflow 的显式状态/活动边界、OpenAPI 的契约优先、Express 的 HTTP 路由约定。

## Decisions so far

- 使用 Node 内置 HTTP server + 原生 HTML/CSS/JS，避免把构建工具错误伪装成业务实现。
- API 返回稳定 JSON 错误码；前端只通过 API 改状态，不直接改内存对象。
- workflow transition 是唯一允许修改状态的模块，拒绝非法跳转并记录审计事件。

## Acceptance gates

- [x] `npm start` 可启动页面和 API；`npm test` 覆盖创建、校验、提交、运行、成功/失败和非法状态跳转。
- [x] 页面 E2E 能创建任务并看到状态流转、错误提示和详情。
- [x] API 契约、状态机图、问题报告、修复引用和回归记录齐全。
- [ ] Public GitHub 仓库无真实用户、token 和运行时日志。

## Evidence

- `npm test`：PASS，8 个 middle-platform checks。
- `npm run check`：PASS，5 个问题报告、31 个文件扫描。
- Chromium 156.0.8078.4 完成创建、validate、submit、run、complete success 页面流程。
- 非法 submit 返回 409，state/audit 未变化；failure 分支保留 `RETRIEVAL_FAILED`。

## Not yet specified

- 权限/RBAC（角色权限控制）：本轮用固定演示操作员，不实现生产鉴权。
- 数据库持久化：本轮使用进程内存，重启后数据清空。

## Out of scope

- 生产数据库、消息队列、分布式锁、登录、权限和部署。
- 真实检索 provider；任务运行只模拟可观察流程。
