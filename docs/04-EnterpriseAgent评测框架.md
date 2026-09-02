# 文档 4 · Enterprise Agent Evaluation Framework

> 状态：骨架（主体由第 6 课填充，各课持续补充指标定义）
> 目标：形成指标字典——每个指标有定义、计算方式、判定方式、数据需求、目标值

## 框架结构（10 大类，沿用学习目标中的划分）

每个指标按统一模板填写：

```
指标名：
定义：
计算方式：
判定方式：代码判定 / IR 指标 / LLM-as-Judge / 人工
数据需求：（需要什么样的评测集或线上数据）
目标值 / 门禁阈值：
已知陷阱：
```

### 1. Data Quality
- [ ] Completeness / Accuracy / Freshness / Consistency / Permission

### 2. Event Detection
- [ ] Event Recall / Event Precision / Duplicate Event / Missing Event / Event Latency

### 3. Retrieval
- [ ] Precision@K / Recall@K / MRR / NDCG / Context Precision / Context Recall

### 4. Fact Layer
- [ ] Extraction Accuracy（按字段拆分：Entity / Value / Unit / Temporal）
- [ ] Source Attribution / Provenance 完整性
- [ ] Conflict Resolution 正确率 / Freshness / Permission 继承

### 5. Situation Assessment
- [ ] 评估结论准确率（对 golden set）/ 严重度校准 / 证据接地率 / 上下文遗漏率

### 6. Decision
- [ ] Trigger Precision / Trigger Recall / False Intervention Rate / 护栏违规率（必须为 0）

### 7. Action
- [ ] Tool Selection / Argument Correctness / Recipient Accuracy / Timing Accuracy / Message Accuracy / Task Completion

### 8. Follow-up
- [ ] 回复识别率 / 回复理解准确率 / 核实执行率 / 重复打扰率 / 状态更新正确率

### 9. Escalation
- [ ] Escalation Accuracy / Timing / Recipient / Evidence 完整性 / HITL 执行率

### 10. Security & Governance
- [ ] 跨用户隔离通过率 / 注入对抗通过率 / 敏感数据泄露 / 审计完整性 / Human Override 可用性 / 回滚可用性

## 判定方式分配原则（第 1 课已确立，第 6 课细化）

- **代码判定**：数值相等、日期计算、收件人、权限、禁止动作、schema 校验——凡可确定性判断的绝不用 LLM。
- **IR 指标**：检索类。
- **LLM-as-Judge**：语气、相关性、推理合理性等主观维度；必须有 rubric、必须定期与人工标注校准。
- **人工**：Ground Truth 认定、争议仲裁、Judge 校准基准。

## 待办

- [ ] 每类指标填写完整模板（第 6 课）
- [ ] 确定上线门禁的最小指标集
- [ ] 在线评测（Online Evaluation）指标：回复率、采纳率、忽略率、人工纠正率
