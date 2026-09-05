import{_ as a,r as o,o as l,c as r,b as n,d as t,e as s,a as i}from"./app-BTSCaQUU.js";const u={},c={href:"https://cloud.google.com/apis/design?hl=zh-cn",target:"_blank",rel:"noopener noreferrer"},p={href:"https://martinfowler.com/articles/richardsonMaturityModel.html#level0",target:"_blank",rel:"noopener noreferrer"},v={href:"https://www.rfc-editor.org/rfc/rfc3986.html",target:"_blank",rel:"noopener noreferrer"};function m(b,e){const d=o("ExternalLinkIcon");return l(),r("div",null,[e[9]||(e[9]=n("h1",{id:"web-api-设计规范",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#web-api-设计规范","aria-hidden":"true"},"#"),t(" Web API 设计规范")],-1)),e[10]||(e[10]=n("h2",{id:"rest-api-简介",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#rest-api-简介","aria-hidden":"true"},"#"),t(" REST API 简介")],-1)),e[11]||(e[11]=n("p",null,"REST 是 Representational State Transfer 的缩写，它将资源作为核心概念，是一套围绕资源、表示和状态转移组织系统接口的架构风格。在实际工作中，我们更多是把它落实到 Web API 的路径、方法、状态码、响应体和兼容性设计上。",-1)),e[12]||(e[12]=n("p",null,"企业在进行产品设计开发时，通常会先由业务专家和技术专家一起梳理业务逻辑和业务模型，再根据领域驱动设计（DDD）的方法论抽象领域模型。最终，这些领域模型会映射为数据存储的数据模型和 Web API 的资源模型，而领域行为会映射为 HTTP 方法、子资源或少量必要的 Action。",-1)),n("p",null,[e[1]||(e[1]=t("REST API 几乎已经是互联网服务 Web API 设计的事实标准。根据 Google 的 ",-1)),n("a",c,[e[0]||(e[0]=t("API 设计指南",-1)),s(d)]),e[2]||(e[2]=t("，早在 2010 年，就有大约 74% 的公共网络 API 是 HTTP REST 或类似 REST 的风格，大多数 API 均使用 JSON 作为传输格式。",-1))]),e[13]||(e[13]=i('<h3 id="restful-设计原则" tabindex="-1"><a class="header-anchor" href="#restful-设计原则" aria-hidden="true">#</a> RESTful 设计原则</h3><p>满足 REST 要求的架构需遵循以下 6 个设计原则：</p><p><strong>1. 客户端与服务端分离</strong></p><p>目的是将客户端和服务端的关注点分离。在 Web 应用中，将用户界面所关注的逻辑和服务端数据存储所关注的逻辑分离开来，有助于提高客户端的跨平台的可移植性；也有助于提高服务端的可扩展性。</p><p>随着前端技术的发展，前后端分离已经是主流的开发方式，传统的 Spring MVC/Django 的前端模板渲染已经被逐渐弃用了。</p><p><strong>2. 无状态</strong></p><p>服务端不保存客户端的上下文信息，会话信息由客户端保存，服务端根据客户端的请求信息处理请求。</p><p>在实际开发中，服务端通常会保存一些状态信息，比如会话信息、认证信息等，这些信息一般是保存在服务端的数据库或者缓存中。</p><p><strong>3. 可缓存</strong></p><p>这一条算是上一条的延伸，无状态服务提升了系统的可靠性、可扩展性，但也会造成不必要的网络开销。为了缓解这个问题，REST 要求客户端或者中间代理（网关）能缓存服务端的响应数据。服务端的响应信息必须明确表示是否可以被缓存以及缓存的时长，以避免客户端请求到过期数据。</p><p>管理良好的缓存机制可以有效减少客户端-服务器之间的交互，甚至完全避免客户端-服务器交互，从而提升了系统的性能和可扩展性。</p><p><strong>4. 分层系统</strong></p><p>对于客户端来说，中间代理是透明的。客户端无需知道请求路径中代理、网关、负载均衡等中间件的存在，这样可以提高系统的可扩展性和安全性。</p><p><strong>5. 统一接口</strong></p><p>REST 要求开发者面向资源来设计系统，有下面四个约束：</p><ul><li><p><strong>每次请求中都包含资源 ID</strong></p></li><li><p><strong>所有操作都通过资源表示进行</strong></p></li><li><p><strong>消息是自描述的</strong>：每条消息包含足够的信息来描述如何处理这条消息。比如 <code>Content-Type</code> 标识请求体或响应体的媒体类型，<code>Accept</code> 表示客户端期望的响应格式，<code>Content-Language</code> 表示语言，<code>Content-Encoding</code> 表示压缩方式。</p></li><li><p><strong>用超媒体驱动应用状态（HATEOAS，Hypermedia as the Engine of Application State）</strong>：客户端在访问了最初的 REST API 后，服务端会返回后续操作的链接，客户端使用服务端提供的链接动态的发现可用资源和可执行操作。</p></li></ul><p><strong>6. 按需编码（可选）</strong></p><p>这是一条可选约束，指的是服务端可以根据客户端需求，将可执行代码发送给客户端，从而实现临时性的功能扩展或定制功能，比如以前的 Java Applet、现在新兴的 WebAssembly。</p><h3 id="rest-api-成熟度模型" tabindex="-1"><a class="header-anchor" href="#rest-api-成熟度模型" aria-hidden="true">#</a> REST API 成熟度模型</h3><p>上述约束读起来还是有些抽象，鉴于在实际开发中，我们更多是聚焦在 API 设计上。为了衡量一个系统是否符合 REST 风格，《RESTful Web APIs》和《RESTful Web Services》的作者 Leonard Richardson 提出了 REST 成熟度模型，根据 API 的设计风格将其分为了 4 级。</p><h4 id="第-0-级-完全不符合-rest-风格" tabindex="-1"><a class="header-anchor" href="#第-0-级-完全不符合-rest-风格" aria-hidden="true">#</a> 第 0 级：完全不符合 REST 风格</h4><p>比如 RPC 面向过程的 API 设计基本是围绕操作过程来设计的，完全没有资源的概念。</p>',22)),n("p",null,[e[4]||(e[4]=t("下面是 Martin Fowler 在介绍成熟度模型的 blog ",-1)),n("a",p,[e[3]||(e[3]=t("Richardson Maturity Model",-1)),s(d)]),e[5]||(e[5]=t(" 中举的病人预约的例子，病人首先需要查询医生可预约的时间表，然后提交预约。",-1))]),e[14]||(e[14]=i(`<p>查询预约服务时提交的请求为</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>POST /appointmentService?action=query HTTP/1.1

{
    &quot;date&quot;: &quot;2020-03-04&quot;,
    &quot;doctor&quot;: &quot;mjones&quot;
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>请求成功后响应如下</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>HTTP/1.1 200 OK
[
    {
        &quot;start&quot;: &quot;14:00&quot;,
        &quot;end&quot;: &quot;14:50&quot;,
        &quot;doctor&quot;: &quot;mjones&quot;
    },
    {
        &quot;start&quot;: &quot;16:00&quot;,
        &quot;end&quot;: &quot;16:50&quot;,
        &quot;doctor&quot;: &quot;mjones&quot;
    }
]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后病人选择时段提交预约</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>POST /appointmentService?action=confirm HTTP/1.1

{
    &quot;slot&quot;: {
        &quot;start&quot;: &quot;14:00&quot;,
        &quot;end&quot;: &quot;14:50&quot;,
        &quot;doctor&quot;: &quot;mjones&quot;
    },
    &quot;patient&quot;: {
        &quot;id&quot;: &quot;jsmith&quot;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>预定成功时响应如下</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>HTTP/1.1 200 OK

{
    &quot;slot&quot;: {
        &quot;start&quot;: &quot;14:00&quot;,
        &quot;end&quot;: &quot;14:50&quot;,
        &quot;doctor&quot;: &quot;mjones&quot;
    },
    &quot;patient&quot;: {
        &quot;id&quot;: &quot;jsmith&quot;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>预定失败时响应如下</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>HTTP/1.1 200 OK

{
    &quot;slot&quot;: {
        &quot;start&quot;: &quot;14:00&quot;,
        &quot;end&quot;: &quot;14:50&quot;,
        &quot;doctor&quot;: &quot;mjones&quot;
    },
    &quot;patient&quot;: {
        &quot;id&quot;: &quot;jsmith&quot;
    },
    &quot;reason&quot;: &quot;Slot not available&quot;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到整个请求过程没有涉及到资源的概念，并且请求也比较简洁明了。但如果操作越来越多，接口也越来越多，随之而来的维护、沟通成本也会越来越高。</p><h4 id="第-1-级-引入资源概念" tabindex="-1"><a class="header-anchor" href="#第-1-级-引入资源概念" aria-hidden="true">#</a> 第 1 级：引入资源概念</h4><p>引入资源后，对服务端的访问都是围绕资源，通过资源 ID 进行。此时的查询和预约请求如下：</p><p>查询预约：以医生为资源，通过 ID查询</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>POST /doctors/mjones HTTP/1.1

{date: &quot;2020-03-04&quot;}

// 请求响应

[
  {&quot;slot_id&quot;: 1234, doctor: &quot;mjones&quot;, start: &quot;14:00&quot;, end: &quot;14:50&quot;},
  {&quot;slot_id&quot;: 5678, doctor: &quot;mjones&quot;, start: &quot;16:00&quot;, end: &quot;16:50&quot;}
]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>提交预约时，以时间表 slot 为资源，通过 ID 预约</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>POST /slots/1234 HTTP/1.1

{ &quot;patient_id&quot;: &quot;jsmith&quot; }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="第-2-级-操作映射到-http-方法" tabindex="-1"><a class="header-anchor" href="#第-2-级-操作映射到-http-方法" aria-hidden="true">#</a> 第 2 级：操作映射到 HTTP 方法</h4><p>上面的例子中所有请求都是用的 POST 方法，Level2 要求将操作映射到 HTTP 方法。对于资源的操作无非就是增删改查，HTTP 对应的 POST、DELETE、PUT/PATCH、GET 可以很好的表达这些操作。</p><ul><li>查询档期，使用 GET 方法</li></ul><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>GET /doctors/mjones/schedule?date=2020-03-04&amp;status=open HTTP/1.1

[
  {&quot;slot_id&quot;: 1234, doctor: &quot;mjones&quot;, start: &quot;14:00&quot;, end: &quot;14:50&quot;},
  {&quot;slot_id&quot;: 5678, doctor: &quot;mjones&quot;, start: &quot;16:00&quot;, end: &quot;16:50&quot;}
]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>创建预约，使用 POST 方法</li></ul><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>POST /schedules/1234 HTTP/1.1

{ &quot;patient_id&quot;: &quot;jsmith&quot; }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>// 预定成功响应
HTTP/1.1 201 Created
Location: slots/1234/appointment

{
    &quot;slot&quot;: {
        &quot;id&quot;: 1234,
        &quot;doctor&quot;: &quot;mjones&quot;,
        &quot;start&quot;: &quot;14:00&quot;,
        &quot;end&quot;: &quot;14:50&quot;
    },
    &quot;patient&quot;: {
        &quot;id&quot;: &quot;jsmith&quot;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>预定失败时，需要返回能表达错误原因的响应码，而不是像之前一样返回 200。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>HTTP/1.1 409 Conflict

[
  {&quot;slot_id&quot;: 5678, doctor: &quot;mjones&quot;, start: &quot;16:00&quot;, end: &quot;16:50&quot;}
]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第 2 级是目前绝大多数系统所达到的级别。</p><h4 id="第-3-级-状态转移完全由后端驱动" tabindex="-1"><a class="header-anchor" href="#第-3-级-状态转移完全由后端驱动" aria-hidden="true">#</a> 第 3 级：状态转移完全由后端驱动</h4><p>在实际开发中，通常是客户端和服务端约定好 API 后进行各自的开发实现。客户端在代码中已经编写了 API 相关的调用，只等服务端开发完成进行联调测试即可。但 REST 认为这是多余的，客户端应该根据服务端返回的链接进行后续操作，返回的资源信息以及操作链接信息能够描述自身以及后续可能发生的状态转移，从而实现超文本驱动应用状态。</p><p>依然是查询预约的 API，此时后端返回的预约列表，除了基本信息外还带有预约所需 link，由此客户端知晓后续的预约操作，并请求服务端返回的 link 进行操作。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>GET /doctors/mjones/slots?date=20100104&amp;status=open HTTP/1.1

[
  {&quot;slot_id&quot;: 1234, doctor: &quot;mjones&quot;, start: &quot;14:00&quot;, end: &quot;14:50&quot;, links: [{&quot;rel&quot;: &quot;book&quot;, &quot;href&quot;: &quot;/slots/1234&quot;}]},
  {&quot;slot_id&quot;: 5678, doctor: &quot;mjones&quot;, start: &quot;16:00&quot;, end: &quot;16:50&quot;, links: [{&quot;rel&quot;: &quot;book&quot;, &quot;href&quot;: &quot;/slots/5678&quot;}]}
]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到返回的数据中包含了支持的预约操作以及操作所对应的链接。笔者在实际工作中很少遇到满足 Level 3 的系统，通常都是 Level 2 的系统。</p><h3 id="rest-vs-rpc" tabindex="-1"><a class="header-anchor" href="#rest-vs-rpc" aria-hidden="true">#</a> REST VS RPC</h3><p>API 的设计通常有 RPC 和 REST 两种形式。虽然两者并不是一回事，但因为都是面向服务端和客户端的通信制定规范，所以经常被混为一谈。</p><p>REST 本身是一套面向资源的架构设计思想，而 RPC 的初衷是希望能在分布式系统之间，像调用本地方法一样调用远程方法。RPC 协议围绕通信过程、数据编码、传输协议以及方法表达提供不同的解决方案。</p><p>具体到 API 设计上，其主要区别在于：<strong>REST 是面向资源的，而 RPC 是面向过程的</strong>。以一个用户的增删改查为例，REST 的 API 设计如下</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># 创建用户
POST /users
# 查询用户列表
GET /users
# 查询用户详情
GET /users/{id}
# 更新用户信息
PUT /users/{id}
# 删除用户
DELETE /users/{id}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>而 RPC 的 API 设计如下：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># 创建用户
POST /createUser
# 查询用户列表
GET /getUserList
# 查询用户详情
GET /getUserById
# 更新用户信息
PUT /updateUser
# 删除用户
DELETE /deleteUser
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>REST 和 RPC 并不是谁一定更高级。面向外部开放、围绕资源进行增删改查、需要长期兼容的 API，更适合使用 REST 风格；命令式很强、内部服务调用、对强类型接口和代码生成要求更高的场景，RPC 往往更直接。真正重要的是保持接口风格一致，不要在同一组 API 中一半像资源，一半像函数。</p><h2 id="uri-的设计规范" tabindex="-1"><a class="header-anchor" href="#uri-的设计规范" aria-hidden="true">#</a> URI 的设计规范</h2><p>了解了 REST API 的基本概念，下面看一些可以在实践中落地的 URI 设计规范。</p>`,42)),n("p",null,[e[7]||(e[7]=t("根据 ",-1)),n("a",v,[e[6]||(e[6]=t("RFC 3986 - Uniform Resource Identifier (URI): Generic Syntax",-1)),s(d)]),e[8]||(e[8]=t(" 中的定义，一个 URI 的结构如下所示：",-1))]),e[15]||(e[15]=i(`<div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>       foo://example.com:8042/over/there?name=ferret#nose
       \\_/   \\______________/\\_________/ \\_________/\\__/
        |        |              |          |          |
scheme（协议）domain（域名） path（路径） query（查询参数）fragment（片段）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里主要讨论 path 和 query。对于面向业务系统的 Web API，可以使用如下路径结构：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/{version}/{namespace}/{resources}
/{version}/{namespace}/{resources}/{id}
/{version}/{namespace}/{resources}/{id}/{sub-resources}
/{version}/{namespace}/{resources}/{id}/{action}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="uri-主体字段含义" tabindex="-1"><a class="header-anchor" href="#uri-主体字段含义" aria-hidden="true">#</a> URI 主体字段含义</h3><p>首先来看 URL 中各个字段的含义与设计规范。</p><ul><li><code>{domain}</code>：域名。可以使用统一域名，也可以针对不同业务线使用不同域名。</li><li><code>{version}</code>：API 主版本。形式通常是 <code>v1</code>、<code>v2</code>。</li><li><code>{namespace}</code>：命名空间或业务域，比如 <code>iam</code>、<code>payment</code>、<code>shipping</code>。小型系统可以省略。</li><li><code>{resources}</code>：具体资源，使用名词和复数形式，比如 <code>orders</code>、<code>users</code>、<code>payments</code>。</li><li><code>{id}</code>：某个资源的唯一标识。</li><li><code>{sub-resources}</code>：子资源，和父资源存在明显归属关系，比如 <code>/carts/{cartId}/items</code>。</li><li><code>{action}</code>：针对资源或子资源的行为操作，用动词或动词短语表示，用来弥补 HTTP 方法表达上的不足。</li></ul><h3 id="uri-路径规范" tabindex="-1"><a class="header-anchor" href="#uri-路径规范" aria-hidden="true">#</a> URI 路径规范</h3><ul><li>使用名词表示资源，尽量使用复数形式，比如 <code>/users</code>、<code>/orders</code>、<code>/invoices</code>。</li><li>使用层次结构表示资源关系，比如 <code>/users/{userId}/orders/{orderId}</code>。</li><li>路径统一小写，多个单词使用短横线 <code>-</code> 分隔，比如 <code>/user-profiles</code>。</li><li>避免动词路径，比如 <code>/getUser</code>、<code>/createOrder</code>，常规动作由 HTTP 方法表达。</li><li>资源标识尽量使用稳定 ID，不要暴露容易变化的业务字段。</li><li>路径不要嵌套过深，超过 3 层后通常需要重新审视资源边界。</li><li>Query 用来表达过滤、排序、分页和字段选择，不要把资源身份藏在 query 里。</li><li>如果必须表示特定动作，可以使用 action，比如 <code>POST /orders/{id}/cancel</code>。</li></ul><p>路径中的 Action 要克制使用。取消订单、发送邮件、重试任务、归档项目这类操作很难用 CRUD 表达，可以使用 action；如果只是创建、查询、更新、删除资源，就不要额外设计 <code>/create</code>、<code>/update</code>、<code>/delete</code>。</p><h2 id="http-方法使用规范" tabindex="-1"><a class="header-anchor" href="#http-方法使用规范" aria-hidden="true">#</a> HTTP 方法使用规范</h2><p>对资源的增删改查应该使用标准 HTTP 方法。下面是常见资源操作与 HTTP 方法的映射关系。</p><table><thead><tr><th>资源操作</th><th>HTTP 方法</th><th>描述</th><th>是否幂等</th><th>是否带请求体</th><th>常见响应</th></tr></thead><tbody><tr><td>List</td><td>GET</td><td>查询资源集合</td><td>是</td><td>否</td><td><code>200 OK</code>，无数据返回空数组</td></tr><tr><td>Get</td><td>GET</td><td>查询单个资源</td><td>是</td><td>否</td><td><code>200 OK</code>，不存在返回 <code>404 Not Found</code></td></tr><tr><td>Create</td><td>POST</td><td>在集合下创建资源</td><td>否</td><td>是</td><td><code>201 Created</code>，响应 <code>Location</code></td></tr><tr><td>Replace</td><td>PUT</td><td>全量替换某个资源</td><td>是</td><td>是</td><td><code>200 OK</code> 或 <code>204 No Content</code></td></tr><tr><td>Update</td><td>PATCH</td><td>局部更新某个资源</td><td>取决于语义</td><td>是</td><td><code>200 OK</code> 或 <code>204 No Content</code></td></tr><tr><td>Delete</td><td>DELETE</td><td>删除某个资源</td><td>是</td><td>通常不带</td><td><code>204 No Content</code></td></tr><tr><td>Head</td><td>HEAD</td><td>获取资源元信息</td><td>是</td><td>否</td><td>只返回响应头</td></tr><tr><td>Options</td><td>OPTIONS</td><td>获取可用方法或跨域预检</td><td>是</td><td>否</td><td><code>204 No Content</code> 或允许的方法信息</td></tr></tbody></table><p>以下是基本的 API 示例</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># 创建用户
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果有特殊动作，可以在路径中使用 action 标识。action 必须是动词或动词短语。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code># 实名认证
POST /users/1/verify-real-name

# 取消订单
POST /orders/123456/cancel

# 激活优惠券
POST /coupons/123456/activate
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这些动作通常使用 <code>POST</code>，因为它们表达的是业务命令，不一定能被简单视为资源替换。若动作本身天然幂等，需要在服务端保证重复调用不会产生额外副作用。</p><h2 id="分页、过滤、排序" tabindex="-1"><a class="header-anchor" href="#分页、过滤、排序" aria-hidden="true">#</a> 分页、过滤、排序</h2><p>分页参数常用两类：<code>offset/limit</code> 或 <code>cursor（基于游标）</code>。</p><ul><li><code>offset/limit</code> 简单直观：<code>GET /items?limit=20&amp;offset=40</code>。</li><li><code>cursor</code> 更适合大数据集或实时数据：<code>GET /items?limit=50&amp;cursor=abc123</code>。</li></ul><p>尽量设置默认分页大小。如果客户端未指定，服务端应有合理默认值，比如 20 或 50，并设置最大限制，比如 100 或 200，避免一次请求拖垮服务。</p><p>过滤、排序和字段选择可以采用如下约定：</p><ul><li>过滤使用明确字段：<code>GET /users?status=active&amp;role=admin</code>。</li><li>排序使用 <code>sort</code> 参数：<code>GET /items?sort=-created-time,name</code>。</li><li>字段选择使用 <code>fields</code> 参数：<code>GET /users/1?fields=id,name,email</code>。</li><li>复杂搜索可以使用搜索资源：<code>POST /users/search</code>。</li></ul><p>分页响应中建议包含 <code>items</code> 和 <code>page</code> 信息：</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
  <span class="token property">&quot;items&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1001&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Alice&quot;</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token property">&quot;page&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;limit&quot;</span><span class="token operator">:</span> <span class="token number">20</span><span class="token punctuation">,</span>
    <span class="token property">&quot;nextCursor&quot;</span><span class="token operator">:</span> <span class="token string">&quot;eyJpZCI6MTAwMX0&quot;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>内部系统如果已经统一使用 envelope，也可以把分页信息放在 <code>data</code> 和 <code>meta</code> 中，但字段命名需要在整个系统内保持一致。</p><h2 id="状态码" tabindex="-1"><a class="header-anchor" href="#状态码" aria-hidden="true">#</a> 状态码</h2><p>必须正确使用 HTTP 状态码。HTTP 协议定义的状态码分类如下：</p><table><thead><tr><th>状态码</th><th>分类</th><th>说明</th></tr></thead><tbody><tr><td>1xx</td><td>信息性状态码</td><td>表示临时响应，需要客户端进一步操作</td></tr><tr><td>2xx</td><td>成功状态码</td><td>表示请求成功</td></tr><tr><td>3xx</td><td>重定向状态码</td><td>表示需要客户端进一步操作</td></tr><tr><td>4xx</td><td>客户端错误状态码</td><td>表示客户端请求错误，比如 400 错误请求、401 未认证、403 禁止访问、404 未找到资源、405 方法不允许、429 请求过多</td></tr><tr><td>5xx</td><td>服务器错误状态码</td><td>表示服务器处理请求错误，比如 500 服务器错误，502 网关错误，503 服务不可用，504 网关超时</td></tr></tbody></table><p>在 API 设计开发时，至少需要区分 2xx、4xx、5xx 三种状态码。常用状态码如下：</p><table><thead><tr><th>状态码</th><th>使用场景</th></tr></thead><tbody><tr><td><code>200 OK</code></td><td>请求成功并返回响应体</td></tr><tr><td><code>201 Created</code></td><td>创建资源成功，通常带 <code>Location</code> 响应头</td></tr><tr><td><code>202 Accepted</code></td><td>请求已接受，但异步任务尚未完成</td></tr><tr><td><code>204 No Content</code></td><td>请求成功但不返回响应体，常用于删除或更新</td></tr><tr><td><code>400 Bad Request</code></td><td>请求格式错误、参数类型错误</td></tr><tr><td><code>401 Unauthorized</code></td><td>未认证或认证失效</td></tr><tr><td><code>403 Forbidden</code></td><td>已认证但没有权限</td></tr><tr><td><code>404 Not Found</code></td><td>资源不存在</td></tr><tr><td><code>409 Conflict</code></td><td>当前资源状态冲突，比如重复提交、版本冲突</td></tr><tr><td><code>410 Gone</code></td><td>资源曾经存在但已不可用</td></tr><tr><td><code>412 Precondition Failed</code></td><td>前置条件失败，比如 <code>If-Match</code> 校验失败</td></tr><tr><td><code>422 Unprocessable Entity</code></td><td>请求格式正确，但业务校验失败</td></tr><tr><td><code>429 Too Many Requests</code></td><td>触发限流</td></tr><tr><td><code>500 Internal Server Error</code></td><td>服务端未预期错误</td></tr><tr><td><code>503 Service Unavailable</code></td><td>服务暂不可用，通常可重试</td></tr></tbody></table><p>不要所有错误都返回 <code>200 OK</code>，再用 body 中的 <code>code</code> 区分成功失败。这会让网关、缓存、监控、SDK、重试策略都失去 HTTP 协议本身提供的语义。</p><h2 id="响应体规范" tabindex="-1"><a class="header-anchor" href="#响应体规范" aria-hidden="true">#</a> 响应体规范</h2><p>默认响应格式建议使用 JSON，并通过 <code>Content-Type: application/json</code> 明确声明。对于其他格式，可以通过 <code>Accept</code> 请求头做内容协商，但只有确实存在多格式需求时才需要实现。</p><p>响应体有两种常见风格。</p><p>第一种是直接返回资源，常见于开放 API：</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
  <span class="token property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1001&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Alice&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;email&quot;</span><span class="token operator">:</span> <span class="token string">&quot;alice@example.com&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第二种是统一 envelope，常见于内部业务系统：</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
  <span class="token property">&quot;code&quot;</span><span class="token operator">:</span> <span class="token string">&quot;OK&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;message&quot;</span><span class="token operator">:</span> <span class="token string">&quot;success&quot;</span><span class="token punctuation">,</span>
  <span class="token property">&quot;data&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1001&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Alice&quot;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;requestId&quot;</span><span class="token operator">:</span> <span class="token string">&quot;req-abc-123&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果使用 envelope，要避免让业务码替代 HTTP 状态码。HTTP 状态码表达协议层和请求处理结果，业务码表达更细的业务原因。</p><p>错误响应建议保持统一结构：</p><div class="language-json line-numbers-mode" data-ext="json"><pre class="language-json"><code><span class="token punctuation">{</span>
  <span class="token property">&quot;error&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;code&quot;</span><span class="token operator">:</span> <span class="token string">&quot;USER_NOT_FOUND&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;message&quot;</span><span class="token operator">:</span> <span class="token string">&quot;用户不存在&quot;</span><span class="token punctuation">,</span>
    <span class="token property">&quot;details&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
      <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;userId&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;message&quot;</span><span class="token operator">:</span> <span class="token string">&quot;没有找到对应用户&quot;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token property">&quot;requestId&quot;</span><span class="token operator">:</span> <span class="token string">&quot;req-abc-123&quot;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上结构包含：</p><ul><li><code>code</code>：机器可读的错误码。</li><li><code>message</code>：人类可读的错误描述。</li><li><code>details</code>：可选的错误详情列表，常用于表单校验。</li><li><code>requestId</code>：请求 ID，便于排查日志和链路追踪。</li></ul><p>生产环境不要在错误响应中泄露堆栈、SQL、内部服务地址、密钥、手机号、身份证号等敏感信息。</p><h2 id="幂等与重试" tabindex="-1"><a class="header-anchor" href="#幂等与重试" aria-hidden="true">#</a> 幂等与重试</h2><p>Web API 一定会遇到超时、网络闪断、客户端重试、网关重放等问题。幂等设计的目标是：同一个请求被执行多次，结果仍然符合预期，不产生额外副作用。</p><p>常见原则如下：</p><ul><li><code>GET</code>、<code>PUT</code>、<code>DELETE</code> 应该设计为幂等。</li><li><code>POST</code> 默认不幂等，创建订单、发起支付、发送消息等接口必须额外设计幂等机制。</li><li>对关键写接口支持 <code>Idempotency-Key</code> 请求头，由客户端生成唯一键，服务端保存请求结果。</li><li>服务端需要定义幂等键的作用域和过期时间，比如同一用户、同一接口、24 小时内有效。</li><li>重试必须区分可重试和不可重试错误，不要对所有 4xx 自动重试。</li></ul><p>例如：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>POST /orders
Idempotency-Key: 7f3f3f5b-9f6d-4e5a-b37a-0d2f1c6d3a11
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>如果第一次请求创建成功但客户端没有收到响应，客户端带同一个 <code>Idempotency-Key</code> 重试时，服务端应该返回同一个创建结果，而不是创建第二个订单。</p><h2 id="并发控制" tabindex="-1"><a class="header-anchor" href="#并发控制" aria-hidden="true">#</a> 并发控制</h2><p>多个客户端同时修改同一个资源时，需要考虑并发冲突。常见做法是使用乐观锁：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>GET /users/1001

HTTP/1.1 200 OK
ETag: &quot;v3&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>客户端更新时带上版本：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>PATCH /users/1001
If-Match: &quot;v3&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>如果资源已经被其他请求修改，服务端返回：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>HTTP/1.1 412 Precondition Failed
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>对于订单、库存、审批流等有明确状态机的资源，也可以通过资源版本号或状态条件做业务层校验，并在冲突时返回 <code>409 Conflict</code>。</p><h2 id="请求头规范" tabindex="-1"><a class="header-anchor" href="#请求头规范" aria-hidden="true">#</a> 请求头规范</h2><p>建议在系统内统一以下常用请求头：</p><table><thead><tr><th>Header</th><th>用途</th></tr></thead><tbody><tr><td><code>Authorization</code></td><td>身份认证，比如 Bearer Token</td></tr><tr><td><code>Content-Type</code></td><td>请求体格式，比如 <code>application/json</code></td></tr><tr><td><code>Accept</code></td><td>客户端期望响应格式</td></tr><tr><td><code>Idempotency-Key</code></td><td>幂等键，用于关键写接口</td></tr><tr><td><code>X-Request-Id</code></td><td>请求 ID，便于日志追踪</td></tr><tr><td><code>If-Match</code></td><td>乐观锁更新</td></tr><tr><td><code>Prefer</code></td><td>客户端偏好，比如异步处理、返回最小响应</td></tr></tbody></table><p>请求头命名要稳定，不要在不同团队之间同时出现 <code>X-Request-Id</code>、<code>Request-Id</code>、<code>Trace-Id</code> 三套语义相近但不兼容的字段。</p><h2 id="兼容规范" tabindex="-1"><a class="header-anchor" href="#兼容规范" aria-hidden="true">#</a> 兼容规范</h2><p>在大型系统中，保持 API 的前向兼容和后向兼容非常关键。</p><p>兼容变更通常包括：</p><ul><li>新增可选字段。</li><li>新增可选 query 参数。</li><li>新增枚举值，但客户端必须能忽略未知枚举。</li><li>新增响应头。</li><li>新增资源或新接口。</li></ul><p>不兼容变更通常包括：</p><ul><li>删除字段。</li><li>修改字段类型。</li><li>修改字段含义。</li><li>修改必填规则。</li><li>修改默认排序或分页语义。</li><li>修改错误码含义。</li><li>将原本同步成功的接口改为异步接受。</li></ul><p>比如将 <code>status</code> 字段类型从 <code>int</code> 改为 <code>string</code> 是不兼容变更，更稳妥的做法是新增 <code>statusText</code> 字段，并保留旧字段一段时间。</p><p>当兼容成本过高时，需要升级 API 版本。常见版本策略有三种：</p><ul><li>路径版本：<code>/v1/orders</code>，最直观，也最常见。</li><li>Header 版本：<code>Accept: application/vnd.example.v2+json</code>，更灵活但调试成本更高。</li><li>参数版本：<code>/orders?version=2</code>，不太推荐，容易污染业务参数。</li></ul><p>版本升级不是改个路径就结束，还需要提供迁移窗口、变更说明、灰度策略、监控指标和下线计划。</p><h2 id="设计检查清单" tabindex="-1"><a class="header-anchor" href="#设计检查清单" aria-hidden="true">#</a> 设计检查清单</h2><p>最后给一份 API 设计检查清单：</p><ul><li>资源名是否是名词、复数、小写、短横线分隔。</li><li>常规 CRUD 是否使用了正确 HTTP 方法。</li><li>特殊 Action 是否有明确业务含义，是否真的不能建模为资源。</li><li>列表接口是否有分页上限。</li><li>错误是否使用了合适 HTTP 状态码。</li><li>错误响应是否包含稳定错误码和 <code>requestId</code>。</li><li>写接口是否考虑幂等和重试。</li><li>更新接口是否考虑并发冲突。</li><li>字段新增、删除、枚举扩展是否满足兼容策略。</li><li>API 是否有认证、授权、限流和审计要求。</li></ul><p>好的 API 设计不是追求“最 RESTful”，而是让资源边界、协议语义和业务行为清晰稳定。外部调用者不关心服务端用了什么框架，他们关心的是接口是否一致、可预测、可排错、可演进。</p>`,78))])}const h=a(u,[["render",m],["__file","rest.html.vue"]]);export{h as default};
