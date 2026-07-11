# 多吉云 OSS 参考

使用时优先重新核对以下官方页面：

- [服务端获取上传临时密钥](https://docs.dogecloud.com/oss/manual-tmp-token)
- [Python S3 SDK](https://docs.dogecloud.com/oss/sdk-full-python)
- [API 介绍](https://docs.dogecloud.com/oss/api-introduction)
- [获取文件列表](https://docs.dogecloud.com/oss/api-file-list)
- [查询文件基本信息](https://docs.dogecloud.com/oss/api-file-info)

## API 与鉴权

- API 域名为 `https://api.dogecloud.com`，只使用 HTTPS。
- API 业务错误通常仍返回 HTTP 200，必须检查响应体中的 `code`；只有 `code == 200` 才算成功。
- AccessToken 签名使用 HMAC-SHA1，签名内容为 `REQUEST_URI + "\n" + HTTP Body`。
- 永久 AccessKey/SecretKey 只放在服务端或 CI 密钥中。

## 临时密钥

临时凭证最长有效 2 小时，包含：

- `accessKeyId`
- `secretAccessKey`
- `sessionToken`

响应同时提供 `s3Endpoint` 和 `s3Bucket`。底层存储提供商可能变化，因此每次从响应读取，不能把控制台当前值长期写死。

授权方式：

- 上传：`channel = OSS_UPLOAD`，scope 使用 `bucket:key` 或最小目录前缀。
- 服务端文件管理：`channel = OSS_FULL`，scope 使用存储空间名称。

## Python S3

项目已经使用 Boto3，不要再引入上传 SDK。初始化客户端时保持：

```python
Config(
    s3={"addressing_style": "virtual"},
    signature_version="s3v4",
    request_checksum_calculation="when_required",
    response_checksum_validation="when_required",
)
```

- `upload_file`/`upload_fileobj` 会对小文件直接上传，对大文件自动分片。
- `list_objects` 单次最多返回 1000 个对象，使用 `IsTruncated`、`NextMarker` 和 `Marker` 分页。
- ETag 是不透明标识。官方示例中即使小文件也可能出现 `-1` 后缀，大文件可能出现多分片后缀，不要直接与本地 MD5 比较。

## 文件管理 API

### 文件列表

- 接口：`GET /oss/file/list.json`
- 限额：每用户 30,000 次/天。
- 单次：1–1000 个，默认 1000。
- 分页：把响应的 `continue` 作为下一次请求参数。
- 过滤：使用 `prefix`。
- 字段：`key`、`hash`、`fsize`、`mimeType`、`putTime`、`status`、`time`。

适合获取远端对象清单。文档未给出 `hash` 的本地计算规范，不据此自行猜测算法。

### 文件信息

- 接口：`POST /oss/file/info.json?bucket=<name>`
- 限额：每用户 30,000 次/天。
- 请求体：对象 Key 的 JSON 字符串数组。
- 单次最多查询 20 个文件。
- 字段：`key`、`etag`、`fsize`、`time`、`headers`。

适合少量对象诊断或读取自定义响应头，不适合对数百个部署对象逐个比较。

## CI 增量部署

推荐 manifest 结构：

```json
{ "version": 1, "files": { "index.html": "sha256..." } }
```

指纹必须同时覆盖文件内容和会写入对象的响应头，例如 `ContentType`、`CacheControl`；否则只调整缓存策略时不会触发更新。

部署顺序：

1. 获取旧 manifest；不存在或无效时使用空清单。
2. 计算本地指纹并筛选新增、变化对象。
3. 上传静态资源和数据；失败时停止。
4. 上传 HTML；失败时停止。
5. 最后覆盖 manifest。

远端旧对象默认保留。需要严格镜像时，先根据旧 manifest 计算删除集合，并把删除放在新文件成功上传之后。

## 本项目落点

- 临时凭证：`packages/blog-core/src/utils/dogecloud_storage.py`
- 静态部署：`packages/blog-core/src/scripts/deploy_static.py`
- CI 工作流：`.github/workflows/deploy.yml`
