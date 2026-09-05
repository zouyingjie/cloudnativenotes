import{_ as o,r as t,o as l,c as d,a as i,b as n,d as s,e as r}from"./app-BTSCaQUU.js";const c={},u={href:"https://prometheus-operator.dev/",target:"_blank",rel:"noopener noreferrer"},p={href:"https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack",target:"_blank",rel:"noopener noreferrer"},m={href:"https://github.com/prometheus-operator/kube-prometheus",target:"_blank",rel:"noopener noreferrer"},b={href:"https://prometheus-operator.dev/",target:"_blank",rel:"noopener noreferrer"};function v(g,e){const a=t("ExternalLinkIcon");return l(),d("div",null,[e[7]||(e[7]=i(`<h1 id="集群监控与-debug" tabindex="-1"><a class="header-anchor" href="#集群监控与-debug" aria-hidden="true">#</a> 集群监控与 debug</h1><h3 id="一-kubernetes-监控" tabindex="-1"><a class="header-anchor" href="#一-kubernetes-监控" aria-hidden="true">#</a> 一. Kubernetes 监控</h3><h4 id="_1-1-metrics-server" tabindex="-1"><a class="header-anchor" href="#_1-1-metrics-server" aria-hidden="true">#</a> 1.1 Metrics Server</h4><p>Metrics Server 是 Kubernetes 提供的监控工具，主要用来收集 Node 和 Pod 的 CPU、内存使用情况。其本质就是通过 kube-aggregator 实现的一个 server。 <img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/38042b5be26b6c040191595fb15f1b3e.png" alt="在这里插入图片描述"></p><p>图片来自 https://www.jetstack.io/blog/resource-and-custom-metrics-hpa-v2/</p><p>Kubelet 内置了 cAdvisor 服务运行在每个节点上收集容器的各种资源信息，并对外提供了 API 来查询这些信息。Metric Server 正是访问 Kubelet 提供的 <code>/stats/summary</code> API 来获取监控数据，只要有这个 API 其实我们完全可以自行实现一个 Kubernetes 指标收集工具。</p><p>可以通过下面命令安装 MetricServer</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl apply <span class="token parameter variable">-f</span> https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>安装完成后就可以通过 kubectl top 命令查看 Pod 和 Node 的资源使用信息了。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl <span class="token function">top</span> nodes
NAME            CPU<span class="token punctuation">(</span>cores<span class="token punctuation">)</span>   CPU%   MEMORY<span class="token punctuation">(</span>bytes<span class="token punctuation">)</span>   MEMORY%
tk01            217m         <span class="token number">10</span>%    5296Mi          <span class="token number">68</span>%
vm-0-2-ubuntu   84m          <span class="token number">4</span>%     1189Mi          <span class="token number">32</span>%

$ kubectl <span class="token function">top</span> pods --all-namespaces
NAMESPACE     NAME                              CPU<span class="token punctuation">(</span>cores<span class="token punctuation">)</span>   MEMORY<span class="token punctuation">(</span>bytes<span class="token punctuation">)</span>
kube-system   coredns-f9fd979d6-jzv8q           4m           10Mi
kube-system   coredns-f9fd979d6-tx9m4           4m           10Mi
kube-system   etcd-tk01                         14m          50Mi
kube-system   kube-apiserver-tk01               31m          293Mi
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_1-2-prometheus" tabindex="-1"><a class="header-anchor" href="#_1-2-prometheus" aria-hidden="true">#</a> 1.2 Prometheus</h4><p>Prometheus 是 CNCF 的第二个毕业项目，目前已经是 Kubernetes 监控方面的事实标准。架构如图：</p><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/prometheus-arch.png" alt="Prometheus Architecture"></p><p>Prometheus 提供了若干组件来完成数据的收集、存储、展示与告警等：</p><ul><li><p><strong>数据收集组件</strong>：Prometheus 采用 pull 的模式定期从各个目标收集数据。对于应用指标收集，应用只需要提供一个类似 <code>/metrics</code> 接口供 Prometheus 访问即可，对于中间件、系统的监控，由官方和社区维护了一系列的 Exporter 来实现数据的收集。对于某些短时任务可以通过 pushGateway 来实现，先将任务的指标收集到 gateway，在被 pull 到 Prometheus 。</p></li><li><p><strong>Prometheus Server</strong>: 存储数据，Prometheus 内置的时序数据库，也可以使用外部的 InfluxDB 等其他存储。</p></li><li><p><strong>AlertManager</strong>: 告警组件，可以根据一系列规则实现及时的告警。</p></li><li><p><strong>数据展示组件</strong>：Prometheus 本身提供了 API 供外部查询各种指标，同时也内置了 UI 界面实现可视化查询与展示，另外比较常用的是结合 Grafana 实现数据的可视化。</p></li></ul><p>就 Kuberetes 而言，需要监控数据大致分为三种:</p><ul><li><p><strong>主机指标</strong>：Kubernetes 各个宿主机节点的指标，由 Node Exporter 提供。</p></li><li><p><strong>组件指标</strong>：Kuberetes 各个组件的指标，比如 api-server、kubelet 等组件的指标，这个由各个组件的 <code>/metrics</code> API 提供。</p></li><li><p><strong>核心指标</strong>： Kubernetes 中各种资源对象的数据，比如 Pod 、Node、容器的各种指标，NameSpace、Deployment 、Service 等各种资源的信息。</p></li></ul><p>下面是部署 Prometheus 并查看监控的一个示例，目前在 Kuberetes 中有三种方式安装 Prometheus:</p>`,18)),n("ul",null,[n("li",null,[n("a",u,[e[0]||(e[0]=s("Prometheus-operator",-1)),r(a)])]),n("li",null,[e[2]||(e[2]=s("社区提供的 ",-1)),n("a",p,[e[1]||(e[1]=s("Helm Chart",-1)),r(a)])]),n("li",null,[n("a",m,[e[3]||(e[3]=s("Kube-prometheus",-1)),r(a)]),e[5]||(e[5]=s("：在 ",-1)),n("a",b,[e[4]||(e[4]=s("Prometheus-operator",-1)),r(a)]),e[6]||(e[6]=s(" 的基础之上做的进一步开发。",-1))])]),e[8]||(e[8]=i(`<p>prometheus-operator 和 kube-prometheus 的关系有点像 Linux 内核和 Ubuntu 发行版的关系，后者提供了更全面的工具和环境。这里我们就使用 Kube-prometheus 部署</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> clone https://github.com/prometheus-operator/kube-prometheus.git
Cloning into <span class="token string">&#39;kube-prometheus&#39;</span><span class="token punctuation">..</span>.
remote: Enumerating objects: <span class="token number">21595</span>, done.
remote: Counting objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">5701</span>/5701<span class="token punctuation">)</span>, done.
remote: Compressing objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">365</span>/365<span class="token punctuation">)</span>, done.
remote: Total <span class="token number">21595</span> <span class="token punctuation">(</span>delta <span class="token number">5563</span><span class="token punctuation">)</span>, reused <span class="token number">5343</span> <span class="token punctuation">(</span>delta <span class="token number">5335</span><span class="token punctuation">)</span>, pack-reused <span class="token number">15894</span> <span class="token punctuation">(</span>from <span class="token number">4</span><span class="token punctuation">)</span>
Receiving objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">21595</span>/21595<span class="token punctuation">)</span>, <span class="token number">13.85</span> MiB <span class="token operator">|</span> <span class="token number">15.10</span> MiB/s, done.
Resolving deltas: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">15022</span>/15022<span class="token punctuation">)</span>, done.

$ <span class="token builtin class-name">cd</span> kube-prometheus

$ kubectl create <span class="token parameter variable">-f</span> manifests/setup
customresourcedefinition.apiextensions.k8s.io/alertmanagerconfigs.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/alertmanagers.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/podmonitors.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/probes.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/prometheuses.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/prometheusagents.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/prometheusrules.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/scrapeconfigs.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/servicemonitors.monitoring.coreos.com created
customresourcedefinition.apiextensions.k8s.io/thanosrulers.monitoring.coreos.com created
namespace/monitoring created


$ kubectl create <span class="token parameter variable">-f</span> manifests/
alertmanager.monitoring.coreos.com/main created
networkpolicy.networking.k8s.io/alertmanager-main created
poddisruptionbudget.policy/alertmanager-main created
prometheusrule.monitoring.coreos.com/alertmanager-main-rules created
secret/alertmanager-main created
service/alertmanager-main created
serviceaccount/alertmanager-main created
servicemonitor.monitoring.coreos.com/alertmanager-main created
clusterrole.rbac.authorization.k8s.io/blackbox-exporter created
clusterrolebinding.rbac.authorization.k8s.io/blackbox-exporter created
configmap/blackbox-exporter-configuration created
deployment.apps/blackbox-exporter created
networkpolicy.networking.k8s.io/blackbox-exporter created
service/blackbox-exporter created
serviceaccount/blackbox-exporter created
servicemonitor.monitoring.coreos.com/blackbox-exporter created
secret/grafana-config created
secret/grafana-datasources created
configmap/grafana-dashboard-alertmanager-overview created
configmap/grafana-dashboard-apiserver created
configmap/grafana-dashboard-cluster-total created
configmap/grafana-dashboard-controller-manager created
configmap/grafana-dashboard-grafana-overview created
configmap/grafana-dashboard-k8s-resources-cluster created
configmap/grafana-dashboard-k8s-resources-multicluster created
configmap/grafana-dashboard-k8s-resources-namespace created
configmap/grafana-dashboard-k8s-resources-node created
configmap/grafana-dashboard-k8s-resources-pod created
configmap/grafana-dashboard-k8s-resources-windows-cluster created
configmap/grafana-dashboard-k8s-resources-windows-namespace created
configmap/grafana-dashboard-k8s-resources-windows-pod created
configmap/grafana-dashboard-k8s-resources-workload created
configmap/grafana-dashboard-k8s-resources-workloads-namespace created
configmap/grafana-dashboard-k8s-windows-cluster-rsrc-use created
configmap/grafana-dashboard-k8s-windows-node-rsrc-use created
configmap/grafana-dashboard-kubelet created
configmap/grafana-dashboard-namespace-by-pod created
configmap/grafana-dashboard-namespace-by-workload created
configmap/grafana-dashboard-node-cluster-rsrc-use created
configmap/grafana-dashboard-node-rsrc-use created
configmap/grafana-dashboard-nodes-aix created
configmap/grafana-dashboard-nodes-darwin created
configmap/grafana-dashboard-nodes created
configmap/grafana-dashboard-persistentvolumesusage created
configmap/grafana-dashboard-pod-total created
configmap/grafana-dashboard-prometheus-remote-write created
configmap/grafana-dashboard-prometheus created
configmap/grafana-dashboard-proxy created
configmap/grafana-dashboard-scheduler created
configmap/grafana-dashboard-workload-total created
configmap/grafana-dashboards created
deployment.apps/grafana created
networkpolicy.networking.k8s.io/grafana created
prometheusrule.monitoring.coreos.com/grafana-rules created
service/grafana created
serviceaccount/grafana created
servicemonitor.monitoring.coreos.com/grafana created
prometheusrule.monitoring.coreos.com/kube-prometheus-rules created
clusterrole.rbac.authorization.k8s.io/kube-state-metrics created
clusterrolebinding.rbac.authorization.k8s.io/kube-state-metrics created
deployment.apps/kube-state-metrics created
networkpolicy.networking.k8s.io/kube-state-metrics created
prometheusrule.monitoring.coreos.com/kube-state-metrics-rules created
service/kube-state-metrics created
serviceaccount/kube-state-metrics created
servicemonitor.monitoring.coreos.com/kube-state-metrics created
prometheusrule.monitoring.coreos.com/kubernetes-monitoring-rules created
servicemonitor.monitoring.coreos.com/kube-apiserver created
servicemonitor.monitoring.coreos.com/coredns created
servicemonitor.monitoring.coreos.com/kube-controller-manager created
servicemonitor.monitoring.coreos.com/kube-scheduler created
servicemonitor.monitoring.coreos.com/kubelet created
clusterrole.rbac.authorization.k8s.io/node-exporter created
clusterrolebinding.rbac.authorization.k8s.io/node-exporter created
daemonset.apps/node-exporter created
networkpolicy.networking.k8s.io/node-exporter created
prometheusrule.monitoring.coreos.com/node-exporter-rules created
service/node-exporter created
serviceaccount/node-exporter created
servicemonitor.monitoring.coreos.com/node-exporter created
clusterrole.rbac.authorization.k8s.io/prometheus-k8s created
clusterrolebinding.rbac.authorization.k8s.io/prometheus-k8s created
networkpolicy.networking.k8s.io/prometheus-k8s created
poddisruptionbudget.policy/prometheus-k8s created
prometheus.monitoring.coreos.com/k8s created
prometheusrule.monitoring.coreos.com/prometheus-k8s-prometheus-rules created
rolebinding.rbac.authorization.k8s.io/prometheus-k8s-config created
rolebinding.rbac.authorization.k8s.io/prometheus-k8s created
rolebinding.rbac.authorization.k8s.io/prometheus-k8s created
rolebinding.rbac.authorization.k8s.io/prometheus-k8s created
role.rbac.authorization.k8s.io/prometheus-k8s-config created
role.rbac.authorization.k8s.io/prometheus-k8s created
role.rbac.authorization.k8s.io/prometheus-k8s created
role.rbac.authorization.k8s.io/prometheus-k8s created
service/prometheus-k8s created
serviceaccount/prometheus-k8s created
servicemonitor.monitoring.coreos.com/prometheus-k8s created
apiservice.apiregistration.k8s.io/v1beta1.metrics.k8s.io created
clusterrole.rbac.authorization.k8s.io/prometheus-adapter created
clusterrole.rbac.authorization.k8s.io/system:aggregated-metrics-reader created
clusterrolebinding.rbac.authorization.k8s.io/prometheus-adapter created
clusterrolebinding.rbac.authorization.k8s.io/resource-metrics:system:auth-delegator created
clusterrole.rbac.authorization.k8s.io/resource-metrics-server-resources created
configmap/adapter-config created
deployment.apps/prometheus-adapter created
networkpolicy.networking.k8s.io/prometheus-adapter created
poddisruptionbudget.policy/prometheus-adapter created
rolebinding.rbac.authorization.k8s.io/resource-metrics-auth-reader created
service/prometheus-adapter created
serviceaccount/prometheus-adapter created
servicemonitor.monitoring.coreos.com/prometheus-adapter created
clusterrole.rbac.authorization.k8s.io/prometheus-operator created
clusterrolebinding.rbac.authorization.k8s.io/prometheus-operator created
deployment.apps/prometheus-operator created
networkpolicy.networking.k8s.io/prometheus-operator created
prometheusrule.monitoring.coreos.com/prometheus-operator-rules created
service/prometheus-operator created
serviceaccount/prometheus-operator created
servicemonitor.monitoring.coreos.com/prometheus-operator created
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>完成后会有一个新的 <code>monitoring</code> namespace，相关服务都运行在该命名空间下。我们可以看到 Prometheus 相关的组件：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl get pods <span class="token parameter variable">-n</span> monitoring
NAME                                   READY   STATUS    RESTARTS   AGE
alertmanager-main-0                    <span class="token number">2</span>/2     Running   <span class="token number">0</span>          5m59s
alertmanager-main-1                    <span class="token number">2</span>/2     Running   <span class="token number">0</span>          5m58s
alertmanager-main-2                    <span class="token number">2</span>/2     Running   <span class="token number">0</span>          5m58s
blackbox-exporter-6d86f57b57-mr9d5     <span class="token number">3</span>/3     Running   <span class="token number">0</span>          6m55s
grafana-7c68d76c67-tzfx6               <span class="token number">1</span>/1     Running   <span class="token number">0</span>          6m52s
kube-state-metrics-c66bdcf9c-pf8fg     <span class="token number">3</span>/3     Running   <span class="token number">0</span>          6m52s
node-exporter-cn8gv                    <span class="token number">2</span>/2     Running   <span class="token number">0</span>          6m51s
node-exporter-cwlhw                    <span class="token number">2</span>/2     Running   <span class="token number">0</span>          6m51s
node-exporter-v66dz                    <span class="token number">2</span>/2     Running   <span class="token number">0</span>          6m51s
prometheus-adapter-599c88b6c4-ccmbc    <span class="token number">1</span>/1     Running   <span class="token number">0</span>          6m50s
prometheus-adapter-599c88b6c4-hjscg    <span class="token number">1</span>/1     Running   <span class="token number">0</span>          6m50s
prometheus-k8s-0                       <span class="token number">2</span>/2     Running   <span class="token number">0</span>          5m58s
prometheus-k8s-1                       <span class="token number">2</span>/2     Running   <span class="token number">0</span>          5m58s
prometheus-operator-7c7bf54bdd-8vv6m   <span class="token number">2</span>/2     Running   <span class="token number">0</span>          6m50s

$ kubectl get svc <span class="token parameter variable">-n</span> monitoring
NAME                    TYPE        CLUSTER-IP      EXTERNAL-IP   PORT<span class="token punctuation">(</span>S<span class="token punctuation">)</span>                      AGE
alertmanager-main       ClusterIP   <span class="token number">10.233</span>.44.102   <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>        <span class="token number">9093</span>/TCP,8080/TCP            7m17s
alertmanager-operated   ClusterIP   None            <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>        <span class="token number">9093</span>/TCP,9094/TCP,9094/UDP   6m20s
blackbox-exporter       ClusterIP   <span class="token number">10.233</span>.33.190   <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>        <span class="token number">9115</span>/TCP,19115/TCP           7m16s
grafana                 ClusterIP   <span class="token number">10.233</span>.41.248   <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>        <span class="token number">3000</span>/TCP                     7m14s
kube-state-metrics      ClusterIP   None            <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>        <span class="token number">8443</span>/TCP,9443/TCP            7m13s
node-exporter           ClusterIP   None            <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>        <span class="token number">9100</span>/TCP                     7m12s
prometheus-adapter      ClusterIP   <span class="token number">10.233</span>.1.147    <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>        <span class="token number">443</span>/TCP                      7m11s
prometheus-k8s          ClusterIP   <span class="token number">10.233</span>.49.86    <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>        <span class="token number">9090</span>/TCP,8080/TCP            7m12s
prometheus-operated     ClusterIP   None            <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>        <span class="token number">9090</span>/TCP                     6m19s
prometheus-operator     ClusterIP   None            <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>        <span class="token number">8443</span>/TCP                     7m11s
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到 Prometheus Server、node-exporter、grafana、Alertmanager 等组件都已经部署好了，并且相关的指标收集规则和告警规则已经默认配置好了。下面是一些示例，实际生产中我们要根据实际需求对指标和告警规则做进一步梳理，以更加满足我们的需求。</p><ul><li><strong>目标 target</strong></li></ul><p>表示收集目标的对象，这里是在 Kubernetes 部署后自动配置的，我们也可以在 Prometheus 文件中设置。</p><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/prometheus-dashboard-targets.png" alt=""></p><ul><li><strong>查询节点信息</strong></li></ul><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/prometheus_kube_nodeinfo.png" alt=""></p><ul><li><strong>kubelet 启动 Pod 统计</strong></li></ul><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/prometheus-kubelet-start-pod.png" alt="在这里插入图片描述"></p><p>除了 Prometheus 本身的 UI，Operator 还部署了 Grafana 并自动创建了众多 Dashboard，默认用户名密码是 admin:admin，登陆进后就可以查看相关的监控指标了，下面是几个示例：</p><ul><li><p><strong>Dashboard 列表</strong><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/250822-prometheus-k8s-01.png" alt=""></p></li><li><p><strong>集群整体监控</strong></p></li></ul><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/250822-prometheus-k8s-monitor-03.png" alt=""></p><ul><li><strong>kubelet 监控</strong></li></ul><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/prometheus-monitoring-kubelet.png" alt=""></p><ul><li><strong>宿主机节点监控</strong></li></ul><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/250822-prometheus-monitor-k8s-node.png" alt=""></p><h3 id="二-debug-logging-troubleshooting" tabindex="-1"><a class="header-anchor" href="#二-debug-logging-troubleshooting" aria-hidden="true">#</a> 二. Debug/Logging/TroubleShooting</h3><p>当运行的应用出现问题时，我们需要找出问题，恢复正常运行，一般包含一些操作：</p><ul><li>查看 Pod 状态以及 Spec，看是否被正确调度，Volume 挂载是否准确等。</li><li>查看应用本身是否正确，比如数据库配置是否正确，代码是否报错等，一般可以通过查看日志来解决，另外如果 Pod 内容器支持 debug 可以运行命令进入容器执行 debug。</li><li>查看 Service、Ingress 等配置是否正确，保证外部请求能正确访问到应用。</li></ul><p>另外集群的控制组件、worker node 都有可能出现问题，导致集群不可用，此时需要检查 Kubernetes 的各个组件是否正常运行。</p><h4 id="_2-1-debug-pod-service" tabindex="-1"><a class="header-anchor" href="#_2-1-debug-pod-service" aria-hidden="true">#</a> 2.1 Debug Pod/Service</h4><p>首先可以通过 kubectl describe 命令和 kubectl get pod $&lt;POD_NAME&gt; -o yaml 命令 查看 Pod 状态或者完整的定义。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl describe pod <span class="token parameter variable">-n</span> ingress-nginx ingress-nginx-controller-5fd866c9b6-qc824
Name:         ingress-nginx-controller-5fd866c9b6-qc824
Namespace:    ingress-nginx
Priority:     <span class="token number">0</span>
Node:         vm-0-7-ubuntu/172.19.0.7
<span class="token punctuation">..</span>.
Events:
  Type    Reason   Age                      From                      Message
  ----    ------   ----                     ----                      -------
  Normal  Pulling  28m <span class="token punctuation">(</span>x73 over 7h8m<span class="token punctuation">)</span>      kubelet                   Pulling image <span class="token string">&quot;k8s.gcr.io/ingress-nginx/controller:v1.1.0@sha256:f766669fdcf3dc26347ed273a55e754b427eb4411ee075a53f30718b4499076a&quot;</span>
  Normal  BackOff  8m42s <span class="token punctuation">(</span>x1613 over 7h7m<span class="token punctuation">)</span>  kubelet                   Back-off pulling image <span class="token string">&quot;k8s.gcr.io/ingress-nginx/controller:v1.1.0@sha256:f766669fdcf3dc26347ed273a55e754b427eb4411ee075a53f30718b4499076a&quot;</span>
  Normal  RELOAD   5m33s                    nginx-ingress-controller  NGINX reload triggered due to a change <span class="token keyword">in</span> configuration
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样通过查看 Pod 的状态、Event信息可以初步了解 Pod 启动失败的原因。比如</p><ul><li>如果Pod一直处于 Pending的状态，那说明Kubernetes 无法将其分配到一个节点上。一般会有以下几种情况： <ul><li>CPU/Memory 资源不足，首先确认除了master 节点外的机器资源，可以通过命令kubectl get nodes -o yaml | egrep &#39;\\sname:|cpu:|memory:&#39;， Pod 的资源申请不能大于节点容量。或者添加一个Node，或者删除一些再需要的Pod 来释放一些资源 如果Pod 有使用 hostPort资源（即Node上实际的端口资源），这样会限制Pod能被调度到的Node节点，除非必要，请用service资源替代。</li><li>如果Pod一直处于waiting 的状态，那说明Pod已经被调度都某一个节点，但是无法执行成功，一般比较大的概率是镜像问题，可以检查： <ul><li>镜像名称是否有误？版本号码是否正确</li><li>是否已经push到镜像仓库，可以使用 <code>docker pull &lt;image&gt;</code>来进行验证</li></ul></li></ul></li><li>如果Pod已经执行起来，但是一直crashing 或者处于不健康状态，此时可能需要通过日志或者 debug 命令来检查 Pod 中容器的运行情况。</li></ul><p>首先可以通过 kubectl log 命令查看 Pod 某个容器的 log</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>kubectl logs <span class="token variable">\${POD_NAME}</span> <span class="token variable">\${CONTAINER_NAME}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如果容器之前有crash 过，可以通过以下命令查看crash 的容器的log</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>kubectl logs <span class="token parameter variable">--previous</span> <span class="token variable">\${POD_NAME}</span> <span class="token variable">\${CONTAINER_NAME}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如果容器镜像已经包含 debug 功能的命令，可以使用 kube exec 命令来执行：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>kubectl <span class="token builtin class-name">exec</span> <span class="token variable">\${POD_NAME}</span> <span class="token parameter variable">-c</span> <span class="token variable">\${CONTAINER_NAME}</span> -- <span class="token variable">\${CMD}</span> <span class="token variable">\${ARG1}</span> <span class="token variable">\${ARG2}</span> <span class="token punctuation">..</span>. <span class="token variable">\${ARGN}</span>，例如：

kubectl <span class="token builtin class-name">exec</span> <span class="token parameter variable">-it</span> cassandra -- <span class="token function">sh</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果容器本身没有开启 debug ，可以使用SideCar 容器或者 Ephemeral 容器来定位那些运行没有包含debugging功能镜像的容器。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl run ephemeral-demo <span class="token parameter variable">--image</span><span class="token operator">=</span>k8s.gcr.io/pause:3.1 <span class="token parameter variable">--restart</span><span class="token operator">=</span>Never
pod/ephemeral-demo created

$ kubectl <span class="token builtin class-name">exec</span> <span class="token parameter variable">-it</span> ephemeral-demo -- <span class="token function">sh</span>
OCI runtime <span class="token builtin class-name">exec</span> failed: <span class="token builtin class-name">exec</span> failed: container_linux.go:380: starting container process caused: exec: <span class="token string">&quot;sh&quot;</span><span class="token builtin class-name">:</span> executable <span class="token function">file</span> not found <span class="token keyword">in</span> <span class="token environment constant">$PATH</span><span class="token builtin class-name">:</span> unknown
<span class="token builtin class-name">command</span> terminated with <span class="token builtin class-name">exit</span> code <span class="token number">126</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此时执行 debug 命令会报错，因此可以使用</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl debug <span class="token parameter variable">-it</span> ephemeral-demo <span class="token parameter variable">--image</span><span class="token operator">=</span>busybox <span class="token parameter variable">--target</span><span class="token operator">=</span>ephemeral-demo

Defaulting debug container name to debugger-8xzrl.
If you don&#39;t see a <span class="token builtin class-name">command</span> prompt, try pressing enter.
/ <span class="token comment">#</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>除了 Pod 一般还会有 Service 的调试以保证 Pod 会被访问到，对于 Service 主要就是查看 Service 资源创建成功以及 Endpoints 是否是对应的 Pod。其次可以通过 <code>&lt;service-name&gt;.&lt;namesapce-name&gt;</code> 来检查 Service 的 DNS 是否正确。</p><h4 id="_2-2-网络调试" tabindex="-1"><a class="header-anchor" href="#_2-2-网络调试" aria-hidden="true">#</a> 2.2 网络调试</h4><p>除了应用本身的问题 ，Kuberetes 中网络问题算是占比较大的问题类型，但 Pod 中的容器往往都只安装了应用所需的依赖和命令，操作系统中的很多程序和命令都是没有的，比如 tcdump 、ifconfig、vim 等程序。为了方便调试网络问题社区提供了 nicolaka/netshoot 工具，其包含众多常用的网络以及相关调试命令。</p><p><img src="https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/eab389f38c2210a88300d54a38c376dd.png" alt="在这里插入图片描述"></p><p>下面是使用 netshoot 的一个示例，在使用我们的 EaseMesh 做灰度时，需要通过抓包检查下请求是否到了灰度应用中。</p><p>首先查看下 Pod 所在节点并找到对应的容器：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl get pods <span class="token parameter variable">-o</span> wide
NAME                                        READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
my-pod-975986b55-r66kg           <span class="token number">2</span>/2     Running   <span class="token number">0</span>          13h   <span class="token number">10.233</span>.68.108   node5   <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>           <span class="token operator">&lt;</span>none<span class="token operator">&gt;</span>


node:➜  ~  <span class="token operator">|</span><span class="token operator">&gt;</span>docker <span class="token function">ps</span>                                                                                                                 <span class="token punctuation">[</span>~<span class="token punctuation">]</span>
CONTAINER ID        IMAGE                                                  COMMAND                  CREATED             STATUS              PORTS               NAMES
k8s_my-pod_mesh-service_1f563154-8a25-431e-8d44-3b1e2b0aab02_0
a2ba0b7db5a5        k8s.gcr.io/pause:3.3                                   <span class="token string">&quot;/pause&quot;</span>                 <span class="token number">14</span> hours ago        Up <span class="token number">14</span> hours                             
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在对应的节点上找到已经创建的容器，因为 Kubernetes 是通过 pause 容器来创建的网络 namespaace，因此我们在 pause 容器中进行抓包操作，netshoot 提供了命令 <code>docker run -it --net container:&lt;container_name&gt; nicolaka/netshoot</code> 使我们进入目标容器内部，进入容器后就可以使用相关的命令了。下面我们通过 ifconfig 查看容器内网络设备以及通过 tcpdump 命令一抓包查看是否有请求进入容器的操作示例：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>node4:➜  ~  |&gt;docker run -it --net container:a2ba0b7db5a5  nicolaka/netshoot                                                            [~]
                    dP            dP                           dP
                    88            88                           88
88d888b. .d8888b. d8888P .d8888b. 88d888b. .d8888b. .d8888b. d8888P
88&#39;  \`88 88ooood8   88   Y8ooooo. 88&#39;  \`88 88&#39;  \`88 88&#39;  \`88   88
88    88 88.  ...   88         88 88    88 88.  .88 88.  .88   88
dP    dP \`88888P&#39;   dP   \`88888P&#39; dP    dP \`88888P&#39; \`88888P&#39;   dP

Welcome to Netshoot! (github.com/nicolaka/netshoot)



my-pod-7647db59f5-vcdzn  ~  ifconfig
eth0      Link encap:Ethernet  HWaddr 6A:A1:BD:16:29:85
          inet addr:10.233.67.129  Bcast:0.0.0.0  Mask:255.255.255.255
          UP BROADCAST RUNNING MULTICAST  MTU:9001  Metric:1
          RX packets:599624 errors:0 dropped:0 overruns:0 frame:0
          TX packets:737437 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:161261874 (153.7 MiB)  TX bytes:295757144 (282.0 MiB)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:228767 errors:0 dropped:0 overruns:0 frame:0
          TX packets:228767 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:22301724 (21.2 MiB)  TX bytes:22301724 (21.2 MiB)

// 抓包
mypod-7647db59f5-vcdzn  ~  tcpdump -s0 -Xvn -i eth0 tcp port 13001
tcpdump: listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes
22:56:43.071099 IP (tos 0x0, ttl 63, id 58997, offset 0, flags [DF], proto TCP (6), length 60)
    10.233.65.136.56160 &gt; 10.233.67.129.13001: Flags [S], cksum 0xfeca (correct), seq 938442090, win 62377, options [mss 8911,sackOK,TS val 4022397520 ecr 0,nop,wscale 7], length 0
	0x0000:  4500 003c e675 4000 3f06 ba6b 0ae9 4188  E..&lt;.u@.?..k..A.
	0x0010:  0ae9 4381 db60 32c9 37ef 7d6a 0000 0000  ..C..\`2.7.}j....
	0x0020:  a002 f3a9 feca 0000 0204 22cf 0402 080a  ..........&quot;.....
	0x0030:  efc0 ea50 0000 0000 0103 0307            ...P........
22:56:43.071114 IP (tos 0x0, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 60)
    10.233.67.129.13001 &gt; 10.233.65.136.56160: Flags [S.], cksum 0x9b09 (incorrect -&gt; 0x4b72), seq 2068664002, ack 938442091, win 62293, options [mss 8911,sackOK,TS val 3323601777 ecr 4022397520,nop,wscale 7], length 0
	0x0000:  4500 003c 0000 4000 4006 9fe1 0ae9 4381  E..&lt;..@.@.....C.
	0x0010:  0ae9 4188 32c9 db60 7b4d 4ec2 37ef 7d6b  ..A.2..\`{MN.7.}k
	0x0020:  a012 f355 9b09 0000 0204 22cf 0402 080a  ...U......&quot;.....
	0x0030:  c61a 2371 efc0 ea50 0103 0307            ..#q...P....
22:56:43.071221 IP (tos 0x0, ttl 63, id 58998, offset 0, flags [DF], proto TCP (6), length 52)
    10.233.65.136.56160 &gt; 10.233.67.129.13001: Flags [.], cksum 0x88c7 (correct), ack 1, win 488, options [nop,nop,TS val 4022397520 ecr 3323601777], length 0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-3-集群组件排错" tabindex="-1"><a class="header-anchor" href="#_2-3-集群组件排错" aria-hidden="true">#</a> 2.3 集群组件排错</h4><p>如果是集群出错，我们需要查看控制节点和 worker 节点的各个组件是否正确。下面是一些基本的步骤供参考：</p><ul><li>检查控制组件 api-server、etcd、scheduler、controller 是否启动成功，可以通过上面提到的 debug Pod 的方式以及检查 /etc/kubernetes/manifests/ 下的 yaml 文件是否有问题。</li><li>检查网络插件是否安装正确以及确保网络插件支持所需的特性。</li><li>检查 kube-proxy 是否部署配置正确。</li><li>检查 DNS 是否配置正确。</li><li>检查 kubelet 是否正常启动，可以通过 systemd status kubelet 命令查看 kubelet 的状态以及 journalctl -u kubelet | tail 命令查看 kubelet 的日志。</li></ul><p>另外关于集群的基本信息，在 kube-public 命名空间下有 ConfigMap 记录，这里记录了基本的 Kubernetes server 信息，如果在节点变化时 server 信息没有及时同步，可以手动该这里的配置进行排错。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ kubectl get cm <span class="token parameter variable">-n</span> kube-public
NAME               DATA   AGE
cluster-info       <span class="token number">1</span>      28d
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,52))])}const h=o(c,[["render",v],["__file","monitoring.html.vue"]]);export{h as default};
