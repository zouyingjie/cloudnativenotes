# 容器基础技术：namespace

在容器内进程是隔离的，容器有自己的网络和文件系统，容器内进程的 PID 为 1，这些都是依赖于 Linux namespace 所提供的隔离机制。本篇我们来了解下 Linux 有哪些 namespace，以及它们是如何实现隔离的。

> 文中案例代码均由 ChatGPT 生成，在 Linux 内核 5.15.0-124-generic，ubuntu 22.04 LTS 系统上测试通过。

## namespace 类型

![namespace](https://abdelouahabmbarki.com/content/images/2022/12/Screenshot-from-2022-12-28-19-58-37.png)

每个进程都有自己所属的 namespace，可以在 `/proc/<pid>/ns/` 目录下查看。自 Linux 3.8 版本开始，该目录下的文件以软连接的形式存在，如果两个进程同属于一个 namespace，那么它们对应的文件是相同的，软连接指向同一个文件。

```
$ sudo ls -al /proc/1506573/ns
total 0
dr-x--x--x 2 root root 0 Mar  2 10:53 .
dr-xr-xr-x 9 root root 0 Mar  2 09:24 ..
lrwxrwxrwx 1 root root 0 Mar  2 10:53 cgroup -> 'cgroup:[4026531835]'
lrwxrwxrwx 1 root root 0 Mar  2 10:53 ipc -> 'ipc:[4026531839]'
lrwxrwxrwx 1 root root 0 Mar  2 10:53 mnt -> 'mnt:[4026531841]'
lrwxrwxrwx 1 root root 0 Mar  2 10:53 net -> 'net:[4026531840]'
lrwxrwxrwx 1 root root 0 Mar  2 10:53 pid -> 'pid:[4026531836]'
lrwxrwxrwx 1 root root 0 Mar  2 10:53 pid_for_children -> 'pid:[4026531836]'
lrwxrwxrwx 1 root root 0 Mar  2 10:53 time -> 'time:[4026531834]'
lrwxrwxrwx 1 root root 0 Mar  2 10:53 time_for_children -> 'time:[4026531834]'
lrwxrwxrwx 1 root root 0 Mar  2 10:53 user -> 'user:[4026531837]'
lrwxrwxrwx 1 root root 0 Mar  2 10:53 uts -> 'uts:[4026531838]'
```

目前 Linux 内核有 8 种 namespace，其类型和功能如下：

| 类型 |  系统调用参数 | 功能| 内核版本|
| --- | --- | --- | --- |
| Mount namespace | CLONE_NEWNS | 隔离文件系统挂载点 | Linux2.4.19，是第一个被引入的 namespace |
| UTS namespace | CLONE_NEWUTS | 隔离主机名和域名 | Linux2.6.19 |
| IPC namespace | CLONE_NEWIPC | 隔离进程间通信 | Linux2.6.19 |
| PID namespace | CLONE_NEWPID | 隔离进程 ID | Linux2.6.24 |
| Network namespace | CLONE_NEWNET | 隔离网络 |  Linux2.6.29 |
| User namespace | CLONE_NEWUSER | 隔离用户和组 | Linux3.8 |
| Cgroup namespace | CLONE_NEWCGROUP | 隔离控制组 | Linux4.6 |
| Time namespace | CLONE_NEWTIME | 隔离系统时间 | Linux5.6 |


## 系统调用

上面我们列出了每种 namespace 的系统调用参数，要对进程实现某个 namespace 的隔离，只需要修改已有进程或者在创建进程时指定对应的参数即可。这里主要涉及三个系统调用：

- `setns`：将进程加入到某个已有 namespace。
- `unshare`：将进程从某个 namespace 移除，并加入到新的 namespace。
- `clone`：创建新进程，可以通过传递上述参数达到隔离效果。

### setns & unshare 系统调用

这两个系统调用比较简单，我们用一段代码来演示下。首先我们利用 unshare 系统调用创建一个新的 UTS namespace（隔离主机名）并设置新的主机名，然后通过 `setns` 将某个进程加入到该 namespace 中，在通过 `unshare` 将该进程从该 namespace 中移除。

- unshare 代码

```c
#define _GNU_SOURCE
#include <sched.h>
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>

int main() {
    // 创建新的 UTS Namespace
    if (unshare(CLONE_NEWUTS) == -1) {
        perror("unshare");
        exit(EXIT_FAILURE);
    }

    // 修改当前 namespace 内的 hostname
    if (sethostname("new-namespace", 13) == -1) {
        perror("sethostname");
        exit(EXIT_FAILURE);
    }

    printf("Namespace created, new hostname set to: new-namespace\n");

    // 进入 shell，让用户可以交互
    system("/bin/bash");

    return 0;
}
```

编译并运行，可以看到新的进程其 hostname 已经变成了 `new-namespace`。如果我们新开一个终端，宿主机上执行 `hostname` 命令，可以看到主机名仍然是 `node1`。

```bash
# ubuntu @ node1 in ~/tmp [16:13:06]
$ gcc unshare.c -o unshare_ns



# ubuntu @ node1 in ~/tmp [16:13:09]
$ sudo ./unshare_ns
Namespace created, new hostname set to: new-namespace
root@new-namespace:/home/ubuntu/tmp# hostname
new-namespace
root@new-namespace:/home/ubuntu/tmp#
exit

# ubuntu @ node1 in ~/tmp [16:14:26]
$ hostname
node1
```
接下来我们利用 setns 系统调用将当前进程加入我们刚刚创建的 UTS namespace 中。我们先看下之前的进程 pid：

```bash
$ sudo ./unshare_ns
Namespace created, new hostname set to: new-namespace
root@new-namespace:/home/ubuntu/tmp# hostname
new-namespace
root@new-namespace:/home/ubuntu/tmp# echo $$
1341239
```

Linux 的 namespace 路径在 `/proc/<pid>/ns/` 目录下，我们可以通过 `ls -l /proc/<pid>/ns/` 命令查看。

```bash
$ sudo ls -l /proc/1341239/ns
total 0
lrwxrwxrwx 1 root root 0 Feb  5 16:18 cgroup -> 'cgroup:[4026531835]'
lrwxrwxrwx 1 root root 0 Feb  5 16:18 ipc -> 'ipc:[4026531839]'
lrwxrwxrwx 1 root root 0 Feb  5 16:18 mnt -> 'mnt:[4026531841]'
lrwxrwxrwx 1 root root 0 Feb  5 16:18 net -> 'net:[4026531840]'
lrwxrwxrwx 1 root root 0 Feb  5 16:18 pid -> 'pid:[4026531836]'
lrwxrwxrwx 1 root root 0 Feb  5 16:18 pid_for_children -> 'pid:[4026531836]'
lrwxrwxrwx 1 root root 0 Feb  5 16:18 time -> 'time:[4026531834]'
lrwxrwxrwx 1 root root 0 Feb  5 16:18 time_for_children -> 'time:[4026531834]'
lrwxrwxrwx 1 root root 0 Feb  5 16:18 user -> 'user:[4026531837]'
lrwxrwxrwx 1 root root 0 Feb  5 16:18 uts -> 'uts:[4026532299]'
```

可以看到有 8 种 namespace 相关的软连接，接下来我们将 UTS namespace 的文件路径作为参数给 setns 系统调用，将当前进程加入到该 namespace 中。

```c
#define _GNU_SOURCE
#include <sched.h>
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    // 打开目标进程的 UTS namespace
    int file_dir = open(argv[1], O_RDONLY);
    if (file_dir == -1) {
        perror("open");
        exit(EXIT_FAILURE);
    }

    // 切换到目标进程的 namespace
    if (setns(file_dir, 0) == -1) {
        perror("setns");
        close(file_dir);
        exit(EXIT_FAILURE);
    }
    close(file_dir);

    printf("Joined namespace of process %s\n", argv[1]);

    // 启动一个新的 shell，测试是否进入了目标 Namespace
    system("/bin/bash");

    return 0;
}
```
执行程序如下，可以看到当前进程的 pid 是 1346117，并且 hostname 也变成了 `new-namespace`。

```bash
$ gcc setns.c -o set_ns

# ubuntu @ node1 in ~/tmp [16:21:18]
$ sudo ./set_ns /proc/1341239/ns/uts # 将当前进程加入到 UTS namespace 中
Joined namespace of process /proc/1341239/ns/uts
root@new-namespace:/home/ubuntu/tmp# $$
1346117
root@new-namespace:/home/ubuntu/tmp# hostname
new-namespace
```

### clone 系统调用

unshare 和 setns 都是对当前进程进行操作，用法也比较简单，实际工作中我们更多的是启动容器，创建新的进程。

clone() 是 Linux 提供的创建新进程的底层系统调用，类似 fork()，但它更灵活，可以通过传递众多的 FLAG 参数来控制新进程是否共享特定的资源（如 PID、文件描述符、内存、命名空间等）。

除了上面提到的 namespace 相关的 FLAG，clone() 还支持很多其他的 FLAG，比如：

| Flag | 功能 |
| --- | --- |
| CLONE_VM | 共享内存地址空间（创建线程时使用）|
| CLONE_FS | 共享文件系统信息 |
| CLONE_FILES | 共享文件描述符 |
| CLONE_SIGHAND | 共享信号处理 |
| CLONE_THREAD | 创建线程组 |

我们使用如下代码作为示例，后续介绍各个 namespace 时，会在该代码基础上进行修改。

```c
#define _GNU_SOURCE
#include <sched.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

// 分配子进程的栈空间（clone 需要手动提供栈）
#define STACK_SIZE (1024 * 1024)  // 1MB
static char child_stack[STACK_SIZE];

// 子进程执行的函数
int child_function(void *arg) {
    printf("Entering child shell (PID: %d)\n", getpid());

    // 运行 /bin/bash 交互式 shell
    execlp("/bin/bash", "/bin/bash", "-i", NULL);

    // execlp() 失败时返回错误
    perror("execlp");
    return 1;
}

int main() {
    printf("Parent process PID: %d\n", getpid());

    // 创建子进程，并运行 bash
    pid_t pid = clone(child_function, child_stack + STACK_SIZE, SIGCHLD, NULL);
    if (pid == -1) {
        perror("clone");
        exit(EXIT_FAILURE);
    }

    // 等待子进程结束
    waitpid(pid, NULL, 0);
    printf("Child process exited\n");

    return 0;
}
```

## namespace 详解

接下来我们基于上述代码做修改，来详细看下各个 namespace 的用途和实现方式。

### UTS namespace

首先我们继续看下 UTS namespace，UTS 是 Unix Timesharing System 的缩写，UTS namespace 主要隔离了主机名和域名。我们修改上面 clone 系统调用的代码，在创建子进程时，指定 **CLONE_NEWUTS** 参数。

```c

int child_function(void *arg) {
    printf("Entering child shell (PID: %d)\n", getpid());

    // 设置主机名为 children
    sethostname("children",8);

    execlp("/bin/bash", "/bin/bash", "-i", NULL);

    perror("execlp");
    return 1;
}

int main() {
    printf("Parent process PID: %d\n", getpid());

    // 创建子进程，设置 CLONE_NEWUTS 参数
    pid_t pid = clone(child_function, child_stack + STACK_SIZE, CLONE_NEWUTS | SIGCHLD, NULL);
    if (pid == -1) {
        perror("clone");
        exit(EXIT_FAILURE);
    }

    // 等待子进程结束
    waitpid(pid, NULL, 0);
    printf("Child process exited\n");

    return 0;
}

```
这时候我们运行程序，在子进程进入 shell 后执行命令可以看到主机名已经变成了 `children`。

```bash
$ sudo ./clone_uts
Parent process PID: 2415770
Entering child shell (PID: 2415771)
root@children:/home/ubuntu/tmp# hostname
children
root@children:/home/ubuntu/tmp# uname -a
Linux children 5.15.0-124-generic #134-Ubuntu SMP Fri Sep 27 20:20:17 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux

root@children:/home/ubuntu/tmp# ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.3 168244 11676 ?        Ss    2024  28:19 /sbin/init
root           2  0.0  0.0      0     0 ?        S     2024   0:00 [kthreadd]
root           3  0.0  0.0      0     0 ?        I<    2024   0:00 [rcu_gp]
root           4  0.0  0.0      0     0 ?        I<    2024   0:00 [rcu_par_gp]
root           5  0.0  0.0      0     0 ?        I<    2024   0:00 [slub_flushwq]
root           6  0.0  0.0      0     0 ?        I<    2024   0:00 [netns]
...
```

### PID namespace

PID namespace 主要隔离了进程 ID，每个 namespace 内的进程 ID 都是从 1 开始，并且相互隔离。运行上面的代码时，可以看到子进程的 PID 是 2415771。我们修改代码，在创建子进程时，指定 **CLONE_NEWPID** 参数。

```c
int child_function(void *arg) {
    printf("Entering child shell (PID: %d)\n", getpid());

    // 设置主机名为 children
    sethostname("children",8);

    execlp("/bin/bash", "/bin/bash", "-i", NULL);

    perror("execlp");
    return 1;
}

int main() {
    printf("Parent process PID: %d\n", getpid());

    // 创建子进程，设置 CLONE_NEWUTS 参数
    pid_t pid = clone(child_function, child_stack + STACK_SIZE, CLONE_NEWUTS | CLONE_NEWPID | SIGCHLD, NULL);
    if (pid == -1) {
        perror("clone");
        exit(EXIT_FAILURE);
    }

    // 等待子进程结束
    waitpid(pid, NULL, 0);
    printf("Child process exited\n");

    return 0;
}
```

再次运行程序，可以看到子进程的 PID 会变成 1。

```c
$ sudo ./clone_pid
Parent process PID: 2420560
Entering new shell (PID: 1)
```

当然，如果我们查看主机上的进程，可以看到子进程的 PID 是 2420561。这和我们使用 Docker 时，在容器中看到的进程 ID 为 1，在主机上看到的进程 ID 为其他值，其原理是一样的。

```c
root     2420560  0.0  0.0   3800   976 pts/1    S    15:06   0:00 ./clone
root     2420561  0.0  0.1   7636  4288 pts/1    S+   15:06   0:00 /bin/bash -i
```

### IPC namespace

IPC（Inter-Process Communication）指的是进程间通信，Linux 支持管道、信号、共享内存、信号量、消息队列、套接字等进程间通信方式。像共享内存、消息队列、信号量这些 IPC 资源是全局共享的，为了避免多个进程之间相互干扰，需要使用 IPC namespace 进行隔离。

我们继续修改代码，在创建子进程时，指定 **CLONE_NEWIPC** 参数。为了校验我们代码要变得复杂一些，我们在父进程创建共享内存和消息队列，然后在子进程中尝试访问这些资源。

```c
#define _GNU_SOURCE
#include <sched.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <sys/msg.h>

// 分配子进程的栈空间（clone 需要手动提供栈）
#define STACK_SIZE (1024 * 1024)  // 1MB
static char child_stack[STACK_SIZE];

// 子进程执行的函数
int child_function(void *arg) {
    printf("Entering child shell (PID: %d)\n", getpid());

    sethostname("children", 8);

    // 在子进程中执行 `ipcs -m`，查看共享内存
    system("ipcs -m");

    // 在子进程中执行 `ipcs -q`，查看消息队列
    system("ipcs -s");

    // 运行 /bin/bash 交互式 shell
    execlp("/bin/bash", "/bin/bash", "-i", NULL);

    // execlp() 失败时返回错误
    perror("execlp");
    return 1;
}

int main() {
    printf("Parent process PID: %d\n", getpid());

     // 父进程创建一个共享内存
    int shmid = shmget(IPC_PRIVATE, 1024, IPC_CREAT | 0666);
    if (shmid < 0) {
        perror("shmget");
        exit(1);
    }
    printf("[Parent] Created shared memory ID: %d\n", shmid);

    // 父进程创建一个消息队列
    int msgid = msgget(1234, IPC_CREAT | 0666);
    if (msgid < 0) {
        perror("msgget");
        exit(1);
    }
    printf("[Parent] Created message queue ID: %d\n", msgid);

    // 创建子进程，设置 CLONE_NEWIPC 并运行 bash
    pid_t pid = clone(child_function, child_stack + STACK_SIZE, CLONE_NEWUTS | CLONE_NEWIPC | SIGCHLD, NULL);
    if (pid == -1) {
        perror("clone");
        exit(EXIT_FAILURE);
    }

    // 等待子进程结束
    waitpid(pid, NULL, 0);
    printf("Child process exited\n");

    return 0;
}
```

我们执行代码会得到如下输出，子进程没有看到共享内存和消息队列。

```bash
$ sudo ./clone_ipc
Parent process PID: 2443935
[Parent] Created shared memory ID: 2
[Parent] Created message queue ID: 0
Entering new shell (PID: 2443936)

------ Shared Memory Segments --------
key        shmid      owner      perms      bytes      nattch     status


------ Semaphore Arrays --------
key        semid      owner      perms      nsems

root@children:/home/ubuntu/tmp#
```
如果在主机上执行 `ipcs -m` 和 `ipcs -s` 命令，是看不到共享内存和消息队列的，可以看到子进程的 IPC 资源是隔离的。

```bash
$ ipcs -q

------ Message Queues --------
key        msqid      owner      perms      used-bytes   messages
0x000004d2 0          root       666        0            0


# ubuntu @ node1 in ~ [15:29:41]
$ ipcs -m

------ Shared Memory Segments --------
key        shmid      owner      perms      bytes      nattch     status
0x00000000 0          root       666        1024       0
```
也可以通过查看 `/proc/{pid}/ns/ipc` 文件检查 namespace 是否一致，可以看到子进程的 IPC namespace 和父进程的 IPC namespace 是不同的。

```bash
$  sudo ls -al /proc/2443935/ns/ipc
lrwxrwxrwx 1 root root 0 Feb  6 15:36 /proc/2443935/ns/ipc -> 'ipc:[4026531839]'

# ubuntu @ node1 in ~ [15:36:27]
$  sudo ls -al /proc/2443936/ns/ipc
lrwxrwxrwx 1 root root 0 Feb  6 15:36 /proc/2443936/ns/ipc -> 'ipc:[4026532300]'
```

如果把 **CLONE_NEWIPC** 参数去掉，则子进程可以看到父进程创建的共享内存和消息队列。

```
$ sudo ./clone_uts
Parent process PID: 2443286
[Parent] Created shared memory ID: 1
[Parent] Created message queue ID: 0
Entering new shell (PID: 2443287)

------ Shared Memory Segments --------
key        shmid      owner      perms      bytes      nattch     status
0x00000000 0          root       666        1024       0
0x00000000 1          root       666        1024       0


------ Semaphore Arrays --------
key        semid      owner      perms      nsems

```
查看 `/proc/{pid}/ns/ipc` 文件可以看到子进程的 IPC namespace 和父进程的 IPC namespace 是相同的。

```bash
$ sudo ls -al /proc/2443286/ns/ipc
lrwxrwxrwx 1 root root 0 Feb  6 15:33 /proc/2443286/ns/ipc -> 'ipc:[4026531839]'

$ sudo ls -al /proc/2443287/ns/ipc
lrwxrwxrwx 1 root root 0 Feb  6 15:34 /proc/2443287/ns/ipc -> 'ipc:[4026531839]'
```

### Mount namespace

上面执行 PID namespace 隔离时，子进程中执行 `ps aux` 命令，依然可以看到主机所有的进程信息。这是因为这些命令是基于 `/proc` 文件系统读取的，PID、IPC 等 namespace 并不隔离文件系统，这需要通过 mount namespace 来实现。在通过 **CLONE_NEWNS** 创建新的 mount namespace 时，父进程会把自己的文件结构复制给子进程，早子进程中的所有 mount 操作都只影响自身的所在 namespace 的文件系统，不会对外界产生影响，从而实现非常严格的隔离。

```
$ sudo ./clone_pid
Parent process PID: 2453554
Entering child shell (PID: 1)

# 被 namespace 隔离的子进程可以看到主机上的所有进程
root@children:/home/ubuntu/tmp# ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.3 168244 11676 ?        Ss    2024  28:19 /sbin/init
root           2  0.0  0.0      0     0 ?        S     2024   0:00 [kthreadd]
root           3  0.0  0.0      0     0 ?        I<    2024   0:00 [rcu_gp]
root           4  0.0  0.0      0     0 ?        I<    2024   0:00 [rcu_par_gp]
root           5  0.0  0.0      0     0 ?        I<    2024   0:00 [slub_flushwq]
```

我们继续修改代码，创建子进程时，指定 CLONE_NEWNS 参数，并将 `proc` 挂载到子进程的 `/proc` 目录下。


```c
#define _GNU_SOURCE
#include <sched.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <sys/msg.h>

// 分配子进程的栈空间（clone 需要手动提供栈）
#define STACK_SIZE (1024 * 1024)  // 1MB
static char child_stack[STACK_SIZE];

// 子进程执行的函数
int child_function(void *arg) {
    printf("Entering child shell (PID: %d)\n", getpid());

    sethostname("children", 8);
    // CLONE_NEWNS 创建了独立的挂载空间，子进程看不到原来的 /proc，所以它必须手动重新挂载 proc。
    system("mount -t proc proc /proc");

    // 运行 /bin/bash 交互式 shell
    execlp("/bin/bash", "/bin/bash", "-i", NULL);

    // execlp() 失败时返回错误
    perror("execlp");
    return 1;
}

int main() {
    printf("Parent process PID: %d\n", getpid());

    // 创建子进程，设置 CLONE_NEWIPC 并运行 bash
    pid_t pid = clone(child_function, child_stack + STACK_SIZE, CLONE_NEWUTS | CLONE_NEWPID | CLONE_NEWNS | SIGCHLD, NULL);
    if (pid == -1) {
        perror("clone");
        exit(EXIT_FAILURE);
    }

    // 等待子进程结束
    waitpid(pid, NULL, 0);
    printf("Child process exited\n");

    return 0;
}
```

再次运行程序，可以看到子进程自己看到的 PID 为 1，并且执行 ps、top 命令时只能看到自己 namespace 下的进程。

```bash
$ sudo ./clone_newns
Parent process PID: 2458440
Entering child shell (PID: 1)
root@children:/home/ubuntu/tmp# ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1   7636  4232 pts/3    S    15:54   0:00 /bin/bash -i
root           9  0.0  0.0  10072  1544 pts/3    R+   15:54   0:00 ps aux

root@children:/home/ubuntu/tmp# top
top - 15:55:00 up 66 days,  3:15,  5 users,  load average: 0.00, 0.04, 0.01
Tasks:   2 total,   1 running,   1 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.3 us,  0.3 sy,  0.0 ni, 99.3 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   3335.9 total,    208.7 free,    447.9 used,   2679.3 buff/cache
MiB Swap:      0.0 total,      0.0 free,      0.0 used.   2596.6 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
      1 root      20   0    7636   4344   3736 S   0.0   0.1   0:00.00 bash
     11 root      20   0   10352   4020   3460 R   0.0   0.1   0:00.00 top
```

### User namespace

User namespace 主要隔离了用户和用户组，每个 namespace 内的用户和用户组都是从 0 开始，并且相互隔离。这在容器中非常有用，比如容器中的进程可能需要 root 权限，但如果容器直接使用了主机的 root 用户会带来安全隐患，我们可以通过 User namespace 来隔离用户和用户组，将容器中的 root 用户映射到主机的某个用户，从而实现安全的隔离。


Usernamespace 使用 CLONE_NEWUSER 参数创建，我们修改代码，在执行 clone 创建子进程时，指定 CLONE_NEWUSER 参数。

```c

// 分配子进程的栈空间（clone 需要手动提供栈）
#define STACK_SIZE (1024 * 1024)  // 1MB
static char child_stack[STACK_SIZE];

// 子进程执行的函数
int child_function(void *arg) {
    printf("Entering child shell (PID: %d)\n", getpid());

    sethostname("children", 8);
    // 打印当前用户和用户组
    int uid = getuid();
    int gid = getgid();

     printf("User ID: %d, Group ID: %d\n", uid, gid);

    // 运行 /bin/bash 交互式 shell
    execlp("/bin/bash", "/bin/bash", "-i", NULL);

    // execlp() 失败时返回错误
    perror("execlp");
    return 1;
}

int main() {
    printf("Parent process PID: %d\n", getpid());

    // 创建子进程，设置 CLONE_NEWUSER 并运行 bash
    pid_t pid = clone(child_function, child_stack + STACK_SIZE, CLONE_NEWUTS  |  CLONE_NEWUSER|SIGCHLD, NULL);
    // 代码省略...
}

```
编译执行代码，可以看到子进程的 UID 和 GID 都是 65534，这是 User namespace 的默认用户和用户组。在 ``/proc/sys/kernel/overflowuid`` 和 ``/proc/sys/kernel/overflowgid`` 文件中定义，如果新的 usernamespace 中的 UID、GID 没有明确映射到主机的用户和用户组，则使用 overflowuid 和 overflowgid 作为默认用户和用户组。

```bash
Parent process PID: 2736120
Entering child shell (PID: 2736121)
User ID: 65534, Group ID: 65534
nobody@children:/home/ubuntu/tmp$ id
uid=65534(nobody) gid=65534(nogroup) groups=65534(nogroup)

$ cat /proc/sys/kernel/overflowuid
65534

$ cat /proc/sys/kernel/overflowgid
65534
```

如果我们想把容器中的 uid、gid 映射到主机的某个用户和用户组，需要修改 ``/proc/{pid}/uid_map`` 和 ``/proc/{gid}/gid_map`` 两个文件进行映射。格式为：

```
{container_uid} {host_uid} {length}
```
三个参数分别表示：
- 容器中的 uid 或 gid
- 映射到主机中的 uid、gid
- 映射范围，一般为 1，表示一一对应

这两个文件的写入权限需要满足以下条件：

- 写文件的进程必须有这个 namespace 的的 **CAP_SETUID** 和 **CAP_SETGID** 权限，参考 [Linux Capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html)
- 写文件进程必须是此 namespace 的父进程或者子进程


比如我们在 Ubuntu 系统中运行的代码，想把 namespace 内部的 root（uid=0）映射到主机中的 ubuntu（uid=1000），用户，可以修改 ``/proc/{pid}/uid_map`` 文件，添加如下内容：
```
0 1000 1
```
下面是代码示例：

```c

#define STACK_SIZE (1024 * 1024)  // 1MB
static char child_stack[STACK_SIZE];

// 子进程执行的函数
int child_function(void *arg) {
    printf("Child process (PID: %d)\n", getpid());

    // 映射子进程的 UID 和 GID 到宿主机的普通用户 ID（假设是 1000）
    FILE *uid_map = fopen("/proc/self/uid_map", "w");
    if (uid_map) {
        fprintf(uid_map, "0 1000 1\n");  // 子进程的 UID 映射到宿主机 UID 1000
        fclose(uid_map);
    } else {
        perror("fopen uid_map");
        return 1;
    }

    FILE *setgroups = fopen("/proc/self/setgroups", "w");
    if (setgroups) {
        fprintf(setgroups, "deny\n");  // 禁止组映射
        fclose(setgroups);
    } else {
        perror("fopen setgroups");
    }

    FILE *gid_map = fopen("/proc/self/gid_map", "w");
    if (gid_map) {
        fprintf(gid_map, "0 1000 1\n");  // 子进程的 GID 映射到宿主机 GID 1000
        fclose(gid_map);
    } else {
        perror("fopen gid_map");
        return 1;
    }

    // 打印 UID 和 GID
    printf("User ID: %d, Group ID: %d\n", getuid(), getgid());

    execlp("/bin/bash", "/bin/bash", "-i", NULL);

    // execlp() 失败时返回错误
    perror("execlp");
    return 1;

}

int main() {
    printf("Parent process (PID: %d)\n", getpid());

    // 创建 User Namespace 并执行子进程
    pid_t pid = clone(child_function, child_stack + STACK_SIZE, CLONE_NEWUSER | SIGCHLD, NULL);
    if (pid == -1) {
        perror("clone");
        exit(EXIT_FAILURE);
    }

    // 等待子进程结束
    waitpid(pid, NULL, 0);
    return 0;
}
```

再次运行代码查看子进程的 UID 和 GID，可以看到其 ID 为 0，并且 /proc/self/uid_map 和 /proc/self/gid_map 文件中已经映射成功。

```bash
$ ./clone_user
Parent process (PID: 2816659)
Child process (PID: 2816660)
User ID: 0, Group ID: 0

root@node1:~/tmp# id
uid=0(root) gid=0(root) groups=0(root),65534(nogroup)


$ cat /proc/2816660/gid_map
         0       1000          1
```


映射成功后，虽然容器中是 root 用户，但容器中执行的命令是以 ubuntu 用户执行的，容器的安全性得到了提升。

```
ubuntu   2816659  0.0  0.0   3800  1044 pts/1    S    14:48   0:00 ./clone_user
ubuntu   2816660  0.0  0.1   8664  5364 pts/1    S+   14:48   0:00 /bin/bash -i
```


### Network namespace

Network namespace 用于网络隔离，每个 namespace 都有自己的网络设备、IP 地址、路由表、防火墙规则等。这里我们用 ip 命令来做测试。

Docker 容器都有自己的网络 namespace，默认使用网桥进行容器间的通信，示例如下：

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/container-network.png)

Docker 有自己的私有网段 172.18.0.0/16，启动时会创建一个名为 docker0 的 bridge 设备，默认地址为 172.17.0.1/16，每个容器有自己的 network namespace，图中两个容器有自己的 network namespace，IP 地址分别为 172.18.0.2 和 172.18.0.3，namespace 和 docker0 通过 veth 设备连接，加上路由表和 iptables 规则，从而实现容器间的通信和外网访问。

我们可以用下面一组命令来 DIY namespace 的网络，模拟容器的网络隔离和通信。

```bash
# 创建一个 bridge 设备 drybr0 docker0
$ sudo ip link add name drybr0 type bridge
$ sudo ip link set dev drbr0 type bridge stp_state 0

# 为 drybr0 设备设置 IP 地址
$ sudo ip addr add 172.17.0.1/16 dev drybr0

# 创建两个 namespace
$ sudo ip netns add dryns1
$ sudo ip netns add dryns2

# 激活两个 namespace 的回环接口
$ sudo ip netns exec dryns1 ip link set lo up
$ sudo ip netns exec dryns2 ip link set lo up

# 创建两对 veth 对
$ sudo ip link add dryveth0 type veth peer name drybr0.1
$ sudo ip link add dryveth1 type veth peer name drybr0.2


# 将 veth 对一头加到 namespace
$ sudo ip link set dryveth0 netns dryns1
$ sudo ip link set dryveth1 netns dryns2

# 修改 namespace 中的 veth 设备名称为 eth0
$ sudo ip netns exec dryns1 ip link set dryveth0 name eth0
$ sudo ip netns exec dryns2 ip link set dryveth1 name eth0

# 为 namespace 中的 eth0 设备设置 IP 地址并激活
$ sudo ip netns exec dryns1 ip addr add 172.17.0.2/16 dev eth0
$ sudo ip netns exec dryns2 ip addr add 172.17.0.3/16 dev eth0

$ sudo ip netns exec dryns1 ip link set eth0 up
$ sudo ip netns exec dryns2 ip link set eth0 up

# veth 连接到 drybr0，启动 veth 和 bridge
$ sudo ip link set drybr0 up
$ sudo ip link set drybr0.1 master drybr0
$ sudo ip link set drybr0.2 master drybr0
$ sudo ip link set drybr0.1 up
$ sudo ip link set drybr0.2 up

# 为 namespace 添加路由规则，使其可以访问到外部
# 默认传输全部走 drybr0
$ sudo ip netns exec dryns1 ip route add default via 172.17.0.1
$ sudo ip netns exec dryns2 ip route add default via 172.17.0.1

# 在 dryns1 中 ping dryns2，此时可以看到两个 namespace 之间可以互相通信
$ sudo ip netns exec dryns1 ping 172.17.0.3
PING 172.17.0.3 (172.17.0.3) 56(84) bytes of data.
64 bytes from 172.17.0.3: icmp_seq=1 ttl=64 time=0.098 ms
64 bytes from 172.17.0.3: icmp_seq=2 ttl=64 time=0.052 ms

```
上述代码模拟了两个容器之间的通信模式，现在两个 namespace 之间是互通的，但如果想访问外界，目前还做不到，原因是 namespace 中的请求会走到 drybr0 设备。drybr0 目前会将同网段的数据通过 veth 对发送到对应的 namespace 中，但对访问外部网络的请求，drybr0 没办法转发出去。

查看主机路由信息：

```bash
# 查看主机路由信息，drybr0 应该将数据路由到 eth0
$ ip route
default via 172.19.0.1 dev eth0 proto dhcp src 172.19.0.12 metric 100
172.17.0.0/16 dev drybr0 proto kernel scope link src 172.17.0.1
172.19.0.0/20 dev eth0 proto kernel scope link src 172.19.0.12 metric 100
172.19.0.1 dev eth0 proto dhcp scope link src 172.19.0.12 metric 100
183.60.82.98 via 172.19.0.1 dev eth0 proto dhcp src 172.19.0.12 metric 100
183.60.83.19 via 172.19.0.1 dev eth0 proto dhcp src 172.19.0.12 metric 100
```

默认情况下，主机会将 src 为 172.19.0.12 的数据包用 eth0 设备转发到 172.19.0.1 设备。而 drybr0 发出的数据包其网络地址为 172.17.0.0/16，所以无法通过 eth0 设备转发出去。我们需要设置 NAT 规则，将 172.17.0.0/16 的数据包源地址替换为 eth0 的地址，这样就可以通过 eth0 设备转发出去。

```bash
# 在 dryns1 中访问百度会超时
$ sudo ip netns exec dryns1  wget https://103.235.46.96 --no-check-certificate
--2025-02-11 15:30:33--  https://103.235.46.96/
Connecting to 103.235.46.96:443...



# 开启 IP 转发
$ sudo sysctl -w net.ipv4.ip_forward=1
net.ipv4.ip_forward = 1

# 配置 iptables 规则，将 eth0 发送的源地址为 172.17.0.0/16 的数据包进行 SNAT 操作，将其替换为 eth0 的地址
$ sudo iptables -t nat -A POSTROUTING -s 172.17.0.0/16 -o eth0 -j MASQUERADE

# 再次访问百度，可以看到成功访问
$ sudo ip netns exec dryns1  wget https://103.235.46.96 --no-check-certificate
--2025-02-11 15:46:43--  https://103.235.46.96/
Connecting to 103.235.46.96:443... connected.
    WARNING: certificate common name ‘baidu.com’ doesn't match requested host name ‘103.235.46.96’.
HTTP request sent, awaiting response... 200 OK
Length: 2443 (2.4K) [text/html]
Saving to: ‘index.html.1’

index.html.1                                                100%[===========>]   2.39K  --.-KB/s    in 0s

2025-02-11 15:46:43 (33.3 MB/s) - ‘index.html.1’ saved [2443/2443]
```

上面命令成功访问了百度，但我们是用 IP 访问的，如果用域名访问会报错。这里要为 namespace 配置 DNS 解析，需要在 /etc/netns/{namespace_name} 目录下创建 resolv.conf 文件。配置完成后，再次访问域名，可以看到成功访问。

```bash
# 通过域名访问，依然报错
$ sudo ip netns exec dryns1 ping www.baidu.com
ping: www.baidu.com: Temporary failure in name resolution


# 配置 DNS 解析
$ sudo mkdir -p /etc/netns/dryns1
$ sudo echo "nameserver 8.8.8.8" > /etc/netns/dryns1/resolv.conf

$ sudo ip netns exec dryns1 ping www.baidu.com
PING www.wshifen.com (103.235.46.96) 56(84) bytes of data.
64 bytes from 103.235.46.96 (103.235.46.96): icmp_seq=1 ttl=54 time=1.89 ms
64 bytes from 103.235.46.96 (103.235.46.96): icmp_seq=2 ttl=54 time=1.86 ms
```
以上就是 docker 网络的基本原理了，觉得难理解可以参考这个[交互式教程：a Docker Bridge Network From Scratch](https://labs.iximiuz.com/tutorials/container-networking-from-scratch)，每次执行命令都会以图表的形式展示网络结构的变化。

具体到 Docker 的实现，它自己实现了类似 ip 命令的工具；对于域名解析，它没有采用 上述 resolv.conf 文件的方式，而是用了 Mount Namespace 的方式实现。


### Cgroup namespace


关于 Cgroup namespace 的介绍我们放到下一篇 cgroup 文章中专门介绍，这里不做赘述。

### Time namespace

这是 Linux 5.6 版本引入的一种 namespace，用于隔离系统时间。服务器本身有三种时间：

- **CLOUD_REALTIME**：实时时间，就是我们日常使用的时间，系统的实时时间一般受 NTP 等服务的影响，可以用 `date` 命令查看

```
$ date
Sun Mar  2 11:17:51 AM CST 2025
```
- **CLOCK_MONOTONIC**：单调时间，从过去某个时间点开始的单调递增的时间，这是计算时间差最好的方式。

- **CLOCK_BOOTTIME**：系统启动到现在的时间，包括休眠时间，可以用 `uptime` 命令或者 `/proc/uptime` 文件查看。

```
$ uptime
11:17:51 up 1 day, 11:17,  1 user,  load average: 0.00, 0.01, 0.05
```

```
$ cat /proc/uptime
1714635471.00 1714635471.00
```

Time namespace 支持后两种时间的隔离，目前只能通过 unshare 命令来创建 Time namespace，然后调用 setns 命令将进程加入到 Time namespace 中。具体的偏移量有在 /proc/{pid}/timens_offsets 文件中设置，格式为：

```
{clock_id} {offset_sec} {offset_nsec} 
```

- clock_id：时间类型，可以是 CLOCK_MONOTONIC 或者 CLOCK_BOOTTIME
- offset_sec：秒偏移量，可以为负数。
- offset_nsec：纳秒偏移量，不可以为负数。

默认偏移都是 0，表示没有偏移。
```
cat /proc/self/timens_offsets
monotonic           0         0
boottime            0         0

```

如果我们希望将时间偏移提前 7 天，可以做如下修改：
```
monotonic -604800 0
boottime -604800 0
```
