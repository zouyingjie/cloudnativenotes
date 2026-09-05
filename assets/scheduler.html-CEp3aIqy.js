import{_ as p,r as i,o,c as u,a as l,b as s,d as a,e as t}from"./app-BTSCaQUU.js";const c={},r={href:"https://static.googleusercontent.com/media/research.google.com/zh-CN//pubs/archive/43438.pdf",target:"_blank",rel:"noopener noreferrer"},d={href:"https://blog.csdn.net/Ahri_J/article/details/151409125",target:"_blank",rel:"noopener noreferrer"},k={href:"https://kubernetes.io/docs/reference/scheduling/policies/",target:"_blank",rel:"noopener noreferrer"},v={href:"https://kubernetes.io/docs/concepts/scheduling-eviction/scheduling-framework/",target:"_blank",rel:"noopener noreferrer"},m={href:"https://github.com/kubernetes-sigs/scheduler-plugins",target:"_blank",rel:"noopener noreferrer"},b={href:"https://kubernetes.io/docs/reference/scheduling/config/#multiple-profiles",target:"_blank",rel:"noopener noreferrer"},y={href:"https://github.com/ray-project/ray",target:"_blank",rel:"noopener noreferrer"},g={href:"https://koordinator.sh/",target:"_blank",rel:"noopener noreferrer"};function h(f,n){const e=i("ExternalLinkIcon");return o(),u("div",null,[n[30]||(n[30]=l(`<h1 id="调度原理" tabindex="-1"><a class="header-anchor" href="#调度原理" aria-hidden="true">#</a> 调度原理</h1><p>所谓调度就是按照一系列的需求、规则，将 Pod 调度至合适的 Node 上，这个过程是由 kube-scheduler 组件负责完成。下面是 Kubernetes 提供的一些调度方式：</p><h3 id="手动调度" tabindex="-1"><a class="header-anchor" href="#手动调度" aria-hidden="true">#</a> 手动调度</h3><p>Pod 的定义中有 nodeName 属性，kube-scheduler 就是在选择出最合适的节点后修改 Pod 的 nodeName 来指定 Pod 的运行节点。我们可以在定义 Pod 时直接设置。示例如下：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> nginx
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> nginx
    <span class="token key atrule">image</span><span class="token punctuation">:</span> nginx
  <span class="token comment"># 指定节点名称，Pod 会被调度到 node02 节点</span>
  <span class="token key atrule">nodeName</span><span class="token punctuation">:</span> node02
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="nodeselector-节点选择器" tabindex="-1"><a class="header-anchor" href="#nodeselector-节点选择器" aria-hidden="true">#</a> NodeSelector 节点选择器</h3><p>Kubernetes 允许使用 label 标签对资源进行标识。可以通过在 Node 打 label，然后使用 nodeSelector 匹配这些 label，将 Pod 调度到对应节点。</p><p>比如我们希望某些执行 IO 任务的 Pod 调度到磁盘类型为 ssd 的 Node 上，可以先在 Node 上打标签 <code>disk-type: ssd</code>，然后设置 Pod 的 nodeSelector 为 <code>disk-type: ssd</code>，示例如下：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> nginx
  <span class="token key atrule">labels</span><span class="token punctuation">:</span>
    <span class="token key atrule">env</span><span class="token punctuation">:</span> test
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> nginx
    <span class="token key atrule">image</span><span class="token punctuation">:</span> nginx
    <span class="token key atrule">imagePullPolicy</span><span class="token punctuation">:</span> IfNotPresent
  <span class="token comment"># 配置 nodeSelector，将 Pod 调度到 disk-type 为 ssd 的 Node 上</span>
  <span class="token key atrule">nodeSelector</span><span class="token punctuation">:</span>
    <span class="token key atrule">disk-type</span><span class="token punctuation">:</span> ssd
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="node-pod-affinity-亲和性调度" tabindex="-1"><a class="header-anchor" href="#node-pod-affinity-亲和性调度" aria-hidden="true">#</a> Node &amp; Pod Affinity 亲和性调度</h3><p>nodeSelector 只能简单的根据标签是否相等来进行调度，会被逐渐弃用。现在更推荐使用拥有更强大的节点关联规则，调度更加灵活的 <code>Node/Pod Affinity</code> （亲和度） 进行调度。 亲和性规则分为 <code>Node Affinity</code> 节点亲和度和 <code>Pod Affinity</code> Pod 亲和度两种。</p><p>首先我们来看 <code>Node Affinity</code> （节点亲和度）的示例：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> with<span class="token punctuation">-</span>node<span class="token punctuation">-</span>affinity
<span class="token key atrule">Spec</span><span class="token punctuation">:</span>
  <span class="token comment"># 设置亲和度</span>
  <span class="token key atrule">affinity</span><span class="token punctuation">:</span>
    <span class="token comment"># 设置节点亲和度</span>
    <span class="token key atrule">nodeAffinity</span><span class="token punctuation">:</span>
      <span class="token comment"># 指定 affinity 类型</span>
      <span class="token key atrule">requiredDuringSchedulingIgnoredDuringExecution</span><span class="token punctuation">:</span>
        <span class="token comment"># 指定若干个规则</span>
        <span class="token key atrule">nodeSelectorTerms</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> <span class="token key atrule">matchExpressions</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> kubernetes.io/e2e<span class="token punctuation">-</span>az<span class="token punctuation">-</span>name
            <span class="token key atrule">operator</span><span class="token punctuation">:</span> In
            <span class="token key atrule">values</span><span class="token punctuation">:</span>
            <span class="token punctuation">-</span> e2e<span class="token punctuation">-</span>az1
            <span class="token punctuation">-</span> e2e<span class="token punctuation">-</span>az2
      <span class="token key atrule">preferredDuringSchedulingIgnoredDuringExecution</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">weight</span><span class="token punctuation">:</span> <span class="token number">1</span>
        <span class="token key atrule">preference</span><span class="token punctuation">:</span>
          <span class="token key atrule">matchExpressions</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> another<span class="token punctuation">-</span>node<span class="token punctuation">-</span>label<span class="token punctuation">-</span>key
            <span class="token key atrule">operator</span><span class="token punctuation">:</span> In
            <span class="token key atrule">values</span><span class="token punctuation">:</span>
            <span class="token punctuation">-</span> another<span class="token punctuation">-</span>node<span class="token punctuation">-</span>label<span class="token punctuation">-</span>value
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> with<span class="token punctuation">-</span>node<span class="token punctuation">-</span>affinity
    <span class="token key atrule">image</span><span class="token punctuation">:</span> k8s.gcr.io/pause<span class="token punctuation">:</span><span class="token number">2.0</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们来看下各个配置的含义，首先 Node Affinity 要指定规则类型，有两种类型的亲和规则：</p><ul><li><p><code>requiredDuringSchedulingIgnoredDuringExecution</code>：表示节点只能在满足匹配规则的情况下，Pod 才会被调度上去。</p></li><li><p><code>preferredDuringSchedulingIgnoredDuringExecution</code>：表示会优先将 Pod 调度到那些满足匹配规则的节点上，实在没有的话也可以调度到其他节点。</p></li></ul><p>虽然 affinity 规则类型的名字看着很长，但其语义还是很清晰的，由 <code>Affinity</code> 类型 和 作用时期 组成。</p><table><thead><tr><th></th><th>DuringScheduling Pod 调度期间</th><th>DuringExecution Pod 运行期间</th></tr></thead><tbody><tr><td>类型 1</td><td>required</td><td>ignored</td></tr><tr><td>类型 2</td><td>preferred</td><td>ignored</td></tr></tbody></table><ul><li><p><code>DuringScheduling</code> 和 <code>DuringExecution</code> 分别表示对调度期和运行期的要求。调度期只会在新 Pod 创建时生效，而运行期则会影响正在运行的 Pod。</p></li><li><p><code>required</code> 表示必须满足条件；<code>preferred</code> 表示尽量满足，也就是说会优先将 Pod 调度到满足亲和性规则的节点上，如果找不到也可以调度到其他节点；<code>Ignored</code> 表示忽略已经存在的 Pod 的亲和性规则。</p></li></ul><p>可以看到两种调度规则对 <code>DuringExecution</code> 都是 <code>ignored</code>，也就是说已经运行中的 Pod 会继续运行，即使 node label 发生了变化，也不会被重新调度。之前 Kubernetes 曾计划引入 <code>requiredDuringSchedulingRequiredDuringExecution</code> 类型的规则，会对运行中的 Pod 进行重新调度，但并没有后续。</p><p>NodeAffinity 的 Operator 支持 <code>In, NotIn, Exists, DoesNotExist, Gt, Lt</code> 这几种操作，我们可以通过 NotIn、DoesNotExist 支持反亲和操作。</p><p>另外有下面几条亲和规则需要注意：</p><ul><li><p>如果同时指定 nodeSelector 和 nodeAffinity，则必须同时满足两个条件才能将Pod调度到候选节点。</p></li><li><p>如果 nodeAffinity 的某个类型关联了多个 nodeSelectorTerms，只需要满足其中之一，就可以将 Pod 调度到节点。</p></li><li><p>如果 nodeSelectorTerms 下有多个 matchExpressions，则只有在满足所有matchExpressions的情况下，才可以将 Pod 调度到一个节点上。</p></li></ul><p>最后对于 <code>preferredDuringSchedulingIgnoredDuringExecution</code> 还会有一个 <code>weight</code> 权重字段，取值范围为 1-100，用来在调度时结合其他条件计算 Node 的优先级，Pod 最终会调度到优先级最高的 Node 上。</p><p>除了节点亲和度，还有 Pod 亲和度、反亲和度（anti-affinity）来指定使 Pod 优先与某些 Pod 部署到一起或者不与某些 Pod 部署到一起，语法和 NodeAffinity 类似，这里不在赘述。下面是一个官网的例子：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> with<span class="token punctuation">-</span>pod<span class="token punctuation">-</span>affinity
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">affinity</span><span class="token punctuation">:</span>
    <span class="token comment"># Pod 亲和度，与标签匹配的 Pod 部署在一起</span>
    <span class="token key atrule">podAffinity</span><span class="token punctuation">:</span>
      <span class="token key atrule">requiredDuringSchedulingIgnoredDuringExecution</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">labelSelector</span><span class="token punctuation">:</span>
          <span class="token key atrule">matchExpressions</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> security
            <span class="token key atrule">operator</span><span class="token punctuation">:</span> In
            <span class="token key atrule">values</span><span class="token punctuation">:</span>
            <span class="token punctuation">-</span> S1
        <span class="token key atrule">topologyKey</span><span class="token punctuation">:</span> topology.kubernetes.io/zone
    <span class="token comment"># 反亲和，优先部署在没有对应标签的 Pod 运行的节点上</span>
    <span class="token key atrule">podAntiAffinity</span><span class="token punctuation">:</span>
      <span class="token key atrule">preferredDuringSchedulingIgnoredDuringExecution</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">weight</span><span class="token punctuation">:</span> <span class="token number">100</span>
        <span class="token key atrule">podAffinityTerm</span><span class="token punctuation">:</span>
          <span class="token key atrule">labelSelector</span><span class="token punctuation">:</span>
            <span class="token key atrule">matchExpressions</span><span class="token punctuation">:</span>
            <span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> security
              <span class="token key atrule">operator</span><span class="token punctuation">:</span> In
              <span class="token key atrule">values</span><span class="token punctuation">:</span>
              <span class="token punctuation">-</span> S2
          <span class="token key atrule">topologyKey</span><span class="token punctuation">:</span> topology.kubernetes.io/zone
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> with<span class="token punctuation">-</span>pod<span class="token punctuation">-</span>affinity
    <span class="token key atrule">image</span><span class="token punctuation">:</span> k8s.gcr.io/pause<span class="token punctuation">:</span><span class="token number">2.0</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>不过在官网的建议中，Pod 亲和、反亲和的调度规则会降低集群的调度速度，因此不建议在超过数百个节点中的集群中使用。</p><h3 id="resource-request" tabindex="-1"><a class="header-anchor" href="#resource-request" aria-hidden="true">#</a> Resource Request</h3><p>在定义 Pod 时可以选择性地为每个容器设定所需要的资源数量。 最常见的可设定资源是 CPU 和内存（RAM）大小，从而使得 Pod 调度到符合资源需求的节点上，示例如下：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> frontend
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> app
    <span class="token key atrule">image</span><span class="token punctuation">:</span> images.my<span class="token punctuation">-</span>company.example/app<span class="token punctuation">:</span>v4
    <span class="token key atrule">env</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> MYSQL_ROOT_PASSWORD
      <span class="token key atrule">value</span><span class="token punctuation">:</span> <span class="token string">&quot;password&quot;</span>
    <span class="token key atrule">resources</span><span class="token punctuation">:</span>
      <span class="token key atrule">requests</span><span class="token punctuation">:</span>
        <span class="token key atrule">memory</span><span class="token punctuation">:</span> <span class="token string">&quot;64Mi&quot;</span>
        <span class="token key atrule">cpu</span><span class="token punctuation">:</span> <span class="token string">&quot;250m&quot;</span>
      <span class="token key atrule">limits</span><span class="token punctuation">:</span>
        <span class="token key atrule">memory</span><span class="token punctuation">:</span> <span class="token string">&quot;128Mi&quot;</span>
        <span class="token key atrule">cpu</span><span class="token punctuation">:</span> <span class="token string">&quot;500m&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里有 requests 和 limits 两个设置项：</p><ul><li><p><strong>requests</strong>： 资源请求值，kube-scheduler 根据该值进行调度决策，在执行调度时，会以 Pod 中所有容器的 request 值的总和作为调度依据。</p></li><li><p><strong>limits</strong>：资源使用配额，给 cGroups 使用，用来限制容器资源的使用。</p></li></ul><p><strong>Pod 对特定资源类型的请求/约束值是 Pod 中各容器对该类型资源的请求/约束值的总和。</strong></p><p>我们看下面的例子， Pod 有两个 Container，每个 Container 请求 500 毫核 CPU 和 1GB 内存， 每个容器的资源约束为 2000 毫核 CPU 和 2GB 内存。 因此 kube-scheduler 会认为该 Pod 的资源请求数为两个容器的 request 之和，即 1 核 CPU 和 2GB 内存。kube-scheduler 会去寻找满足该资源请求的节点。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> frontend
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> app
    <span class="token key atrule">image</span><span class="token punctuation">:</span> images.my<span class="token punctuation">-</span>company.example/app<span class="token punctuation">:</span>v4
    <span class="token key atrule">env</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> MYSQL_ROOT_PASSWORD
      <span class="token key atrule">value</span><span class="token punctuation">:</span> <span class="token string">&quot;password&quot;</span>
    <span class="token key atrule">resources</span><span class="token punctuation">:</span>
      <span class="token key atrule">requests</span><span class="token punctuation">:</span>
        <span class="token key atrule">memory</span><span class="token punctuation">:</span> <span class="token string">&quot;1Gi&quot;</span>
        <span class="token key atrule">cpu</span><span class="token punctuation">:</span> <span class="token string">&quot;500m&quot;</span>
      <span class="token key atrule">limits</span><span class="token punctuation">:</span>
        <span class="token key atrule">memory</span><span class="token punctuation">:</span> <span class="token string">&quot;2Gi&quot;</span>
        <span class="token key atrule">cpu</span><span class="token punctuation">:</span> <span class="token string">&quot;2000m&quot;</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> log<span class="token punctuation">-</span>aggregator
    <span class="token key atrule">image</span><span class="token punctuation">:</span> images.my<span class="token punctuation">-</span>company.example/log<span class="token punctuation">-</span>aggregator<span class="token punctuation">:</span>v6
    <span class="token key atrule">resources</span><span class="token punctuation">:</span>
      <span class="token key atrule">requests</span><span class="token punctuation">:</span>
        <span class="token key atrule">memory</span><span class="token punctuation">:</span> <span class="token string">&quot;1Gi&quot;</span>
        <span class="token key atrule">cpu</span><span class="token punctuation">:</span> <span class="token string">&quot;500m&quot;</span>
      <span class="token key atrule">limits</span><span class="token punctuation">:</span>
        <span class="token key atrule">memory</span><span class="token punctuation">:</span> <span class="token string">&quot;2Gi&quot;</span>
        <span class="token key atrule">cpu</span><span class="token punctuation">:</span> <span class="token string">&quot;2000m&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,34)),s("p",null,[n[1]||(n[1]=a("谷歌在其 ",-1)),s("a",r,[n[0]||(n[0]=a("Brog",-1)),t(e)]),n[2]||(n[2]=a(" 论文中指出，在实际操作中人们往往会过度请求资源。大多数实际运行的应用真正用到的资源往往远小于其所请求的配额。",-1))]),n[31]||(n[31]=l(`<p>Kubernetes 使用上述两个配置项来设定资源的使用，并且基于该配置项确定 Pod 的服务质量等级（Quality of Service Level，QoS Level）：</p><p>QoS 等级有三类，基于 limits 和 requests 确定：</p><ul><li><p><strong>Guaranteed</strong>：最高服务等级，当 Pod 中<strong>所有容器</strong>都设置了 limits 和 requests 并且值相等时，其 QoS 等级是 Guaranteed。<strong>资源不足时优先保证该类 Pod 的运行。</strong></p></li><li><p><strong>Burstable</strong>：Pod 中有容器只设置了 requests 没有设置 limits，或者 requests 的值小于 limits 值，此时 QoS 为 Burstable。</p></li><li><p><strong>BestEffort</strong>: Pod 中容器都没有设置 limits 和 requests，资源不足时优先杀死这类 Pod。</p></li></ul><p>简单来说，就是只有 Pod 中所有容器都达到 Guaranteed 级别，Pod 才会达到 Guaranteed 级别。而只要有一个容器没有达到 Guaranteed 级别，Pod 就会降到 Burstable 级别。如果有一个容器没有设置 limits 和 requests，则 Pod 会降到 BestEffort 级别。</p><table><thead><tr><th>CPU requests vs limits</th><th>Memory requests vs limits</th><th>Container QoS</th></tr></thead><tbody><tr><td>None set</td><td>None set</td><td>BestEffort</td></tr><tr><td>None set</td><td>Requests &lt; Limits</td><td>Burstable</td></tr><tr><td>None set</td><td>Requests = Limits</td><td>Burstable</td></tr><tr><td>Requests &lt; Limits</td><td>None set</td><td>Burstable</td></tr><tr><td>Requests &lt; Limits</td><td>Requests &lt; Limits</td><td>Burstable</td></tr><tr><td>Requests &lt; Limits</td><td>Requests = Limits</td><td>Burstable</td></tr><tr><td>Requests = Limits</td><td>Requests = Limits</td><td>Guaranteed</td></tr></tbody></table><p>通过这种方式，Kubernetes 鼓励我们按实际需要分配资源，如果我们随意设置甚至不设置资源，则 Kubernetes 会做出“惩罚”，资源不足时优先将这类 Pod 驱逐。</p><h3 id="taints-tolerations" tabindex="-1"><a class="header-anchor" href="#taints-tolerations" aria-hidden="true">#</a> Taints &amp; Tolerations</h3><p>上面提到的规则基本都是表示将 Pod 调度到哪个节点，而对于某些节点，我们希望 Pod 不要调度到该节点上去。此时可以通过给 Node 打 Taint(污点) 的方式实现。</p><p>给 Node 打污点的命令格式如下：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl taint nodes <span class="token function">node</span> name <span class="token assign-left variable">key</span><span class="token operator">=</span>value:taint effect
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li><p><strong>key</strong> 代表 taint 的键</p></li><li><p><strong>value</strong> 代表 taint 的值，可以省略</p></li><li><p><strong>taint effect</strong> 代表 taint 的效果，有下面三个可选值</p><ul><li><strong>NoSchedule：</strong> 如果 Pod 没有容忍该 taint，则不会被调度到打上该 taint 的 Node 上，但已运行的 Pod 不受影响。</li><li><strong>PreferNoSchedule：</strong> 如果 Pod 没有容忍该 taint，则尽量不让其调度到打上该 taint 的节点上，实在没有其他 Node 可用了才会调度过去。</li><li><strong>NoExecute：</strong> 前两种效果影响的只是调度期，而该效果会影响运行期，如果向节点添加了该作用的 taint，则已运行在该 Node 上的没有忍受该 taint 的 Pod 会被驱逐。</li></ul></li></ul><p>下面我们来看几个示例。</p><ol><li>添加、查看与移除污点</li></ol><p>给 node2 节点添加两个污点</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># key 为 node-type，value 为 production，效果为 NoSchedule</span>
$ kubectl taint <span class="token function">node</span> node2 node-type<span class="token operator">=</span>production:NoSchedule
node/node2 tainted

<span class="token comment"># key 为 isProduct，value 省略，效果为 NoSchedule</span>
$ kubectl taint <span class="token function">node</span> node2 <span class="token assign-left variable">isProduct</span><span class="token operator">=</span>:NoSchedule
node/node2 tainted
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>新建两个 Pod 并且没有容忍上述的污点，可以看到新的 Pod 都调度到了 vm-0-4-ubuntu 节点上。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl run redis <span class="token parameter variable">--image</span><span class="token operator">=</span>redis <span class="token parameter variable">--labels</span><span class="token operator">=</span><span class="token string">&quot;app=redis&quot;</span>
pod/redis created

$ kubectl run nginx <span class="token parameter variable">--image</span><span class="token operator">=</span>nginx
pod/nginx created

$ kubectl get pods <span class="token parameter variable">-o</span> wide
NAME    READY   STATUS    RESTARTS   AGE   IP          NODE            NOMINATED NODE   READINESS GATES
nginx   <span class="token number">1</span>/1     Running   <span class="token number">0</span>          55s   <span class="token number">10.32</span>.0.7   vm-0-4-ubuntu   <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>           <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>
redis   <span class="token number">1</span>/1     Running   <span class="token number">0</span>          58s   <span class="token number">10.32</span>.0.8   vm-0-4-ubuntu   <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>           <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>现在去掉 node2 上的两个污点，然后将 vm-0-4-ubuntu 节点打上 NoExecute 效果的污点，看上面的 Pod 是否被驱逐。</p><p>移除污点的方式很简单，在污点最后面加 - 即可，如下：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl taint <span class="token function">node</span> node2 <span class="token assign-left variable">isProduct</span><span class="token operator">=</span>:NoSchedule-
node/node2 untainted
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>现在将 vm-0-4-ubuntu 打上新的效果为 NoExecute 的污点</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl taint <span class="token function">node</span> vm-0-4-ubuntu node-type<span class="token operator">=</span>production:NoExecute
node/vm-0-4-ubuntu tainted
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到 Pod 已经被驱逐了，如果 Pod 是由 Deployment 等控制的，那应该会重新调度到 node2 上。</p><ol start="2"><li>设置 Pod 容忍污点</li></ol><p>如果我们不想移除污点但是依然想让 Pod 调度到该节点的话，就需要给 Pod 添加 Tolerations（容忍度） 了。示例如下：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> nginx
  <span class="token key atrule">labels</span><span class="token punctuation">:</span>
    <span class="token key atrule">env</span><span class="token punctuation">:</span> test
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> nginx
    <span class="token key atrule">image</span><span class="token punctuation">:</span> nginx
    <span class="token key atrule">imagePullPolicy</span><span class="token punctuation">:</span> IfNotPresent
  <span class="token key atrule">tolerations</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> <span class="token string">&quot;key1&quot;</span>
    <span class="token key atrule">operator</span><span class="token punctuation">:</span> <span class="token string">&quot;Equal&quot;</span>
    <span class="token key atrule">value</span><span class="token punctuation">:</span> <span class="token string">&quot;value1&quot;</span>
    <span class="token key atrule">effect</span><span class="token punctuation">:</span> <span class="token string">&quot;NoSchedule&quot;</span>
  <span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> <span class="token string">&quot;example-key&quot;</span>
    <span class="token key atrule">operator</span><span class="token punctuation">:</span> <span class="token string">&quot;Exists&quot;</span>
    <span class="token key atrule">effect</span><span class="token punctuation">:</span> <span class="token string">&quot;NoSchedule&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>operator 有两种：</p><ul><li><strong>Equal</strong>：这是默认值，表示容忍某个 key 等于 value，并且 effect 为对应效果的污点。</li><li><strong>Exists</strong>：用于判断没有 value 的污点，表示容忍如果某个 key 存在且 effect 为对应效果的污点。</li></ul><p>另外这里还有两种特殊情况:</p><ul><li>key 为空并且 operator 为 Exists，表示容忍所有污点</li><li>effect 为空，表示容忍所有与 key 匹配的污点。</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code>  <span class="token key atrule">tolerations</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> <span class="token string">&quot;key1&quot;</span>
    <span class="token key atrule">operator</span><span class="token punctuation">:</span> <span class="token string">&quot;Equal&quot;</span>
    <span class="token key atrule">value</span><span class="token punctuation">:</span> <span class="token string">&quot;value1&quot;</span>
    <span class="token key atrule">effect</span><span class="token punctuation">:</span> <span class="token string">&quot;&quot;</span>
  <span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> <span class="token string">&quot;&quot;</span>
    <span class="token key atrule">operator</span><span class="token punctuation">:</span> <span class="token string">&quot;Exists&quot;</span>
    <span class="token key atrule">effect</span><span class="token punctuation">:</span> <span class="token string">&quot;NoSchedule&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>针对 NoExecute 类型的污点，还有一个 <code>tolerationSeconds</code> 的配置，表示可以容忍某个污点多长时间。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">tolerations</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> <span class="token string">&quot;key1&quot;</span>
  <span class="token key atrule">operator</span><span class="token punctuation">:</span> <span class="token string">&quot;Equal&quot;</span>
  <span class="token key atrule">value</span><span class="token punctuation">:</span> <span class="token string">&quot;value1&quot;</span>
  <span class="token key atrule">effect</span><span class="token punctuation">:</span> <span class="token string">&quot;NoExecute&quot;</span>
  <span class="token key atrule">tolerationSeconds</span><span class="token punctuation">:</span> <span class="token number">3600</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面我们提到如果打上 NoExecute 效果的污点，会将正在运行的没有容忍该污点的 Pod 驱逐出去。如果加上 tolerationSeconds 配置，则 Pod 会继续运行，如果超出 tolerationSeconds 时间后还没有结束的话则会被驱逐。</p><p>比如，一个使用了很多本地状态的应用程序在网络断开时，仍然希望停留在当前节点上运行一段较长的时间， 愿意等待网络恢复以避免被驱逐。在这种情况下，Pod 的容忍度可能是下面这样的：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">tolerations</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> <span class="token string">&quot;node.kubernetes.io/unreachable&quot;</span>
  <span class="token key atrule">operator</span><span class="token punctuation">:</span> <span class="token string">&quot;Exists&quot;</span>
  <span class="token key atrule">effect</span><span class="token punctuation">:</span> <span class="token string">&quot;NoExecute&quot;</span>
  <span class="token key atrule">tolerationSeconds</span><span class="token punctuation">:</span> <span class="token number">6000</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="pod-驱逐" tabindex="-1"><a class="header-anchor" href="#pod-驱逐" aria-hidden="true">#</a> Pod 驱逐</h3><p>在基于资源进行调度一节中提到，当资源不足时 Kubernetes 会将 QoS 等级较低的 Pod 杀死，该过程在 Kubernetes 中称为驱逐（Eviction）。</p><p>计算机资源可以分为两类：</p><ul><li><strong>可压缩资源</strong>：像 CPU 这类资源，当资源不足时，Pod 会运行变慢，但不会被杀死。</li><li><strong>不可压缩资源</strong>：像磁盘、内存等资源，当资源不足时 Pod 会被杀死，比如发生内存溢出时 Pod 被直接终止。</li></ul><p>Kubernetes 默认设置了一系列阈值，当不可压缩资源达到阈值时，kubelet 就会执行驱逐机制。主要的阈值有下面几个：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>- memory.available <span class="token operator">&lt;</span> 100Mi <span class="token comment"># 可用内存</span>
- nodefs.available <span class="token operator">&lt;</span> <span class="token number">10</span>%   <span class="token comment"># 可用磁盘空间</span>
- nodefs.inodesFree <span class="token operator">&lt;</span> <span class="token number">5</span>%   <span class="token comment"># 文件系统可用 inode 是数量</span>
- imagefs.available <span class="token operator">&lt;</span> <span class="token number">15</span>%  <span class="token comment"># 可用的容器运行时镜像存储空间</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>另外驱逐机制中还有<code>软驱逐（soft eviction）</code>、<code>硬驱逐（hard eviction）</code> 以及<code> 优雅退出期（grace period）</code>的概念:</p><ul><li><p><strong>软驱逐</strong>：一个较低的警戒线，资源持续超过该警戒线一段时间后，会触发 Pod 的优雅退出，系统通知 Pod 做必要的善后清理，然后自行结束。超出优雅退出期后，系统会强行杀死未自动退出的 Pod。</p></li><li><p><strong>硬驱逐</strong>：配置一个较高的警戒线，一旦触及此红线，则立即强行杀死 Pod，不会优雅退出。</p></li></ul><p>之所以出现这样更加细化的概念，是因为驱逐 Pod 是一种危险行为，可能导致服务中断，因此需要兼顾系统短时间的资源波动和资源剧烈消耗影响到高服务质量的 Pod 甚至集群节点的情况。</p><p>Kubelet 启动时默认配置文件是 <code>/etc/kubernetes/kubelet-config.yaml</code>，可以通过修改该文件 然后重启 Kubelet 来修改上述阈值配置，示例如下：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> kubelet.config.k8s.io/v1beta1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> KubeletConfiguration
<span class="token key atrule">nodeStatusUpdateFrequency</span><span class="token punctuation">:</span> <span class="token string">&quot;10s&quot;</span>
<span class="token key atrule">failSwapOn</span><span class="token punctuation">:</span> <span class="token boolean important">True</span>
<span class="token punctuation">...</span>
<span class="token punctuation">...</span>
<span class="token comment"># 配置硬驱逐阈值</span>
<span class="token key atrule">eventRecordQPS</span><span class="token punctuation">:</span> <span class="token number">5</span>
<span class="token key atrule">evictionHard</span><span class="token punctuation">:</span>
  <span class="token key atrule">nodefs.available</span><span class="token punctuation">:</span>  <span class="token string">&quot;5%&quot;</span>
  <span class="token key atrule">imagefs.available</span><span class="token punctuation">:</span>  <span class="token string">&quot;5%&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="调度过程" tabindex="-1"><a class="header-anchor" href="#调度过程" aria-hidden="true">#</a> 调度过程</h3>`,48)),s("p",null,[n[4]||(n[4]=a("了解了 Kubernetes 的调度规则后，我们再来看下 Kubernetes 调度过程是怎样实现的。这里对过程最简要分析，更详细的流程可以参考的文章 ",-1)),s("a",d,[n[3]||(n[3]=a("【kubernetes 源码剖析】kube-scheduler 调度流程",-1)),t(e)]),n[5]||(n[5]=a("。",-1))]),n[32]||(n[32]=s("p",null,"Kubernetes 调度过程图所示：",-1)),n[33]||(n[33]=s("p",null,[s("img",{src:"https://i-blog.csdnimg.cn/blog_migrate/6164aa5fb3ffdc41ac32fc84c1eadc48.png",alt:"在这里插入图片描述"})],-1)),n[34]||(n[34]=s("p",null,"图片来自：https://icyfenix.cn/immutable-infrastructure/schedule/hardware-schedule.html",-1)),n[35]||(n[35]=s("p",null,"主要有下面几个步骤：",-1)),s("ul",null,[n[13]||(n[13]=s("li",null,[s("p",null,[s("strong",null,"Informer Loop"),a(": 持续监听 etcd 中的资源信息，当 Pod、Node 信息发生变化时触发监听，更新调度缓存和调度队列。")])],-1)),s("li",null,[n[12]||(n[12]=s("p",null,[s("strong",null,"Scheduler Loop"),a(": 该步骤主要是从优先级调度队列中获取要调度的 Pod，并基于调度缓存中的信息进行调度决策，主要有如下过程：")],-1)),s("ul",null,[n[10]||(n[10]=s("li",null,[s("p",null,[s("strong",null,"Predicates: 过滤阶段"),a("，本质上是一组节点过滤器，基于一系列的过滤策略，包括我们上面提到的这些调度规则的设定，比如亲和度都是在这里起作用。只有满足条件的节点才会被筛选出来。")])],-1)),s("li",null,[s("p",null,[n[7]||(n[7]=s("strong",null,"Priorities: 打分阶段",-1)),n[8]||(n[8]=a("，所有可用节点被过滤筛选出来后会进入打分阶段，基于各种打分规则给 Node 打分以选出最合适的节点后进行调度。具体的过滤、打分策略可以参考文档 ",-1)),s("a",k,[n[6]||(n[6]=a("Scheduling Policies",-1)),t(e)]),n[9]||(n[9]=a("。",-1))])]),n[11]||(n[11]=s("li",null,[s("p",null,[s("strong",null,"Bind"),a("：经过过滤打分最终选出合适的 Node 后，会更新本地调度缓存闭关通过异步请求的方式更新 Etcd 中 Pod 的 nodeName 属性。这样如果调度成功则本地缓存与 Etcd 中的信息向保持一致，如果调度失败，则会通过 Informer 循环更新本地缓存，重新调度。")])],-1))])])]),n[36]||(n[36]=l(`<p>另外为了提升调度性能：</p><ul><li>调度过程全程只和本地缓存通信，只有在最后的 bind 阶段才会向 api-server 发起异步通信。</li><li>调度器不会处理所有的节点，而是选择一部分节点进行过滤、打分操作。</li></ul><h3 id="自定义调度器" tabindex="-1"><a class="header-anchor" href="#自定义调度器" aria-hidden="true">#</a> 自定义调度器</h3><p>除了默认的 Kubernetes 默认提供的调度器，我们还可以自定义调度器并在集群中部署多个调度器，然后在创建 Pod 选择使用的调度器。</p><p>下面是一个基于官方的 scheduler 的例子，在集群中部署另一个调度器。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> apps/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Deployment
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">labels</span><span class="token punctuation">:</span>
    <span class="token key atrule">component</span><span class="token punctuation">:</span> scheduler
    <span class="token key atrule">tier</span><span class="token punctuation">:</span> control<span class="token punctuation">-</span>plane
  <span class="token key atrule">name</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>scheduler
  <span class="token key atrule">namespace</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>system
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">selector</span><span class="token punctuation">:</span>
    <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
      <span class="token key atrule">component</span><span class="token punctuation">:</span> scheduler
      <span class="token key atrule">tier</span><span class="token punctuation">:</span> control<span class="token punctuation">-</span>plane
  <span class="token key atrule">replicas</span><span class="token punctuation">:</span> <span class="token number">1</span>
  <span class="token key atrule">template</span><span class="token punctuation">:</span>
    <span class="token key atrule">metadata</span><span class="token punctuation">:</span>
      <span class="token key atrule">labels</span><span class="token punctuation">:</span>
        <span class="token key atrule">component</span><span class="token punctuation">:</span> scheduler
        <span class="token key atrule">tier</span><span class="token punctuation">:</span> control<span class="token punctuation">-</span>plane
        <span class="token key atrule">version</span><span class="token punctuation">:</span> second
    <span class="token key atrule">spec</span><span class="token punctuation">:</span>
      <span class="token key atrule">serviceAccountName</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>scheduler
      <span class="token key atrule">containers</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">command</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> /usr/local/bin/kube<span class="token punctuation">-</span>scheduler
        <span class="token punctuation">-</span> <span class="token punctuation">-</span><span class="token punctuation">-</span>config=/etc/kubernetes/my<span class="token punctuation">-</span>scheduler/my<span class="token punctuation">-</span>scheduler<span class="token punctuation">-</span>config.yaml
        <span class="token key atrule">image</span><span class="token punctuation">:</span> gcr.io/my<span class="token punctuation">-</span>gcp<span class="token punctuation">-</span>project/my<span class="token punctuation">-</span>kube<span class="token punctuation">-</span>scheduler<span class="token punctuation">:</span><span class="token number">1.0</span>
        <span class="token key atrule">livenessProbe</span><span class="token punctuation">:</span>
          <span class="token key atrule">httpGet</span><span class="token punctuation">:</span>
            <span class="token key atrule">path</span><span class="token punctuation">:</span> /healthz
            <span class="token key atrule">port</span><span class="token punctuation">:</span> <span class="token number">10251</span>
          <span class="token key atrule">initialDelaySeconds</span><span class="token punctuation">:</span> <span class="token number">15</span>
        <span class="token key atrule">name</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>second<span class="token punctuation">-</span>scheduler
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> apps/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Deployment
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">labels</span><span class="token punctuation">:</span>
    <span class="token key atrule">component</span><span class="token punctuation">:</span> scheduler
    <span class="token key atrule">tier</span><span class="token punctuation">:</span> control<span class="token punctuation">-</span>plane
  <span class="token key atrule">name</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>scheduler
  <span class="token key atrule">namespace</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>system
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">selector</span><span class="token punctuation">:</span>
    <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
      <span class="token key atrule">component</span><span class="token punctuation">:</span> scheduler
      <span class="token key atrule">tier</span><span class="token punctuation">:</span> control<span class="token punctuation">-</span>plane
  <span class="token key atrule">replicas</span><span class="token punctuation">:</span> <span class="token number">1</span>
  <span class="token key atrule">template</span><span class="token punctuation">:</span>
    <span class="token key atrule">metadata</span><span class="token punctuation">:</span>
      <span class="token key atrule">labels</span><span class="token punctuation">:</span>
        <span class="token key atrule">component</span><span class="token punctuation">:</span> scheduler
        <span class="token key atrule">tier</span><span class="token punctuation">:</span> control<span class="token punctuation">-</span>plane
        <span class="token key atrule">version</span><span class="token punctuation">:</span> second
    <span class="token key atrule">spec</span><span class="token punctuation">:</span>
      <span class="token key atrule">serviceAccountName</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>scheduler
      <span class="token key atrule">containers</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">command</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> /usr/local/bin/kube<span class="token punctuation">-</span>scheduler
        <span class="token punctuation">-</span> <span class="token punctuation">-</span><span class="token punctuation">-</span>config=/etc/kubernetes/my<span class="token punctuation">-</span>scheduler/my<span class="token punctuation">-</span>scheduler<span class="token punctuation">-</span>config.yaml
        <span class="token key atrule">image</span><span class="token punctuation">:</span> gcr.io/my<span class="token punctuation">-</span>gcp<span class="token punctuation">-</span>project/my<span class="token punctuation">-</span>kube<span class="token punctuation">-</span>scheduler<span class="token punctuation">:</span><span class="token number">1.0</span>
        <span class="token key atrule">livenessProbe</span><span class="token punctuation">:</span>
          <span class="token key atrule">httpGet</span><span class="token punctuation">:</span>
            <span class="token key atrule">path</span><span class="token punctuation">:</span> /healthz
            <span class="token key atrule">port</span><span class="token punctuation">:</span> <span class="token number">10251</span>
          <span class="token key atrule">initialDelaySeconds</span><span class="token punctuation">:</span> <span class="token number">15</span>
        <span class="token key atrule">name</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>second<span class="token punctuation">-</span>scheduler
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>部署调度器后，可以在 Pod Spec 中设置 <code>schedulerName</code> 字段，指定要选择的调度器。</p><h3 id="kube-scheduler-框架" tabindex="-1"><a class="header-anchor" href="#kube-scheduler-框架" aria-hidden="true">#</a> kube-scheduler 框架</h3>`,8)),s("p",null,[n[15]||(n[15]=a("自定义调度器通常需要用户自己从头编写、编译、打包为一个完整的程序并部署执行后才可以被使用，整个流程非常的繁琐。为了简化自定义调度器的开发，Kubernetes 提供了 ",-1)),s("a",v,[n[14]||(n[14]=a("Kubernetes Scheduling Framework",-1)),t(e)]),n[16]||(n[16]=a("，将调度过程中过滤、打分、Reserve 、Permit、绑定等流程以扩展点的形式暴露出来，我们可以实现相应的扩展插件，来定义自己的调度逻辑。 下面是主要的扩展点。",-1))]),n[37]||(n[37]=s("p",null,[s("img",{src:"https://kubernetes.io/images/docs/scheduling-framework-extensions.png",alt:"在这里插入图片描述"})],-1)),s("p",null,[n[18]||(n[18]=a("具体到代码中就是实现相应的接口，相关接口可以参考 ",-1)),s("a",m,[n[17]||(n[17]=a("scheduler-plugins",-1)),t(e)]),n[19]||(n[19]=a(" 的代码。",-1))]),s("p",null,[n[21]||(n[21]=a("在开发完成后，Kubernetes 提供了 ",-1)),s("a",b,[n[20]||(n[20]=a("KubeSchedulerConfiguration",-1)),t(e)]),n[22]||(n[22]=a(" 配置资源，允许我们配置多个调度器信息，并且可以为每个调度器指定不同的插件组合。",-1))]),n[38]||(n[38]=l(`<p>比我我们基于框架实现一个 my-scheduler 调度器，然后做部署：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> apps/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Deployment
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>scheduler
  <span class="token key atrule">namespace</span><span class="token punctuation">:</span> kube<span class="token punctuation">-</span>system
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">replicas</span><span class="token punctuation">:</span> <span class="token number">1</span>
  <span class="token key atrule">selector</span><span class="token punctuation">:</span>
    <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
      <span class="token key atrule">component</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>scheduler
  <span class="token key atrule">template</span><span class="token punctuation">:</span>
    <span class="token key atrule">metadata</span><span class="token punctuation">:</span>
      <span class="token key atrule">labels</span><span class="token punctuation">:</span>
        <span class="token key atrule">component</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>scheduler
    <span class="token key atrule">spec</span><span class="token punctuation">:</span>
      <span class="token key atrule">serviceAccountName</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>scheduler<span class="token punctuation">-</span>sa
      <span class="token key atrule">containers</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>scheduler
        <span class="token key atrule">image</span><span class="token punctuation">:</span> myrepo/my<span class="token punctuation">-</span>scheduler<span class="token punctuation">:</span>latest
        <span class="token key atrule">command</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> /my<span class="token punctuation">-</span>scheduler
        <span class="token punctuation">-</span> <span class="token punctuation">-</span><span class="token punctuation">-</span>config=/etc/kubernetes/scheduler<span class="token punctuation">-</span>config/config.yaml
        <span class="token key atrule">volumeMounts</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> <span class="token key atrule">mountPath</span><span class="token punctuation">:</span> /etc/kubernetes/scheduler<span class="token punctuation">-</span>config
          <span class="token key atrule">name</span><span class="token punctuation">:</span> config
          <span class="token key atrule">readOnly</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
      <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> config
        <span class="token key atrule">configMap</span><span class="token punctuation">:</span>
          <span class="token key atrule">name</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>scheduler<span class="token punctuation">-</span>config
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>部署完成后，通过 KubeSchedulerConfiguration 修改 kube-scheduler 的配置，将我们的自定义调度器配置进去。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>apiVersion: kubescheduler.config.k8s.io/v1
kind: KubeSchedulerConfiguration
profiles:
- schedulerName: default-scheduler
- schedulerName: my-scheduler   # Pod 用这个名字调度
  plugins:
    filter:
      enabled:
      - name: MyFilterPlugin
    score:
      enabled:
      - name: MyScorePlugin
  pluginConfig:
  - name: MyScorePlugin
    args:
      weight: 10
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,4)),s("p",null,[n[25]||(n[25]=a("调度可能是 Kubernetes 被讨论最多的话题之一，尤其是在现代大模型训练场景下，对调度策略的要求变得愈加严格和复杂，像 ",-1)),n[26]||(n[26]=s("a",{href:""},"Volcano",-1)),n[27]||(n[27]=a(" 的 批处理任务（Batch）和 AI 任务调度、",-1)),s("a",y,[n[23]||(n[23]=a("Ray",-1)),t(e)]),n[28]||(n[28]=a(" 的资源感知调度、",-1)),s("a",g,[n[24]||(n[24]=a("Koordinator",-1)),t(e)]),n[29]||(n[29]=a(" 基于异构混部的负载感知、潮汐调度都是新出的框架。",-1))]),n[39]||(n[39]=s("p",null,"这是一个能够一通百通的技术方向，从 Linux 内核线程调度、Kubernetes Pod 调度到 Golang 的 goroutine 调度，再到各类任务调度，对技术深度有追求的同学不妨在这个领域深入钻研一下。",-1))])}const q=p(c,[["render",h],["__file","scheduler.html.vue"]]);export{q as default};
