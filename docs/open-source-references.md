# 开源项目引用与边界

## React Admin

- 官方仓库：[marmelab/react-admin](https://github.com/marmelab/react-admin)，MIT License。
- 一手资料：[Data Providers](https://github.com/marmelab/react-admin/blob/master/docs/DataProviders.md)；README 展示 resource CRUD、REST/GraphQL adapter、validation 和 cache。
- 借鉴：页面资源操作与后端 data provider 契约分离，CRUD 动作对应明确 API。
- 边界：本项目用原生 HTML/JS 演练，不复制 React Admin 组件或运行时。

## Temporal TypeScript SDK

- 官方仓库：[temporalio/sdk-typescript](https://github.com/temporalio/sdk-typescript)，MIT License。
- 一手资料：[TypeScript Workflows](https://docs.temporal.io/develop/typescript/workflows) 与 Activities；资料强调 workflow 编排和 activity 执行边界。
- 借鉴：将状态流转集中到 workflow 模块，页面只发动作；保留 audit 以便定位。
- 边界：本项目没有 durable execution、worker、重试持久化或真实队列。

## OpenAPI Specification

- 官方仓库：[OAI/OpenAPI-Specification](https://github.com/OAI/OpenAPI-Specification)，Apache License 2.0。
- 一手规范：[OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0.html) 定义语言无关的 HTTP API 描述、请求/响应和 schema。
- 借鉴：把端点、状态码、请求响应和错误结构写成可核对契约。
- 边界：本演练不宣称已经提供完整生产 OpenAPI 文档生成链路。

## Express

- 官方仓库：[expressjs/express](https://github.com/expressjs/express)，MIT License。
- 一手资料：[Error Handling](https://expressjs.com/en/guide/error-handling.html) 说明 route/middleware 错误传播和集中式错误处理。
- 借鉴：统一错误包络、路由边界和未处理异常隔离。
- 边界：实现使用 Node 内置 `http`，不复制 Express 代码。

## 许可证纪律

只引用公开机制和链接；没有复制外部项目源代码。若以后引入依赖，必须重新核对版本、许可证和安全公告。
