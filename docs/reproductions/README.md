# 复现材料

## 启动

```bash
npm install
npx playwright install chromium
npm run start
```

服务地址：`http://127.0.0.1:4172`。

## API 复现主流程

```bash
curl -s -X POST http://127.0.0.1:4172/api/jobs \
  -H 'content-type: application/json' \
  -d '{"query":"browser retrieval","strategy":"strategy-v2","owner":"demo"}'
```

随后按返回 `id` 调用 `validate`、`submit`、`run`、`complete`。正式回归脚本会自动执行，不要求复制 ID。

## 页面复现

打开首页，填写 query，点击 Create → Validate → Submit → Run → Complete success/failure。右侧详情必须同步显示 state、error 和 audit。
