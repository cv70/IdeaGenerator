# Idea Generator

一个基于核心主题批量产生 idea 的工具

## 产品定位

Idea Generator 面向以下用户：

- 独立开发者
- 创业者
- 产品经理
- 运营

第一版的核心目标不是输出详细实施方案，而是围绕一个核心主题，快速、大量、持续地产生有差异的 idea。

产品强调三件事：

- 多产出：一次生成 12-24 条 idea
- 有差异：从不同机会方向切出结果，避免同质化
- 可继续发散：支持换角度再生成，而不是一次性结束

## 输入与输出

### 输入

用户以 `主题词` 作为起点，例如：

- AI 教育
- 宠物经济
- 银发消费
- 跨境电商
- 独立开发者工具

第一版允许少量辅助选项：

- 更大众 / 更细分
- 更稳健 / 更新奇
- 偏工具 / 偏内容 / 偏服务
- 国内市场 / 海外市场

### 输出

系统输出按机会簇分组的 idea 卡片，而不是单一列表。

每张 idea 卡片包含：

- Idea 名称
- 一句话描述
- 目标人群
- 核心场景
- 价值点
- 商业标签
- 机会标签

## 核心流程

系统采用三层生成法（由 3 轮自主 agent 驱动）：

1. 主题拆解
2. 机会切片
3. Idea 卡片生成

### 1. 主题拆解

输入主题词后，先生成轻量机会地图，不直接随机出点子。

拆解维度包括：

- 人群维度
- 场景维度
- 需求维度
- 动机维度
- 趋势维度
- 商业模式维度

### 2. 机会切片

基于拆解结果，形成多个机会区。

例如围绕一个主题词，系统可以切出：

- 特定人群
- 特定使用场景
- 特定消费动机
- 特定频率需求
- 特定付费能力
- 特定趋势交叉点

### 3. Idea 卡片生成

每个机会区批量生成若干条 idea，并统一格式化为卡片。

目标不是生成“长篇方案”，而是生成适合快速浏览、比较、收藏和继续发散的机会型点子。

### Agent 编排（Hybrid, max 3 rounds）

后端 `IdeaGenerationAgent` 在 `/generate` 中执行：

1. Planner：规划本轮探索重点与簇目标
2. Executor：按计划生成结构化 idea cards
3. Critic：评估重复率/覆盖度/质量并给下一轮 focus

停止规则：

- 达到目标数量且重复率低于阈值时提前停止
- 最多执行 3 轮

可靠性规则：

- 任意一轮解析或模型调用失败时，自动回退到规则生成器，不让接口失败

## 差异化策略

为了减少重复和套话，第一版至少要控制以下问题：

- 同一轮内限制重复人群
- 同一轮内限制重复场景
- 同一轮内限制重复价值主张
- 对生成结果做相似性过滤
- 对被过滤后的空位补生成

同时支持明确的“换角度再生成”：

- 换人群
- 换场景
- 更偏小众
- 更偏赚钱
- 更偏内容型
- 更偏工具型
- 更反常识

## 交互设计

第一版交互目标：让用户在 30 秒内看到第一批结果。

### 首页

- 一个主题词输入框
- 少量生成偏好开关
- 若干示例主题

### 结果页

- 展示当前主题和筛选条件
- 按机会簇展示 idea 卡片
- 支持筛选、隐藏、收藏、继续发散

### 收藏页

- 保存用户感兴趣的 idea
- 支持再次查看和继续发散

## 用户动作

第一版重点支持以下动作：

- 生成一批 idea
- 换个角度再生成
- 只看某一类标签
- 收藏某条 idea
- 基于某条 idea 再扩展一批相近但不同的 idea

## MVP 范围

### 必做

- 主题输入模块
- 机会扫描模块
- Idea 生成模块
- 去重与分组模块
- 结果展示模块
- 收藏模块

### 不做

- 详细商业计划生成
- PRD 生成
- 技术方案生成
- 多人协作
- 复杂账号体系
- 长对话记忆
- 自动联网市场研究
- 复杂评分系统

## 核心数据对象

第一版建议围绕 4 类对象设计：

- `Topic`
- `OpportunityCluster`
- `IdeaCard`
- `Favorite`

## 推荐技术形态

建议采用轻量 Web 应用架构：

- 前端负责输入、展示、筛选和收藏
- 后端负责 prompt 编排、结果清洗、去重和持久化
- 模型层先接入一个主模型即可
- 存储层优先使用关系型数据库

向量能力不是 MVP 必需项。只有在后续需要更强的语义去重、相似扩展或主题回溯时，再考虑引入。

## API (MVP)

Base path: `/api/v1/ideas`

### `POST /generate`

Request:

```json
{
  "topic": "creator economy",
  "count": 16,
  "angle": "profit-first"
}
```

Response (shape):

```json
{
  "code": 200,
  "data": {
    "topic": "creator economy",
    "angle": "profit-first",
    "meta": {
      "source": "agent",
      "rounds": 2,
      "quality_score": 4.1,
      "duplicate_rate": 0.08
    },
    "clusters": [
      {
        "cluster_id": "audience",
        "title": "Audience Slice",
        "ideas": [
          {
            "id": "string",
            "name": "string",
            "one_liner": "string",
            "target_audience": "string",
            "core_scenario": "string",
            "value_point": "string",
            "business_tags": ["tool"],
            "opportunity_tags": ["niche", "profit-first"]
          }
        ]
      }
    ]
  }
}
```

### `POST /expand`

Request:

```json
{
  "topic": "creator economy",
  "base_idea_id": "abc123",
  "base_name": "Creator Audience Slice 1",
  "count": 5,
  "angle": "niche-first"
}
```

### `POST /regenerate-cluster`

Request:

```json
{
  "topic": "creator economy",
  "cluster_id": "audience",
  "count": 6,
  "angle": "balanced"
}
```

### `POST /favorites`

Request:

```json
{
  "card": {
    "id": "fav-1",
    "name": "Idea Name",
    "one_liner": "One-line summary",
    "target_audience": "solo founders",
    "core_scenario": "weekly planning",
    "value_point": "faster ideation",
    "business_tags": ["tool"],
    "opportunity_tags": ["niche"]
  }
}
```

### `GET /favorites`

Response `data.ideas` returns all saved cards.

### `DELETE /favorites/:id`

Removes one saved card.

Response (shape):

```json
{
  "code": 200,
  "data": {
    "topic": "creator economy",
    "base_idea_id": "abc123",
    "base_name": "Creator Audience Slice 1",
    "ideas": []
  }
}
```

## 成功标准

第一版是否成立，主要看以下信号：

- 用户是否愿意围绕同一主题多次生成
- 用户是否觉得结果足够分散而不是重复改写
- 用户是否会收藏部分 idea
- 用户是否会使用“换个角度”继续探索

## 一句话总结

输入一个主题词，扫描多个机会方向，批量生成成组的 idea 卡片，并支持继续发散。
