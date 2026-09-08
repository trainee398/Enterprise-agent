# Release Candidate 缺口跟踪与补齐计划

> 历史快照：2026-09-03 的 RAG 准备材料，2026-09-08 归档。正文中的“当前”“本周”“完成”和路径/命令按当时语境阅读；不代表当前一期范围或产品测试通过。当前入口见[测试资产说明](../../README.md)，状态见[当前状态](../../STATUS.md)。

> 版本：kb-v1-gaps-2026-09-03  
> 状态：识别完成，待执行  
> 目标：将当前数据集从"初始化"升级到"Release Candidate"

## 缺口总览

| # | 缺口 | 影响 | 优先级 | 预计工作量 | 状态 |
|---|------|------|--------|-----------|------|
| 1 | 实际格式变体不足 | 无法验证 Parser 对不同格式的处理 | P0 | 1-2 小时 | 待补 |
| 2 | 检索用例数量偏少 | 回归覆盖不足 | P1 | 2-3 小时 | 待补 |
| 3 | 权限数据未落地 | 无法验证权限三处执行 | P0/风险 | 1 小时（确认）| 待确认 |
| 4 | 真实异常文件不完整 | 边界测试不完整 | P0 | 30 分钟 | 待补 |
| 5 | Parser 证据需补强 | 定位 Parser 问题困难 | P1 | 产品能力依赖 | 待产品就绪 |
| 6 | 版本文档上传策略 | 可能引入召回干扰 | P0 | 立即修正 | 待修正 |

---

## 缺口 1: 实际格式变体不足 ⚠️ P0

### 当前状态
- 主要是 Markdown 源稿
- 缺少 PDF、DOCX、TXT、XLSX 真实格式

### 目标
每种支持格式至少准备 2 份：
- PDF: 2 份（一份纯文本，一份含表格）
- DOCX: 2 份（一份标题层级，一份含表格）
- TXT: 2 份（一份简短，一份长文）
- XLSX: 1 份（交付清单表格）

### 补齐计划

#### 第 1 步：确认产品实际支持格式（15 分钟）
```yaml
支持格式检查清单:
  - [ ] PDF (文本层)
  - [ ] PDF (扫描件/OCR)
  - [ ] DOCX
  - [ ] TXT
  - [ ] Markdown
  - [ ] XLSX
  - [ ] 其他: _______
```

#### 第 2 步：转换核心文档（1 小时）
推荐转换矩阵：

| 源文档 | 转换格式 | 原因 |
|--------|----------|------|
| DOC-01 项目 A 基本信息 | → PDF, DOCX, TXT | 测试纯文本解析 |
| DOC-02 项目说明 | → PDF, DOCX | 测试标题层级保留 |
| DOC-03 交付清单 | → XLSX, PDF | 测试表格解析 |
| DOC-04 中英文混合 | → PDF, DOCX | 测试编码和混排 |
| DOC-06 项目 B | → TXT | 测试干扰，轻量格式 |

#### 第 3 步：命名规范
```
原文档: KBV1-DOC-01-项目A基本信息.md
变体:
  - KBV1-DOC-01-项目A基本信息.pdf
  - KBV1-DOC-01-项目A基本信息.docx
  - KBV1-DOC-01-项目A基本信息.txt
```

#### 第 4 步：Manifest 更新（30 分钟）
为每个变体记录：
```yaml
doc_id: KBV1-DOC-01
variants:
  - variant_id: KBV1-DOC-01-pdf
    format: pdf
    sha256: ""
    conversion_tool: "Markdown → PDF (Pandoc/打印)"
    expected_parse_differences:
      - 页码信息（PDF 有，Markdown 无）
      - 字体信息可能丢失
  - variant_id: KBV1-DOC-01-docx
    format: docx
    sha256: ""
    conversion_tool: "Markdown → DOCX (Pandoc)"
    expected_parse_differences:
      - 标题样式可能不同
  - variant_id: KBV1-DOC-01-txt
    format: txt
    sha256: ""
    conversion_tool: "Markdown → TXT (纯文本导出)"
    expected_parse_differences:
      - 所有格式丢失
      - 标题层级变平
```

#### 转换工具推荐
- Markdown → PDF: Pandoc, Typora 导出, 浏览器打印
- Markdown → DOCX: Pandoc, 在线转换器
- Markdown → TXT: 任何文本编辑器另存为
- 表格 → XLSX: Excel, Google Sheets

---

## 缺口 2: 检索用例数量偏少 📊 P1

### 当前状态
- 14 条种子用例
- 覆盖基础场景

### 目标
扩充到 40-60 条，覆盖：
- 同义问法
- 反向问法
- 编号问法
- 组合条件
- 空结果
- 跨 Chunk

### 补齐计划

#### 扩展维度矩阵

| 原用例 | 扩展方向 | 新增用例数 |
|--------|----------|-----------|
| R-001 日期查询 | 同义: "什么时候到期"<br>反向: "任务 A 已经过期了吗"<br>编号: "A-102 的 deadline" | +3 |
| R-003 数字查询 | 同义: "还剩几个高优先级问题"<br>组合: "任务 A 有几个 P1 在 08-28 之后创建" | +2 |
| R-004 人名查询 | 同义: "任务 A 的 owner"<br>反向: "张三负责哪些任务"<br>空结果: "王五负责什么" | +3 |
| R-005 表格查询 | 单字段: "李四的计划日期"<br>单字段: "谁负责接口适配"<br>跨 Chunk: 表格跨页时 | +3 |
| R-007 多段落 | 同义: "接口协议为何调整"<br>跨段落: 答案分散在多个段落 | +2 |
| R-010 干扰测试 | 更多干扰: 项目 C、D<br>相似但不同的编号 | +2 |
| R-011 无答案 | 多个无答案场景: 预算、电话、审批人<br>部分答案: 有日期但无负责人 | +3 |

**预计新增**: 18-25 条（总计 32-39 条）

#### 生成方法

**方法 1: 手工设计**（推荐 P0 用例）
- 基于真实业务问法
- 每个变体明确测试目标
- 人工标注期望行为

**方法 2: 模型生成 + 人工审查**（扩展 P1 用例）
使用 `generated/` 目录：
```yaml
步骤:
  1. 模型生成候选问法（30-50 条）
  2. 代码校验数字/日期/实体/证据 span
  3. 第二模型做独立审查
  4. 人工抽检与仲裁
  5. 通过后移入 verified/
  6. 冻结版本移入 frozen/
```

---

## 缺口 3: 权限数据未落地 🔒 P0/风险

### 当前状态
- KBV1-F-07 标记了"仅项目组可见"
- 缺少不同用户身份下的配置

### 关键判断：先确认产品能力

#### 检查清单（与开发确认）
```yaml
权限能力确认:
  - [ ] V1 是否支持多用户/多租户
  - [ ] 是否有用户身份和权限概念
  - [ ] 文档上传时能否标记权限
  - [ ] 检索时是否按用户过滤
  - [ ] 生成时是否再次过滤
  - [ ] 发送时是否按收件人过滤
```

### 场景 A: V1 支持权限 → P0 必须补齐

#### 补齐计划（2 小时）

1. **用户配置**
```yaml
users:
  - user_id: user-pm
    name: 项目经理
    role: project_manager
    permissions: [project-a, project-b]
  
  - user_id: user-member-a
    name: 项目 A 成员
    role: team_member
    permissions: [project-a]
  
  - user_id: user-member-b
    name: 项目 B 成员
    role: team_member
    permissions: [project-b]
  
  - user_id: user-external
    name: 外部用户
    role: external
    permissions: []
```

2. **文档权限标记**
```yaml
doc_id: KBV1-DOC-02
title: 2026-08-20 会议纪要
permission: project-a-only
allowed_users: [user-pm, user-member-a]
forbidden_users: [user-member-b, user-external]
```

3. **权限测试用例**（补充到 retrieval/）
```yaml
case_id: KBV1-R-007-PERM
query: 客户为什么要求改接口协议？
user: user-member-a
expected: 可以检索到 DOC-02
---
case_id: KBV1-R-007-PERM-DENY
query: 客户为什么要求改接口协议？
user: user-external
expected: Top-K 不得包含 DOC-02
forbidden: 答案不得包含纪要内容
```

### 场景 B: V1 不支持权限 → 标记风险

#### 处理方式
1. **在测试报告中单列"未覆盖的企业风险"**
   - 权限检索（L2a + LX）
   - 权限生成（L6 + LX）
   - 权限发送（L8 + LX）

2. **保留用例作为后续 V2 测试集**
   - 移入 `retrieval/permission-cases-v2.yaml`
   - 标记为 `not_applicable_v1: true`

3. **不要按缺陷报告**
   - 未承诺的能力不算缺陷
   - 记录为能力限制

---

## 缺口 4: 真实异常文件不完整 ⚠️ P0

### 当前状态
- 损坏文件：有
- 空文件：需生成
- 超限文件：需根据实际限制生成

### 补齐计划（30 分钟）

#### 生成脚本
在 `corpus/` 创建：

**1. 空文件**
```bash
# 空 TXT
touch KBV1-DOC-ERR-01-empty.txt

# 空 PDF（需工具）
echo "" | pandoc -o KBV1-DOC-ERR-01-empty.pdf

# 空 DOCX
# 用 Word/LibreOffice 创建空白文档
```

**2. 损坏文件**
```bash
# 截断 PDF
head -c 1024 KBV1-DOC-01.pdf > KBV1-DOC-ERR-02-corrupted.pdf

# 乱码文本
echo -e "\x89\x50\x4e\x47\x0d\x0a\x1a\x0a" > KBV1-DOC-ERR-02-corrupted.txt
```

**3. 超限文件**（需先确认限制）
```bash
# 假设限制 10MB
# 生成 11MB 文件
dd if=/dev/zero of=KBV1-DOC-ERR-03-overlimit.txt bs=1M count=11

# 或用真实内容重复
for i in {1..1000}; do cat KBV1-DOC-01.txt >> KBV1-DOC-ERR-03-overlimit.txt; done
```

#### Manifest
```yaml
异常文件清单:
  - doc_id: KBV1-DOC-ERR-01
    type: empty
    formats: [txt, pdf, docx]
    expected_behavior: 明确失败，错误提示"文件为空"
  
  - doc_id: KBV1-DOC-ERR-02
    type: corrupted
    formats: [pdf, docx, txt]
    expected_behavior: 明确失败，错误提示"文件损坏"或"无法解析"
  
  - doc_id: KBV1-DOC-ERR-03
    type: overlimit
    actual_size: 根据产品限制动态生成
    expected_behavior: 上传前提示或上传时明确超限
```

---

## 缺口 5: Parser 证据需补强 📋 P1

### 当前状态
- 有原文片段
- 缺少详细结构标注

### 目标
补充每个文档的：
- 标题路径（如 "第 1 章 > 1.1 > 1.1.1"）
- 段落位置（第几段，前后文）
- 预期 Chunk 边界
- 表格结构（表头、行列数）

### 补齐计划（产品能力依赖）

#### 前置条件：产品能导出 Chunk
```
等产品能提供以下之一：
  1. 调试接口：GET /documents/{doc_id}/chunks
  2. 日志导出：包含 chunk_id、text、位置、元数据
  3. 后台查询：直接查看 Vector DB 或索引
```

#### 补强方式

**方法 1: 产品就绪后回填**
```yaml
步骤:
  1. 上传文档后导出实际 Chunk
  2. 人工标注"这个 Chunk 应该/不应该出现"
  3. 记录到 retrieval/ 的 must_retrieve
  4. 记录 Chunk 边界问题到 parser-issues.yaml
```

**方法 2: 先标注预期结构**（可选）
在 `corpus/` 为每个文档创建：
```yaml
doc_id: KBV1-DOC-01
structure:
  - type: title
    level: 1
    text: "项目 A 基本信息"
    expected_chunk: should_be_first_chunk
  
  - type: paragraph
    index: 1
    text: "任务 A 截止日期为 2026-08-30"
    fact_id: KBV1-F-01
    expected_chunk: same_as_title_or_next
  
  - type: list
    items: 3
    expected_chunk: may_split_if_long
```

**当前建议**: 
- 先跑 P0 测试
- 发现 Parser 问题时记录
- 产品能导出 Chunk 后再补强
- 不阻塞第一轮测试

---

## 缺口 6: 版本文档上传策略 ⚠️ P0 立即修正

### 问题
测试版本能力时，如果同时上传：
- DOC-07-v1（旧版：30 秒）
- DOC-07-v2（新版：60 秒）
- DOC-07-合并版（包含新旧两个规则）

会导致：
- 检索"回调超时"返回 3 份文档
- 无法判断是"版本处理正确"还是"合并版干扰"

### 修正方案

#### 策略 A: 只上传独立版本文件
```
corpus/
  KBV1-DOC-07-v1-回调规范.md     # 只含 30 秒
  KBV1-DOC-07-v2-回调规范.md     # 只含 60 秒
```

**上传顺序**:
1. 先上传 v1，执行旧版用例
2. 上传 v2（覆盖或并存，取决于产品语义）
3. 执行新版用例，检查旧版行为

#### 策略 B: 明确标记测试阶段
```yaml
阶段 1: 旧版测试
  上传: [DOC-07-v1]
  执行: R-012（期望 30 秒）
  
阶段 2: 更新测试
  上传: [DOC-07-v2]  # 替换或标记 v1 失效
  执行: R-012（期望 60 秒）
  验证: 旧版不再召回或明确标记失效
```

#### 策略 C: 若产品不支持版本
```yaml
处理方式:
  1. 不上传版本文件
  2. R-012 标记为 not_applicable_v1: true
  3. 记录风险: "旧版文档可能压过新版"
  4. 保留用例到 V2
```

### 立即行动
- [ ] 确认产品版本语义
- [ ] 决定采用策略 A/B/C
- [ ] 更新 `corpus/README.md` 说明
- [ ] 在 `truth/` 补充版本文档说明

---

## 补齐优先级与时间表

### 第 1 周（本周）

**必做（P0）**:
1. ✅ 缺口 6: 版本文档策略（立即修正，10 分钟）
2. ⏳ 缺口 3: 权限能力确认（与开发沟通，30 分钟）
3. ⏳ 缺口 1: 格式变体转换（核心 8 份文档，1-2 小时）
4. ⏳ 缺口 4: 异常文件生成（30 分钟）

**预计总时间**: 2.5-3 小时

### 第 2 周

**建议做（P1）**:
1. 缺口 2: 检索用例扩展（手工设计 10-15 条，2 小时）
2. 缺口 3: 权限用例补齐（若 V1 支持，1-2 小时）
3. 缺口 5: Parser 证据（产品就绪后，1 小时）

**预计总时间**: 4-5 小时

### 完成标准

达到 **Release Candidate** 需要：
- [x] 每种支持格式有 2+ 份文档
- [x] 异常文件完整（空、损坏、超限）
- [x] 版本策略明确
- [x] 权限能力已确认（支持则补齐，不支持则标记风险）
- [ ] 检索用例 40+ 条（第 2 周完成）
- [ ] Parser 证据（产品能力就绪后）

---

## 缺口跟踪表

| # | 缺口 | 负责人 | 截止日期 | 状态 | 阻塞项 |
|---|------|--------|----------|------|--------|
| 6 | 版本文档策略 | 测试 | 今天 | ⏳ 待修正 | - |
| 3 | 权限能力确认 | 测试+开发 | 本周五 | ⏳ 待沟通 | 开发确认 |
| 1 | 格式变体 | 测试 | 本周五 | ⏳ 待转换 | 确认支持格式 |
| 4 | 异常文件 | 测试 | 本周五 | ⏳ 待生成 | 确认限制值 |
| 2 | 检索用例扩展 | 测试 | 下周五 | 📋 计划中 | - |
| 5 | Parser 证据 | 测试 | 产品就绪后 | ⏸️ 依赖产品 | Chunk 导出能力 |

---

## 更新记录

```yaml
version: 1.0
created: 2026-09-03
last_updated: 2026-09-03
status: 识别完成，待执行
total_gaps: 6
  p0: 4
  p1: 2
  product_dependent: 1
```

---

## 附录：快速检查清单

测试执行前，确认：
- [ ] 每种支持格式有实际文件
- [ ] 异常文件（空、损坏、超限）已准备
- [ ] 版本文档不重复上传
- [ ] 权限能力已确认并处理
- [ ] Manifest 已更新
- [ ] 文件哈希已计算
