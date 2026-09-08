# 开源测试集提取快速参考卡

> 后续方法资料（2026-09-08）：本文保留开源/RAG 预研内容，不是当前文档管理一期的必做任务，也不代表已下载官方数据或通过产品测试。当前范围见[范围记录](../../docs/00-知识库一期范围与待确认事项.md)。

> 一页纸速查：从哪个资源提取什么
> 版本：kb-v1-quick-ref-2026-09-03

---

## 🎯 按需求查找资源

| 我需要测试... | 推荐资源 | 提取什么 | 用时 |
|--------------|---------|---------|------|
| 检索召回率、干扰文档 | **BEIR** | qrels、干扰文档设计 | 2-3h |
| 答案幻觉、无依据断言 | **RAGTruth** | 幻觉四分类、span标注 | 2-3h |
| 无答案拒答、干扰上下文 | **RGB** | 无答案场景、反事实文档 | 1-2h |
| 表格查询、表格+文本联合 | **TAT-QA** | 表格查询分类、联合取证 | 2-3h |
| 更新/删除传播 | **CRUD-RAG** | 生命周期操作、状态时间线 | 1-2h |
| 文档结构保留 | **DocLayNet** | 结构标注、Parser检查点 | 2-3h |

---

## 📋 资源速查表

### 🔍 BEIR - 检索基准
```yaml
适用: 检索层校准
提取:
  - ✅ 干扰文档思路
  - ✅ qrels 三级相关度
  - ✅ 查询类型分类
  - ✅ Top-K 边界测试

不提取:
  - ❌ 公开语料内容
  - ❌ 平均分门槛

推荐子集:
  - NFCorpus (3.6K文档)
  - SciFact (5K文档)
  
提取后放入: retrieval/golden-queries-v1.yaml
```

### ✅ RAGTruth - 答案可信度
```yaml
适用: 答案接地性、幻觉检测
提取:
  - ✅ 幻觉四分类
      contradictory: 矛盾
      extrapolatory: 外推
      unverifiable: 无法验证
      irrelevant: 无关
  - ✅ Span-level 标注
  - ✅ Claim 拆解方法

不提取:
  - ❌ 模型评分
  - ❌ 公开样例内容

提取后放入: answer/trust-golden-v1.yaml
```

### 🚫 RGB - 拒答与鲁棒性
```yaml
适用: 无答案拒答、干扰测试
提取:
  - ✅ 无答案三分类
      absence: 信息缺失
      ambiguous: 模糊
      conflicting: 冲突
  - ✅ 干扰上下文类型
  - ✅ 反事实文档设计

不提取:
  - ❌ 公开问答对

提取后放入: 
  - retrieval/golden-queries-v1.yaml (无答案查询)
  - answer/trust-golden-v1.yaml (拒答判定)
```

### 📊 TAT-QA - 表格理解
```yaml
适用: 表格解析、表格问答
提取:
  - ✅ 表格查询四分类
      single_cell: 单单元格
      multiple_span: 多单元格
      arithmetic: 计算
      count: 计数
  - ✅ 表格+文本联合模式

不提取:
  - ❌ 财务报告内容
  - ❌ 数学推理（若产品不承诺）

提取后放入: retrieval/golden-queries-v1.yaml (表格用例)
```

### 🔄 CRUD-RAG - 生命周期
```yaml
适用: 更新、删除、版本管理
提取:
  - ✅ CRUD 四操作框架
  - ✅ 状态时间线
  - ✅ 传播检查点

不提取:
  - ❌ 业务场景内容

提取后放入: lifecycle/lifecycle-cases-v1.yaml
```

### 📄 DocLayNet - 文档结构
```yaml
适用: Parser 质量、结构保留
提取:
  - ✅ 元素分类
      title/paragraph/list/table/header/footer
  - ✅ 层级关系
  - ✅ 结构检查点

不提取:
  - ❌ 精确 Bbox（可选）
  - ❌ OCR 数据（若产品不支持）

提取后放入: corpus/README.md (Parser 检查点)
```

---

## 🛠️ 三步提取法

### 步骤 1: 提取 Schema（10-20 分钟）
```yaml
# 从 RAGTruth 提取幻觉分类
hallucination_schema:
  contradictory: "与上下文矛盾"
  extrapolatory: "超出上下文"
  unverifiable: "无法验证"
  irrelevant: "无关"
```

### 步骤 2: 适配到自建数据（30-60 分钟）
```yaml
# 适配到任务 A
case_id: KBV1-A-021
query: "任务 A 的预算是多少？"
answerability: unanswerable
forbidden_claims:
  - type: extrapolatory  # ← 来自 RAGTruth
    pattern: "预算约.*元"
must_refuse: true
```

### 步骤 3: 少量原数据校准（可选，1-2 小时）
```yaml
# 从 BEIR 选 5-10 条用于校准
calibration_set:
  - beir_nfcorpus_q1
  - beir_nfcorpus_q2
  - ...
purpose: "检索基线校准"
metric: "Recall@10"
```

---

## ⚡ 快速决策树

```
我应该用开源数据吗？
│
├─ 只需要用例维度/错误分类？
│  └─ ✅ 提取 Schema，用自建数据实例化
│
├─ 需要检索基线校准？
│  └─ ✅ 少量下载（5-10条），明确标记为校准集
│
├─ 需要大量测试数据？
│  └─ ❌ 自建或模型生成，不要全量下载开源集
│
└─ 领域不匹配（科学论文 vs 企业文档）？
   └─ ❌ 只参考方法，不用数据
```

---

## 🎯 本周行动清单

### 优先提取（P0）
- [ ] BEIR: 干扰文档思路 → 2-3 条新用例
- [ ] RAGTruth: 幻觉分类 → 5 条新用例
- [ ] RGB: 无答案场景 → 3 条新用例

### 可选提取（P1）
- [ ] TAT-QA: 表格查询 → 3 条新用例
- [ ] CRUD-RAG: 生命周期 → 2 条新用例

### 总工作量
- P0: 5-8 小时
- P1: 3-5 小时
- 可产出: 10-20 条新用例

---

## 📝 提取时填写

```yaml
extraction_checklist:
  before_download:
    - [ ] 访问项目主页
    - [ ] 确认许可证
    - [ ] 填写 sources/registry.md
    - [ ] 决定采用等级（A/B/C）
  
  during_extraction:
    - [ ] 只提取 Schema/维度/场景
    - [ ] 基于自建数据适配
    - [ ] 保留原始 ID 映射
  
  after_extraction:
    - [ ] 计算文件 SHA-256
    - [ ] 更新 registry.md
    - [ ] 标注用途（校准/借鉴）
    - [ ] 不混入发布门槛
```

---

## ⚠️ 红线

**绝对不要**:
- ❌ 全量下载 BEIR/MS MARCO
- ❌ 用开源平均分做发布门槛
- ❌ 把公开语料当企业文档
- ❌ 未登记就使用外部数据
- ❌ 混淆"参考方法"和"用数据"

**必须做**:
- ✅ 提取前登记 sources/registry.md
- ✅ 确认许可证
- ✅ 保留原始出处
- ✅ 明确标注用途
- ✅ 基于自建数据实例化

---

## 📞 快速帮助

| 问题 | 查看文档 |
|------|----------|
| 详细提取方法 | `sources/EXTRACTION_GUIDE.md` |
| 开源资源登记 | `sources/registry.md` |
| 已有用例参考 | `retrieval/`, `answer/`, `lifecycle/` |
| 真值表 | `truth/task-a-facts.yaml` |

---

**记住**: 开源资源是**校准基线**和**借鉴思路**，不是**替代自建数据**！

---

版本: kb-v1-quick-ref-2026-09-03  
维护者: AI 应用测试工程师
