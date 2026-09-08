# 开源测试集资源登记表

> 后续方法资料（2026-09-08）：本文保留开源/RAG 预研内容，不是当前文档管理一期的必做任务，也不代表已下载官方数据或通过产品测试。当前范围见[范围记录](../../docs/00-知识库一期范围与待确认事项.md)。

> 任何外部数据进入测试工作区前，先登记一行
> 没有登记的资源只可阅读，不可进入发布门槛

## 重要说明

**正式下载或纳入发布门槛前，必须再次阅读项目主页和数据卡**

- 开源项目的版本、可下载性和许可证会变化
- 不把本表当作许可证意见
- 许可证、隐私和再分发条件不清楚时，保留链接和研究笔记即可，不要把数据复制进团队共享目录

## 采用等级

| 等级 | 含义 | 处理方式 |
|------|------|----------|
| A：直接校准 | 数据结构和目标与当前层接近 | 小规模导入，保留原始 ID、qrels、证据和许可证记录 |
| B：借鉴设计 | 方向相关，但语料/领域不匹配 | 只复制用例维度、Rubric 或生成方法，不直接拿平均分做门槛 |
| C：暂不采用 | 与当前能力差异过大或成本高 | 记录原因，避免为"看起来完整"增加无效工作 |

## 检索 / Embedding 基准

| source_dataset | source_url | version | license | usage_class | approved_by | notes |
|----------------|------------|---------|---------|-------------|-------------|-------|
| BEIR | https://github.com/beir-cellar/beir | 待确认 | 各子集许可证需分别核对 | A（小子集校准） | 待确认 | 用小子集校准 Top-K、Recall@K、Precision@K；不测上传、解析、Chunk、权限 |
| MTEB | https://github.com/embeddings-benchmark/mteb | 待确认 | 待确认 | B（参考） | 待确认 | 比较候选 Embedding 基础能力；不能证明切块、索引、查询路由正确 |
| MIRACL | https://github.com/project-miracl/miracl | 待确认 | 待确认 | C（按需） | 待确认 | 若产品需要多语言；中文覆盖需单独确认 |
| Mr. TyDi | https://github.com/castorini/mrtydi | 待确认 | 待确认 | C（按需） | 待确认 | 多语言问答检索；中文覆盖和许可需确认 |
| KILT | https://github.com/facebookresearch/KILT | 待确认 | 待确认 | B（借鉴） | 待确认 | 借鉴"检索结果 + provenance + 下游答案"数据组织方式 |
| Qasper | https://allenai.org/data/qasper | 待确认 | 待确认 | B（借鉴） | 待确认 | 测长文、跨段落证据和引用回跳；学术论文结构与企业文档不同 |

## Parser / 版面 / 表格数据

| source_dataset | source_url | version | license | usage_class | approved_by | notes |
|----------------|------------|---------|---------|-------------|-------------|-------|
| DocVQA | https://www.docvqa.org/ | 待确认 | 待确认 | C（按能力） | 待确认 | 若 V1 支持扫描 PDF/OCR；若只处理文本层 PDF/DOCX，图像集仅参考 |
| DocLayNet | https://github.com/DS4SD/DocLayNet | 待确认 | 待确认 | B（借鉴） | 待确认 | 构造标题、段落、表格等 Parser 结构用例；需转换成"解析文本+位置"真值 |
| PubLayNet | https://github.com/ibm-aur-nlp/PubLayNet | 待确认 | 待确认 | C（按需） | 待确认 | 科学文档版面标注；科学论文分布不等于企业纪要、合同 |
| PubTables-1M | https://github.com/microsoft/table-transformer | 待确认 | 待确认 | B（借鉴） | 待确认 | 测表头、行列、合并单元格；需映射到产品最终可检索文本 |
| TAT-QA | https://github.com/NExTplusplus/TAT-QA | 待确认 | 待确认 | B（借鉴） | 待确认 | 测表格与正文联合取证、数字和单位；财务领域为主 |
| FinQA | https://github.com/czyssrs/FinQA | 待确认 | 待确认 | C（按需） | 待确认 | 财务报告问答和数值推理；更偏推理/问答，不测上传和索引 |

## RAG 回答可信度、拒答与引用

| source_dataset | source_url | version | license | usage_class | approved_by | notes |
|----------------|------------|---------|---------|-------------|-------------|-------|
| RAGTruth | https://github.com/ParticleMedia/RAGTruth | 待确认 | 待确认 | A（借鉴） | 待确认 | 借鉴断言级接地、幻觉 span 和错误分类；不能替代企业文档真值 |
| RGB | 待补充官方链接 | 待确认 | 待确认 | A（借鉴） | 待确认 | 设计无依据拒答、干扰上下文和反事实文档用例；需核对实现版本 |
| RAGBench | 待补充官方链接 | 待确认 | 待确认 | B（借鉴） | 待确认 | 借鉴 context relevance / faithfulness 拆分；不用聚合分数代替门槛 |
| CRAG | 待补充官方链接 | 待确认 | 待确认 | B（借鉴） | 待确认 | 含不可回答、噪声和知识时效；公开网页场景与企业私有文档不同 |
| FreshQA | 待补充官方链接 | 待确认 | 待确认 | B（借鉴） | 待确认 | 借鉴"旧答案看似正确但已过期"测试方式 |
| ARES | https://github.com/stanford-futuredata/ARES | 待确认 | 待确认 | B（借鉴） | 待确认 | 借鉴自动评测与人工校准的组合；ARES 是评估工具，生成数据不能直接成为业务真值 |

## 更新 / 删除 / 持续 RAG

| source_dataset | source_url | version | license | usage_class | approved_by | notes |
|----------------|------------|---------|---------|-------------|-------------|-------|
| CRUD-RAG | https://github.com/RUC-NLPIR/CRUD-RAG | 待确认 | 待确认 | B（借鉴） | 待确认 | 借鉴重传、更新、删除传播和旧知识残留的用例设计；V1 若未承诺版本和删除，作为风险集保留 |

## 登记字段说明

| 字段 | 要求 |
|------|------|
| source_dataset | 官方名称 |
| source_url | 项目主页、数据卡或论文主页 |
| version | release、tag、commit 或获取日期 |
| license | 原项目和具体子集的许可证，不能只写"开源" |
| original_ids | 原始 document/query/qrel/evidence ID（下载后补充） |
| adaptation | 是否改写标题、格式、语言或文件封装（下载后补充） |
| local_hash | 下载包或转换文件的 SHA-256（下载后补充） |
| usage_class | A 直接校准 / B 借鉴设计 / C 暂不采用 |
| approved_by | 许可证和数据用途确认人 |
| notes | 适用条件、限制、优先级 |

## 当前推荐组合

| 目标 | 推荐开源资源 | 本项目自建部分 |
|------|--------------|----------------|
| 检索基础校准 | BEIR 小子集；必要时 MIRACL/Mr. TyDi | 中文企业术语、编号、人名、项目干扰和实际 Chunk qrels |
| 文档结构 | DocVQA / DocLayNet / PubTables-1M（仅在能力相关时） | 支持格式的标题、列表、表格、中文混排和损坏文件 |
| 回答可信度 | RAGTruth、RGB、RAGBench 的断言/拒答维度 | 任务 A 真值、引用位置、旧值、新版和禁止归责断言 |
| 生命周期 | CRUD-RAG 的 Create/Update/Delete 维度 | 真实产品的重复上传、重试、刷新、删除和可检索时延 |
| UX | 无需引入外部集 | 7 个首次使用任务 + 观察记录 |

## 下载前检查清单

在正式下载任何开源资源前：

- [ ] 访问项目主页，确认仍然可下载
- [ ] 阅读许可证，确认允许内部测试使用
- [ ] 确认版本或 commit，记录获取日期
- [ ] 检查数据卡，了解数据来源和构造方式
- [ ] 评估是否与当前产品能力匹配
- [ ] 决定采用等级（A/B/C）
- [ ] 填写本表一行
- [ ] 获得许可证确认人批准（如需要）

## 下载后处理

1. 计算并记录文件 SHA-256
2. 保留原始 ID 映射
3. 记录任何改写或转换
4. 将适配后的数据放入 `sources/` 目录
5. 更新本表的 `original_ids`、`adaptation`、`local_hash` 字段
6. 在 `sources/README.md` 中补充详细说明

## 不要做的事

- ❌ 不要在未登记的情况下下载并使用外部数据
- ❌ 不要把"开源"当作许可证名称
- ❌ 不要直接用开源数据集的平均分作为产品发布门槛
- ❌ 不要为了数据量下载整个 MS MARCO、BEIR 全集
- ❌ 不要混淆"参考开源资源的方法"和"直接使用其数据"
- ❌ 不要把未确认许可证的数据放入发布包或共享存储

## 数据集版本

```yaml
registry_version: kb-v1-sources-registry-2026-09-03.1
total_registered: 17
usage_class_a: 2
usage_class_b: 10
usage_class_c: 5
confirmed_downloads: 0
pending_confirmation: 17
```

## 下一步

1. 确认当前 V1 需要哪些专项校准（优先 P0 能力）
2. 从推荐组合中选择 1-2 个资源
3. 访问项目主页，确认可下载性和许可证
4. 填写完整登记信息
5. 获得批准后下载
6. 计算哈希，保留原始 ID 映射
7. 执行专项测试，不混入发布门槛
