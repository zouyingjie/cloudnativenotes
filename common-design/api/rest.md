# Web API 设计规范

## REST API 简介

REST 是 Representational State Transfer 的缩写，它将资源作为核心概念，是一套围绕资源、表示和状态转移组织系统接口的架构风格。在实际工作中，我们更多是把它落实到 Web API 的路径、方法、状态码、响应体和兼容性设计上。

企业在进行产品设计开发时，通常会先由业务专家和技术专家一起梳理业务逻辑和业务模型，再根据领域驱动设计（DDD）的方法论抽象领域模型。最终，这些领域模型会映射为数据存储的数据模型和 Web API 的资源模型，而领域行为会映射为 HTTP 方法、子资源或少量必要的 Action。

REST API 几乎已经是互联网服务 Web API 设计的事实标准。根据 Google 的 [API 设计指南](https://cloud.google.com/apis/design?hl=zh-cn)，早在 2010 年，就有大约 74% 的公共网络 API 是 HTTP REST 或类似 REST 的风格，大多数 API 均使用 JSON 作为传输格式。

### RESTful 设计原则

满足 REST 要求的架构需遵循以下 6 个设计原则：

**1. 客户端与服务端分离**

目的是将客户端和服务端的关注点分离。在 Web 应用中，将用户界面所关注的逻辑和服务端数据存储所关注的逻辑分离开来，有助于提高客户端的跨平台的可移植性；也有助于提高服务端的可扩展性。

随着前端技术的发展，前后端分离已经是主流的开发方式，传统的 Spring MVC/Django 的前端模板渲染已经被逐渐弃用了。

**2. 无状态**

服务端不保存客户端的上下文信息，会话信息由客户端保存，服务端根据客户端的请求信息处理请求。

在实际开发中，服务端通常会保存一些状态信息，比如会话信息、认证信息等，这些信息一般是保存在服务端的数据库或者缓存中。

**3. 可缓存**

这一条算是上一条的延伸，无状态服务提升了系统的可靠性、可扩展性，但也会造成不必要的网络开销。为了缓解这个问题，REST 要求客户端或者中间代理（网关）能缓存服务端的响应数据。服务端的响应信息必须明确表示是否可以被缓存以及缓存的时长，以避免客户端请求到过期数据。

管理良好的缓存机制可以有效减少客户端-服务器之间的交互，甚至完全避免客户端-服务器交互，从而提升了系统的性能和可扩展性。

**4. 分层系统**

对于客户端来说，中间代理是透明的。客户端无需知道请求路径中代理、网关、负载均衡等中间件的存在，这样可以提高系统的可扩展性和安全性。

**5. 统一接口**

REST 要求开发者面向资源来设计系统，有下面四个约束：

- **每次请求中都包含资源 ID**

- **所有操作都通过资源表示进行**

- **消息是自描述的**：每条消息包含足够的信息来描述如何处理这条消息。比如 `Content-Type` 标识请求体或响应体的媒体类型，`Accept` 表示客户端期望的响应格式，`Content-Language` 表示语言，`Content-Encoding` 表示压缩方式。

- **用超媒体驱动应用状态（HATEOAS，Hypermedia as the Engine of Application State）**：客户端在访问了最初的 REST API 后，服务端会返回后续操作的链接，客户端使用服务端提供的链接动态的发现可用资源和可执行操作。

**6. 按需编码（可选）**

这是一条可选约束，指的是服务端可以根据客户端需求，将可执行代码发送给客户端，从而实现临时性的功能扩展或定制功能，比如以前的 Java Applet、现在新兴的 WebAssembly。

### REST API 成熟度模型

上述约束读起来还是有些抽象，鉴于在实际开发中，我们更多是聚焦在 API 设计上。为了衡量一个系统是否符合 REST 风格，《RESTful Web APIs》和《RESTful Web Services》的作者 Leonard Richardson 提出了 REST 成熟度模型，根据 API 的设计风格将其分为了 4 级。

#### 第 0 级：完全不符合 REST 风格

比如 RPC 面向过程的 API 设计基本是围绕操作过程来设计的，完全没有资源的概念。

下面是 Martin Fowler 在介绍成熟度模型的 blog [Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html#level0) 中举的病人预约的例子，病人首先需要查询医生可预约的时间表，然后提交预约。

查询预约服务时提交的请求为

```text
POST /appointmentService?action=query HTTP/1.1

{
    "date": "2020-03-04",
    "doctor": "mjones"
}

```
请求成功后响应如下
```text
HTTP/1.1 200 OK
[
    {
        "start": "14:00",
        "end": "14:50",
        "doctor": "mjones"
    },
    {
        "start": "16:00",
        "end": "16:50",
        "doctor": "mjones"
    }
]
```

然后病人选择时段提交预约

```text
POST /appointmentService?action=confirm HTTP/1.1

{
    "slot": {
        "start": "14:00",
        "end": "14:50",
        "doctor": "mjones"
    },
    "patient": {
        "id": "jsmith"
    }
}
```
预定成功时响应如下

```text
HTTP/1.1 200 OK

{
    "slot": {
        "start": "14:00",
        "end": "14:50",
        "doctor": "mjones"
    },
    "patient": {
        "id": "jsmith"
    }
}
```

预定失败时响应如下

```text
HTTP/1.1 200 OK

{
    "slot": {
        "start": "14:00",
        "end": "14:50",
        "doctor": "mjones"
    },
    "patient": {
        "id": "jsmith"
    },
    "reason": "Slot not available"
}
```
可以看到整个请求过程没有涉及到资源的概念，并且请求也比较简洁明了。但如果操作越来越多，接口也越来越多，随之而来的维护、沟通成本也会越来越高。


#### 第 1 级：引入资源概念

引入资源后，对服务端的访问都是围绕资源，通过资源 ID 进行。此时的查询和预约请求如下：

查询预约：以医生为资源，通过 ID查询

```text
POST /doctors/mjones HTTP/1.1

{date: "2020-03-04"}

// 请求响应

[
  {"slot_id": 1234, doctor: "mjones", start: "14:00", end: "14:50"},
  {"slot_id": 5678, doctor: "mjones", start: "16:00", end: "16:50"}
]
```
提交预约时，以时间表 slot 为资源，通过 ID 预约

```text
POST /slots/1234 HTTP/1.1

{ "patient_id": "jsmith" }
```

#### 第 2 级：操作映射到 HTTP 方法

上面的例子中所有请求都是用的 POST 方法，Level2 要求将操作映射到 HTTP 方法。对于资源的操作无非就是增删改查，HTTP 对应的 POST、DELETE、PUT/PATCH、GET 可以很好的表达这些操作。

- 查询档期，使用 GET 方法

```text
GET /doctors/mjones/schedule?date=2020-03-04&status=open HTTP/1.1

[
  {"slot_id": 1234, doctor: "mjones", start: "14:00", end: "14:50"},
  {"slot_id": 5678, doctor: "mjones", start: "16:00", end: "16:50"}
]
```

- 创建预约，使用 POST 方法

```text
POST /schedules/1234 HTTP/1.1

{ "patient_id": "jsmith" }
```

```text
// 预定成功响应
HTTP/1.1 201 Created
Location: slots/1234/appointment

{
    "slot": {
        "id": 1234,
        "doctor": "mjones",
        "start": "14:00",
        "end": "14:50"
    },
    "patient": {
        "id": "jsmith"
    }
}
```

预定失败时，需要返回能表达错误原因的响应码，而不是像之前一样返回 200。

```text
HTTP/1.1 409 Conflict

[
  {"slot_id": 5678, doctor: "mjones", start: "16:00", end: "16:50"}
]
```

第 2 级是目前绝大多数系统所达到的级别。

#### 第 3 级：状态转移完全由后端驱动

在实际开发中，通常是客户端和服务端约定好 API 后进行各自的开发实现。客户端在代码中已经编写了 API 相关的调用，只等服务端开发完成进行联调测试即可。但 REST 认为这是多余的，客户端应该根据服务端返回的链接进行后续操作，返回的资源信息以及操作链接信息能够描述自身以及后续可能发生的状态转移，从而实现超文本驱动应用状态。

依然是查询预约的 API，此时后端返回的预约列表，除了基本信息外还带有预约所需 link，由此客户端知晓后续的预约操作，并请求服务端返回的 link 进行操作。
```text
GET /doctors/mjones/slots?date=20100104&status=open HTTP/1.1

[
  {"slot_id": 1234, doctor: "mjones", start: "14:00", end: "14:50", links: [{"rel": "book", "href": "/slots/1234"}]},
  {"slot_id": 5678, doctor: "mjones", start: "16:00", end: "16:50", links: [{"rel": "book", "href": "/slots/5678"}]}
]
```
可以看到返回的数据中包含了支持的预约操作以及操作所对应的链接。笔者在实际工作中很少遇到满足 Level 3 的系统，通常都是 Level 2 的系统。

### REST VS RPC

API 的设计通常有 RPC 和 REST 两种形式。虽然两者并不是一回事，但因为都是面向服务端和客户端的通信制定规范，所以经常被混为一谈。

REST 本身是一套面向资源的架构设计思想，而 RPC 的初衷是希望能在分布式系统之间，像调用本地方法一样调用远程方法。RPC 协议围绕通信过程、数据编码、传输协议以及方法表达提供不同的解决方案。

具体到 API 设计上，其主要区别在于：**REST 是面向资源的，而 RPC 是面向过程的**。以一个用户的增删改查为例，REST 的 API 设计如下

```
# 创建用户
POST /users
# 查询用户列表
GET /users
# 查询用户详情
GET /users/{id}
# 更新用户信息
PUT /users/{id}
# 删除用户
DELETE /users/{id}
```

而 RPC 的 API 设计如下：

```
# 创建用户
POST /createUser
# 查询用户列表
GET /getUserList
# 查询用户详情
GET /getUserById
# 更新用户信息
PUT /updateUser
# 删除用户
DELETE /deleteUser
```

REST 和 RPC 并不是谁一定更高级。面向外部开放、围绕资源进行增删改查、需要长期兼容的 API，更适合使用 REST 风格；命令式很强、内部服务调用、对强类型接口和代码生成要求更高的场景，RPC 往往更直接。真正重要的是保持接口风格一致，不要在同一组 API 中一半像资源，一半像函数。

## URI 的设计规范

了解了 REST API 的基本概念，下面看一些可以在实践中落地的 URI 设计规范。

根据 [RFC 3986 - Uniform Resource Identifier (URI): Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986.html) 中的定义，一个 URI 的结构如下所示：

```
       foo://example.com:8042/over/there?name=ferret#nose
       \_/   \______________/\_________/ \_________/\__/
        |        |              |          |          |
scheme（协议）domain（域名） path（路径） query（查询参数）fragment（片段）
```

这里主要讨论 path 和 query。对于面向业务系统的 Web API，可以使用如下路径结构：

```
/{version}/{namespace}/{resources}
/{version}/{namespace}/{resources}/{id}
/{version}/{namespace}/{resources}/{id}/{sub-resources}
/{version}/{namespace}/{resources}/{id}/{action}
```

### URI 主体字段含义

首先来看 URL 中各个字段的含义与设计规范。

- `{domain}`：域名。可以使用统一域名，也可以针对不同业务线使用不同域名。
- `{version}`：API 主版本。形式通常是 `v1`、`v2`。
- `{namespace}`：命名空间或业务域，比如 `iam`、`payment`、`shipping`。小型系统可以省略。
- `{resources}`：具体资源，使用名词和复数形式，比如 `orders`、`users`、`payments`。
- `{id}`：某个资源的唯一标识。
- `{sub-resources}`：子资源，和父资源存在明显归属关系，比如 `/carts/{cartId}/items`。
- `{action}`：针对资源或子资源的行为操作，用动词或动词短语表示，用来弥补 HTTP 方法表达上的不足。

### URI 路径规范

- 使用名词表示资源，尽量使用复数形式，比如 `/users`、`/orders`、`/invoices`。
- 使用层次结构表示资源关系，比如 `/users/{userId}/orders/{orderId}`。
- 路径统一小写，多个单词使用短横线 `-` 分隔，比如 `/user-profiles`。
- 避免动词路径，比如 `/getUser`、`/createOrder`，常规动作由 HTTP 方法表达。
- 资源标识尽量使用稳定 ID，不要暴露容易变化的业务字段。
- 路径不要嵌套过深，超过 3 层后通常需要重新审视资源边界。
- Query 用来表达过滤、排序、分页和字段选择，不要把资源身份藏在 query 里。
- 如果必须表示特定动作，可以使用 action，比如 `POST /orders/{id}/cancel`。

路径中的 Action 要克制使用。取消订单、发送邮件、重试任务、归档项目这类操作很难用 CRUD 表达，可以使用 action；如果只是创建、查询、更新、删除资源，就不要额外设计 `/create`、`/update`、`/delete`。

## HTTP 方法使用规范

对资源的增删改查应该使用标准 HTTP 方法。下面是常见资源操作与 HTTP 方法的映射关系。

| 资源操作 | HTTP 方法 | 描述 | 是否幂等 | 是否带请求体 | 常见响应 |
| --- | --- | --- | --- | --- | --- |
| List | GET | 查询资源集合 | 是 | 否 | `200 OK`，无数据返回空数组 |
| Get | GET | 查询单个资源 | 是 | 否 | `200 OK`，不存在返回 `404 Not Found` |
| Create | POST | 在集合下创建资源 | 否 | 是 | `201 Created`，响应 `Location` |
| Replace | PUT | 全量替换某个资源 | 是 | 是 | `200 OK` 或 `204 No Content` |
| Update | PATCH | 局部更新某个资源 | 取决于语义 | 是 | `200 OK` 或 `204 No Content` |
| Delete | DELETE | 删除某个资源 | 是 | 通常不带 | `204 No Content` |
| Head | HEAD | 获取资源元信息 | 是 | 否 | 只返回响应头 |
| Options | OPTIONS | 获取可用方法或跨域预检 | 是 | 否 | `204 No Content` 或允许的方法信息 |

以下是基本的 API 示例

```text
# 创建用户
POST /users

# 查询用户列表
GET /users

# 查询用户详情
GET /users/1

# 全量更新用户信息
PUT /users/1

# 局部更新用户信息
PATCH /users/1

# 删除用户
DELETE /users/1
```

如果有特殊动作，可以在路径中使用 action 标识。action 必须是动词或动词短语。

```text
# 实名认证
POST /users/1/verify-real-name

# 取消订单
POST /orders/123456/cancel

# 激活优惠券
POST /coupons/123456/activate
```

这些动作通常使用 `POST`，因为它们表达的是业务命令，不一定能被简单视为资源替换。若动作本身天然幂等，需要在服务端保证重复调用不会产生额外副作用。

## 分页、过滤、排序

分页参数常用两类：`offset/limit` 或 `cursor（基于游标）`。

- `offset/limit` 简单直观：`GET /items?limit=20&offset=40`。
- `cursor` 更适合大数据集或实时数据：`GET /items?limit=50&cursor=abc123`。

尽量设置默认分页大小。如果客户端未指定，服务端应有合理默认值，比如 20 或 50，并设置最大限制，比如 100 或 200，避免一次请求拖垮服务。

过滤、排序和字段选择可以采用如下约定：

- 过滤使用明确字段：`GET /users?status=active&role=admin`。
- 排序使用 `sort` 参数：`GET /items?sort=-created-time,name`。
- 字段选择使用 `fields` 参数：`GET /users/1?fields=id,name,email`。
- 复杂搜索可以使用搜索资源：`POST /users/search`。

分页响应中建议包含 `items` 和 `page` 信息：

```json
{
  "items": [
    { "id": "1001", "name": "Alice" }
  ],
  "page": {
    "limit": 20,
    "nextCursor": "eyJpZCI6MTAwMX0"
  }
}
```

内部系统如果已经统一使用 envelope，也可以把分页信息放在 `data` 和 `meta` 中，但字段命名需要在整个系统内保持一致。

## 状态码

必须正确使用 HTTP 状态码。HTTP 协议定义的状态码分类如下：

| 状态码 | 分类 | 说明 |
| --- | --- | --- |
| 1xx | 信息性状态码 | 表示临时响应，需要客户端进一步操作 |
| 2xx | 成功状态码 | 表示请求成功 |
| 3xx | 重定向状态码 | 表示需要客户端进一步操作 |
| 4xx | 客户端错误状态码 | 表示客户端请求错误，比如 400 错误请求、401 未认证、403 禁止访问、404 未找到资源、405 方法不允许、429 请求过多 |
| 5xx | 服务器错误状态码 | 表示服务器处理请求错误，比如 500 服务器错误，502 网关错误，503 服务不可用，504 网关超时 |

在 API 设计开发时，至少需要区分 2xx、4xx、5xx 三种状态码。常用状态码如下：

| 状态码 | 使用场景 |
| --- | --- |
| `200 OK` | 请求成功并返回响应体 |
| `201 Created` | 创建资源成功，通常带 `Location` 响应头 |
| `202 Accepted` | 请求已接受，但异步任务尚未完成 |
| `204 No Content` | 请求成功但不返回响应体，常用于删除或更新 |
| `400 Bad Request` | 请求格式错误、参数类型错误 |
| `401 Unauthorized` | 未认证或认证失效 |
| `403 Forbidden` | 已认证但没有权限 |
| `404 Not Found` | 资源不存在 |
| `409 Conflict` | 当前资源状态冲突，比如重复提交、版本冲突 |
| `410 Gone` | 资源曾经存在但已不可用 |
| `412 Precondition Failed` | 前置条件失败，比如 `If-Match` 校验失败 |
| `422 Unprocessable Entity` | 请求格式正确，但业务校验失败 |
| `429 Too Many Requests` | 触发限流 |
| `500 Internal Server Error` | 服务端未预期错误 |
| `503 Service Unavailable` | 服务暂不可用，通常可重试 |

不要所有错误都返回 `200 OK`，再用 body 中的 `code` 区分成功失败。这会让网关、缓存、监控、SDK、重试策略都失去 HTTP 协议本身提供的语义。

## 响应体规范

默认响应格式建议使用 JSON，并通过 `Content-Type: application/json` 明确声明。对于其他格式，可以通过 `Accept` 请求头做内容协商，但只有确实存在多格式需求时才需要实现。

响应体有两种常见风格。

第一种是直接返回资源，常见于开放 API：

```json
{
  "id": "1001",
  "name": "Alice",
  "email": "alice@example.com"
}
```

第二种是统一 envelope，常见于内部业务系统：

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "id": "1001",
    "name": "Alice"
  },
  "requestId": "req-abc-123"
}
```

如果使用 envelope，要避免让业务码替代 HTTP 状态码。HTTP 状态码表达协议层和请求处理结果，业务码表达更细的业务原因。

错误响应建议保持统一结构：

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "用户不存在",
    "details": [
      {
        "field": "userId",
        "message": "没有找到对应用户"
      }
    ],
    "requestId": "req-abc-123"
  }
}
```

以上结构包含：

- `code`：机器可读的错误码。
- `message`：人类可读的错误描述。
- `details`：可选的错误详情列表，常用于表单校验。
- `requestId`：请求 ID，便于排查日志和链路追踪。

生产环境不要在错误响应中泄露堆栈、SQL、内部服务地址、密钥、手机号、身份证号等敏感信息。

## 幂等与重试

Web API 一定会遇到超时、网络闪断、客户端重试、网关重放等问题。幂等设计的目标是：同一个请求被执行多次，结果仍然符合预期，不产生额外副作用。

常见原则如下：

- `GET`、`PUT`、`DELETE` 应该设计为幂等。
- `POST` 默认不幂等，创建订单、发起支付、发送消息等接口必须额外设计幂等机制。
- 对关键写接口支持 `Idempotency-Key` 请求头，由客户端生成唯一键，服务端保存请求结果。
- 服务端需要定义幂等键的作用域和过期时间，比如同一用户、同一接口、24 小时内有效。
- 重试必须区分可重试和不可重试错误，不要对所有 4xx 自动重试。

例如：

```text
POST /orders
Idempotency-Key: 7f3f3f5b-9f6d-4e5a-b37a-0d2f1c6d3a11
```

如果第一次请求创建成功但客户端没有收到响应，客户端带同一个 `Idempotency-Key` 重试时，服务端应该返回同一个创建结果，而不是创建第二个订单。

## 并发控制

多个客户端同时修改同一个资源时，需要考虑并发冲突。常见做法是使用乐观锁：

```text
GET /users/1001

HTTP/1.1 200 OK
ETag: "v3"
```

客户端更新时带上版本：

```text
PATCH /users/1001
If-Match: "v3"
```

如果资源已经被其他请求修改，服务端返回：

```text
HTTP/1.1 412 Precondition Failed
```

对于订单、库存、审批流等有明确状态机的资源，也可以通过资源版本号或状态条件做业务层校验，并在冲突时返回 `409 Conflict`。

## 请求头规范

建议在系统内统一以下常用请求头：

| Header | 用途 |
| --- | --- |
| `Authorization` | 身份认证，比如 Bearer Token |
| `Content-Type` | 请求体格式，比如 `application/json` |
| `Accept` | 客户端期望响应格式 |
| `Idempotency-Key` | 幂等键，用于关键写接口 |
| `X-Request-Id` | 请求 ID，便于日志追踪 |
| `If-Match` | 乐观锁更新 |
| `Prefer` | 客户端偏好，比如异步处理、返回最小响应 |

请求头命名要稳定，不要在不同团队之间同时出现 `X-Request-Id`、`Request-Id`、`Trace-Id` 三套语义相近但不兼容的字段。

## 兼容规范

在大型系统中，保持 API 的前向兼容和后向兼容非常关键。

兼容变更通常包括：

- 新增可选字段。
- 新增可选 query 参数。
- 新增枚举值，但客户端必须能忽略未知枚举。
- 新增响应头。
- 新增资源或新接口。

不兼容变更通常包括：

- 删除字段。
- 修改字段类型。
- 修改字段含义。
- 修改必填规则。
- 修改默认排序或分页语义。
- 修改错误码含义。
- 将原本同步成功的接口改为异步接受。

比如将 `status` 字段类型从 `int` 改为 `string` 是不兼容变更，更稳妥的做法是新增 `statusText` 字段，并保留旧字段一段时间。

当兼容成本过高时，需要升级 API 版本。常见版本策略有三种：

- 路径版本：`/v1/orders`，最直观，也最常见。
- Header 版本：`Accept: application/vnd.example.v2+json`，更灵活但调试成本更高。
- 参数版本：`/orders?version=2`，不太推荐，容易污染业务参数。

版本升级不是改个路径就结束，还需要提供迁移窗口、变更说明、灰度策略、监控指标和下线计划。

## 设计检查清单

最后给一份 API 设计检查清单：

- 资源名是否是名词、复数、小写、短横线分隔。
- 常规 CRUD 是否使用了正确 HTTP 方法。
- 特殊 Action 是否有明确业务含义，是否真的不能建模为资源。
- 列表接口是否有分页上限。
- 错误是否使用了合适 HTTP 状态码。
- 错误响应是否包含稳定错误码和 `requestId`。
- 写接口是否考虑幂等和重试。
- 更新接口是否考虑并发冲突。
- 字段新增、删除、枚举扩展是否满足兼容策略。
- API 是否有认证、授权、限流和审计要求。

好的 API 设计不是追求“最 RESTful”，而是让资源边界、协议语义和业务行为清晰稳定。外部调用者不关心服务端用了什么框架，他们关心的是接口是否一致、可预测、可排错、可演进。
