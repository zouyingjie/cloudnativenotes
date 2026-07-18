# 分布式 ID

> 在复杂分布式系统中，往往需要对大量的数据和消息进行唯一标识。如在美团点评的金融、支付、餐饮、酒店、猫眼电影等产品的系统中，数据日渐增长，对数据分库分表后需要有一个唯一 ID 来标识一条数据或消息，数据库的自增 ID 显然不能满足需求；特别一点的如订单、骑手、优惠券也都需要有唯一 ID 做标识。此时一个能够生成全局唯一 ID 的系统是非常必要的。
>
> [Leaf——美团点评分布式 ID 生成系统](https://tech.meituan.com/2017/04/21/mt-leaf.html)

本文主要介绍一些常见的分布式唯一 ID 生成方案。

## UUID（通用唯一识别码）

UUID 是 [Universally Unique Identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier) 的缩写，其目的是为了满足在分布式系统中，各个节点可以独立的生成唯一标识符，不需要依赖一个中心化的服务来分配 ID。相关设计最早在 1980 年代就已经提出，最终 2005 年在 [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122) 中被完整定义。2024 年最新的 [RFC 9562](https://datatracker.ietf.org/doc/html/rfc9562) 发布，新增了 3 个新版本的 UUID 生成算法，取代了 RFC4122。

UUID 本身是一个长度为 128bit 的数字，通常用 32 位长度的 16 进制数字表示。因此其理论上的总数为 2^128，约等于 3.4 x 10^38。也就是说如果每纳秒生成一万个 UUID（每秒 **10 万亿**个），在完全随机版本下，需要 1700 万亿年才能生成完所有的 UUID，妥妥的直到宇宙尽头（宇宙预测寿命为 138 亿年）。

在实际使用中，生成的 UUID 由 32 个字符和 4 个连字符表示，格式为 ``8-4-4-4-12``，我们一般会在生成后将 `-` 给替换掉 `UUID.randomUUID().toString().replaceAll("-","")`。

RFC 4122 中定义了 5 个版本的 UUID，每个版本的算法不同，应用范围也不同，分别为：

- `Time-based UUID`：基于时间的 UUID。通过本机 MAC 地址、时间戳以及a随机数计算出 UUID，格式为 `timestamp(60bit)-clock_seq(14bit)-MAC(48bit)`，另外还有 4bit 的 version 字段和 2 bit 的 variant 字段。因为使用了 MAC 地址，因此理论上绝对唯一，但 UUID 暴露了 MAC 地址，私密性不够好。

- `DCE Security UUID`：DCE安全的UUID。和版本一类似，但会将时间戳的前 4 位替换为 POSIX 的 UID 或 GID，实际很少使用。

- `UUID from names(MD5)`：基于名字的 UUID，通过 MD5(命名空间ID + 名称) 计算出哈希值，该版本可以保证相同输入产生相同输出，但目前 MD5 已经不再安全，容易受到碰撞攻击，现在推荐用 UUIDv5 替代。

- `truly random UUID`：完全随机 UUID。根据随机数或者伪随机数生成 UUID，这是使用最广泛的版本，JDK 中实现的就是这个版本。

- `UUID from names(SHA1)`：UUIDv3 的升级版，通过 SHA1(命名空间ID + 名称) 计算出哈希值，该版本可以保证相同输入产生相同输出，安全性相对较高。

RFC9562 又提出了三个新的版本，分别是：

- `Time-based UUID`：对 UUIDv1 的升级，对时间戳进行了重排，将时间戳从高到低位有序排列，从而提高了数据库索引性能。

- `Unix Epoch-based UUID`：基于 Unix 时间戳的 UUID，使用当前时间戳（自 1970 年 1 月 1 日以来的毫秒数）作为 UUID 的前 48 位，整体格式为 `timestamp(48bit)-version(4bit)-randomA(12bit)-variant(2bit)-randomB(62bit)`。 Version7 是专为现代数据库和分布式系统设计的、基于时间的 UUID 格式。它结合了时间戳和高质量的随机数，从而实现了优秀的排序性和唯一性。

  如果开发者使用的语言生态已经支持 Version7，应该优先使用该版本。以笔者熟悉的 Java 和 Golang 为例，JDK 尚不支持 Version7，但已经有 [uuid-creator](https://github.com/f4b6a3/uuid-creator)和 [java-uuid-generator](https://github.com/cowtowncoder/java-uuid-generator) 开源库支持；Golang 方面 Google 官方的[uuid](https://github.com/google/uuid) 库已经支持。

- `Custom UUID`：自定义 UUID，一种实验性质或供应商特定用途的 UUID，除了 version 和 variant 字段外，其余 122bit 可以自由定义。

下面是使用 Java 和 Golang 生成的 Version4 和 Version7 版本的 UUID 示例：

- Golang 示例

```golang
package main

import "github.com/google/uuid"

func main() {
	uuidv4 := uuid.New()
	println("UUIDv4: " + uuidv4.String())

	uuidv7, _ := uuid.NewV7()
	println("UUIDv7: " + uuidv7.String())
}
```

输出结果如下

```
UUIDv4: 496a53aa-e690-4d8f-bf77-316d294e2f81
UUIDv7: 01989e87-e56c-729b-a341-5faa691e4b24
```

- Java 示例

```Java

import java.util.UUID;

public class UUIDDemo {
    public static void main(String[] args) {

    	//默认是版本 4，完全随机 ID
    	UUID uuid = UUID.randomUUID();
		// 替换 -
    	System.out.println(uuid.toString().replaceAll("-",""));
	}
}

```

输出结果如下

```
676a8fee6c1b48028dfc86e2bc35e4fe
```

## 数据库自增 ID

一般在设计数据库表时，一定会有一个 AUTO_INCREMENT=1 的 ID 字段，其本身就是一个表范围的全局唯一 ID。但如果数据量达到一定量级，需要分库分表时，生成的 ID 就会重复，此时一般需要设置自增 ID 的起始值和增长步长，比如 MySQL 提供了两个字段进行设置：

- `auto_increment_offset`：自增 ID 的起始值，默认是 1。
- `auto_increment_increment`：自增 ID 的增长步长，默认是 1。

比如当通过分库分表拆分为三个数据库时，可以设置如下起始值和步长来实现全局自增 ID 唯一：

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/db-uniqueid.png)

像数据库的自增 ID、Redis 的 `INCR` 和 `INCRBY` 命令，Zookeeper 的 `Sequential` 节点，都带有自增属性，因此都可以用来实现分布式唯一 ID，但这些方案都会对中间件产生依赖。无论是使用的编码复杂度，还是对中间件的高可用性要求，相比其他方案都会有一定的劣势。

## 雪花算法

[Snowflake（雪花算法）](https://en.wikipedia.org/wiki/Snowflake_ID) 是由 Twitter 提出的分布式唯一 ID 生成方案。其核心思想是将时间戳、机器 ID 和序列号结合在一起，生成一个 64 位的唯一 ID。

雪花算法的 ID 结构如下：

![](https://pub-08b57ed9c8ce4fadab4077a9d577e857.r2.dev/twitter-snowflake-unique-id.png)

- 1 个保留位，始终为 0。
- 41 位时间毫秒时间戳，其可用年限大约为 69 年。
- 10 位机器 ID，支持 1024 台机器。还可以继续细分， 5 位给 IDC，5 位给工作机器。
- 12 位序列号，可以表示 2^12 = 4096 个数。因此雪花算法最大支持每毫秒生成 4096 个 ID。

基于以上字段分布，雪花算法可以**每毫秒在一个数据中心的一台机器上产生4096个有序的不重复的ID**。

不过因为是时间戳的原因，雪花算法在生成 ID 时需要考虑时钟回拨的问题。如果系统时间发生回拨，可能会导致生成的 ID 重复。因此在使用雪花算法时，需要确保系统时间的准确性。Twitter 的官方实现并没有对其做明确处理，只是简单的报错，这样会导致分布式ID服务短期内不可用。后续的开源方案，像美团的 [Leaf](https://tech.meituan.com/2017/04/21/mt-leaf.html)，百度的 [UidGenerator](https://github.com/baidu/uid-generator) 都对其做了优化，这也是比较常用的两个开源库，在实际工程中如果需要，可以在详细调研后进行选型。
