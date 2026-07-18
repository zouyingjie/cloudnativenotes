# 链路追踪

## 为什么需要链路追踪

在单体应用中，一次请求通常只需要经过一个进程。遇到问题时，通过日志和监控指标基本可以定位原因。

但在微服务架构中，一个请求可能需要经过网关、订单服务、库存服务、支付服务、缓存和数据库等多个组件。如果请求出现异常或者响应缓慢，只看单个服务的日志很难还原请求的完整执行过程，也很难判断问题发生在哪个环节。

链路追踪（Distributed Tracing）就是为了解决这个问题。它记录一次请求经过的服务、调用顺序和执行耗时，最终还原出完整的调用链路。基于这些数据，可以：

- 定位慢请求，分析时间消耗在哪个服务。
- 定位错误，查看异常是由哪个下游调用引起的。
- 分析服务之间的依赖关系，生成调用拓扑。
- 聚合请求量、错误率、响应时间等指标。

链路追踪看起来只是记录调用关系，但工程上的难点在于：采集不能明显拖慢业务，埋点不能依赖每个团队大量手工改造，还要覆盖足够多的服务。现代链路追踪系统在这些取舍上，基本都受到了 Google [Dapper 论文](https://research.google.com/archive/papers/dapper-2010-1.pdf)的影响。Dapper 的设计目标主要有三点：

- **低开销**：不能因为增加链路追踪而明显影响业务性能。
- **对应用透明**：尽量通过公共组件完成埋点，减少业务改造。
- **广泛覆盖**：只有大部分服务都接入后，才能还原完整链路。

## 基本原理

### Trace 和 Span

链路追踪中有两个核心概念：

- **Trace**：表示一次完整的请求链路。
- **Span**：表示链路中的一次操作，比如一次 HTTP 请求、一次 RPC 调用、一次数据库查询。

一次请求通常会产生多个 Span，Span 之间通过父子关系关联起来。每一次 Trace 实际上都是由若干个有顺序、有层级关系的 Span 组成的一棵追踪树。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/dapper_trace_spans.png)

图：Trace 和 Span（图片来源于 [Dapper 论文](https://research.google.com/archive/papers/dapper-2010-1.pdf)）

每个 Span 通常包含以下信息：

| 字段 | 含义 |
| --- | --- |
| TraceID | 整条链路的 ID。同一次请求产生的 Span 使用相同的 TraceID |
| SpanID | 当前 Span 的 ID |
| ParentSpanID | 父 Span 的 ID。入口 Span 没有父节点 |
| Name | 当前操作名称，比如 `GET /users/{id}`、`SELECT orders` |
| StartTime | Span 开始时间 |
| Duration | Span 执行耗时 |
| Kind | Span 类型，比如 Server、Client、Producer、Consumer |
| Attributes | Span 属性，比如 HTTP 状态码、请求路径、数据库类型 |
| Events | Span 执行期间发生的事件，比如异常信息 |
| Status | Span 执行状态 |

以 HTTP 请求为例，服务端接收到请求时会生成一个 Server Span；如果处理过程中需要调用下游服务，则会再生成一个 Client Span。下游服务收到请求后继续生成新的 Server Span。通过这些 Span 的 TraceID 和 ParentSpanID，就可以还原请求的完整调用关系。

### 上下文传递

链路追踪需要在服务之间传递 TraceID 和 SpanID，否则每个服务生成的 Span 无法关联起来。

HTTP 请求通常使用 [W3C Trace Context](https://www.w3.org/TR/trace-context/) 规范。调用方在请求头中写入 `traceparent`：

```text
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

`traceparent` 由四部分组成：

```text
版本号-TraceID-ParentSpanID-标志位
```

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/tracing_w3c_context.png)

下面是一个完整的 HTTP 请求示例：

```http
GET /api/orders/12345 HTTP/1.1
Host: order-service
User-Agent: inventory-service/1.0
Content-Type: application/json
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
tracestate: vendorname=opaque-value
baggage: tenant.id=shop-01,app.version=1.2.0
```

下游服务收到请求后，会读取 `traceparent`，使用相同的 TraceID 创建自己的 Span，并把上游 SpanID 记录为 ParentSpanID。继续调用其它服务时，再把当前 SpanID 写入新的 `traceparent`，传递给下一跳服务。

这几个请求头的职责不同：

- `traceparent`：W3C Trace Context 的核心字段，用来传递 TraceID、上游 SpanID 和采样标记。
- `tracestate`：W3C Trace Context 的扩展字段，用来传递链路追踪系统自定义的状态信息。
- `baggage`：OpenTelemetry 支持的跨服务业务属性传播方式，比如租户、区域、版本等上下文信息。

`baggage` 会随着请求不断向下游传递，因此不要在其中放入 Token、密码、个人信息等敏感数据，也不要放入过多字段。

## 实现规范：OpenTelemetry

### 从 Dapper 到 OpenTelemetry

Dapper 提出了链路追踪的核心思想，但它本身只是一篇论文，并没有规定不同系统之间应该如何埋点、如何传播上下文、如何上报数据。因此早期链路追踪系统大多各自实现一套 SDK、上下文格式和上报协议。

为了解决标准化问题，后来出现了 OpenTracing 和 OpenCensus 两个项目。

| 项目 | 重点 | 说明 |
| --- | --- | --- |
| OpenTracing | API 规范 | 主要定义应用如何创建 Span、设置 Tag、注入和提取上下文，但不提供完整 SDK 实现 |
| OpenCensus | SDK 和数据采集 | 提供 API、SDK、上下文传播、Stats 等能力，同时覆盖 Trace 和 Metrics |
| OpenTelemetry | 统一标准 | 由 OpenTracing 和 OpenCensus 合并而来，统一 API、SDK、语义约定、Collector 和 OTLP |

OpenTracing 更像是一套抽象接口，目标是让应用代码不直接绑定某个追踪系统。OpenCensus 则更接近一套可直接使用的采集框架。两者各有侧重，但如果长期并行发展，仍然会让生态割裂。因此二者在 2019 年合并为 OpenTelemetry。

[OpenTelemetry](https://opentelemetry.io/docs/) 是 CNCF 下的可观测性项目，提供了统一的 API、SDK、数据格式和传输协议。目前大部分主流链路追踪系统都支持接收 OpenTelemetry 数据。

OpenTelemetry 的价值在于，它把应用埋点、自动采集、上下文传播、数据处理和数据导出统一到一套规范里。应用侧只需要按照 OpenTelemetry 接入，后端可以是 Tempo、Jaeger、SkyWalking、Elastic APM 或其它系统。

### OpenTelemetry 的核心组件

OpenTelemetry 主要包含以下部分：

| 组件 | 作用 |
| --- | --- |
| API | 定义创建 Span、Metric、Log 的接口 |
| SDK | API 的具体实现，负责采样、处理和导出数据 |
| Instrumentation | 针对 Web 框架、数据库、RPC 等组件的自动埋点 |
| Collector | 接收、处理并转发遥测数据 |
| OTLP | OpenTelemetry Protocol，用于传输 Metrics、Logs、Traces |

对于 Java、Python 等语言，可以通过 Agent 或 OpenTelemetry Operator 自动注入。Go 通常使用 SDK 和 middleware，在 HTTP、gRPC 等入口统一创建 Span。

### OTLP 与 Collector

OpenTelemetry 使用 [OTLP](https://opentelemetry.io/docs/specs/otlp/) 传输数据。OTLP 支持两种常见方式：

| 协议 | 默认端口 | 说明 |
| --- | --- | --- |
| OTLP/gRPC | 4317 | 使用 gRPC 传输 Protobuf 数据 |
| OTLP/HTTP | 4318 | 使用 HTTP 传输 Protobuf 或 JSON 数据 |

业务服务可以直接将数据发送到存储后端，也可以先发送到 OpenTelemetry Collector。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/tracing-workflow.jpg)

实际工程中通常会增加 Collector。它可以统一处理批量发送、内存保护、重试、过滤和采样等逻辑。后续更换存储后端时，应用侧通常也不需要修改。Collector 的处理过程大致如下：

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/tracing-collector.jpg)

- **Receiver**：接收 OTLP、Jaeger、Zipkin 等协议的数据。
- **Processor**：对数据做批量处理、过滤、属性变换和采样。
- **Exporter**：将数据写入 Tempo、Jaeger、Zipkin 等后端。

## 数据采集与处理

### 采集方式

链路追踪首先需要解决的是如何采集 Span。一次请求会经过不同语言编写的服务，调用 HTTP、RPC、数据库和消息队列等组件。如果要求开发人员在每个调用点手工记录数据，不仅工作量很大，也很难保证所有服务的采集方式一致。

按照采集位置和数据上报方式的不同，常见方案大致可以分为以下几类。

#### 基于服务的追踪

基于服务的追踪（Service-Based Tracing）在应用进程中创建 Span，再通过独立的数据通道发送到 Collector 或存储后端。这是目前最常见的实现方式。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/service-based-tracing.png)

在应用中创建 Span 主要有两种方式：

| 方式 | 说明 | 适用场景 |
| --- | --- | --- |
| SDK 手工埋点 | 在代码中主动创建 Span，并记录业务属性和事件 | 核心业务流程、公共组件、自定义中间件 |
| Agent 自动埋点 | 在应用启动时注入 Agent，自动拦截框架和公共库 | HTTP、RPC、数据库访问等通用调用 |

自动埋点接入成本低，可以快速覆盖大部分服务；手工埋点能够记录更具体的业务语义。比如一次支付请求，Agent 可以自动采集 HTTP 请求和数据库查询，但像“检查账户余额”“执行风控规则”“扣减余额”等步骤，需要应用自行增加 Span 才能看到。

基于服务的追踪不依赖业务日志，数据更完整，也可以采集应用内部操作。代价是应用需要引入 SDK 或 Agent，并额外消耗一定的 CPU、内存和网络资源。

#### 基于日志的追踪

基于日志的追踪（Log-Based Tracing）将 TraceID、SpanID、ParentSpanID 等信息写入业务日志，再通过日志采集器汇总到存储后端。后端根据这些字段还原调用关系。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/log-based-tracing.png)

这种方式可以复用已有日志采集链路，额外开销较小，也方便从 Trace 跳转到应用日志。但它依赖日志归集过程。如果日志发生延迟、丢失或者采集顺序变化，重建出来的链路也可能不完整。

因此，日志中保留 TraceID 和 SpanID 很有价值，但更适合作为日志关联手段，而不是复杂系统中唯一的 Trace 数据通道。

#### 基于代理的追踪

基于代理的追踪（Proxy-Based Tracing）在服务通信链路中增加代理，由代理记录请求的入口、出口、耗时和状态。Service Mesh 中的 Sidecar Proxy 就属于这种方式。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/proxy-based-tracing.png)

代理位于服务之间的网络路径上，因此不需要修改应用代码，也不依赖具体编程语言。对于 HTTP、gRPC 等网络调用，可以比较方便地生成服务调用拓扑。

这种方式也有明显的限制。代理只能看到经过它的网络请求，无法知道应用内部执行了哪些业务逻辑，也无法直接看到进程内方法调用。为了让上下游 Span 能够关联起来，请求仍然需要正确传递 Trace Context。

#### eBPF

近几年也出现了使用 eBPF 采集链路数据的方案。它通过内核或者用户态探针观测网络请求和部分应用调用，不需要在每个服务中安装 Agent。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/ebpf-based-tracing.png)

eBPF 适合快速补充服务拓扑和基础调用数据，但能够采集到的语义取决于协议、运行时和具体实现。对于关键业务流程，通常仍然需要配合 SDK 或 Agent。

实际工程中，可以组合使用不同方式：通过自动埋点覆盖常见框架，通过 SDK 补充关键业务 Span，通过日志关联 TraceID，通过代理或者 eBPF 补充基础设施侧的调用关系。

### 采样

链路数据量通常比较大。一个请求会产生多个 Span，每个 Span 还会包含属性、事件等信息。如果保存所有链路，很容易增加网络传输和存储成本。

链路追踪常见的采样方式有两种。

#### 头部采样

头部采样（Head Sampling）在请求进入系统时就决定是否采集。

比如配置 10% 的采样率，入口服务会按照 TraceID 做采样判断，并将采样结果通过 `traceparent` 传递给下游。这样同一条链路中的 Span 会一起保留或者一起丢弃。

头部采样实现简单，资源消耗也比较低。但因为在请求刚进入系统时就做了决定，此时还不知道请求最后是否发生异常，因此可能丢失一些低频错误链路。

#### 尾部采样

尾部采样（Tail Sampling）先收集一条链路中的 Span，再根据整条链路的执行情况决定是否保留。

比如：

- 保留所有发生错误的链路。
- 保留响应时间超过 1s 的链路。
- 保留部分正常请求。
- 提高核心业务接口的采样比例。

尾部采样保留的数据更有价值，但 Collector 需要暂存 Span，增加了内存开销。使用多个 Collector 实例时，还需要确保同一条 Trace 的 Span 被路由到同一个实例，否则 Collector 无法看到完整链路。

### 数据存储

链路数据通常会写入专门的存储后端。与日志相比，Trace 的主要查询方式是根据 TraceID 查找一条完整链路，或者根据服务名、响应时间、状态等 Span 属性进行过滤，不需要对日志内容做全文检索。

不同 Trace 后端的存储实现有所不同。比如 Tempo 将 Trace 写入对象存储，通过 TraceID 或 TraceQL 查询；Jaeger、SkyWalking 等系统则可以使用 Elasticsearch、OpenSearch、BanyanDB 等存储后端。选择时主要考虑数据量、查询方式、保留时间和已有技术栈。

### 指标拓展

除了查看单条链路，还可以对 Span 做聚合分析，生成请求数量、错误率和响应时间等指标。常见的指标包括：

| 指标 | 说明 |
| --- | --- |
| QPS | 服务、实例或者接口的请求数量 |
| 错误率 | 请求失败比例，可以用来分析服务可用性 |
| 响应时间 | 请求处理耗时，可以进一步统计 P50、P95、P99 |
| TopN | 调用量最大、响应最慢、错误最多的服务或者接口 |

根据 Span 之间的调用关系，还可以生成服务拓扑图，用来展示服务之间的依赖关系、调用量和响应时间。

需要注意的是，如果 Trace 做了采样，通过 Span 生成的指标也只代表被采样的请求。链路指标适合用来分析趋势和排查问题，但不能完全替代应用主动暴露的业务指标。

## 工程实践

链路追踪系统由数据采集、数据分析、数据存储和数据展示几部分组成。工程选型时，通常不是单独选择一个 Trace 后端，而是选择一整套采集、分析、存储和可视化方案。

下面简要介绍两类常见技术栈：Grafana 技术栈和 SkyWalking 技术栈。

| 技术栈 | 采集方式 | 分析与存储 | 展示 | 特点 |
| --- | --- | --- | --- | --- |
| Grafana | OpenTelemetry SDK / Agent、Alloy、Beyla | Alloy、Tempo、Mimir / Prometheus、Loki | Grafana | 开放标准优先，适合将 Metrics、Logs、Traces 放在一个 Grafana 入口下展示 |
| SkyWalking | SkyWalking Agent、OpenTelemetry | OAP Server、BanyanDB / Elasticsearch | SkyWalking UI | 一体化 APM 方案，Agent、分析、拓扑、UI 都比较完整 |

OpenTelemetry 将埋点和传输协议标准化后，应用不需要直接依赖某个 Trace 后端。比如可以先将数据发送到 OpenTelemetry Collector，再根据需要写入 Tempo、Jaeger 或其它后端。

### Grafana 技术栈

在 Grafana 技术栈中，可以使用 OpenTelemetry 负责埋点和数据传输，使用 Grafana Alloy 或 OpenTelemetry Collector 采集数据，使用 Tempo 存储 Trace，最后通过 Grafana 查询和展示。

[Grafana Alloy](https://grafana.com/docs/alloy/latest/introduction/) 是 Grafana Labs 开源的 OpenTelemetry Collector 发行版。它兼容 OpenTelemetry Collector 的组件体系，同时支持 Prometheus、Loki、Tempo 等 Grafana 技术栈。

整体架构如下：

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/grafana-tracing.png)

从图中可以看到，这套架构大致分为三层：

- **请求流向**：用户请求经过 API 网关、服务 A、服务 B、数据库等组件。服务之间通过 Trace Context 传递 TraceID 和 SpanID。
- **Trace 上报**：应用通过 OpenTelemetry SDK 或自动埋点生成 Span，并通过 OTLP 上报到 Alloy 或 OpenTelemetry Collector。Grafana Beyla 也可以作为 eBPF 自动采集的补充方案。
- **存储与展示**：Trace 写入 Tempo；日志写入 Loki；Span Metrics、Service Graph 等指标写入 Mimir 或 Prometheus 兼容存储；最后由 Grafana 统一查询和展示。

Alloy 接收应用上报的 OTLP 数据，将 Trace 写入 Tempo。同时，也可以根据 Span 生成两类数据：

- **Span Metrics**：请求数量、错误数量、响应时间分布等指标。
- **Service Graph**：服务之间的调用关系。

应用日志可以写入 Loki，并在日志中增加 TraceID 和 SpanID。这样就可以在 Grafana 中从 Trace 跳转到日志，也可以从日志反查完整链路。

指标、链路和日志关联起来后，常见的排查路径如下：

```text
Metrics -> Trace -> Logs
Logs -> Trace
```

当服务规模增加时，可以将 Alloy 分成 Agent 和 Gateway 两层。Agent 靠近应用部署，负责接收和批量转发；Gateway 集中处理过滤、采样和数据导出。

```text
Application -> Alloy Agent -> Alloy Gateway -> Tempo
```

如果启用了尾部采样，需要按照 TraceID 将同一条链路的数据发送到同一个 Gateway 实例。

### SkyWalking 技术栈

SkyWalking 是另一类常见的一体化链路追踪方案。它不仅提供 Agent，还提供 OAP Server、存储和 UI，整体更接近完整 APM 系统。

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/skywalking-tracing.png)

SkyWalking 的核心组件包括：

| 组件 | 作用 |
| --- | --- |
| SkyWalking Agent | 注入到应用进程中，自动采集 HTTP、RPC、数据库等调用，并负责 Trace Context 传递 |
| OAP Server | 接收 Trace 数据，完成分析、聚合、服务拓扑计算等工作 |
| BanyanDB / Elasticsearch | 存储 Trace、指标和拓扑数据 |
| SkyWalking UI | 查询 Trace、查看服务拓扑和调用指标 |

从数据流看，SkyWalking Agent 在服务中自动创建 Span，并通过 gRPC 或 HTTP 将数据上报给 OAP Server。OAP 负责分析和聚合数据，再写入 BanyanDB 或 Elasticsearch。SkyWalking UI 查询 OAP 和存储后端，展示调用链、服务拓扑和指标。

与 Grafana 技术栈相比，SkyWalking 的优点是链路追踪相关能力比较集中，Agent、后端分析和 UI 都由同一套系统提供，接入 Java 等语言时比较方便。缺点是它的生态边界相对更清晰，如果已经在使用 Prometheus、Loki、Grafana 等组件，仍然需要考虑与现有指标和日志体系的关联。

### 落地注意事项

探活请求通常频率很高，但排查问题时价值较低，可以在 Collector 或后端分析层中过滤常见的探活路径：

```text
/health
/healthz
/ready
/live
/metrics
/actuator/health
```

Span 的属性也需要控制。比如 HTTP 路径应该记录 `/users/{id}`，而不是 `/users/12345`。如果将用户 ID、订单 ID 等值直接写入 Span 名或者 Metric Label，会产生大量高基数数据，增加存储和查询压力。

链路追踪主要记录服务之间的调用关系。如果已经定位到某个 Span 响应缓慢，还需要继续分析函数耗时、CPU 使用、内存分配等问题，可以结合 Profiling 工具做进一步分析。
