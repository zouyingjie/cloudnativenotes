import{_ as s,o as a,c as e,a as t}from"./app-BTSCaQUU.js";const p={};function l(i,n){return a(),e("div",null,[...n[0]||(n[0]=[t(`<h1 id="配置管理对象" tabindex="-1"><a class="header-anchor" href="#配置管理对象" aria-hidden="true">#</a> 配置管理对象</h1><p>Kubernetes 中配置管理对象主要包含 ConfigMap 和 Secret 两种，分别用来管理普通配置和敏感信息。</p><h3 id="_1-configmap" tabindex="-1"><a class="header-anchor" href="#_1-configmap" aria-hidden="true">#</a> 1. ConfigMap</h3><p>ConfigMap 是一种 API 对象，用来将非机密性的数据保存到健值对中。使用时可以用作环境变量、命令行参数或者存储卷中的配置文件。ConfigMap 可以让配置信息和容器镜像解耦，便于应用配置的修改。每次应用需要修改配置时，只需要修改 ConfigMap 然后按需重启应用 Pod 即可，不用像修改代码那样还需要重新编译打包、制作镜像等操作。</p><p>Kubernetes 支持基于字面量、文件、目录等方式创建 ConfigMap，下面是基于字面量创建一个示例：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>kubectl create configmap special-config --from-literal<span class="token operator">=</span>special.how<span class="token operator">=</span>very --from-literal<span class="token operator">=</span>special.type<span class="token operator">=</span>charm

$ kubectl get configmaps special-config <span class="token parameter variable">-o</span> yaml
apiVersion: v1
kind: ConfigMap
metadata:
  creationTimestamp: <span class="token number">2016</span>-02-18T19:14:38Z
  name: special-config
  namespace: default
  resourceVersion: <span class="token string">&quot;651&quot;</span>
  selfLink: /api/v1/namespaces/default/configmaps/special-config
  uid: dadce046-d673-11e5-8cd0-68f728db1985
data:
  special.how: very
  special.type: charm
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ConfigMap 创建后可以在可以作为卷直接挂载到 Pod ，也可以用来声明环境变量：</p><p><strong>作为环境变量使用</strong></p><p>可以引入指定的键值对作为环境变量，也可以引入所有的键值对作为环境变量。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> test<span class="token punctuation">-</span>container
      <span class="token key atrule">image</span><span class="token punctuation">:</span> k8s.gcr.io/busybox
      <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span> <span class="token string">&quot;/bin/sh&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;-c&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;env&quot;</span> <span class="token punctuation">]</span>
      <span class="token key atrule">env</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> SPECIAL_LEVEL_KEY
          <span class="token key atrule">valueFrom</span><span class="token punctuation">:</span>
            <span class="token key atrule">configMapKeyRef</span><span class="token punctuation">:</span>
              <span class="token key atrule">name</span><span class="token punctuation">:</span> special<span class="token punctuation">-</span>config
              <span class="token key atrule">key</span><span class="token punctuation">:</span> special.how
      <span class="token key atrule">envFrom</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">configMapRef</span><span class="token punctuation">:</span>
          <span class="token key atrule">name</span><span class="token punctuation">:</span> special<span class="token punctuation">-</span>config
  <span class="token key atrule">restartPolicy</span><span class="token punctuation">:</span> Never
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>直接挂载卷使用</strong></p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> dapi<span class="token punctuation">-</span>test<span class="token punctuation">-</span>pod
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> test<span class="token punctuation">-</span>container
      <span class="token key atrule">image</span><span class="token punctuation">:</span> k8s.gcr.io/busybox
      <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span> <span class="token string">&quot;/bin/sh&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;-c&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;ls /etc/config/&quot;</span> <span class="token punctuation">]</span>
      <span class="token key atrule">volumeMounts</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> config<span class="token punctuation">-</span>volume
        <span class="token key atrule">mountPath</span><span class="token punctuation">:</span> /etc/config
  <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> config<span class="token punctuation">-</span>volume
      <span class="token key atrule">configMap</span><span class="token punctuation">:</span>
        <span class="token key atrule">name</span><span class="token punctuation">:</span> special<span class="token punctuation">-</span>config
  <span class="token key atrule">restartPolicy</span><span class="token punctuation">:</span> Never
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-secret" tabindex="-1"><a class="header-anchor" href="#_2-secret" aria-hidden="true">#</a> 2. Secret</h3><p>ConfigMap 一般用来管理与存储普通配置，而 Secret 是用来管理和保存敏感的信息，例如密码、OAuth 令牌、ssh 密钥等。使用 Secret 来保存这些信息会比动态地添加到 Pod 定义或者是使用 ConfigMap 更加具备安全性和灵活性。</p><p>和 ConfigMap 一样，Secret 也支持基于字面量、文件等方式创建， 另外 Kubernetes 提供了不同类型的 Secret：</p><ul><li><strong>Generic</strong>：通用类型，可以基于文件、字面量、目录创建。</li><li><strong>tls</strong>：用来创建 TLS 加密用的 Secret，需要指定 key 和证书。</li><li><strong>docker-registry</strong>：创建访问私有镜像仓库使用的 Secret，可以将访问镜像仓库所需要的认证信息封装进 Secret。然后当 Pod 中的镜像需要从私有镜像仓库拉取时就可以使用该 Secret 了。</li></ul><p>下面是创建一个 docker-registry 类型的 Secret 的示例：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code>kubectl create secret docker<span class="token punctuation">-</span>registry regcred <span class="token punctuation">-</span><span class="token punctuation">-</span>docker<span class="token punctuation">-</span>server=&lt;your<span class="token punctuation">-</span>registry<span class="token punctuation">-</span>server<span class="token punctuation">&gt;</span> <span class="token punctuation">-</span><span class="token punctuation">-</span>docker<span class="token punctuation">-</span>username=&lt;your<span class="token punctuation">-</span>name<span class="token punctuation">&gt;</span> <span class="token punctuation">-</span><span class="token punctuation">-</span>docker<span class="token punctuation">-</span>password=&lt;your<span class="token punctuation">-</span>pword<span class="token punctuation">&gt;</span> <span class="token punctuation">-</span><span class="token punctuation">-</span>docker<span class="token punctuation">-</span>email=&lt;your<span class="token punctuation">-</span>email<span class="token punctuation">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>创建后可以在 Pod 中使用：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> private<span class="token punctuation">-</span>reg
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> private<span class="token punctuation">-</span>reg<span class="token punctuation">-</span>container
    <span class="token key atrule">image</span><span class="token punctuation">:</span> &lt;your<span class="token punctuation">-</span>private<span class="token punctuation">-</span>image<span class="token punctuation">&gt;</span>
  <span class="token key atrule">imagePullSecrets</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> regcred

<span class="token punctuation">---</span>

<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> mypod
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> mypod
    <span class="token key atrule">image</span><span class="token punctuation">:</span> redis
    <span class="token key atrule">volumeMounts</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> foo
      <span class="token key atrule">mountPath</span><span class="token punctuation">:</span> <span class="token string">&quot;/etc/foo&quot;</span>
  <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> foo
    <span class="token key atrule">secret</span><span class="token punctuation">:</span>
      <span class="token key atrule">secretName</span><span class="token punctuation">:</span> mysecret
      <span class="token key atrule">defaultMode</span><span class="token punctuation">:</span> <span class="token number">0400</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于普通的 Secret，可以像 ConfigMap 作为环境变量或者卷在 Pod 中使用。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> mypod
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> mypod
    <span class="token key atrule">image</span><span class="token punctuation">:</span> redis
    <span class="token key atrule">volumeMounts</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> foo
      <span class="token key atrule">mountPath</span><span class="token punctuation">:</span> <span class="token string">&quot;/etc/foo&quot;</span>
  <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> foo
    <span class="token key atrule">secret</span><span class="token punctuation">:</span>
      <span class="token key atrule">secretName</span><span class="token punctuation">:</span> mysecret
      <span class="token key atrule">defaultMode</span><span class="token punctuation">:</span> <span class="token number">0400</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Secret 中存储的值都是经过 base64 编码后的值，下面是创建一个 Secret 的示例：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl create secret generic prod-db-secret <span class="token punctuation">\\</span>
  --from-literal<span class="token operator">=</span>username<span class="token operator">=</span>produser <span class="token punctuation">\\</span>
  --from-literal<span class="token operator">=</span>password<span class="token operator">=</span>Y4nys7f11
secret/prod-db-secret created
username:  <span class="token number">8</span> bytes

$ kubectl get secrets prod-db-secret <span class="token parameter variable">-o</span> yaml
apiVersion: v1
data:
  password: WTRueXM3ZjEx
  username: <span class="token assign-left variable">cHJvZHVzZXI</span><span class="token operator">=</span>
kind: Secret
metadata:
  name: prod-db-secret
  namespace: default
type: Opaque
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Secret 中存储的值都是经过 base64 编码后的值，可以通过 base64 解码获取到实际的值：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token builtin class-name">echo</span> <span class="token string">&quot;WTRueXM3ZjEx&quot;</span> <span class="token operator">|</span> base64 <span class="token parameter variable">-d</span>
Y4nys7f11%

$ <span class="token builtin class-name">echo</span> <span class="token string">&quot;cHJvZHVzZXI=&quot;</span> <span class="token operator">|</span> base64 <span class="token parameter variable">-d</span>
produser%
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到 Secret 本身提供的安全性是有限的，如果能拿到 Secret 中的数据是可以通过 Base64 解码来获取实际的信息的。日常使用更多的是围绕 Secret 的安全实践，比如避免将敏感数据直接写到代码仓库，因此抽取到 Secret。</p><p>另外只有某节点的 Pod 用到 Secret 时其才会被发送到对应节点，可以设置 Secret 写到内存而不是磁盘，这样 Pod 停止后 Secret 数据也会被删除。</p><p>Kubernetes 组件与 api-server 之间的通信一般都是受 TLS 保护的，因此 Secret 在组件之间传输时也是安全的，Pod 之间无法共享 Secret，可以在 Pod 级别构建安全分区来保证只有需要的容器才能访问到 Secret。</p>`,29)])])}const o=s(p,[["render",l],["__file","config.html.vue"]]);export{o as default};
