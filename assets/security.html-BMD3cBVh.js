import{_ as l,r as i,o,c,a as p,b as s,d as a,e as t}from"./app-BTSCaQUU.js";const u={},r={href:"https://openid.net/connect/",target:"_blank",rel:"noopener noreferrer"},d={href:"http://bit.ly/2xNS77W",target:"_blank",rel:"noopener noreferrer"},k={href:"http://bit.ly/2Oh6DPS",target:"_blank",rel:"noopener noreferrer"},v={href:"https://kubernetes-security.info/#authentication",target:"_blank",rel:"noopener noreferrer"},m={href:"https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#what-does-each-admission-controller-do",target:"_blank",rel:"noopener noreferrer"},b={href:"https://github.com/kubernetes/api/blob/master/admission/v1beta1/types.go",target:"_blank",rel:"noopener noreferrer"},g={href:"https://github.com/megaease/easemesh",target:"_blank",rel:"noopener noreferrer"},y={href:"https://github.com/stackrox/admission-controller-webhook-demo",target:"_blank",rel:"noopener noreferrer"},h={href:"https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/",target:"_blank",rel:"noopener noreferrer"},R={href:"https://kubernetes.io/blog/2019/03/21/a-guide-to-kubernetes-admission-controllers/",target:"_blank",rel:"noopener noreferrer"},U={href:"https://kubernetes.io/docs/concepts/security/pod-security-standards/",target:"_blank",rel:"noopener noreferrer"};function V(q,n){const e=i("ExternalLinkIcon");return o(),c("div",null,[n[35]||(n[35]=p(`<h1 id="安全机制" tabindex="-1"><a class="header-anchor" href="#安全机制" aria-hidden="true">#</a> 安全机制</h1><p>本篇对 Kubernetes 中一些安全机制进行介绍，包括 mTLS、身份认证、RBAC 授权以及准入控制等功能。</p><h3 id="_1-mtls" tabindex="-1"><a class="header-anchor" href="#_1-mtls" aria-hidden="true">#</a> 1. mTLS</h3><p>在常见的浏览器访问网站的场景下，通过 HTTPS 协议，浏览器作为客户端会对服务器的证书进行验证。而所谓 mTLS（ Mutual TLS）是指在通信时除了客户端会验证服务端证书确认其是否合法之外，服务端也会验证客户端的证书是否合法。 使用 mTLS 有如下优点：</p><ul><li>可以同时满足加密传输和身份认证</li><li>独立于应用之外，与具体语言无关</li></ul><p>当然 mTLS 也有不足：</p><ul><li><p>证书管理过于复杂。假设有一对客户端与服务端通信，如果使用自签名证书我们需要 ca 私钥证书、服务端私钥证书、客户端私钥证书共 6 个文件需要进行管理。如果服务变多证书数量也会随之增多，从而增加管理成本</p></li><li><p>证书更新时需要重启应用</p></li></ul><p>Kubernetes 各个组件之间的通信采用的是 mTLS 认证方式，服务端与客户端都需要各自进行身份认证。Kubernetes 中各个组件通信情况如图：</p><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/75137a4fc3694c036151967099b3175e.png" alt="在这里插入图片描述"></p><p>Server 端包括</p><ul><li><strong>kube-apiserver</strong>: 外部和 Kubernetes 中的各个组件都是与 api-server 通信。</li><li><strong>etcd Server</strong> : apiserver 与 etcd 进行通信。</li><li><strong>kubelet server</strong> : api-server 会与 kubelet 通信。</li></ul><p>Client 端证书包括：</p><ul><li><strong>admin</strong>：外部命令行与 apiserver 通信</li><li><strong>scheduler</strong>: 调度器作为客户端与 apiserver 通信</li><li><strong>controller manager</strong>：控制器作为客户端与 apiserver 通信</li><li><strong>kube-proxy</strong>: kube-proxy 作为客户端与 api-server 通信</li><li><strong>kubelet</strong>： kubelet 与 apiserver 通信</li></ul><p>Kubernetes 使用的是自签名证书，以我们使用 kubeadm 为例，在部署时 kubeadm 会自动帮我们生成证书，Kubernetes 用到的证书大致如下：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>
ubuntu@sit-01:/etc/kubernetes/ssl$ <span class="token function">sudo</span> <span class="token function">ls</span> <span class="token parameter variable">-al</span> /etc/kubernetes/ssl/
total <span class="token number">80</span>
drwxr-xr-x <span class="token number">2</span> root root <span class="token number">4096</span> Jan <span class="token number">22</span> <span class="token number">15</span>:21 <span class="token builtin class-name">.</span>
drwxr-xr-x <span class="token number">4</span> kube root <span class="token number">4096</span> Jan <span class="token number">22</span> <span class="token number">15</span>:21 <span class="token punctuation">..</span>
-rw-r--r-- <span class="token number">1</span> root root <span class="token number">1432</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 apiserver.crt
-rw-r--r-- <span class="token number">1</span> root root <span class="token number">1432</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 apiserver.crt.old
-rw------- <span class="token number">1</span> root root <span class="token number">1675</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 apiserver.key
-rw------- <span class="token number">1</span> root root <span class="token number">1675</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 apiserver.key.old
-rw-r--r-- <span class="token number">1</span> root root <span class="token number">1176</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 apiserver-kubelet-client.crt
-rw-r--r-- <span class="token number">1</span> root root <span class="token number">1176</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 apiserver-kubelet-client.crt.old
-rw------- <span class="token number">1</span> root root <span class="token number">1679</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 apiserver-kubelet-client.key
-rw------- <span class="token number">1</span> root root <span class="token number">1679</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 apiserver-kubelet-client.key.old
-rw-r--r-- <span class="token number">1</span> root root <span class="token number">1107</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 ca.crt
-rw------- <span class="token number">1</span> root root <span class="token number">1679</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 ca.key
-rw-r--r-- <span class="token number">1</span> root root <span class="token number">1123</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 front-proxy-ca.crt
-rw------- <span class="token number">1</span> root root <span class="token number">1679</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 front-proxy-ca.key
-rw-r--r-- <span class="token number">1</span> root root <span class="token number">1119</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 front-proxy-client.crt
-rw-r--r-- <span class="token number">1</span> root root <span class="token number">1119</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 front-proxy-client.crt.old
-rw------- <span class="token number">1</span> root root <span class="token number">1679</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 front-proxy-client.key
-rw------- <span class="token number">1</span> root root <span class="token number">1679</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 front-proxy-client.key.old
-rw------- <span class="token number">1</span> root root <span class="token number">1679</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 sa.key
-rw------- <span class="token number">1</span> root root  <span class="token number">451</span> Jan <span class="token number">22</span> <span class="token number">14</span>:37 sa.pub


<span class="token comment"># ubuntu @ VM-0-7-ubuntu in /etc/kubernetes/pki/etcd </span>
total <span class="token number">48</span>
drwx------ <span class="token number">2</span> etcd root <span class="token number">4096</span> Jan <span class="token number">22</span> <span class="token number">15</span>:20 <span class="token builtin class-name">.</span>
drwx------ <span class="token number">3</span> etcd root <span class="token number">4096</span> Jan <span class="token number">22</span> <span class="token number">14</span>:36 <span class="token punctuation">..</span>
-rwx------ <span class="token number">1</span> etcd root <span class="token number">1704</span> Jan <span class="token number">22</span> <span class="token number">15</span>:20 admin-sit-01-key.pem
-rwx------ <span class="token number">1</span> etcd root <span class="token number">1379</span> Jan <span class="token number">22</span> <span class="token number">15</span>:20 admin-sit-01.pem
-rwx------ <span class="token number">1</span> etcd root <span class="token number">1708</span> Jan <span class="token number">22</span> <span class="token number">14</span>:36 ca-key.pem
-rwx------ <span class="token number">1</span> etcd root <span class="token number">1111</span> Jan <span class="token number">22</span> <span class="token number">14</span>:36 ca.pem
-rwx------ <span class="token number">1</span> etcd root <span class="token number">1704</span> Jan <span class="token number">22</span> <span class="token number">15</span>:20 member-sit-01-key.pem
-rwx------ <span class="token number">1</span> etcd root <span class="token number">1379</span> Jan <span class="token number">22</span> <span class="token number">15</span>:20 member-sit-01.pem
-rwx------ <span class="token number">1</span> etcd root <span class="token number">1704</span> Jan <span class="token number">22</span> <span class="token number">15</span>:20 node-sit-01-key.pem
-rwx------ <span class="token number">1</span> etcd root <span class="token number">1375</span> Jan <span class="token number">22</span> <span class="token number">15</span>:20 node-sit-01.pem
-rwx------ <span class="token number">1</span> etcd root <span class="token number">1704</span> Jan <span class="token number">22</span> <span class="token number">15</span>:20 node-sit-02-key.pem
-rwx------ <span class="token number">1</span> etcd root <span class="token number">1375</span> Jan <span class="token number">22</span> <span class="token number">15</span>:20 node-sit-02.pem

$ <span class="token function">sudo</span> <span class="token function">ls</span> <span class="token parameter variable">-l</span> /var/lib/kubelet/pki
total <span class="token number">12</span>
kubelet-client-2021-11-12-18-30-55.pem
-rw-r--r-- <span class="token number">1</span> root root <span class="token number">2287</span> Nov <span class="token number">12</span> <span class="token number">18</span>:30 kubelet.crt
-rw------- <span class="token number">1</span> root root <span class="token number">1679</span> Nov <span class="token number">12</span> <span class="token number">18</span>:30 kubelet.key
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Kubeadm 生成的 ca 证书默认有效期为 10 年，其他证书为 1 年，可以通过 <code>sudo kubeadm certs check-expiration</code> 命令查看证书的过期情况。可以通过自动脚本定时更新或者修改 kubeadm 源码将证书有效期延长。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">sudo</span> kubeadm  certs check-expiration
<span class="token punctuation">[</span>check-expiration<span class="token punctuation">]</span> Reading configuration from the cluster<span class="token punctuation">..</span>.
<span class="token punctuation">[</span>check-expiration<span class="token punctuation">]</span> FYI: You can <span class="token function">look</span> at this config <span class="token function">file</span> with <span class="token string">&#39;kubectl -n kube-system get cm kubeadm-config -o yaml&#39;</span>

CERTIFICATE                EXPIRES                  RESIDUAL TIME   CERTIFICATE AUTHORITY   EXTERNALLY MANAGED
admin.conf                 Nov <span class="token number">12</span>, <span class="token number">2022</span> <span class="token number">10</span>:30 UTC   354d                                    
apiserver                  Nov <span class="token number">12</span>, <span class="token number">2022</span> <span class="token number">10</span>:30 UTC   354d            ca                      noapiserver-etcd-client    Nov <span class="token number">12</span>, <span class="token number">2022</span> <span class="token number">10</span>:30 UTC   354d            etcd-ca                 
apiserver-kubelet-client   Nov <span class="token number">12</span>, <span class="token number">2022</span> <span class="token number">10</span>:30 UTC   354d            ca                      
controller-manager.conf    Nov <span class="token number">12</span>, <span class="token number">2022</span> <span class="token number">10</span>:30 UTC   354d                                    
etcd-healthcheck-client    Nov <span class="token number">12</span>, <span class="token number">2022</span> <span class="token number">10</span>:30 UTC   354d            etcd-ca                 
etcd-peer                  Nov <span class="token number">12</span>, <span class="token number">2022</span> <span class="token number">10</span>:30 UTC   354d            etcd-ca                 
etcd-server                Nov <span class="token number">12</span>, <span class="token number">2022</span> <span class="token number">10</span>:30 UTC   354d            etcd-ca                 
front-proxy-client         Nov <span class="token number">12</span>, <span class="token number">2022</span> <span class="token number">10</span>:30 UTC   354d               
scheduler.conf             Nov <span class="token number">12</span>, <span class="token number">2022</span> <span class="token number">10</span>:30 UTC   354d                                    

CERTIFICATE AUTHORITY   EXPIRES                  RESIDUAL TIME   EXTERNALLY MANAGED
ca                      Nov <span class="token number">10</span>, <span class="token number">2031</span> <span class="token number">10</span>:30 UTC   9y              no
etcd-ca                 Nov <span class="token number">10</span>, <span class="token number">2031</span> <span class="token number">10</span>:30 UTC   9y              no
front-proxy-ca          Nov <span class="token number">10</span>, <span class="token number">2031</span> <span class="token number">10</span>:30 UTC   9y              no
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-认证" tabindex="-1"><a class="header-anchor" href="#_2-认证" aria-hidden="true">#</a> 2. 认证</h3><p>apiserver 收到外部请求时，首先要需要经过一系列的验证后才能确认是否允许请求继续执行。主要有三步：</p><ul><li>身份认证：Who you are？</li><li>权限验证：What can you do？</li><li>准入控制: 请求是否合法？</li></ul><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/72bdd189d04fe67d3e4a6c9f48bacc7a.png" alt="在这里插入图片描述"></p><p>对于身份验证，Kubernetes 中身份信息可以分为两类：</p><ul><li><strong>Service Account</strong>：集群内部进行身份认证和授权的服务账户。</li><li><strong>普通用户</strong>：外部访问集群的用户。</li></ul><h4 id="_2-1-serviceaccount" tabindex="-1"><a class="header-anchor" href="#_2-1-serviceaccount" aria-hidden="true">#</a> 2.1 ServiceAccount</h4><p>ServiceAccount 是 Kubernetes 内部通信使用的账户信息，每个 namesapce 下都会有一个名为 <code>default</code> 的默认 Service Account，在没有单独设置时 Pod 默认使用该 ServiceAccout 作为服务账户。Service Account 会生成对应的 Secret 存储其 token。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl get serviceaccounts
NAME      SECRETS   AGE
default   <span class="token number">1</span>         10d

$ kubectl get secrets
NAME                  TYPE                                  DATA   AGE
default-token-c7bv9   kubernetes.io/service-account-token   <span class="token number">3</span>      10d


$ kubectl describe secrets default-token-c7bv9
Name:         default-token-c7bv9
Namespace:    default
Labels:       <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>
Annotations:  kubernetes.io/service-account.name: default
              kubernetes.io/service-account.uid: 517fd6b1-6441-4817-bf16-14ef37175da2

Type:  kubernetes.io/service-account-token
Data
<span class="token operator">==</span><span class="token operator">==</span>
ca.crt:     <span class="token number">1099</span> bytes
namespace:  <span class="token number">7</span> bytes
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IjFLMkVMNm5mMkFhYmQyMUdCVXp3OGdiZEs1dkdRQ3NNR0JWT0RZblIzYkkifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4tYzdidjkiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjUxN2ZkNmIxLTY0NDEtNDgxNy1iZjE2LTE0ZWYzNzE3NWRhMiIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.C2gGaqrF1effQy_9e48VGh06Ks1ihwR3Q6gHezBBZ51WmD2Sg4Pt0WASZEpJ8swPLXUCo13UaL_y2b3dXOwcjWDOApFsPttDZQtfjiIDn_Wt0RMCKTUNr9ft8_GcM2Xjt8Bnz_mev-NZFwBBJC1vhJn2u-XQLfsp0XiHVTsls0JlPdtZjBOAvlxTQtM9LbMb2o5flEXLCHEGiKNkrYczS7SDNFfrOUNcdDbJHUhifAynOm0bSFIWTG9R0CYHvM3oTJyLSLHuSjqZjpMfNev_4V27AWfSTWg1rwC3Bhj3FNzQSEriQCg1rt9t-Bq58AbJR4vrj2dQa6vT5FP6xQVULA



<span class="token assign-left variable">CA_CERT</span><span class="token operator">=</span>/var/run/secrets/kubernetes.io/serviceaccount/ca.crt 
<span class="token assign-left variable">TOKEN</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span><span class="token function">cat</span> /var/run/secrets/kubernetes.io/serviceaccount/token<span class="token variable">)</span></span> 
<span class="token assign-left variable">NAMESPACE</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span><span class="token function">cat</span> /var/run/secrets/kubernetes.io/serviceaccount/namespace<span class="token variable">)</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Pod 会将 Secret 作为卷挂在进来，Service Account 的 Secrets 的 token 文件会被 mount 到 pod 里的下面这个位置。 在 pod 里可以使他们来访问 API，为便于操作可以先在 Pod 里设置几个环境变量。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">ls</span> <span class="token parameter variable">-l</span> /var/run/secrets/kubernetes.io/serviceaccount/

lrwxrwxrwx    <span class="token number">1</span> root  root <span class="token number">13</span> Aug <span class="token number">31</span> 03:24 ca.crt -<span class="token operator">&gt;</span> <span class="token punctuation">..</span>data/ca.crt
lrwxrwxrwx    <span class="token number">1</span> root  root <span class="token number">16</span> Aug <span class="token number">31</span> 03:24 namespace -<span class="token operator">&gt;</span> <span class="token punctuation">..</span>data/namespace
lrwxrwxrwx    <span class="token number">1</span> root  root <span class="token number">12</span> Aug <span class="token number">31</span> 03:24 token -<span class="token operator">&gt;</span> <span class="token punctuation">..</span>data/token
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们也可以直接使用该 token 与 apiserver 通信。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">curl</span> <span class="token parameter variable">-k</span> https://172.19.0.7:6443/api
<span class="token punctuation">{</span>
  <span class="token string">&quot;kind&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;Status&quot;</span>,
  <span class="token string">&quot;apiVersion&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;v1&quot;</span>,
  <span class="token string">&quot;metadata&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>

  <span class="token punctuation">}</span>,
  <span class="token string">&quot;status&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;Failure&quot;</span>,
  <span class="token string">&quot;message&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;forbidden: User <span class="token entity" title="\\&quot;">\\&quot;</span>system:anonymous<span class="token entity" title="\\&quot;">\\&quot;</span> cannot get path <span class="token entity" title="\\&quot;">\\&quot;</span>/api<span class="token entity" title="\\&quot;">\\&quot;</span>&quot;</span>,
  <span class="token string">&quot;reason&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;Forbidden&quot;</span>,
  <span class="token string">&quot;details&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>

  <span class="token punctuation">}</span>,
  <span class="token string">&quot;code&quot;</span><span class="token builtin class-name">:</span> <span class="token number">403</span>
<span class="token punctuation">}</span>

$ <span class="token function">curl</span> <span class="token parameter variable">-k</span> https://172.19.0.7:6443/api <span class="token parameter variable">-H</span> <span class="token string">&quot;Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjFLMkVMNm5mMkFhYmQyMUdCVXp3OGdiZEs1dkdRQ3NNR0JWT0RZblIzYkkifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4tYzdidjkiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjUxN2ZkNmIxLTY0NDEtNDgxNy1iZjE2LTE0ZWYzNzE3NWRhMiIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.C2gGaqrF1effQy_9e48VGh06Ks1ihwR3Q6gHezBBZ51WmD2Sg4Pt0WASZEpJ8swPLXUCo13UaL_y2b3dXOwcjWDOApFsPttDZQtfjiIDn_Wt0RMCKTUNr9ft8_GcM2Xjt8Bnz_mev-NZFwBBJC1vhJn2u-XQLfsp0XiHVTsls0JlPdtZjBOAvlxTQtM9LbMb2o5flEXLCHEGiKNkrYczS7SDNFfrOUNcdDbJHUhifAynOm0bSFIWTG9R0CYHvM3oTJyLSLHuSjqZjpMfNev_4V27AWfSTWg1rwC3Bhj3FNzQSEriQCg1rt9t-Bq58AbJR4vrj2dQa6vT5FP6xQVULA&quot;</span>
<span class="token punctuation">{</span>
  <span class="token string">&quot;kind&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;APIVersions&quot;</span>,
  <span class="token string">&quot;versions&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span>
    <span class="token string">&quot;v1&quot;</span>
  <span class="token punctuation">]</span>,
  <span class="token string">&quot;serverAddressByClientCIDRs&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span>
      <span class="token string">&quot;clientCIDR&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;0.0.0.0/0&quot;</span>,
      <span class="token string">&quot;serverAddress&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;172.19.0.7:6443&quot;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>除了每个 namespace 默认的服务账户外，我们可以自己创建 Service Account。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>​​$ kubectl create serviceaccount build-robot
serviceaccount/build-robot created

<span class="token comment"># ubuntu @ VM-0-7-ubuntu in ~ [9:45:08]</span>
$ kubectl get serviceaccounts/build-robot <span class="token parameter variable">-o</span> yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  creationTimestamp: <span class="token string">&quot;2021-11-23T01:45:08Z&quot;</span>
  name: build-robot
  namespace: default
  resourceVersion: <span class="token string">&quot;881093&quot;</span>
  uid: 0160e851-cae1-4927-a524-58c3a379ee05
secrets:
- name: build-robot-token-d9p58


创建完成后我们可以在创建 Pod 时通过修改 spec.serviceAccountName 属性来指定 ServiceAccount。通过自己创建 ServiceAccount 并结合 RBAC 授权可以针对特殊的 Pod 进行单独的权限控制。

apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - image: nginx
    name: nginx
    volumeMounts:
    - mountPath: /var/run/secrets/tokens
      name: vault-token
  serviceAccountName: build-robot
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-2-用户" tabindex="-1"><a class="header-anchor" href="#_2-2-用户" aria-hidden="true">#</a> 2.2 用户</h4><p>Kubernetes 虽然有用户的概念，但它认为用户是由集群无关的服务进行管理的，因此并没有提供类似 kubectl create user 的 API 来创建用户。</p><p>当外部访问 apiserver 时，Kubernetes 可以使用的认证方式有：</p>`,35)),s("ul",null,[n[3]||(n[3]=s("li",null,"客户端证书认证",-1)),n[4]||(n[4]=s("li",null,"静态的用户密码或 token 文件（Departed）",-1)),n[5]||(n[5]=s("li",null,"Bootstrap tokens",-1)),s("li",null,[s("a",r,[n[0]||(n[0]=a("OpenID Connect (OIDC)",-1)),t(e)])]),s("li",null,[s("a",d,[n[1]||(n[1]=a("Authenticating proxy",-1)),t(e)])]),s("li",null,[s("a",k,[n[2]||(n[2]=a("Webhook token authentication",-1)),t(e)])])]),s("p",null,[n[7]||(n[7]=a("这里比较常用的方式是客户端证书，其他方式使用可以参考这份索引 ",-1)),s("a",v,[n[6]||(n[6]=a("文档",-1)),t(e)]),n[8]||(n[8]=a("。",-1))]),n[36]||(n[36]=p(`<p>Kubernetes 内置了 <code>Certificate Signing Request</code> 对象来执行证书签名。当外部用户想请求 Kubernetes 时，可以使用私钥来生成 CSR 证书签名请求，然后交给 Kuberetes 签发。流程如下</p><h5 id="生成私钥与-csr" tabindex="-1"><a class="header-anchor" href="#生成私钥与-csr" aria-hidden="true">#</a> 生成私钥与 CSR</h5><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 创建私钥</span>
$ openssl genrsa <span class="token parameter variable">-out</span> Jane.key <span class="token number">2048</span>
Generating RSA private key, <span class="token number">2048</span> bit long modulus <span class="token punctuation">(</span><span class="token number">2</span> primes<span class="token punctuation">)</span>
<span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span>.+++++
<span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token punctuation">..</span>.+++++
e is <span class="token number">65537</span> <span class="token punctuation">(</span>0x010001<span class="token punctuation">)</span>


<span class="token comment"># 生成 CSR</span>
$ openssl req <span class="token parameter variable">-new</span> <span class="token parameter variable">-key</span> Jane.key <span class="token parameter variable">-out</span> Jane.csr
<span class="token punctuation">..</span>.
Common Name <span class="token punctuation">(</span>e.g. server FQDN or YOUR name<span class="token punctuation">)</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>:Jane
Email Address <span class="token punctuation">[</span><span class="token punctuation">]</span>:

Please enter the following <span class="token string">&#39;extra&#39;</span> attributes
to be sent with your certificate request
A challenge password <span class="token punctuation">[</span><span class="token punctuation">]</span>:
An optional company name <span class="token punctuation">[</span><span class="token punctuation">]</span>:


$ <span class="token function">cat</span> Jane.csr <span class="token operator">|</span> base64 <span class="token operator">|</span> <span class="token function">tr</span> <span class="token parameter variable">-d</span> <span class="token string">&quot;<span class="token entity" title="\\n">\\n</span>&quot;</span>

<span class="token assign-left variable">LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ21UQ0NBWUVDQVFBd1ZERUxNQWtHQTFVRUJoTUNRVlV4RXpBUkJnTlZCQWdNQ2xOdmJXVXRVM1JoZEdVeApJVEFmQmdOVkJBb01HRWx1ZEdWeWJtVjBJRmRwWkdkcGRITWdVSFI1SUV4MFpERU5NQXNHQTFVRUF3d0VTbUZ1ClpUQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQU5tb3dZUkdpbHlWSkVIbkxaUU0KSFEvQWRveG9CNmJUN2YvSjFuc2xBYXZEYm9Sc3BKdjBBcGh6a05RYXJDU1E1SDRYVjR2OGZDdDVmeGFyL294agpmUXVyWDNrbXk1SHpJTGFod0svWXUvWU01djhacG53S3J3RmpmTzVpVC9rRmhyOUF0VkhWL0ZMajBhZURzUHRaCjlaemduUXUwbUUxcmc5WWZBUVFxOHo5UjB5bGFxQ0V2SU9HVU5FRzBrNGN2K0lDNE96KzZjQmIyUGhLLzFKc3kKcUg3V3RONnIraDI0S0FveXExZDFSY1NIU0ppbVgwbkExNlFCYjRuRVFGc0xJaUtXSXRxQ1JXUm9WT2dqSDhMUQpOV1ZlQmRKRVh6MWxIYXhzVE56OEo0QVhUZGFTLzcwSDhMRXhCT3ppMXNXMFB1aldPRC8xRkVhc2dqY1NNUG9uCnVua0NBd0VBQWFBQU1BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQ2Z3ck5menl1blFtaUVBaXpxdzN6VGh0UkIKdjZtSmZVL2tNZTN1eHVDZm1MR3Y4OXpvZ3k3SWQxM25pdTE5Zzgzdy82UktkRFI1QVhXODk0L3daQi9CQjQwcgoyU3pQcmk5L3hMUkFManZnbWY0d1NhaDIyUnRJUjJYZGNVelJZL2V4V2w4ajJVV0w5Mkwxci82bWNjSVdrT1BUCnNmUWVYWWYxZThnNVk5Q1VSbThTNlloeURQOXFCQzk3QjEwenovNU1SN0YxdmtxMTI2OEtEek9GbWtWSnJLMkEKaXFNQk4xdkRSVkJURFVISFJ4V1lwTUpTSHJrOFRlVHhLVE1RNG12WGxCMzNUbElIZlU4L1ZOMEtQNFU5d0k5egpLNEI1NWFFc3QxUW5TWkw3cDlxMisvb20rdmtZUC9RblU4M3I4RlBFVTJ4R2ZzSTR0WFpzNkdseGZyVzMKLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tCg</span><span class="token operator">==</span>%
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="创建-certificate-signing-request" tabindex="-1"><a class="header-anchor" href="#创建-certificate-signing-request" aria-hidden="true">#</a> 创建 Certificate Signing Request</h5><p>CSR 生成后我们通过 base64 编码拿到其内容，并创建 Kubernetes 的 CSR 对象：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> certificates.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> CertificateSigningRequest
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> Jane
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">request</span><span class="token punctuation">:</span> LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ21UQ0NBWUVDQVFBd1ZERUxNQWtHQTFVRUJoTUNRVlV4RXpBUkJnTlZCQWdNQ2xOdmJXVXRVM1JoZEdVeApJVEFmQmdOVkJBb01HRWx1ZEdWeWJtVjBJRmRwWkdkcGRITWdVSFI1SUV4MFpERU5NQXNHQTFVRUF3d0VTbUZ1ClpUQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQU5tb3dZUkdpbHlWSkVIbkxaUU0KSFEvQWRveG9CNmJUN2YvSjFuc2xBYXZEYm9Sc3BKdjBBcGh6a05RYXJDU1E1SDRYVjR2OGZDdDVmeGFyL294agpmUXVyWDNrbXk1SHpJTGFod0svWXUvWU01djhacG53S3J3RmpmTzVpVC9rRmhyOUF0VkhWL0ZMajBhZURzUHRaCjlaemduUXUwbUUxcmc5WWZBUVFxOHo5UjB5bGFxQ0V2SU9HVU5FRzBrNGN2K0lDNE96KzZjQmIyUGhLLzFKc3kKcUg3V3RONnIraDI0S0FveXExZDFSY1NIU0ppbVgwbkExNlFCYjRuRVFGc0xJaUtXSXRxQ1JXUm9WT2dqSDhMUQpOV1ZlQmRKRVh6MWxIYXhzVE56OEo0QVhUZGFTLzcwSDhMRXhCT3ppMXNXMFB1aldPRC8xRkVhc2dqY1NNUG9uCnVua0NBd0VBQWFBQU1BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQ2Z3ck5menl1blFtaUVBaXpxdzN6VGh0UkIKdjZtSmZVL2tNZTN1eHVDZm1MR3Y4OXpvZ3k3SWQxM25pdTE5Zzgzdy82UktkRFI1QVhXODk0L3daQi9CQjQwcgoyU3pQcmk5L3hMUkFManZnbWY0d1NhaDIyUnRJUjJYZGNVelJZL2V4V2w4ajJVV0w5Mkwxci82bWNjSVdrT1BUCnNmUWVYWWYxZThnNVk5Q1VSbThTNlloeURQOXFCQzk3QjEwenovNU1SN0YxdmtxMTI2OEtEek9GbWtWSnJLMkEKaXFNQk4xdkRSVkJURFVISFJ4V1lwTUpTSHJrOFRlVHhLVE1RNG12WGxCMzNUbElIZlU4L1ZOMEtQNFU5d0k5egpLNEI1NWFFc3QxUW5TWkw3cDlxMisvb20rdmtZUC9RblU4M3I4RlBFVTJ4R2ZzSTR0WFpzNkdseGZyVzMKLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tCg==
  <span class="token key atrule">signerName</span><span class="token punctuation">:</span> kubernetes.io/kube<span class="token punctuation">-</span>apiserver<span class="token punctuation">-</span>client
  <span class="token key atrule">expirationSeconds</span><span class="token punctuation">:</span> <span class="token number">86400</span>  <span class="token comment"># one day</span>
  <span class="token key atrule">usages</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> client auth
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl apply <span class="token parameter variable">-f</span> k8s-csr-jane.yaml
certificatesigningrequest.certificates.k8s.io/Jane created
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="批准-certificate-signing-request" tabindex="-1"><a class="header-anchor" href="#批准-certificate-signing-request" aria-hidden="true">#</a> 批准 Certificate Signing Request</h5><p>新创建的 CSR 处于 Pending 状态，需要批准后才能使用。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl get csr
NAME     AGE     SIGNERNAME                            REQUESTOR          REQUESTEDDURATION   CONDITION
Jane     6s      kubernetes.io/kube-apiserver-client   kubernetes-admin   24h                 Pending


$ kubectl certificate approve Jane
certificatesigningrequest.certificates.k8s.io/Jane approved

$ kubectl get csr 
NAME   AGE     SIGNERNAME                            REQUESTOR          REQUESTEDDURATION   CONDITION
Jane   4m18s   kubernetes.io/kube-apiserver-client   kubernetes-admin   24h                 Approved,Issued
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>批准后 CSR 中就有了证书信息：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl get csr Jane <span class="token parameter variable">-o</span> yaml
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: <span class="token operator">|</span>
      <span class="token punctuation">{</span><span class="token string">&quot;apiVersion&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;certificates.k8s.io/v1&quot;</span>,<span class="token string">&quot;kind&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;CertificateSigningRequest&quot;</span>,<span class="token string">&quot;metadata&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;annotations&quot;</span>:<span class="token punctuation">{</span><span class="token punctuation">}</span>,<span class="token string">&quot;name&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;Jane&quot;</span><span class="token punctuation">}</span>,<span class="token string">&quot;spec&quot;</span>:<span class="token punctuation">{</span><span class="token string">&quot;expirationSeconds&quot;</span>:86400,<span class="token string">&quot;request&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ21UQ0NBWUVDQVFBd1ZERUxNQWtHQTFVRUJoTUNRVlV4RXpBUkJnTlZCQWdNQ2xOdmJXVXRVM1JoZEdVeApJVEFmQmdOVkJBb01HRWx1ZEdWeWJtVjBJRmRwWkdkcGRITWdVSFI1SUV4MFpERU5NQXNHQTFVRUF3d0VTbUZ1ClpUQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQU5tb3dZUkdpbHlWSkVIbkxaUU0KSFEvQWRveG9CNmJUN2YvSjFuc2xBYXZEYm9Sc3BKdjBBcGh6a05RYXJDU1E1SDRYVjR2OGZDdDVmeGFyL294agpmUXVyWDNrbXk1SHpJTGFod0svWXUvWU01djhacG53S3J3RmpmTzVpVC9rRmhyOUF0VkhWL0ZMajBhZURzUHRaCjlaemduUXUwbUUxcmc5WWZBUVFxOHo5UjB5bGFxQ0V2SU9HVU5FRzBrNGN2K0lDNE96KzZjQmIyUGhLLzFKc3kKcUg3V3RONnIraDI0S0FveXExZDFSY1NIU0ppbVgwbkExNlFCYjRuRVFGc0xJaUtXSXRxQ1JXUm9WT2dqSDhMUQpOV1ZlQmRKRVh6MWxIYXhzVE56OEo0QVhUZGFTLzcwSDhMRXhCT3ppMXNXMFB1aldPRC8xRkVhc2dqY1NNUG9uCnVua0NBd0VBQWFBQU1BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQ2Z3ck5menl1blFtaUVBaXpxdzN6VGh0UkIKdjZtSmZVL2tNZTN1eHVDZm1MR3Y4OXpvZ3k3SWQxM25pdTE5Zzgzdy82UktkRFI1QVhXODk0L3daQi9CQjQwcgoyU3pQcmk5L3hMUkFManZnbWY0d1NhaDIyUnRJUjJYZGNVelJZL2V4V2w4ajJVV0w5Mkwxci82bWNjSVdrT1BUCnNmUWVYWWYxZThnNVk5Q1VSbThTNlloeURQOXFCQzk3QjEwenovNU1SN0YxdmtxMTI2OEtEek9GbWtWSnJLMkEKaXFNQk4xdkRSVkJURFVISFJ4V1lwTUpTSHJrOFRlVHhLVE1RNG12WGxCMzNUbElIZlU4L1ZOMEtQNFU5d0k5egpLNEI1NWFFc3QxUW5TWkw3cDlxMisvb20rdmtZUC9RblU4M3I4RlBFVTJ4R2ZzSTR0WFpzNkdseGZyVzMKLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tCg==&quot;</span>,<span class="token string">&quot;signerName&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;kubernetes.io/kube-apiserver-client&quot;</span>,<span class="token string">&quot;usages&quot;</span>:<span class="token punctuation">[</span><span class="token string">&quot;client auth&quot;</span><span class="token punctuation">]</span><span class="token punctuation">}</span><span class="token punctuation">}</span>
  creationTimestamp: <span class="token string">&quot;2021-11-24T22:47:57Z&quot;</span>
  name: Jane
  resourceVersion: <span class="token string">&quot;1127112&quot;</span>
  uid: 6f0b5433-e1d0-4f89-bbf1-a14fc1d0ad55
spec:
  expirationSeconds: <span class="token number">86400</span>
  groups:
  - system:masters
  - system:authenticated
  request: <span class="token assign-left variable">LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ21UQ0NBWUVDQVFBd1ZERUxNQWtHQTFVRUJoTUNRVlV4RXpBUkJnTlZCQWdNQ2xOdmJXVXRVM1JoZEdVeApJVEFmQmdOVkJBb01HRWx1ZEdWeWJtVjBJRmRwWkdkcGRITWdVSFI1SUV4MFpERU5NQXNHQTFVRUF3d0VTbUZ1ClpUQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQU5tb3dZUkdpbHlWSkVIbkxaUU0KSFEvQWRveG9CNmJUN2YvSjFuc2xBYXZEYm9Sc3BKdjBBcGh6a05RYXJDU1E1SDRYVjR2OGZDdDVmeGFyL294agpmUXVyWDNrbXk1SHpJTGFod0svWXUvWU01djhacG53S3J3RmpmTzVpVC9rRmhyOUF0VkhWL0ZMajBhZURzUHRaCjlaemduUXUwbUUxcmc5WWZBUVFxOHo5UjB5bGFxQ0V2SU9HVU5FRzBrNGN2K0lDNE96KzZjQmIyUGhLLzFKc3kKcUg3V3RONnIraDI0S0FveXExZDFSY1NIU0ppbVgwbkExNlFCYjRuRVFGc0xJaUtXSXRxQ1JXUm9WT2dqSDhMUQpOV1ZlQmRKRVh6MWxIYXhzVE56OEo0QVhUZGFTLzcwSDhMRXhCT3ppMXNXMFB1aldPRC8xRkVhc2dqY1NNUG9uCnVua0NBd0VBQWFBQU1BMEdDU3FHU0liM0RRRUJDd1VBQTRJQkFRQ2Z3ck5menl1blFtaUVBaXpxdzN6VGh0UkIKdjZtSmZVL2tNZTN1eHVDZm1MR3Y4OXpvZ3k3SWQxM25pdTE5Zzgzdy82UktkRFI1QVhXODk0L3daQi9CQjQwcgoyU3pQcmk5L3hMUkFManZnbWY0d1NhaDIyUnRJUjJYZGNVelJZL2V4V2w4ajJVV0w5Mkwxci82bWNjSVdrT1BUCnNmUWVYWWYxZThnNVk5Q1VSbThTNlloeURQOXFCQzk3QjEwenovNU1SN0YxdmtxMTI2OEtEek9GbWtWSnJLMkEKaXFNQk4xdkRSVkJURFVISFJ4V1lwTUpTSHJrOFRlVHhLVE1RNG12WGxCMzNUbElIZlU4L1ZOMEtQNFU5d0k5egpLNEI1NWFFc3QxUW5TWkw3cDlxMisvb20rdmtZUC9RblU4M3I4RlBFVTJ4R2ZzSTR0WFpzNkdseGZyVzMKLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tCg</span><span class="token operator">==</span>
  signerName: kubernetes.io/kube-apiserver-client
  usages:
  - client auth
  username: kubernetes-admin
status:
  certificate: <span class="token assign-left variable">LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURPakNDQWlLZ0F3SUJBZ0lSQU9MQzB0MXpQVUdIdkU0Z3ZJRUova0l3RFFZSktvWklodmNOQVFFTEJRQXcKRlRFVE1CRUdBMVVFQXhNS2EzVmlaWEp1WlhSbGN6QWVGdzB5TVRFeE1qUXlNalEzTVRKYUZ3MHlNVEV4TWpVeQpNalEzTVRKYU1GUXhDekFKQmdOVkJBWVRBa0ZWTVJNd0VRWURWUVFJRXdwVGIyMWxMVk4wWVhSbE1TRXdId1lEClZRUUtFeGhKYm5SbGNtNWxkQ0JYYVdSbmFYUnpJRkIwZVNCTWRHUXhEVEFMQmdOVkJBTVRCRXBoYm1Vd2dnRWkKTUEwR0NTcUdTSWIzRFFFQkFRVUFBNElCRHdBd2dnRUtBb0lCQVFEWnFNR0VSb3BjbFNSQjV5MlVEQjBQd0hhTQphQWVtMCszL3lkWjdKUUdydzI2RWJLU2I5QUtZYzVEVUdxd2trT1IrRjFlTC9Id3JlWDhXcS82TVkzMExxMTk1CkpzdVI4eUMyb2NDdjJMdjJET2IvR2FaOENxOEJZM3p1WWsvNUJZYS9RTFZSMWZ4UzQ5R25nN0Q3V2ZXYzRKMEwKdEpoTmE0UFdId0VFS3ZNL1VkTXBXcWdoTHlEaGxEUkJ0Sk9ITC9pQXVEcy91bkFXOWo0U3Y5U2JNcWgrMXJUZQpxL29kdUNnS01xdFhkVVhFaDBpWXBsOUp3TmVrQVcrSnhFQmJDeUlpbGlMYWdrVmthRlRvSXgvQzBEVmxYZ1hTClJGODlaUjJzYkV6Yy9DZUFGMDNXa3YrOUIvQ3hNUVRzNHRiRnREN28xamcvOVJSR3JJSTNFakQ2SjdwNUFnTUIKQUFHalJqQkVNQk1HQTFVZEpRUU1NQW9HQ0NzR0FRVUZCd01DTUF3R0ExVWRFd0VCL3dRQ01BQXdId1lEVlIwagpCQmd3Rm9BVTdMQXF5b3RONUltOFBQZnFlTEgwVmMvcjdNb3dEUVlKS29aSWh2Y05BUUVMQlFBRGdnRUJBRjljCnIyQWVuYVl1UDBvcmlLZTU5QjgwaWk2WUErbGdBelowU2lwdnhTYzlQbDBsZ3NuN01ibGtQdkc3MGM4S3UyRVIKRXl5WE9WcjFjcVhjSE1DNDk3b0hHQUM5L2ZDcitUc3lLT2x4L1A5TWxCOTRZdC9ZMStvd2drUndzajFnSnVHTQorbENlbUcyKy9yZCtWbTlHeEh0c3pxODZHa0tDNHVzV0dKMmhkZGVDYVV2OEdjZk9KMCtUT1orM3ZwNExIWmZ2CmFuakNEK2R2RzIxVW5SUXM2eUQyZUNDVG0ydVhVQkdNSnlkajFEUlNERis5b0ZRS2hvZVVPMnhUaWFpdFZEeTgKNy9RODZVb2hMS1lGQUdWTmFSazRDdDh0N2hMeFFVaU9USUcxajNUbi96T0lZd256aURCV0dhZ1RKOVNMbGk3RQovcGRlTWFReEFiMHdBMnkvbnlzPQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg</span><span class="token operator">==</span>
  conditions:
  - lastTransitionTime: <span class="token string">&quot;2021-11-24T22:52:12Z&quot;</span>
    lastUpdateTime: <span class="token string">&quot;2021-11-24T22:52:12Z&quot;</span>
    message: This CSR was approved by kubectl certificate approve.
    reason: KubectlApprove
    status: <span class="token string">&quot;True&quot;</span>
    type: Approved
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们可以通过 base64 将 CSR 中的证书解码导出然后在 作为登陆凭证配合在 kubeconfig 或者 RBAC 授权中。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>​​$ kubectl get csr Jane <span class="token parameter variable">-o</span> <span class="token assign-left variable">jsonpath</span><span class="token operator">=</span><span class="token string">&#39;{.status.certificate}&#39;</span> <span class="token operator">|</span> base64 <span class="token parameter variable">-d</span> <span class="token operator">&gt;</span> Jane.crt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_3-kubeconfig" tabindex="-1"><a class="header-anchor" href="#_3-kubeconfig" aria-hidden="true">#</a> 3. Kubeconfig</h3><p>有了用户信息后，我们可以通过 curl 或者 kubectl 访问集群了，我们可以在发起请求时配置证书或者在请求头中设置 token 进行验证。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">curl</span> <span class="token parameter variable">-k</span> https://172.19.0.7:6443/api <span class="token parameter variable">-H</span> <span class="token string">&quot;Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjFLMkVMNm5mMkFhYmQyMUdCVXp3OGdiZEs1dkdRQ3NNR0JWT0RZblIzYkkifQ...&quot;</span>

$ kubectl get pods <span class="token parameter variable">--server</span> https://172.19.0.7:6443 <span class="token punctuation">\\</span>
<span class="token operator">&gt;</span> --client-key admin.key <span class="token punctuation">\\</span>
<span class="token operator">&gt;</span> --client-certificate admin.crt <span class="token punctuation">\\</span>
<span class="token operator">&gt;</span> --certificate-authority ca.crt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>但每次都这样访问的话非常不方便，尤其是需要用不同身份访问不同集群时，Kubernetes 提供了 kubeconfig 配置文件让我们可以更方便的配置对集群的访问。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl get pods <span class="token parameter variable">--kubeconfig</span> /etc/kubernetes/admin.conf
NAME                         READY   STATUS    RESTARTS      AGE
php-apache-d4cf67d68-xsbbt   <span class="token number">1</span>/1     Running   <span class="token number">2</span> <span class="token punctuation">(</span>44h ago<span class="token punctuation">)</span>   7d15h
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>默认的 kubeconfig 配置文件位于 ~/.kube/config ，一般安装完成后我们会将 /etc/kubernetes/admin.conf 文件复制过来，这样我们就可以通过 kubectl 直接访问集群了。</p><p>可以通过查看文件或者 kubectl config view 命令查看</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code>$ kubectl config view
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Config
<span class="token key atrule">clusters</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">cluster</span><span class="token punctuation">:</span>
    <span class="token key atrule">certificate-authority-data</span><span class="token punctuation">:</span> DATA+OMITTED
    <span class="token key atrule">server</span><span class="token punctuation">:</span> https<span class="token punctuation">:</span>//172.19.0.7<span class="token punctuation">:</span><span class="token number">6443</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> kubernetes
<span class="token key atrule">contexts</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">context</span><span class="token punctuation">:</span>
    <span class="token key atrule">cluster</span><span class="token punctuation">:</span> kubernetes
    <span class="token key atrule">user</span><span class="token punctuation">:</span> kubernetes<span class="token punctuation">-</span>admin
  <span class="token key atrule">name</span><span class="token punctuation">:</span> kubernetes<span class="token punctuation">-</span>admin@kubernetes
<span class="token key atrule">current-context</span><span class="token punctuation">:</span> kubernetes<span class="token punctuation">-</span>admin@kubernetes
<span class="token key atrule">preferences</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token key atrule">users</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> kubernetes<span class="token punctuation">-</span>admin
  <span class="token key atrule">user</span><span class="token punctuation">:</span>
    <span class="token key atrule">client-certificate-data</span><span class="token punctuation">:</span> REDACTED
    <span class="token key atrule">client-key-data</span><span class="token punctuation">:</span> REDACTED
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Kubeconfig 文件可以分为三部分：</p><ul><li><strong>Clusters</strong>：要访问的集群，指定集群名称、访问地址以及 CA 证书。</li><li><strong>Users</strong>： 用户信息，指定用户名以及私钥、证书作为访问凭证。</li><li><strong>Contexts</strong>：访问上下文，指定用哪个用户访问哪个集群。</li></ul><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/e391b7298278647cdee8b4ef3e6be96a.png" alt="在这里插入图片描述"></p><p>通过添加不同的集群和用户，并设置不同的上下文，我们就可以在同一个终端对不同的集群进行访问。</p><p>除了直接修改文件外我们可以通过 kubectl config 命令来动态操作 kubeconfig 配置。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl config
Modify kubeconfig files using subcommands like <span class="token string">&quot;kubectl config set current-context my-context&quot;</span>

 The loading order follows these rules:

  <span class="token number">1</span>.  If the <span class="token parameter variable">--kubeconfig</span> flag is set, <span class="token keyword">then</span> only that <span class="token function">file</span> is loaded. The flag may only be <span class="token builtin class-name">set</span> once and no merging takes
place.
  <span class="token number">1</span>.  If <span class="token variable">$KUBECONFIG</span> environment variable is set, <span class="token keyword">then</span> it is used as a list of paths <span class="token punctuation">(</span>normal path delimiting rules <span class="token keyword">for</span>
your system<span class="token punctuation">)</span>. These paths are merged. When a value is modified, it is modified <span class="token keyword">in</span> the <span class="token function">file</span> that defines the stanza. When
a value is created, it is created <span class="token keyword">in</span> the first <span class="token function">file</span> that exists. If no files <span class="token keyword">in</span> the chain exist, <span class="token keyword">then</span> it creates the
last <span class="token function">file</span> <span class="token keyword">in</span> the list.
  <span class="token number">1</span>.  Otherwise, <span class="token variable">\${<span class="token environment constant">HOME</span>}</span>/.kube/config is used and no merging takes place.

Available Commands:
  current-context Display the current-context
  delete-cluster  Delete the specified cluster from the kubeconfig
  delete-context  Delete the specified context from the kubeconfig
  delete-user     Delete the specified user from the kubeconfig
  get-clusters    Display clusters defined <span class="token keyword">in</span> the kubeconfig
  get-contexts    Describe one or many contexts
  get-users       Display <span class="token function">users</span> defined <span class="token keyword">in</span> the kubeconfig
  rename-context  Rename a context from the kubeconfig <span class="token function">file</span>
  <span class="token builtin class-name">set</span>             Set an individual value <span class="token keyword">in</span> a kubeconfig <span class="token function">file</span>
  set-cluster     Set a cluster entry <span class="token keyword">in</span> kubeconfig
  set-context     Set a context entry <span class="token keyword">in</span> kubeconfig
  set-credentials Set a user entry <span class="token keyword">in</span> kubeconfig
  <span class="token builtin class-name">unset</span>           Unset an individual value <span class="token keyword">in</span> a kubeconfig <span class="token function">file</span>
  use-context     Set the current-context <span class="token keyword">in</span> a kubeconfig <span class="token function">file</span>
  view            Display merged kubeconfig settings or a specified kubeconfig <span class="token function">file</span>

Usage:
  kubectl config SUBCOMMAND <span class="token punctuation">[</span>options<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>比如我每次查看 order 命名空间下的资源对象都需要加 -n 指定 namespace 比较麻烦，我可以新加一个 context 使得每次默认访问 easemesh 命名空间下的对象。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token number">1</span>. 新建 context
$ kubectl config set-context order-checker <span class="token parameter variable">--cluster</span><span class="token operator">=</span>kubernetes <span class="token parameter variable">--user</span><span class="token operator">=</span>kubernetes-admin <span class="token parameter variable">--namespace</span><span class="token operator">=</span>order
Context <span class="token string">&quot;order-checker&quot;</span> created.

$ kubectl config current-context
kubernetes-admin@kubernetes


<span class="token number">2</span>. 切换 context 
$ kubectl config use-context order-checker
Switched to context <span class="token string">&quot;order-checker&quot;</span><span class="token builtin class-name">.</span>


$ kubectl get pods
NAME                                                READY   STATUS    RESTARTS      AGE
order-control-plane-0                            <span class="token number">1</span>/1     Running   <span class="token number">0</span>             24h
order-operator-6754847bb7-fcglb                  <span class="token number">2</span>/2     Running   <span class="token number">4</span> <span class="token punctuation">(</span>44h ago<span class="token punctuation">)</span>   7d15h


$ kubectl config current-context
order-checker
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在 CKA/CKAD 考试中一般会提供若干个集群供我们操作，会频繁的用到 kubectl config use-context 来切换上下文。</p><h3 id="_4-授权" tabindex="-1"><a class="header-anchor" href="#_4-授权" aria-hidden="true">#</a> 4. 授权</h3><p>有了身份认证后还需要权限认证来确认请求者是否有权限执行操作：</p><table><thead><tr><th>认证方式</th><th>实现方式</th><th>使用方式</th></tr></thead><tbody><tr><td>Node 授权</td><td>apiserver 内置</td><td>内部使用（kubelet）</td></tr><tr><td>ABAC</td><td>静态文件</td><td>已弃用</td></tr><tr><td>RBAC</td><td>Kuberetes 对象</td><td>用户/管理员授权</td></tr><tr><td>WebHook</td><td>外部服务</td><td></td></tr><tr><td>Always Dency/Always Allow</td><td>apiserver 内置</td><td>测试时使用</td></tr></tbody></table><h4 id="_4-1-rbac" tabindex="-1"><a class="header-anchor" href="#_4-1-rbac" aria-hidden="true">#</a> 4.1 RBAC</h4><p>基于角色的访问控制（Role-Based Access Control, 即”RBAC”）使用<code>rbac.authorization.k8s.io</code> API Group 实现授权决策，允许管理员通过 Kubernetes API 动态配置策略。要启用 RBAC，需使用 <code>--authorization-mode=RBAC</code> 启动 API Server。</p><p>Kubernetes 中 RBAC 的核心是通过 Role/ClusterRole、RoleBinding/ClusterRoleBind 来完成授权策略的定义：</p><ul><li><strong>Role/ClusterRole</strong>: 在 namespace 或者集群层面定义针对资源的权限集合</li><li><strong>RoleBinding/ClusterRoleBinding</strong>: 将 Role/ClusterRole 绑定到目标对象完成授权，目前 Kubernetes 支持给 User、Group、ServiceAccount 三种对象授权。</li></ul><h5 id="_4-1-1-roles-clusterroles" tabindex="-1"><a class="header-anchor" href="#_4-1-1-roles-clusterroles" aria-hidden="true">#</a> 4.1.1 Roles &amp; ClusterRoles</h5><p>Role 代表对某个单一命名空间下的访问权限，而如果相对整个集群内的某些资源拥有权限，则需要通过 ClusterRole 实现。</p><p>以下是在 ”default” 命名空间中一个 Role 对象的定义，用于授予对 pod 的读访问权限：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">kind</span><span class="token punctuation">:</span> Role
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> rbac.authorization.k8s.io/v1beta1
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">namespace</span><span class="token punctuation">:</span> default
  <span class="token key atrule">name</span><span class="token punctuation">:</span> pod<span class="token punctuation">-</span>reader
<span class="token key atrule">rules</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;&quot;</span><span class="token punctuation">]</span> <span class="token comment"># 空字符串&quot;&quot; 表明使用 core API group</span>
  <span class="token key atrule">resources</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;pods&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">verbs</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;get&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;watch&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;list&quot;</span><span class="token punctuation">,</span> “”<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下面例子是 ClusterRole 的定义示例，用于授予用户对某一特定命名空间，或者所有命名空间中的 secret（取决于其绑定方式）的读访问权限：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">kind</span><span class="token punctuation">:</span> ClusterRole
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> rbac.authorization.k8s.io/v1beta1
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token comment"># 鉴于 ClusterRole 是集群范围对象，所以这里不需要定义 &quot;namespace&quot; 字段</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> secret<span class="token punctuation">-</span>reader
<span class="token key atrule">rules</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">resources</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;secrets&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">verbs</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;get&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;watch&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;list&quot;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>权限集合的定义在 rules 中，包含三部分：</p><p><strong>apiGroups</strong></p><p>API 组，资源所在的组，比如 Job 对象在 batch 组，Deploymet 在 app 组。可以通过 kubectl api-resources 命令查看其 apiversion 中的组。如果是空字符串代表 core 组。</p><p><strong>resources</strong></p><p>具体的资源列表，比如 pods，cronjobs 等。大多数资源由代表其名字的字符串表示，例如”pods”，但有一些 Kubernetes API 还 包含了“子资源”，比如 pod 的 logs。在 Kubernetes 中，pod logs endpoint 的 URL 格式为：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>GET /api/v1/namespaces/<span class="token punctuation">{</span>namespace<span class="token punctuation">}</span>/pods/<span class="token punctuation">{</span>name<span class="token punctuation">}</span>/log
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>在这种情况下，”pods” 是命名空间资源，而 “log” 是 pods 的子资源。为了在 RBAC 的角色中表示出这一点，我们需要使用斜线来划分资源 与子资源。如果需要角色绑定主体读取 pods 以及 pod log，您需要定义以下角色：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">kind</span><span class="token punctuation">:</span> Role
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> rbac.authorization.k8s.io/v1beta1
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">namespace</span><span class="token punctuation">:</span> default
  <span class="token key atrule">name</span><span class="token punctuation">:</span> pod<span class="token punctuation">-</span>and<span class="token punctuation">-</span>pod<span class="token punctuation">-</span>logs<span class="token punctuation">-</span>reader
<span class="token key atrule">rules</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">resources</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;pods&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;pods/log&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">verbs</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;get&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;list&quot;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>另外可以通过设置 <code>resourceNames</code> 表示针对某个特定的对象的操作权限，此时请求所使用的动词不能是 list、watch、create 或者 deletecollection，因为资源名不会出现在 create、list、watch 和 deletecollection 等的 API 请求中。</p><p>除了针对 API Object 这些资源外，我们还需要对其他非资源类的 API 进行授权，此时需要通过 nonResourceURLs 资源来指定 URL 进行授权。下面是一个示例，表示对 “/healthz” 及其所有子路径有”GET” 和”POST” 的请求权限。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">rules</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">nonResourceURLs</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;/healthz&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;/healthz/*&quot;</span><span class="token punctuation">]</span> <span class="token comment"># 在非资源 URL 中，&#39;*&#39; 代表后缀通配符</span>
  <span class="token key atrule">verbs</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;get&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;post&quot;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>verbs</strong></p><p>一系列动词集合，代表允许对资源执行的操作，本质上可以发起的请求类型。动词选项和 HTTP 请求对应如下：</p><table><thead><tr><th>verb</th><th>含义</th><th>HTTP 请求</th></tr></thead><tbody><tr><td>get</td><td>获取单个资源</td><td>GET，HEAD</td></tr><tr><td>list</td><td>获取一组资源</td><td>GET，HEAD</td></tr><tr><td>watch</td><td>获取单个资源</td><td>GET，HEAD</td></tr><tr><td>create</td><td>创建资源</td><td>POST</td></tr><tr><td>update</td><td>更新资源</td><td>PUT</td></tr><tr><td>patch</td><td>更新资源</td><td>PATCH</td></tr><tr><td>delete</td><td>局部更新资源</td><td>DELETE</td></tr><tr><td>deletecollection</td><td>删除一组资源</td><td>DELETE</td></tr></tbody></table><p>通过 <code>kubectl get clusterrole</code> 或 <code>kubectl get role --all-namespace</code> 可以查出 K8s 的所有的 ClusterRole 和 Role。通过 <code>kubectl describe clusterrole &lt;role&gt;</code> 可以看到这些role在哪些资源上有什么样的权限。</p><p>下面是一些示例：</p><ul><li>允许读取 core API Group 中定义的资源”pods”：</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">rules</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">resources</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;pods&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">verbs</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;get&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;list&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;watch&quot;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>允许读写在”extensions” 和”apps” API Group 中定义的”deployments”：</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">rules</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;extensions&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;apps&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">resources</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;deployments&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">verbs</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;get&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;list&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;watch&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;create&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;update&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;patch&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;delete&quot;</span><span class="token punctuation">]</span>
  ··\`


<span class="token punctuation">-</span> 允许读取”pods” 以及读写”jobs”：

\`\`\`yaml
<span class="token key atrule">rules</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">resources</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;pods&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">verbs</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;get&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;list&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;watch&quot;</span><span class="token punctuation">]</span>
<span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;batch&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;extensions&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">resources</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;jobs&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">verbs</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;get&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;list&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;watch&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;create&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;update&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;patch&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;delete&quot;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>允许读取一个名为 ”my-config” 的ConfigMap实例（需要将其通过RoleBinding绑定从而限制针对某一个命名空间中定义的一个ConfigMap实例的访问）：</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">rules</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">resources</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;configmaps&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">resourceNames</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;my-config&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">verbs</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;get&quot;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>允许读取 core API Group 中的”nodes” 资源，由于Node是集群级别资源，所以此ClusterRole 定义需要与一个 ClusterRoleBinding绑定才能有效。</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">rules</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">resources</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;nodes&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">verbs</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;get&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;list&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;watch&quot;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_4-1-2-rolebinding-clusterrolebinding" tabindex="-1"><a class="header-anchor" href="#_4-1-2-rolebinding-clusterrolebinding" aria-hidden="true">#</a> 4.1.2 RoleBinding &amp; ClusterRoleBinding</h5><p>角色绑定将一个角色中定义的各种权限授予一个或者一组用户。 角色绑定包含了一组相关 subject 主体, subject 包括用户 User、用户组 Group、或者服务账户 Service Account 以及对被授予角色的引用。</p><p>在命名空间中可以通过 RoleBinding 对象授予权限，而集群范围的权限授予则通过 ClusterRoleBinding 对象完成。</p><p>ClusterRole 可以通过 RoleBinding 进行角色绑定，但仅对 RoleBinding 所在命名空间有效。</p><p>下面示例是一些示例：</p><ul><li>在 default 命名空间中将 pod-reader 角色授予用户 jane， 允许用户 jane 从 default 命名空间中读取 pod。</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">kind</span><span class="token punctuation">:</span> RoleBinding
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> rbac.authorization.k8s.io/v1beta1
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> read<span class="token punctuation">-</span>pods
  <span class="token key atrule">namespace</span><span class="token punctuation">:</span> default
<span class="token key atrule">subjects</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">kind</span><span class="token punctuation">:</span> User
  <span class="token key atrule">name</span><span class="token punctuation">:</span> jane
  <span class="token key atrule">apiGroup</span><span class="token punctuation">:</span> rbac.authorization.k8s.io
<span class="token key atrule">roleRef</span><span class="token punctuation">:</span>
  <span class="token key atrule">kind</span><span class="token punctuation">:</span> Role
  <span class="token key atrule">name</span><span class="token punctuation">:</span> pod<span class="token punctuation">-</span>reader
  <span class="token key atrule">apiGroup</span><span class="token punctuation">:</span> rbac.authorization.k8s.io
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>ClusterRoleBinding 对象允许在用户组 &quot;manager&quot; 中的任何用户都可以读取集群中任何命名空间中的 secret。</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">kind</span><span class="token punctuation">:</span> ClusterRoleBinding
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> rbac.authorization.k8s.io/v1beta1
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> read<span class="token punctuation">-</span>secrets<span class="token punctuation">-</span>global
<span class="token key atrule">subjects</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">kind</span><span class="token punctuation">:</span> Group
  <span class="token key atrule">name</span><span class="token punctuation">:</span> manager
  <span class="token key atrule">apiGroup</span><span class="token punctuation">:</span> rbac.authorization.k8s.io
<span class="token key atrule">roleRef</span><span class="token punctuation">:</span>
  <span class="token key atrule">kind</span><span class="token punctuation">:</span> ClusterRole
  <span class="token key atrule">name</span><span class="token punctuation">:</span> secret<span class="token punctuation">-</span>reader
  <span class="token key atrule">apiGroup</span><span class="token punctuation">:</span> rbac.authorization.k8s.io
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_4-1-3-命令行工具" tabindex="-1"><a class="header-anchor" href="#_4-1-3-命令行工具" aria-hidden="true">#</a> 4.1.3 命令行工具</h5><p>除了定义 yaml 文武兼外，对于 rolebinding 的操作可以通过命令行方便的完成，下面是一些示例：</p><p>在某一特定命名空间内授予 Role 或者 ClusterRole。示例如下：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 在名为&quot;acme&quot; 的命名空间中将 admin ClusterRole 授予用户&quot;bob&quot;：</span>
kubectl create rolebinding bob-admin-binding <span class="token parameter variable">--clusterrole</span><span class="token operator">=</span>admin <span class="token parameter variable">--user</span><span class="token operator">=</span>bob <span class="token parameter variable">--namespace</span><span class="token operator">=</span>acme

<span class="token comment"># 在名为&quot;acme&quot; 的命名空间中将 view ClusterRole 授予服务账户&quot;myapp&quot;：</span>
kubectl create rolebinding myapp-view-binding <span class="token parameter variable">--clusterrole</span><span class="token operator">=</span>view <span class="token parameter variable">--serviceaccount</span><span class="token operator">=</span>acme:myapp <span class="token parameter variable">--namespace</span><span class="token operator">=</span>acme
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在整个集群中授予 ClusterRole，包括所有命名空间。示例如下：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># 在整个集群范围内将 cluster-admin ClusterRole 授予用户&quot;root&quot;：</span>
kubectl create clusterrolebinding root-cluster-admin-binding <span class="token parameter variable">--clusterrole</span><span class="token operator">=</span>cluster-admin <span class="token parameter variable">--user</span><span class="token operator">=</span>root

<span class="token comment"># 在整个集群范围内将 system:node ClusterRole 授予用户&quot;kubelet&quot;：</span>
kubectl create clusterrolebinding kubelet-node-binding <span class="token parameter variable">--clusterrole</span><span class="token operator">=</span>system:node <span class="token parameter variable">--user</span><span class="token operator">=</span>kubelet

<span class="token comment"># 在整个集群范围内将 view ClusterRole 授予命名空间&quot;acme&quot; 内的服务账户&quot;myapp&quot;：</span>
kubectl create clusterrolebinding myapp-view-binding <span class="token parameter variable">--clusterrole</span><span class="token operator">=</span>view <span class="token parameter variable">--serviceaccount</span><span class="token operator">=</span>acme:myapp
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-准入控制" tabindex="-1"><a class="header-anchor" href="#_5-准入控制" aria-hidden="true">#</a> 5. 准入控制</h3><p>请求在完成认证和授权之后，对象在被持久化到 etcd 之前，还需要通过一系列的准入控制器进行验证。如同我们业务系统一样，除了需要验证登陆用户的身份、操作权限外，还需要验证用户的操作对不对，比如提交一个表单，要看下必填项是否都填了，手机号码的格式是否正确等，甚至还可能要拦截请求做额外的处理，比如注入请求头做流量着色。</p><p>Kubernetes 也一样，需要对外部提交的请求做校验、拦截修改等操作。所谓准入控制器就是一系列的插件，每个插件都有其特定的功能，比如允许哪些请求进入，限定对资源的使用，设定 Pod 的安全策略等。它们作为看门人（gatekeeper）来对发送到 Kubernetes 做拦截验证，从而实现对集群使用方式的管理，</p><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/55299c8f8c185258c4980dff5557df11.png" alt="在这里插入图片描述"></p><p>图片来自 https://sysdig.com/blog/kubernetes-admission-controllers/</p><p>准入控制器的操作有两种：</p><ul><li><strong>mutating</strong> ：拦截并修改请求</li><li><strong>validating</strong>：验证请求的合法性</li></ul><p>一个准入控制器可以是只执行 mutating 或者 validating ，也可以两个都执行，先执行 mutating 在执行 validating。</p><p>Kubernetes 本身已经提供了很多的准入控制器插件，可以通过以下命令查看：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kube-apiserver <span class="token parameter variable">-h</span> <span class="token operator">|</span> <span class="token function">grep</span> enable-admission-plugins
CertificateApproval, CertificateSigning, CertificateSubjectRestriction, DefaultIngressClass, DefaultStorageClass, DefaultTolerationSeconds, LimitRanger, MutatingAdmissionWebhook, NamespaceLifecycle, PersistentVolumeClaimResize, Priority, ResourceQuota, RuntimeClass, ServiceAccount, StorageObjectInUseProtection, TaintNodesByCondition, ValidatingAdmissionWebhook
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,93)),s("p",null,[n[10]||(n[10]=a("每个准入控制器插件基本都是实现了某一特定的功能，在启动 kube-apiserver 时可以通过设置 ",-1)),n[11]||(n[11]=s("code",null,"--enable-admission-plugins，--disable-admission-plugins",-1)),n[12]||(n[12]=a(" 参数来启动或者禁用某些注入控制器。已有的控制器类型可以参考 ",-1)),s("a",m,[n[9]||(n[9]=a("文档",-1)),t(e)]),n[13]||(n[13]=a("。",-1))]),n[37]||(n[37]=p('<h4 id="_5-1-动态准入控制" tabindex="-1"><a class="header-anchor" href="#_5-1-动态准入控制" aria-hidden="true">#</a> 5.1 动态准入控制</h4><p>在 Kubernetes 默认的准入控制器中，有两个特殊的控制器：</p><ul><li>MutatingAdmissionWebhook</li><li>ValidatingAdmissionWebhook</li></ul><p>它们以 WebHook 的方式提供扩展能力，我们可以在集群中创建相关的 WebHook 配置并在配置中选择想要关注的资源对象，这样对应的资源对象在执行操作时就可以触发 WebHook，然后我们可以编写具体的响应代码实现准入控制。</p><p><code>MutatingAdmissionWebhook</code> 用来修改用户的请求，执行 mutating 操作，比如修改镜像、添加注解、注入 SideCar 等。</p><p><code>ValidatingAdmissionWebhook</code> 则只能用来做校验，比如检查命名规范，检查镜像的使用。 MutatingAdmissionWebhook 会在 ValidatingAdmissionWebhook 前执行。</p><p>想要自定义准入控制策略，集群需要满足以下条件：</p><ul><li>确保 Kubernetes 集群版本至少为 v1.16（以便使用 admissionregistration.k8s.io/v1 API） 或者 v1.9 （以便使用 admissionregistration.k8s.io/v1beta1 API）。</li><li>确保启用 MutatingAdmissionWebhook 和 ValidatingAdmissionWebhook 控制器。</li><li>确保启用了 admissionregistration.k8s.io/v1 或者 admissionregistration.k8s.io/v1beta1 API。</li></ul><p>为了实现自定义的 WebHook，我们主要需要两步操作：</p><ul><li>创建 webhook server</li><li>创建 webhook 配置</li></ul><h5 id="_5-1-1-webhook-server" tabindex="-1"><a class="header-anchor" href="#_5-1-1-webhook-server" aria-hidden="true">#</a> 5.1.1 WebHook Server</h5><p>所谓 WebHook Server 就是 在 webhook 触发时的响应服务：</p>',12)),s("ul",null,[n[17]||(n[17]=s("li",null,"本质上是一个 HTTP 服务，接收 POST + JSON 请求",-1)),s("li",null,[n[15]||(n[15]=a("请求和响应都是一个 ",-1)),s("a",b,[n[14]||(n[14]=a("AdmissionReview",-1)),t(e)]),n[16]||(n[16]=a(" 对象，其内部包含 request 和 response 两个对象。",-1))]),n[18]||(n[18]=s("li",null,[a("每个请求都有 uid 字段；而响应则必须含有如下字段： "),s("ul",null,[s("li",null,"uid 字段：从请求中拷贝的 uid。"),s("li",null,"allowed: true 或者 false，表示是否允许请求执行")])],-1))]),n[38]||(n[38]=p(`<div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token punctuation">{</span>
  <span class="token string">&quot;apiVersion&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;admission.k8s.io/v1&quot;</span>,
  <span class="token string">&quot;kind&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;AdmissionReview&quot;</span>,
  <span class="token string">&quot;response&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">{</span>
    <span class="token string">&quot;uid&quot;</span><span class="token builtin class-name">:</span> <span class="token string">&quot;&lt;value from request.uid&gt;&quot;</span>,
    <span class="token string">&quot;allowed&quot;</span><span class="token builtin class-name">:</span> <span class="token boolean">true</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>因此，我们的任务就是编写一个 HTTP 服务，来接收 AdmissionReview 的请求并返回 AdmissionReview 响应。</p><h5 id="_5-1-2-webhook-配置" tabindex="-1"><a class="header-anchor" href="#_5-1-2-webhook-配置" aria-hidden="true">#</a> 5.1.2 WebHook 配置</h5><p>有了 WebHook server 后，我们就可以创建配置来指定要选择的资源以及响应服务了。 Kubernetes 提供了 <code>MutatingWebhookConfiguration</code> 和 <code>ValidatingWebhookConfiguration</code> 两种 API 对象来让我们动态的创建准入控制的配置。顾名思义，前者用来拦截并修改请求，后者用来验证请求是否正确。下面是一个 <code>ValidatingWebhookConfiguration</code> 配置示例：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> admissionregistration.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> ValidatingWebhookConfiguration
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> <span class="token string">&quot;pod-policy.example.com&quot;</span>
<span class="token key atrule">webhooks</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> <span class="token string">&quot;pod-policy.example.com&quot;</span>
  <span class="token key atrule">rules</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span>   <span class="token punctuation">[</span><span class="token string">&quot;&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">apiVersions</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;v1&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">operations</span><span class="token punctuation">:</span>  <span class="token punctuation">[</span><span class="token string">&quot;CREATE&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">resources</span><span class="token punctuation">:</span>   <span class="token punctuation">[</span><span class="token string">&quot;pods&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">scope</span><span class="token punctuation">:</span>       <span class="token string">&quot;Namespaced&quot;</span>
  <span class="token key atrule">clientConfig</span><span class="token punctuation">:</span>
    <span class="token key atrule">service</span><span class="token punctuation">:</span>
      <span class="token key atrule">namespace</span><span class="token punctuation">:</span> <span class="token string">&quot;example-namespace&quot;</span>
      <span class="token key atrule">name</span><span class="token punctuation">:</span> <span class="token string">&quot;example-service&quot;</span>
    <span class="token key atrule">caBundle</span><span class="token punctuation">:</span> <span class="token string">&quot;Ci0tLS0tQk...&lt;\`caButLS0K&quot;</span>
  <span class="token key atrule">admissionReviewVersions</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;v1&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;v1beta1&quot;</span><span class="token punctuation">]</span>
  <span class="token key atrule">sideEffects</span><span class="token punctuation">:</span> None
  <span class="token key atrule">timeoutSeconds</span><span class="token punctuation">:</span> <span class="token number">5</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到 API 对象就是用来定义一系列的 webhook 的，每个 webhook 的配置包含以下主要字段：</p><p><strong>rules</strong></p><p>每个webhook 需要设置一系列规则来确认某个请求是否需要发送给 webhook。每个规则可以指定一个或多个 operations、apiGroups、apiVersions 和 resources 以及资源的 scope：</p><ul><li><strong>operations</strong> 列出一个或多个要匹配的操作。 可以是 CREATE、UPDATE、DELETE、CONNECT 或 * 以匹配所有内容。</li><li><strong>apiGroups</strong> 列出了一个或多个要匹配的 API 组。&quot;&quot; 是核心 API 组。&quot;*&quot; 匹配所有 API 组。</li><li><strong>apiVersions</strong> 列出了一个或多个要匹配的 API 版本。&quot;*&quot; 匹配所有 API 版本。</li><li><strong>resources</strong> 列出了一个或多个要匹配的资源。 <ul><li>&quot;*&quot; 匹配所有资源，但不包括子资源。</li><li>&quot;<em>/</em>&quot; 匹配所有资源，包括子资源。</li><li>&quot;pods/*&quot; 匹配 pod 的所有子资源。</li><li>&quot;*/status&quot; 匹配所有 status 子资源。</li></ul></li><li><strong>scope</strong> 指定要匹配的范围。有效值为 &quot;Cluster&quot;、&quot;Namespaced&quot; 和 &quot;<em>&quot;。 子资源匹配其父资源的范围。在 Kubernetes v1.14+ 版本中才被支持。 默认值为 &quot;</em>&quot;，对应 1.14 版本之前的行为。 <ul><li>&quot;Cluster&quot; 表示只有集群作用域的资源才能匹配此规则（API 对象 Namespace 是集群作用域的）。</li><li>&quot;Namespaced&quot; 意味着仅具有名字空间的资源才符合此规则。</li><li>&quot;*&quot; 表示没有范围限制。</li></ul></li></ul><p>下面示例表示匹配针对 apps/v1 和 apps/v1beta1 组中 deployments 和 replicasets 资源的 CREATE 或 UPDATE 请求</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> admissionregistration.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> ValidatingWebhookConfiguration
<span class="token punctuation">...</span>
<span class="token key atrule">webhooks</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>webhook.example.com
  <span class="token key atrule">rules</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">operations</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;CREATE&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;UPDATE&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;apps&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">apiVersions</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;v1&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;v1beta1&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">resources</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;deployments&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;replicasets&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">scope</span><span class="token punctuation">:</span> <span class="token string">&quot;Namespaced&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>objectSelector</strong></p><p>根据发送对象的标签来判断是否拦截，如下面示例，任何带有 foo=bar 标签的对象创建请求都会被拦截触发 webhook。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> admissionregistration.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> MutatingWebhookConfiguration
<span class="token punctuation">...</span>
<span class="token key atrule">webhooks</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>webhook.example.com
  <span class="token key atrule">objectSelector</span><span class="token punctuation">:</span>
    <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
      <span class="token key atrule">foo</span><span class="token punctuation">:</span> bar
  <span class="token key atrule">rules</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">operations</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;CREATE&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">apiGroups</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;*&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">apiVersions</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;*&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">resources</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;*&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">scope</span><span class="token punctuation">:</span> <span class="token string">&quot;*&quot;</span>
  <span class="token punctuation">...</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>namespaceSelector</strong></p>`,15)),s("p",null,[n[20]||(n[20]=a("匹配命名空间，根据资源对象所在的命名空间作拦截，下面是 ",-1)),s("a",g,[n[19]||(n[19]=a("EaseMesh",-1)),t(e)]),n[21]||(n[21]=a(" 的示例， 针对带有 ",-1)),n[22]||(n[22]=s("code",null,"mesh.megaease.com/mesh-service",-1)),n[23]||(n[23]=a(" 标签的，除 easemesh、kube-system、kube-public 之外的命名空间中的对象，如果对象符合 rules 中的定义，则会将请求发送到 webhook server。",-1))]),n[39]||(n[39]=p(`<div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> admissionregistration.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> MutatingWebhookConfiguration
<span class="token punctuation">...</span>
<span class="token key atrule">webhooks</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> mesh<span class="token punctuation">-</span>injector.megaease.com
  <span class="token key atrule">namespaceSelector</span><span class="token punctuation">:</span>
    <span class="token key atrule">matchExpressions</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> kubernetes.io/metadata.name
      <span class="token key atrule">operator</span><span class="token punctuation">:</span> NotIn
      <span class="token key atrule">values</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> easemesh
      <span class="token punctuation">-</span> kube<span class="token punctuation">-</span>system
      <span class="token punctuation">-</span> kube<span class="token punctuation">-</span>public
    <span class="token punctuation">-</span> <span class="token key atrule">key</span><span class="token punctuation">:</span> mesh.megaease.com/mesh<span class="token punctuation">-</span>service
      <span class="token key atrule">operator</span><span class="token punctuation">:</span> Exists
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>clientConfig</strong></p><p>这里配置的就是我们的 Webhook Server 访问地址以及验证信息。当一个请求经由上述选择规则确定要发送到 webhook 后，就会根据 clientConfig 中配置的信息向我们的 WebHook Server 发送请求。 WebHook Server 可以分为集群内和集群外部的服务，如果是集群外部的服务需要配置访问 URL，示例如下：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> admissionregistration.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> MutatingWebhookConfiguration
<span class="token punctuation">...</span>
<span class="token key atrule">webhooks</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>webhook.example.com
  <span class="token key atrule">clientConfig</span><span class="token punctuation">:</span>
    <span class="token key atrule">url</span><span class="token punctuation">:</span> <span class="token string">&quot;https://my-webhook.example.com:9443/my-webhook-path&quot;</span>
  <span class="token punctuation">...</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果是集群内部的服务，则可以通过配置服务名后通过 Kubernetes 的 DNS 访问到，下面是 EaseMesh 中的示例：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code>➜  ~  <span class="token punctuation">|</span><span class="token punctuation">&gt;</span>kubectl get svc <span class="token punctuation">-</span>n easemesh                                                            
NAME                                               TYPE        CLUSTER<span class="token punctuation">-</span>IP      EXTERNAL<span class="token punctuation">-</span>IP   PORT(S)                                        AGE
easemesh<span class="token punctuation">-</span>operator<span class="token punctuation">-</span>service                          ClusterIP   10.233.53.203   &lt;none<span class="token punctuation">&gt;</span>        8443/TCP<span class="token punctuation">,</span>9090/TCP

 
<span class="token key atrule">clientConfig</span><span class="token punctuation">:</span>
    <span class="token key atrule">caBundle</span><span class="token punctuation">:</span>  LS0<span class="token punctuation">...</span>tCg==
    <span class="token key atrule">service</span><span class="token punctuation">:</span>
      <span class="token key atrule">Name</span><span class="token punctuation">:</span>        easemesh<span class="token punctuation">-</span>operator<span class="token punctuation">-</span>service
      <span class="token key atrule">Namespace</span><span class="token punctuation">:</span>   easemesh
      <span class="token key atrule">Path</span><span class="token punctuation">:</span>        /mutate
      <span class="token key atrule">Port</span><span class="token punctuation">:</span>        <span class="token number">9090</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,6)),s("p",null,[n[25]||(n[25]=a("下面是官方文档中提供的一个例子 ",-1)),s("a",y,[n[24]||(n[24]=a("admission-controller-webhook-demo",-1)),t(e)]),n[26]||(n[26]=a(" ， 该应用的目的是要限制 Pod 的权限，尽量避免以 root 用户的身份运行：",-1))]),n[40]||(n[40]=p(`<ul><li>如果 Pod 没有明确设置 runAsNonRoot，则默认添加 runAsNonRoot: true ；如果没有设置 runAsUser 则默认添加 runAsUser: 1234 配置。</li><li>如果设置 runAsNonRoot 为 true，则校验 runAsUser 是否等于 0（root)，不等于的话 Pod 会创建失败。</li></ul><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">var</span> runAsNonRoot <span class="token operator">*</span><span class="token builtin">bool</span>
<span class="token keyword">var</span> runAsUser <span class="token operator">*</span><span class="token builtin">int64</span>
<span class="token keyword">if</span> pod<span class="token punctuation">.</span>Spec<span class="token punctuation">.</span>SecurityContext <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
  runAsNonRoot <span class="token operator">=</span> pod<span class="token punctuation">.</span>Spec<span class="token punctuation">.</span>SecurityContext<span class="token punctuation">.</span>RunAsNonRoot
  runAsUser <span class="token operator">=</span> pod<span class="token punctuation">.</span>Spec<span class="token punctuation">.</span>SecurityContext<span class="token punctuation">.</span>RunAsUser
<span class="token punctuation">}</span>

<span class="token comment">// Create patch operations to apply sensible defaults, if those options are not set explicitly.</span>
<span class="token keyword">var</span> patches <span class="token punctuation">[</span><span class="token punctuation">]</span>patchOperation
<span class="token keyword">if</span> runAsNonRoot <span class="token operator">==</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
  patches <span class="token operator">=</span> <span class="token function">append</span><span class="token punctuation">(</span>patches<span class="token punctuation">,</span> patchOperation<span class="token punctuation">{</span>
     Op<span class="token punctuation">:</span>   <span class="token string">&quot;add&quot;</span><span class="token punctuation">,</span>
     Path<span class="token punctuation">:</span> <span class="token string">&quot;/spec/securityContext/runAsNonRoot&quot;</span><span class="token punctuation">,</span>
     <span class="token comment">// The value must not be true if runAsUser is set to 0, as otherwise we would create a conflicting</span>
     <span class="token comment">// configuration ourselves.</span>
     Value<span class="token punctuation">:</span> runAsUser <span class="token operator">==</span> <span class="token boolean">nil</span> <span class="token operator">||</span> <span class="token operator">*</span>runAsUser <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span>

  <span class="token keyword">if</span> runAsUser <span class="token operator">==</span> <span class="token boolean">nil</span> <span class="token punctuation">{</span>
     patches <span class="token operator">=</span> <span class="token function">append</span><span class="token punctuation">(</span>patches<span class="token punctuation">,</span> patchOperation<span class="token punctuation">{</span>
        Op<span class="token punctuation">:</span>    <span class="token string">&quot;add&quot;</span><span class="token punctuation">,</span>
        Path<span class="token punctuation">:</span>  <span class="token string">&quot;/spec/securityContext/runAsUser&quot;</span><span class="token punctuation">,</span>
        Value<span class="token punctuation">:</span> <span class="token number">1234</span><span class="token punctuation">,</span>
     <span class="token punctuation">}</span><span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token operator">*</span>runAsNonRoot <span class="token operator">==</span> <span class="token boolean">true</span> <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>runAsUser <span class="token operator">!=</span> <span class="token boolean">nil</span> <span class="token operator">&amp;&amp;</span> <span class="token operator">*</span>runAsUser <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token comment">// Make sure that the settings are not contradictory, and fail the object creation if they are.</span>
  <span class="token keyword">return</span> <span class="token boolean">nil</span><span class="token punctuation">,</span> errors<span class="token punctuation">.</span><span class="token function">New</span><span class="token punctuation">(</span><span class="token string">&quot;runAsNonRoot specified, but runAsUser set to 0 (the root user)&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面是主要的 mutating 逻辑代码，下面是启动一个 http server 来处理请求，将上面的方法传进去作为 handler 。</p><div class="language-go line-numbers-mode" data-ext="go"><pre class="language-go"><code><span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  certPath <span class="token operator">:=</span> filepath<span class="token punctuation">.</span><span class="token function">Join</span><span class="token punctuation">(</span>tlsDir<span class="token punctuation">,</span> tlsCertFile<span class="token punctuation">)</span>
  keyPath <span class="token operator">:=</span> filepath<span class="token punctuation">.</span><span class="token function">Join</span><span class="token punctuation">(</span>tlsDir<span class="token punctuation">,</span> tlsKeyFile<span class="token punctuation">)</span>

  mux <span class="token operator">:=</span> http<span class="token punctuation">.</span><span class="token function">NewServeMux</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  mux<span class="token punctuation">.</span><span class="token function">Handle</span><span class="token punctuation">(</span><span class="token string">&quot;/mutate&quot;</span><span class="token punctuation">,</span> <span class="token function">admitFuncHandler</span><span class="token punctuation">(</span>applySecurityDefaults<span class="token punctuation">)</span><span class="token punctuation">)</span>
  server <span class="token operator">:=</span> <span class="token operator">&amp;</span>http<span class="token punctuation">.</span>Server<span class="token punctuation">{</span>
     <span class="token comment">// We listen on port 8443 such that we do not need root privileges or extra capabilities for this server.</span>
     <span class="token comment">// The Service object will take care of mapping this port to the HTTPS port 443.</span>
     Addr<span class="token punctuation">:</span>    <span class="token string">&quot;:8443&quot;</span><span class="token punctuation">,</span>
     Handler<span class="token punctuation">:</span> mux<span class="token punctuation">,</span>
  <span class="token punctuation">}</span>
  log<span class="token punctuation">.</span><span class="token function">Fatal</span><span class="token punctuation">(</span>server<span class="token punctuation">.</span><span class="token function">ListenAndServeTLS</span><span class="token punctuation">(</span>certPath<span class="token punctuation">,</span> keyPath<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  certPath <span class="token operator">:=</span> filepath<span class="token punctuation">.</span><span class="token function">Join</span><span class="token punctuation">(</span>tlsDir<span class="token punctuation">,</span> tlsCertFile<span class="token punctuation">)</span>
  keyPath <span class="token operator">:=</span> filepath<span class="token punctuation">.</span><span class="token function">Join</span><span class="token punctuation">(</span>tlsDir<span class="token punctuation">,</span> tlsKeyFile<span class="token punctuation">)</span>

  mux <span class="token operator">:=</span> http<span class="token punctuation">.</span><span class="token function">NewServeMux</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  mux<span class="token punctuation">.</span><span class="token function">Handle</span><span class="token punctuation">(</span><span class="token string">&quot;/mutate&quot;</span><span class="token punctuation">,</span> <span class="token function">admitFuncHandler</span><span class="token punctuation">(</span>applySecurityDefaults<span class="token punctuation">)</span><span class="token punctuation">)</span>
  server <span class="token operator">:=</span> <span class="token operator">&amp;</span>http<span class="token punctuation">.</span>Server<span class="token punctuation">{</span>
     <span class="token comment">// We listen on port 8443 such that we do not need root privileges or extra capabilities for this server.</span>
     <span class="token comment">// The Service object will take care of mapping this port to the HTTPS port 443.</span>
     Addr<span class="token punctuation">:</span>    <span class="token string">&quot;:8443&quot;</span><span class="token punctuation">,</span>
     Handler<span class="token punctuation">:</span> mux<span class="token punctuation">,</span>
  <span class="token punctuation">}</span>
  log<span class="token punctuation">.</span><span class="token function">Fatal</span><span class="token punctuation">(</span>server<span class="token punctuation">.</span><span class="token function">ListenAndServeTLS</span><span class="token punctuation">(</span>certPath<span class="token punctuation">,</span> keyPath<span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>将上面的程序部署到集群</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl get <span class="token function">service</span> <span class="token parameter variable">-n</span> webhook-demo
NAME             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT<span class="token punctuation">(</span>S<span class="token punctuation">)</span>   AGE
webhook-server   ClusterIP   <span class="token number">10.108</span>.206.71   <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>        <span class="token number">443</span>/TCP   7s

$ kubectl get pods <span class="token parameter variable">-n</span> webhook-demo
NAME                              READY   STATUS    RESTARTS   AGE
webhook-server-69c78cb569-s9dw6   <span class="token number">1</span>/1     Running   <span class="token number">0</span>          10s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Webhook Server 部署好就可以配置准入控制的配置了，因为要修改请求，因此要创建 MutatingWebhookConfiguration，下面是创建好的配置内容：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl describe mutatingwebhookconfigurations demo-webhook
Name:         demo-webhook
Namespace:
Labels:       <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>
Annotations:  <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>
API Version:  admissionregistration.k8s.io/v1
Kind:         MutatingWebhookConfiguration
Metadata:
Webhooks:
  Admission Review Versions:
    v1
    v1beta1
  Client Config:
    Ca Bundle:  LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURQekNDQWllZ0F3SUJBZ0lVZUNs
    Service:
      Name:        webhook-server
      Namespace:   webhook-demo
      Path:        /mutate
      Port:        <span class="token number">443</span>
  Failure Policy:  Fail
  Match Policy:    Equivalent
  Name:            webhook-server.webhook-demo.svc
  Namespace Selector:
  Object Selector:
  Reinvocation Policy:  Never
  Rules:
    API Groups:
    API Versions:
      v1
    Operations:
      CREATE
    Resources:
      pods
    Scope:          *
  Side Effects:     None
  Timeout Seconds:  <span class="token number">10</span>
Events:             <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到其 Rule 是当收到 Pod 的创建请求时，会将发送请求到我们的 Webhook Server。 下面测试 Pod 的创建，首先是默认情况下，如果不设置会自动配置 runAsNoneRoot 和 runAsUser</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>apiVersion: v1
kind: Pod
metadata:
  name: pod-with-defaults
  labels:
    app: pod-with-defaults
spec:
  restartPolicy: OnFailure
  containers:
  - name: busybox
    image: busybox
    command: <span class="token punctuation">[</span><span class="token string">&quot;sh&quot;</span>, <span class="token string">&quot;-c&quot;</span>, <span class="token string">&quot;echo I am running as user <span class="token variable"><span class="token variable">$(</span><span class="token function">id</span> <span class="token parameter variable">-u</span><span class="token variable">)</span></span>&quot;</span><span class="token punctuation">]</span>

 
$ kubectl get pods pod-with-defaults <span class="token parameter variable">-o</span> yaml
apiVersion: v1
kind: Pod
metadata:
   labels:
    app: pod-with-defaults
  name: pod-with-defaults
  namespace: default

spec:
  containers:
  - command:
    - <span class="token function">sh</span>
    - <span class="token parameter variable">-c</span>
    - <span class="token builtin class-name">echo</span> I am running as user <span class="token variable"><span class="token variable">$(</span><span class="token function">id</span> <span class="token parameter variable">-u</span><span class="token variable">)</span></span>
    image: busybox
    imagePullPolicy: Always
    name: busybox
  securityContext:
    runAsNonRoot: <span class="token boolean">true</span>
    runAsUser: <span class="token number">1234</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果是 runAsNonRoot 如果设置为 true，但是 runAsUser 设置 设置为 0，请求会被拦截并报错：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> pod<span class="token punctuation">-</span>with<span class="token punctuation">-</span>conflict
  <span class="token key atrule">labels</span><span class="token punctuation">:</span>
    <span class="token key atrule">app</span><span class="token punctuation">:</span> pod<span class="token punctuation">-</span>with<span class="token punctuation">-</span>conflict
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">restartPolicy</span><span class="token punctuation">:</span> OnFailure
  <span class="token key atrule">securityContext</span><span class="token punctuation">:</span>
    <span class="token key atrule">runAsNonRoot</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
    <span class="token key atrule">runAsUser</span><span class="token punctuation">:</span> <span class="token number">0</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> busybox
      <span class="token key atrule">image</span><span class="token punctuation">:</span> busybox
      <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;sh&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;-c&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;echo I am running as user $(id -u)&quot;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl apply <span class="token parameter variable">-f</span> examples/pod-with-conflict.yaml
Error from server: error when creating <span class="token string">&quot;examples/pod-with-conflict.yaml&quot;</span><span class="token builtin class-name">:</span> admission webhook <span class="token string">&quot;webhook-server.webhook-demo.svc&quot;</span> denied the request: runAsNonRoot specified, but runAsUser <span class="token builtin class-name">set</span> to <span class="token number">0</span> <span class="token punctuation">(</span>the root user<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,13)),s("p",null,[n[29]||(n[29]=a("可以看到请求被正确拦截了, 以上是动态准入控制的简单介绍，更多的细节可以参考",-1)),s("a",h,[n[27]||(n[27]=a("官方文档",-1)),t(e)]),n[30]||(n[30]=a(" 和",-1)),s("a",R,[n[28]||(n[28]=a("博客",-1)),t(e)]),n[31]||(n[31]=a("。",-1))]),n[41]||(n[41]=p(`<h3 id="_6-security-context" tabindex="-1"><a class="header-anchor" href="#_6-security-context" aria-hidden="true">#</a> 6. Security Context</h3><p>上述 RBAC、准入控制等策略都是针对 api-server 的安全访问控制，如果外部攻击者攻破了 API Server 的访问控制成功部署了 Pod，并在容器中运行攻击代码，依然是可以对我们的系统造成损害。因此我们还需要设置 Pod 的操作权限，不能让 Pod <code>“为所欲为”</code>。</p><h4 id="_6-1-宿主机命名空间" tabindex="-1"><a class="header-anchor" href="#_6-1-宿主机命名空间" aria-hidden="true">#</a> 6.1 宿主机命名空间</h4><p>Pod 有自己的网络、PID、IPC 命名空间，因此同一 Pod 中的容器可以共享网络，可以进行进程间通信以及只看到自己的进程树。如果某些 Pod 需要使用宿主机默认的命令空间，则需要额外进行设置。 网络命名空间</p><p>可以通过 hostNetwork: true 配置来使 Pod 直接使用网络的命名空间。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> pod<span class="token punctuation">-</span>with<span class="token punctuation">-</span>host<span class="token punctuation">-</span>network
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">hostNetwork</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>                    
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> main
    <span class="token key atrule">image</span><span class="token punctuation">:</span> alpine
    <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;/bin/sleep&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;999999&quot;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样 Pod 创建后其网络用的就是宿主机的网络，在 Pod 中执行 ifconfig 命令查看网络设备会看到其所在宿主机的网络设备列表。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl <span class="token builtin class-name">exec</span> <span class="token parameter variable">-it</span> pod-with-host-network -- <span class="token function">ifconfig</span>
eth0      Link encap:Ethernet  HWaddr <span class="token number">52</span>:54:00:22:84:B5
          inet addr:172.19.0.3  Bcast:172.19.15.255  Mask:255.255.240.0
          inet6 addr: fe80::5054:ff:fe22:84b5/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:5089655 errors:0 dropped:0 overruns:0 frame:0
          TX packets:5061521 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:1952900135 <span class="token punctuation">(</span><span class="token number">1.8</span> GiB<span class="token punctuation">)</span>  TX bytes:1062809752 <span class="token punctuation">(</span><span class="token number">1013.5</span> MiB<span class="token punctuation">)</span>

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:1334609 errors:0 dropped:0 overruns:0 frame:0
          TX packets:1334609 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:159996559 <span class="token punctuation">(</span><span class="token number">152.5</span> MiB<span class="token punctuation">)</span>  TX bytes:159996559 <span class="token punctuation">(</span><span class="token number">152.5</span> MiB<span class="token punctuation">)</span>
<span class="token punctuation">..</span>.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/49120e9723d1a2064896616def00cb0e.png" alt="在这里插入图片描述"></p><p>像 Kubernetes 的控制平面组件 kube-apiserver 等都是设置了该选项，从而使得它们的行为与不在 Pod 中运行时相同。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl get pods <span class="token parameter variable">-n</span> kube-system kube-apiserver-vm-0-7-ubuntu <span class="token parameter variable">-o</span> yaml
apiVersion: v1
kind: Pod
metadata:
  name: kube-apiserver-vm-0-7-ubuntu
  namespace: kube-system
spec:
  containers:
  - command:
    - kube-apiserver
  
    image: k8s.gcr.io/kube-apiserver:v1.22.3
    imagePullPolicy: IfNotPresent
  <span class="token punctuation">..</span>.
  hostNetwork: <span class="token boolean">true</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>另外还可以通过设置 hostPort 使容器使用所在节点的主机端口而不是直接共享命名空间。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> kubia<span class="token punctuation">-</span>hostport
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">image</span><span class="token punctuation">:</span> luksa/kubia
    <span class="token key atrule">name</span><span class="token punctuation">:</span> kubia
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">containerPort</span><span class="token punctuation">:</span> <span class="token number">8080</span>     
      <span class="token key atrule">hostPort</span><span class="token punctuation">:</span> <span class="token number">9000</span>          
      <span class="token key atrule">protocol</span><span class="token punctuation">:</span> TCP
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样当访问 Pod 所在节点上的 9000 端口时会访问到 Pod 中容器，因为要占用主机端口，因此如果有多个副本的话这些副本不能被调度到同一个节点。</p><p>该功能最初主要是用来暴露通过 DaemonSet 在每个节点上运行的服务，后来也用来做 Pod 的调度，保证相同的 Pod 不能被部署到同一个节点，现在已经被 Pod 非亲和的调度方式所取代。</p><h4 id="_6-2-pid-ipc-命名空间" tabindex="-1"><a class="header-anchor" href="#_6-2-pid-ipc-命名空间" aria-hidden="true">#</a> 6.2 PID &amp; IPC 命名空间</h4><p>除了网络命名空间，Pod 还可以直接使用宿主机的 IPC 和 PID 命名空间，从而看到宿主机所有的进程，以及与宿主机的进程进行通信。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> pod<span class="token punctuation">-</span>with<span class="token punctuation">-</span>host<span class="token punctuation">-</span>pid<span class="token punctuation">-</span>and<span class="token punctuation">-</span>ipc
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">hostPID</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>                      
  <span class="token key atrule">hostIPC</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>                      
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> main
    <span class="token key atrule">image</span><span class="token punctuation">:</span> alpine
    <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;/bin/sleep&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;999999&quot;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_6-3-pod-security-context" tabindex="-1"><a class="header-anchor" href="#_6-3-pod-security-context" aria-hidden="true">#</a> 6.3 Pod Security Context</h4><p>除了使用宿主机的命名空间，还是设置安全上下文来定义 Pod 或者容器的特权和访问控制设置。包含但不限于一下配置：</p><ul><li>指定容器中运行进程的用户和用户组，从而简介判定对对象、文件的操作权限。</li><li>设置 SELinux 选项，加强对容器的限制</li><li>以特权模式或者非特权模式运行，特权模式下容器对宿主机节点内核具有完整的访问权限</li><li>配置内核功能，以细粒度的方式配置内核访问权限</li><li>AppArmor：使用程序框架来限制个别程序的权能。</li><li>Seccomp：过滤进程的系统调用。</li><li>readOnlyRootFilesystem：以只读方式加载容器的根文件系统。</li></ul><p>下面是一些使用示例：</p><p><strong>设置容器的安全上下文</strong></p><p>-- 设置非 root 用户执行</p><p>容器运行的用户可以在构建镜像时指定，如果攻击者获取到 Dockerfile 并设置的 root 用户，如果 Pod 挂载了宿主机目录，此时就会对宿主机的目录有完整的访问权限。如果是非 root 用户则不会有完整的权限。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> pod<span class="token punctuation">-</span>run<span class="token punctuation">-</span>as<span class="token punctuation">-</span>non<span class="token punctuation">-</span>root
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> main
    <span class="token key atrule">image</span><span class="token punctuation">:</span> alpine
    <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;/bin/sleep&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;999999&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">securityContext</span><span class="token punctuation">:</span>                   
      <span class="token key atrule">runAsNonRoot</span><span class="token punctuation">:</span> <span class="token boolean important">true</span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>设置特权模式运行</li></ul><p>如果容器获取内核的完整权限，需要在宿主机能做任何事，就可以设置为特权模式。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> pod<span class="token punctuation">-</span>privileged
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> main
    <span class="token key atrule">image</span><span class="token punctuation">:</span> alpine
    <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;/bin/sleep&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;999999&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">securityContext</span><span class="token punctuation">:</span>
      <span class="token key atrule">privileged</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>像 kube-proxy 需要修改 iptables 规则，因此就开启了特权模式。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl get pods kube-proxy-fschm <span class="token parameter variable">-n</span> kube-system <span class="token parameter variable">-o</span> yaml
apiVersion: v1
kind: Pod
metadata:
  name: kube-proxy-fschm
  namespace: kube-system
spec:
    image: k8s.gcr.io/kube-proxy:v1.22.3
    imagePullPolicy: IfNotPresent
    name: kube-proxy
    securityContext:
      privileged: <span class="token boolean">true</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>为容器单独添加或者禁用内核功能</li></ul><p>除了赋予完整权限的特权模式，我们还可以细粒度的添加或者删除内核操作权限，下面是一个例子，允许修改系统时间，但不允许容器修改文件的所有者。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Pod
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> pod<span class="token punctuation">-</span>add<span class="token punctuation">-</span>settime<span class="token punctuation">-</span>capability
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">containers</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> main
    <span class="token key atrule">image</span><span class="token punctuation">:</span> alpine
    <span class="token key atrule">command</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;/bin/sleep&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;999999&quot;</span><span class="token punctuation">]</span>
    <span class="token key atrule">securityContext</span><span class="token punctuation">:</span>                     
      <span class="token key atrule">capabilities</span><span class="token punctuation">:</span>                      
        <span class="token key atrule">add</span><span class="token punctuation">:</span>                             
        <span class="token punctuation">-</span> SYS_TIME
        <span class="token key atrule">drop</span><span class="token punctuation">:</span>                   
        <span class="token punctuation">-</span> CHOWN
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>除了为容器单独设置上下文，一部分配置可以在 Pod 层面设置，表示对 Pod 中所有的容器生效，如果容器也设置了则会覆盖掉 Pod 的设置，另外 Pod 也要独有的上下文配置，可以参考 官方文档，这里就不做赘述了。</p><h3 id="_7-pod-security" tabindex="-1"><a class="header-anchor" href="#_7-pod-security" aria-hidden="true">#</a> 7. Pod Security</h3><p>安全上下文是创建 Pod 的用户指定的，除此之外我们还需要在集群层面来保证用户不能滥用相关的权限。因此之前 Kubernetes 提供了集群层面 PSP（PodSecurityPolicy）对象来让集群员来定义用户的 Pod 能否使用各种安全相关的特性。</p><p>可以通过 PSP 来统一批量设置相关的安全设置，然后通过 RBAC 为不同的用户赋予不同 PSP，然后在创建 Pod 时指定用户，就可以实现针对不用的 Pod 应用不同的安全策略了。下面是一个例子：</p><p>通过创建一个 PSP 同时指定用户、是否使用宿主机命名空间、启用和禁用内核权限等。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> extensions/v1beta1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> PodSecurityPolicy
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> default
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">hostIPC</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>                 
  <span class="token key atrule">hostPID</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>                 
  <span class="token key atrule">hostNetwork</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>             
  <span class="token key atrule">hostPorts</span><span class="token punctuation">:</span>                     
  <span class="token punctuation">-</span> <span class="token key atrule">min</span><span class="token punctuation">:</span> <span class="token number">10000</span>                   
    <span class="token key atrule">max</span><span class="token punctuation">:</span> <span class="token number">11000</span>                   
  <span class="token punctuation">-</span> <span class="token key atrule">min</span><span class="token punctuation">:</span> <span class="token number">13000</span>                   
    <span class="token key atrule">max</span><span class="token punctuation">:</span> <span class="token number">14000</span>                   
  <span class="token key atrule">privileged</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>              
  <span class="token key atrule">readOnlyRootFilesystem</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>   
  <span class="token key atrule">runAsUser</span><span class="token punctuation">:</span>                     
    <span class="token key atrule">rule</span><span class="token punctuation">:</span> RunAsAny               
  <span class="token key atrule">fsGroup</span><span class="token punctuation">:</span>                       
    <span class="token key atrule">rule</span><span class="token punctuation">:</span> RunAsAny   
  <span class="token key atrule">allowedCapabilities</span><span class="token punctuation">:</span>            
  <span class="token punctuation">-</span> SYS_TIME                      
  <span class="token key atrule">defaultAddCapabilities</span><span class="token punctuation">:</span>         
  <span class="token punctuation">-</span> CHOWN                         
  <span class="token key atrule">requiredDropCapabilities</span><span class="token punctuation">:</span>       
  <span class="token punctuation">-</span> SYS_ADMIN                     
  <span class="token punctuation">-</span> SYS_MODULE       
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后可以通过 RBAC 进行设置，鉴于 PSP 已经被弃用，并将在 1.25 版本移除，这里就不多做讲解了。取而代之的是使用新的 PodSecurity 进行安全相关的设置，截止到 1.23 该特性处于 beta 阶段。下面简单看一下</p><p>PodSecurity 是一个准入控制器，其由松到紧定义了三种安全级别的策略：</p><ul><li><p><strong>privileged</strong>: 特权策略，表示几乎没有限制。提供最大可能范围的权限许可</p></li><li><p><strong>baseline</strong>：基线策略，允许使用默认的（规定最少）Pod 配置。</p></li><li><p><strong>Restricted</strong>：限制性最强的策略，遵循保护 Pod 针对最佳实践。</p></li></ul>`,43)),s("p",null,[n[33]||(n[33]=a("策略具体关联都的权限控制可以查看 ",-1)),s("a",U,[n[32]||(n[32]=a("pod-security-standards",-1)),t(e)]),n[34]||(n[34]=a(" 文档。有了策略后，我们可以在命名空间上声明针对各个安全策略的处理方式。具体处理方式也有三种：",-1))]),n[42]||(n[42]=p(`<ul><li><strong>enforce</strong>：强制执行，如果违反策略，则 od 创建请求会被拒绝。</li><li><strong>audit</strong>：执行监听，如果违反策略，则会触发记录监听日志，但 Pod 可以被创建成功。</li><li><strong>warn</strong>: 执行警告，如果违反策略，Pod 创建时会提示用户，但依然可以被创建成成功。</li></ul><p>针对每种方式，Kubernetes 提供了两个标签来指定处理的安全级别和 Kubernetes minor 版本：</p><ul><li><p><code>pod-security.kubernetes.io/&lt;MODE&gt;: &lt;LEVEL&gt;</code>，model 必须是 enforce、audit、warn 之一，level 必须是 privileged、baseline、restricted 之一。</p></li><li><p><code>pod-security.kubernetes.io/&lt;MODE&gt;-version: &lt;VERSION&gt;</code>：表示策略执行的版本，必须是 Kubernetes minor 版本或者 latest。</p></li></ul><p>然后就可以在 namespace 上添加标签来进行安全限制了，下面的例子表示，在 <code>my-baseline-namespace</code> 来命名空间创建的 Pod:</p><ul><li>如果不满足 baseline 策略，会被拒绝创建。</li><li>如果不满足 restricted 策略，则会记录监听日志以及向用户发出经过。其策略版本是 1.23 版本。</li></ul><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> Namespace
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> my<span class="token punctuation">-</span>baseline<span class="token punctuation">-</span>namespace
  <span class="token key atrule">labels</span><span class="token punctuation">:</span>
    <span class="token key atrule">pod-security.kubernetes.io/enforce</span><span class="token punctuation">:</span> baseline
    <span class="token key atrule">pod-security.kubernetes.io/enforce-version</span><span class="token punctuation">:</span> v1.23

    <span class="token comment"># We are setting these to our _desired_ \`enforce\` level.</span>
    <span class="token key atrule">pod-security.kubernetes.io/audit</span><span class="token punctuation">:</span> restricted
    <span class="token key atrule">pod-security.kubernetes.io/audit-version</span><span class="token punctuation">:</span> v1.23
    <span class="token key atrule">pod-security.kubernetes.io/warn</span><span class="token punctuation">:</span> restricted
    <span class="token key atrule">pod-security.kubernetes.io/warn-version</span><span class="token punctuation">:</span> v1.23
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_8-network-policy" tabindex="-1"><a class="header-anchor" href="#_8-network-policy" aria-hidden="true">#</a> 8. Network Policy</h3><p>Network Policy 类似于 AWS 的安全组，是一组 Pod 间及与其他网络端点间所允许的通信规则。NetworkPolicy 资源使用 Label 和 Selector 选择 Pod，并定义选定 Pod 所允许的通信规则。</p><p>下面是一个 NetworkPolicy 的示例:</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> networking.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> NetworkPolicy
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> test<span class="token punctuation">-</span>network<span class="token punctuation">-</span>policy
  <span class="token key atrule">namespace</span><span class="token punctuation">:</span> default
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">podSelector</span><span class="token punctuation">:</span>
    <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
      <span class="token key atrule">role</span><span class="token punctuation">:</span> db
  <span class="token key atrule">policyTypes</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> Ingress
  <span class="token punctuation">-</span> Egress
  <span class="token key atrule">ingress</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">from</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">ipBlock</span><span class="token punctuation">:</span>
        <span class="token key atrule">cidr</span><span class="token punctuation">:</span> 172.17.0.0/16
        <span class="token key atrule">except</span><span class="token punctuation">:</span>
        <span class="token punctuation">-</span> 172.17.1.0/24
    <span class="token punctuation">-</span> <span class="token key atrule">namespaceSelector</span><span class="token punctuation">:</span>
        <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
          <span class="token key atrule">project</span><span class="token punctuation">:</span> myproject
    <span class="token punctuation">-</span> <span class="token key atrule">podSelector</span><span class="token punctuation">:</span>
        <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
          <span class="token key atrule">role</span><span class="token punctuation">:</span> frontend
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">protocol</span><span class="token punctuation">:</span> TCP
      <span class="token key atrule">port</span><span class="token punctuation">:</span> <span class="token number">6379</span>
  <span class="token key atrule">egress</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">to</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">ipBlock</span><span class="token punctuation">:</span>
        <span class="token key atrule">cidr</span><span class="token punctuation">:</span> 10.0.0.0/24
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">protocol</span><span class="token punctuation">:</span> TCP
      <span class="token key atrule">port</span><span class="token punctuation">:</span> <span class="token number">5978</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上述的示例意思是：</p><ul><li><p>对 default 命名空间下带有标签 role=db 的 Pod 进行如下配置</p></li><li><p>（Ingress 规则）允许以下客户端连接到被选中 Pod 的 6379 TCP 端口：</p><ul><li>default 命名空间下任意带有 role=frontend 标签的 Pod</li><li>带有 project=myproject 标签的任意命名空间中的 Pod</li><li>IP 地址范围为 172.17.0.0–172.17.0.255 和 172.17.2.0–172.17.255.255（即，除了 172.17.1.0/24 之外的所有 172.17.0.0/16）的外部节点</li></ul></li><li><p>（Egress 规则）允许被选中 Pod 可以访问以下节点</p><ul><li>地址为 10.0.0.0/24 下 的 5978 端口</li></ul></li></ul><p><strong>podSelector</strong></p><p>每个 NetworkPolicy 都包括一个 podSelector ，它根据标签选安定一组 Pod 以应用其所定义的规则。示例中表示选择带有 &quot;role=db&quot; 标签的 Pod。如果 podSelector 为空，表示选择namespace下的所有 Pod。</p><p><strong>policyTypes</strong></p><p>表示定义的规则类型，包含 Ingress 或 Egress 或两者兼具。</p><ul><li>Ingress 表示所选 Pod 的入网规则，即哪些端点可以访问该 Pod。</li><li>Egress 表示 Pod 的出网规则，即该 Pod 可以访问那些端点。</li></ul><p>Ingress / Egress 下用来限定规则的方式有四种：</p><ul><li><strong>podSelector</strong>：选择相同命名空间下的特定 Pod 。</li><li><strong>namespaceSelector</strong>：选择特定命名空间下的所有 Pod 。</li><li><strong>podSelector</strong> 与 <strong>namespaceSelector</strong>：选择特定命名空间下的特定 Pod。定义时注意和之上两者的区别</li><li><strong>ipBlock</strong>：IP CIDR 范围，一般都是外部地址，因为 Pod 地址是临时性、经常变化的。 ports</li></ul><p>同时指定 namespaceSelector 和 podSelector 时，请求需要同时满足任意两个条件。</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">ingress</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">from</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">namespaceSelector</span><span class="token punctuation">:</span>
        <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
          <span class="token key atrule">user</span><span class="token punctuation">:</span> alice
      <span class="token key atrule">podSelector</span><span class="token punctuation">:</span>
        <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
          <span class="token key atrule">role</span><span class="token punctuation">:</span> client
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>各自指定时，只满足其中一个条件即可：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code> <span class="token key atrule">ingress</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">from</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">namespaceSelector</span><span class="token punctuation">:</span>
        <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
          <span class="token key atrule">user</span><span class="token punctuation">:</span> alice
    <span class="token punctuation">-</span> <span class="token key atrule">podSelector</span><span class="token punctuation">:</span>
        <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
          <span class="token key atrule">role</span><span class="token punctuation">:</span> client
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>ports</strong></p><p>可以被访问的端口或者可以访问的外部端口。在定义时指明协议和端口即可，一般都是 TCP 协议，</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> networking.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> NetworkPolicy
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> test<span class="token punctuation">-</span>network<span class="token punctuation">-</span>policy
  <span class="token key atrule">namespace</span><span class="token punctuation">:</span> default
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
<span class="token punctuation">...</span>.
  <span class="token key atrule">ingress</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">from</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">ipBlock</span><span class="token punctuation">:</span>
        <span class="token key atrule">cidr</span><span class="token punctuation">:</span> 172.17.0.0/16
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">protocol</span><span class="token punctuation">:</span> TCP
      <span class="token key atrule">port</span><span class="token punctuation">:</span> <span class="token number">6379</span>
  <span class="token key atrule">egress</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">to</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">ipBlock</span><span class="token punctuation">:</span>
        <span class="token key atrule">cidr</span><span class="token punctuation">:</span> 10.0.0.0/24
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">protocol</span><span class="token punctuation">:</span> TCP
      <span class="token key atrule">port</span><span class="token punctuation">:</span> <span class="token number">5978</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从 1.20 版本开始默认也支持 SCTP 协议，如果想关掉需要修改 apiserver 的启动配置 --feature-<code>gates=SCTPSupport=false</code>。</p><p>另外现在可以指定一组端口，该特性在 1.22 版本处于 beta 状态，使用示例如下：</p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> networking.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> NetworkPolicy
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> multi<span class="token punctuation">-</span>port<span class="token punctuation">-</span>egress
  <span class="token key atrule">namespace</span><span class="token punctuation">:</span> default
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">podSelector</span><span class="token punctuation">:</span>
    <span class="token key atrule">matchLabels</span><span class="token punctuation">:</span>
      <span class="token key atrule">role</span><span class="token punctuation">:</span> db
  <span class="token key atrule">policyTypes</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> Egress
  <span class="token key atrule">egress</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">to</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">ipBlock</span><span class="token punctuation">:</span>
        <span class="token key atrule">cidr</span><span class="token punctuation">:</span> 10.0.0.0/24
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">protocol</span><span class="token punctuation">:</span> TCP
      <span class="token key atrule">port</span><span class="token punctuation">:</span> <span class="token number">32000</span>
      <span class="token key atrule">endPort</span><span class="token punctuation">:</span> <span class="token number">32768</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里表示选中的 Pod 可以访问 10.0.0.0/24 网段的 32000 ~ 32768 端口。这里有几个要求：</p><ul><li>endPort 必须大于等于 port</li><li>endPort 不能被单独定义，必须先指定 port</li><li>端口都是数字</li></ul><p>下面是一些特殊的规则示例：</p><p><strong>拒绝所有入站流量</strong></p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token punctuation">---</span>
<span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> networking.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> NetworkPolicy
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> default<span class="token punctuation">-</span>deny<span class="token punctuation">-</span>ingress
  <span class="token key atrule">namespace</span><span class="token punctuation">:</span> default
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">podSelector</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token key atrule">policyTypes</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> Ingress
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>允许所有入站流量</strong></p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> networking.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> NetworkPolicy
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> allow<span class="token punctuation">-</span>all<span class="token punctuation">-</span>ingress
  <span class="token key atrule">namespace</span><span class="token punctuation">:</span> default
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">podSelector</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token key atrule">ingress</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token key atrule">policyTypes</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> Ingress
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>拒绝所有出站流量</strong></p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> networking.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> NetworkPolicy
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> default<span class="token punctuation">-</span>deny<span class="token punctuation">-</span>egress
  <span class="token key atrule">namespace</span><span class="token punctuation">:</span> default
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">podSelector</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token key atrule">policyTypes</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> Egress
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>允许所有出站流量</strong></p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> networking.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> NetworkPolicy
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> allow<span class="token punctuation">-</span>all<span class="token punctuation">-</span>egress
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">podSelector</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token key atrule">egress</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token key atrule">policyTypes</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> Egress
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>拒绝所有入站和出站流量</strong></p><div class="language-yaml line-numbers-mode" data-ext="yml"><pre class="language-yaml"><code><span class="token key atrule">apiVersion</span><span class="token punctuation">:</span> networking.k8s.io/v1
<span class="token key atrule">kind</span><span class="token punctuation">:</span> NetworkPolicy
<span class="token key atrule">metadata</span><span class="token punctuation">:</span>
  <span class="token key atrule">name</span><span class="token punctuation">:</span> default<span class="token punctuation">-</span>deny<span class="token punctuation">-</span>all
<span class="token key atrule">spec</span><span class="token punctuation">:</span>
  <span class="token key atrule">podSelector</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
  <span class="token key atrule">policyTypes</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> Ingress
  <span class="token punctuation">-</span> Egress
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最后需要注意的是 Network Policy 的功能是由网络插件实现的，因此是否可以使用该特性取决于我们使用的网络插件。像 Calico、Weave 都对该功能做了支持，但 Flannel 本身不支持，需要结合 Calico 使用才性能，参考文档 Installing Calico for policy and flannel (aka Canal) for networking。</p><p>以上是对 Kubernetes 安全相关的简单概述，在实际云原生环境里，其安全性按层分需要从所谓的 4C（Cloud, Clusters, Containers, and Code.）四个层面来保证。Kubernetes 只是其中的一层而已。</p><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/f14dc24b85627ce5fa32bf015b08938f.png" alt="在这里插入图片描述"></p>`,45))])}const N=l(u,[["render",V],["__file","security.html.vue"]]);export{N as default};
