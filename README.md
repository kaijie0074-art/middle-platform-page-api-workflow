# 中台页面接口和流程开发

模拟一个“检索任务中台”：用户在页面创建 RetrievalJob，后端通过稳定 API 驱动 `draft → validated → queued → running → succeeded/failed`，页面展示状态、错误和审计轨迹。

这是本地确定性工程演练，不连接真实检索服务、不使用真实账号或生产数据。

## 快速开始

```bash
npm install
npx playwright install chromium
npm run start
```

另开终端运行：

```bash
npm test
npm run check
```

- `npm run start`：启动 `http://127.0.0.1:4172`。
- `npm test`：API 契约、非法状态流转、成功/失败分支和 Chromium 页面流程。
- `npm run check`：检查接口文档、状态 ID、FIX 引用和敏感信息。

## 功能范围

- 创建任务：query、strategy、owner。
- 校验任务：输入契约和状态变更分离。
- 提交队列：只有 `validated` 可进入 `queued`。
- 运行任务：`queued → running`。
- 完成任务：`running → succeeded/failed`，保留 error code。
- 任务详情：页面和 API 读取同一份状态与审计记录。

## 文档路径

- [`docs/api-contract.md`](docs/api-contract.md)：HTTP 方法、状态码、错误结构。
- [`docs/state-machine.md`](docs/state-machine.md)：状态机和不变量。
- [`docs/open-source-references.md`](docs/open-source-references.md)：React Admin、Temporal、OpenAPI、Express 一手资料。
- [`docs/reproductions/README.md`](docs/reproductions/README.md)：端到端复现步骤。
- [`docs/issue-reports/`](docs/issue-reports/)：问题报告。
- [`docs/repair-references.md`](docs/repair-references.md)：模拟修复引用。
- [`docs/regression-records/`](docs/regression-records/)：回归证据。
- [`work/wayfinder-map.md`](work/wayfinder-map.md)：任务模型和验收门。

## 许可证

本项目采用 MIT License。外部项目只借鉴公开机制，不复制其源代码；许可证以官方来源为准。
