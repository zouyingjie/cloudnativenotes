# API 路径设计哪家强

本文主要比较一些主流产品和云厂商的 Web API 路径设计。看这些案例的目的不是照搬某一家规范，而是理解不同业务形态下资源、版本、命名空间、Action、HTTP 方法是如何组合的，从而帮助我们设计出更稳定、更容易维护的 API。

需要注意，很多大型平台的 API 都经历过多年演进，历史包袱、兼容性、SDK 生成、网关能力、认证机制都会影响最终形态。因此真实世界里的 API 往往不是“纯 REST”，而是在 REST、RPC 和产品兼容性之间做取舍。

## Google

- API 文档地址：[https://developers.google.com/apis-explorer/#p/](https://developers.google.com/apis-explorer/#p/)

### YouTube Data API

- API 文档地址：[YouTube Data API](https://developers.google.com/apis-explorer/#p/youtube/v3/)
- API 前缀：`https://www.googleapis.com/youtube/v3`

**播放列表 API**

- 创建播放列表：`POST /playlists`
- 查询播放列表集合：`GET /playlists`
- 更新播放列表：`PUT /playlists`
- 删除播放列表：`DELETE /playlists`

**视频 API**

- 上传视频：`POST /videos`
- 查询列表：`GET /videos`
- 更新视频信息：`PUT /videos`
- 删除视频：`DELETE /videos`
- 为视频评分：`POST /videos/rate`
- 获取视频评分：`GET /videos/getRating`

### Calendar API

- API 文档地址：[Calendar API](https://developers.google.com/apis-explorer/#p/calendar/v3/)
- API 前缀：`https://www.googleapis.com/calendar/v3`

**日历 API**

- 创建辅助日历：`POST /calendars`
- 查询日历：`GET /calendars/{calendarId}`
- 更新/补丁日历：`PUT/PATCH /calendars/{calendarId}`
- 删除日历：`DELETE /calendars/{calendarId}`
- 清除主日历：`POST /calendars/calendarId/clear`

**事件 API**

- 创建事件：`POST /calendars/{calendarId}/events`
- 查询日历中的事件：`GET /calendars/{calendarId}/events`
- 查询单个事件：`GET /calendars/{calendarId}/events/{eventId}`
- 更新事件：`PUT /calendars/{calendarId}/events/{eventId}`
- 删除事件：`DELETE /calendars/{calendarId}/events/{eventId}`
- 移动事件：`POST /calendars/{calendarId}/events/{eventId}/move`

### Gmail API



- API 文档地址：[Gmail API](https://developers.google.com/apis-explorer/#p/gmail/v1/)
- API 前缀：`https://gmail.googleapis.com`

**标签 API**

- 创建标签：`POST /gmail/v1/users/{userId}/labels`
- 查询标签列表：`GET /gmail/v1/users/{userId}/labels`
- 获取指定标签：`GET /gmail/v1/users/{userId}/labels/{id}`
- 更新标签：`PUT /gmail/v1/users/{userId}/labels/{id}`
- 删除标签：`DELETE /gmail/v1/users/{userId}/labels/{id}`


**消息 API**

- 发送消息：`POST /gmail/v1/users/{userId}/messages/send`
- 查询消息列表：`GET /gmail/v1/users/{userId}/messages`
- 获取指定消息：`GET /gmail/v1/users/{userId}/messages/{id}`
- 删除消息：`DELETE /gmail/v1/users/{userId}/messages/{id}`
- 修改邮件标签：`POST /gmail/v1/users/{userId}/messages/{id}/modify`
- 批量修改邮件标签：`POST /gmail/v1/users/{userId}/messages/batchModify`
- 批量删除邮件：`POST /gmail/v1/users/{userId}/messages/batchDelete`

批量修改和批量删除使用 `POST` 方法。这里可以看到，当操作不再是单个资源的标准 CRUD 时，即使是 Google API 也会引入自定义 Action。


### 观察结果

1. 结构基本为：`/{product}/{version}/{namespace}/{resource}/{resourceId}/{action}`。
    - `product`：产品线，区分不同产品，比如 gmail、calendar、adsense。
    - `version`：版本，区分不同版本，比如 v1、v2。
    - `namespace`：命名空间，可选，用来组织 API 或做访问控制。
    - `resource`：资源，比如 gmail 下的 messages、labels，使用名词。
    - `resourceId`：资源 ID，可选，比如 Gmail 下的 messageId。
    - `action`：动作，对资源进行的操作，使用动词。

2. 多数 API 使用 `www.googleapis.com`，也有产品独立域名，比如 Gmail API 使用 `https://gmail.googleapis.com`。
3. 使用名词表示资源，命名使用复数。
4. 使用动词或者动词短语表示操作（action）。
5. 对于多个单词的标识符使用驼峰命名。
6. 不同产品对资源 ID 的传参位置并不完全一致。设计自己的 API 时，不要只看单个接口，要看整组 API 是否一致。



## PayPal

- API 文档地址：[PayPal API](https://developer.paypal.com/docs/api/)
- API 前缀：`https://api.paypal.com`

**API 示例**


- 查询授权：`GET /v2/payments/authorizations/{authorization_id}`
- 创建订单：`POST /v2/checkout/orders`
- 更新订单：`PATCH /v2/checkout/orders/{order_id}`
- 查询订单：`GET /v2/checkout/orders/{order_id}`

- 创建发票：`POST /v2/invoicing/invoices`
- 发送发票：`POST /v2/invoicing/invoices/{invoice_id}/send`
- 查询发票列表：`GET /v2/invoicing/invoices`
- 查询发票：`GET /v2/invoicing/invoices/{invoice_id}`
- 删除发票：`DELETE /v2/invoicing/invoices/{invoice_id}`
- 删除外部支付：`DELETE /v2/invoicing/invoices/{invoice_id}/payments/{transaction_id}`
- 生成二维码：`POST /v2/invoicing/invoices/{invoice_id}/generate-qr-code`


### 观察结果

- 域名：生产 `https://api.paypal.com`；沙盒 `https://api-m.sandbox.paypal.com`
- 结构：`/{version}/{namespace}/{resource}/{resourceId}/{action}`
- PayPal API 的结构相对比较干净统一
- 资源命名使用复数
- 使用动词或者动词短语表示操作（action）
- 使用中划线 `-` 作为分隔符


## AWS

- API 文档地址：[AWS API](https://docs.aws.amazon.com/)

关于域名，AWS 使用了一种完全不一样的方案。不同产品线和不同地区（region）会有不一样的域名。

**S3 域名**

参考文档：[S3 域名](https://docs.aws.amazon.com/general/latest/gr/s3.html)

- 美国东部 (弗吉尼亚北部)：`s3.us-east-1.amazonaws.com`
- 亚太区域 (香港)：`s3.ap-east-1.amazonaws.com`
- 亚太区域 (东京)：`s3.ap-northeast-1.amazonaws.com`

**EC2 域名**

参考文档：[EC2 域名](https://docs.aws.amazon.com/general/latest/gr/ec2-service.html)

- 美国东部 (弗吉尼亚北部)：`ec2.us-east-1.amazonaws.com`
- 亚太区域 (香港)：`ec2.ap-east-1.amazonaws.com`

基本上来说，格式是：`product-name.region-name.amazonaws.com/?Action=Function`

**API 示例**

- 查询实例：`https://ec2.us-east-1.amazonaws.com/?Action=DescribeInstances`
- 启动实例：`https://ec2.amazonaws.com/?Action=StartInstances`
- 创建 VPC：`https://ec2.us-east-1.amazonaws.com/?Action=CreateVpc`
- 创建 Volume：`https://ec2.us-east-1.amazonaws.com/?Action=CreateVolume`

### 观察结果

1. AWS 很多服务采用 Query API 风格，通过 `Action` 表达操作。
2. 这种风格更接近 RPC，适合操作很多、资源模型难以统一的云产品。
3. 域名承担了产品和地域路由的一部分职责，路径本身不是主要建模手段。

## GitHub

- API 文档地址：[GitHub REST API](https://docs.github.com/rest)
- API 域名：`https://api.github.com`

**API 示例**


- 取所有 repo：`GET /orgs/{org}/repos`
- 取特定用户名的 repo：`GET /repos/{owner}/{repo}`
- 取某个仓库所有的 PR：`GET /repos/{owner}/{repo}/pulls`
- 创建 PR：`POST /repos/{owner}/{repo}/pulls`
- 查询 PR：`GET /repos/{owner}/{repo}/pulls/{pull_number}`
- 更新 PR：`PATCH /repos/{owner}/{repo}/pulls/{pull_number}`
- Merge PR：`PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge`
- 取自己的 issue：`GET /user/issues`
- 取某个 repo 下的 issue：`GET /repos/{owner}/{repo}/issues`
- 取用户：`GET /users/{username}`
- 取组织下的所有项目：`GET /orgs/{org}/projects`

### 观察结果


1. 结构：`/{resource}/{id}/{sub-resource}`。
2. GitHub API 没有把主版本号放在路径中，直接从 resource 开始。
3. 仓库、组织、用户等资源关系通过路径层次表达，整体可读性较好。


## Dropbox


- API 文档地址：[Dropbox API](https://www.dropbox.com/developers/documentation/http/overview)
- API 域名：`https://api.dropboxapi.com`

**API 示例**

- `POST /2/file_properties/templates/add_for_user`
- `POST /2/file_properties/templates/get_for_user`
- `POST /2/file_properties/templates/remove_for_user`
- `POST /2/file_properties/templates/update_for_user`

- `POST /2/file_requests/create`
- `POST /2/files/create_folder_v2`
- `POST /2/users/get_account_batch`
- `POST /2/paper/docs/list`


### 观察结果

1. 结构：`/{version}/{resource}/{actions}`。

2. Dropbox 的 API 是在 resource 上建各种函数。除了总版本，函数上还可以有版本，比如 `/2/files/create_folder_v2`。

3. 大量接口统一使用 `POST`，更接近 RPC 风格。

4. 对于多个单词的 action，使用下划线 `_` 作为分隔符。关于下划线，在最初的 RFC 1738 中规定不合法，但是 RFC 1738 后来被 RFC 2396 更新，RFC 2396 允许使用下划线作为 unreserved character。RFC 3986 继续将下划线归类为非保留字符，可以在以下组件中直接使用：

- path
- query
- fragment

以下是 [RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986#section-2.3) 中的相关描述：

> Characters that are allowed in a URI but do not have a reserved
   purpose are called unreserved.  These include uppercase and lowercase
   letters, decimal digits, hyphen, period, underscore, and tilde.
>
> unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"

## Twitter / X

- API 文档地址：[X API](https://docs.x.com/x-api/introduction)
- API 域名：`api.twitter.com`、`ads-api.twitter.com`

**API 示例**

- 获取粉丝列表：`GET /2/users/:id/followers`
- 获取正在关注列表：`GET /2/users/:id/following`
- 关注用户：`POST /2/users/:id/following`
- 取消关注：`DELETE /2/users/:source_user_id/following/:target_user_id`

- 获取用户列表：`GET /2/users/:id/list_memberships`

- 更新列表：`PUT /2/lists/:id`
- 创建列表：`POST /2/lists`
- 删除列表：`DELETE /2/lists/:id`

### 观察结果

1. 结构：`/{version}/{resource}/{action}`。
2. Twitter 的 API 结构也很标准，版本号放在最前面。
3. resource 命名使用复数。
4. 部分多单词参数或路径使用下划线 `_` 作为分隔符。

## Stripe

- API 文档地址：[Stripe API](https://stripe.com/docs/api)
- API 域名：`https://api.stripe.com`

**API 示例**


- 获取余额：`GET /v1/balance`
- 获取余额交易列表：`GET /v1/balance_transactions`
- 获取余额交易：`GET /v1/balance_transactions/:id`

- 创建客户：`POST /v1/customers`
- 获取客户列表：`GET /v1/customers`
- 更新客户：`POST /v1/customers/:id`
- 获取客户详情：`GET /v1/customers/:id`
- 删除客户：`DELETE /v1/customers/:id`
- 搜索客户：`GET /v1/customers/search`

- 创建支付方式：`POST /v1/payment_methods`
- 获取支付方式详情：`GET /v1/payment_methods/:id`
- 获取客户支付方式：`GET /v1/customers/:id/payment_methods/:id`
- 创建支付意图：`POST /v1/payment_intents`
- 获取支付意图详情：`GET /v1/payment_intents/:id`


### 观察结果

- 结构：`/{version}/{resource}/{id}/{action}`。
- 其更新操作使用 `POST`，而不是 `PUT` 或 `PATCH`。
- 对于子资源的区分，使用下划线 `_` 作为分隔符。
- 所有 POST 请求，通过 `Idempotency-Key` 请求头来实现幂等。

```shell
curl https://api.stripe.com/v1/customers \
  -u sk_test_xxx: \
  -H "Idempotency-Key: KG5LxwFBepaKHyUD" \
```

## Trello

- API 文档地址：[Trello API](https://developer.atlassian.com/cloud/trello/rest/)
- API 域名：`https://api.trello.com`

**API 示例**

- 获取 Action 详情：`GET /1/actions/{id}`
- 获取 Action 卡片：`GET /1/actions/{id}/card`
- 获取 Action 看板：`GET /1/actions/{id}/board`
- 更新 Action 文本：`PUT /1/actions/{id}/text`

- 创建 Action 的回应：`POST /1/actions/{idAction}/reactions`
- 获取 Action 的回应：`GET /1/actions/{idAction}/reactions/{id}`
- 删除 Action 的回应：`DELETE /1/actions/{idAction}/reactions/{id}`


- 创建卡片：`POST /1/cards`
- 获取卡片详情：`GET /1/cards/{id}`
- 更新卡片：`PUT /1/cards/{id}`
- 删除卡片：`DELETE /1/cards/{id}`
- 获取卡片特定属性：`GET /1/cards/{id}/{field}`

- 获取卡片附件：`GET /1/cards/{id}/attachments`
- 创建卡片附件：`POST /1/cards/{id}/attachments`
- 获取卡片附件：`GET /1/cards/{id}/attachments/{idAttachment}`
- 删除卡片附件：`DELETE /1/cards/{id}/attachments/{idAttachment}`


### 观察结果

1. 结构：`/{version}/{resource}/{id}/{sub-resource}/{subId}`。
2. 资源层次表达比较清晰，适合作为常规业务系统的参考。

## Tencent

### 微信公众号

- API 文档地址：[微信公众号 API](https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html)
- 域名：
  - 主域名：`api.weixin.qq.com`
  - 灾备域名：`api2.weixin.qq.com`
- 区域域名：`sh.api.weixin.qq.com`, `sz.api.weixin.qq.com`, `hk.api.weixin.qq.com`


**API 示例**

- 获取用户列表：`GET /cgi-bin/user/get`
- 获取用户信息：`GET /cgi-bin/user/info`
- 设置用户备注：`POST /cgi-bin/user/info/updateremark`

- 查询卡劵：`POST /cgi-bin/card/code/get`
- 核销卡劵：`POST /cgi-bin/card/code/consume`

- 新增永久素材：`POST /cgi-bin/material/add_material`
- 获取永久素材：`POST /cgi-bin/material/get_material`
- 删除永久素材：`POST /cgi-bin/material/del_material`
- 获取素材总数：`GET /cgi-bin/material/get_materialcount`
- 获取素材列表：`POST /cgi-bin/material/batchget_material`


### 微信支付


- API 文档地址：[微信支付 API](https://pay.weixin.qq.com/docs/merchant/products/jsapi-payment/introduction.html)
- 域名：`api.mch.weixin.qq.com`，备域名：`api2.mch.weixin.qq.com`

**API 示例**

- app 下单：`POST /v3/pay/transactions/app`
- h5 下单：`POST /v3/pay/transactions/h5`
- 小程序下单：`POST /v3/pay/transactions/jsapi`

- 查询订单：`GET /v3/pay/transactions/out-trade-no/{out_trade_no}`
- 关闭订单：`POST /v3/pay/transactions/out-trade-no/{out_trade_no}/close`
- 申请退款：`POST /v3/refund/domestic/refunds`

- 创建支付分订单：`POST /v3/payscore/serviceorder`
- 查询支付分订单：`GET /v3/payscore/serviceorder/`
- 取消支付分订单：`POST /v3/payscore/serviceorder/{out_order_no}/cancel`

- 核销用户券：`POST /v3/marketing/busifavor/coupons/use`


### 腾讯开放平台

- API 文档地址：[腾讯开放平台 API](https://open.tencent.com/)
- 域名：`graph.qq.com`


**API 示例**

- 获取 QQ 用户信息：`GET /user/get_user_info`

### 腾讯云

- API 文档地址：[腾讯云 API](https://cloud.tencent.com/document/api)
- 域名：`cvm.tencentcloudapi.com`

**API 示例**

腾讯云的 API 文档没有 API 路径，所有操作都是通过请求 body 或者 params 里的 `Action` 来区分。

- 启动实例：`GET https://cvm.tencentcloudapi.com/?Action=StartInstances`
- 关闭实例：`GET https://cvm.tencentcloudapi.com/?Action=StopInstances`

### 观察结果

1. 有多个域名，用于不同的产品线。
2. 微信、QQ 的 API 风格基本都是 `/resource/action`。
3. 腾讯云的 API 没有 URL，全部是直接请求域名即可。通过请求 body 或者 params 里的 `Action` 来区分。


## 总结

- 大多数面向资源的 API 都会采用 `/{version}/{namespace}/{resource}/{id}/{sub-resource}` 这类结构。
- resource 命名通常使用名词和复数形式，Action 使用动词或动词短语。
- 标准 CRUD 尽量使用 HTTP 方法表达；批量操作、状态流转、发送、取消、重试等命令式行为，通常会引入 Action。
- 多单词分隔常见做法有短横线 `-`、下划线 `_` 和驼峰。新系统建议优先选择短横线，并在全局保持一致。
- AWS、腾讯云、Dropbox 等 API 更接近 RPC 风格，这并不代表设计错误，而是由云产品操作复杂、历史兼容、SDK 生成等因素共同决定。
- 对业务系统来说，最实用的默认选择是：资源路径保持 RESTful，少量业务命令使用 Action，关键写接口用幂等键兜底。

看完这些案例，最重要的结论反而是不要迷信“标准答案”。API 设计的好坏不取决于它像不像某家大厂，而取决于它是否在自己的业务域里保持一致、清晰、可兼容、可治理。
