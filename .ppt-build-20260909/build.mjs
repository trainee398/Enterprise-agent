import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {FileBlob, PresentationFile} from '@oai/artifact-tool';

const TMP=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.dirname(TMP);
const SKILL='/Users/linhe/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const REF='/Users/linhe/.codex/plugins/cache/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-team-alignment/assets/reference.pptx';
const PY='/Users/linhe/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')));
const p=await PresentationFile.importPptx(await FileBlob.load(REF));
const originals=[...p.slides.items], maps=new Map(), deck=[];
const CJK='Arial Unicode MS', LATIN='Inter', BLUE='#007DBA';

const U={
 notion:'https://www.notion.com/en-gb/help/sharing-and-permissions',
 notionImport:'https://www.notion.com/help/import-data-into-notion',
 notionEdit:'https://www.notion.com/help/writing-and-editing-basics',
 obsidian:'https://obsidian.md/help/sync/collaborate',
 obsidianFiles:'https://obsidian.md/help/import/markdown',
 feishuDefault:'https://www.feishu.cn/hc/zh-CN/articles/265017155035',
 feishuList:'https://www.feishu.cn/hc/zh-CN/articles/780474929438',
 feishuMove:'https://www.feishu.cn/hc/zh-CN/articles/763992129311',
 yuque:'https://www.yuque.com/yuque/thyzgp/qnxyk7',
 yuqueToc:'https://www.yuque.com/yuque/thyzgp/vlki63',
 youdao:'https://note.youdao.com/help-center/changelog_mac.html',
 gitbook:'https://gitbook.com/docs/creating-content/content-structure',
 gitVersion:'https://gitbook.com/docs/creating-content/version-control',
 powerIntro:'https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards',
 powerShare:'https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-share-dashboards',
 metaIntro:'https://www.metabase.com/docs/latest/dashboards/introduction',
 metaFilter:'https://www.metabase.com/docs/latest/dashboards/filters',
 metaDrill:'https://www.metabase.com/docs/latest/questions/visualizations/drill-through',
 metaPerm:'https://www.metabase.com/docs/latest/permissions/introduction',
 metaData:'https://www.metabase.com/docs/latest/permissions/data',
 metaImage:'https://www.metabase.com/docs/latest/dashboards/images/interactive-dashboard.png'
};
function clone(n){
 const src=originals[n-1], s=src.duplicate();
 maps.set(s.id,new Map(src.shapes.items.map((x,i)=>[String(x.id),s.shapes.items[i]])));
 deck.push(s);return s;
}
function runs(text,size,bold=false,color='#111111'){
 return String(text).split(/([^\x00-\x7F]+)/).filter(Boolean).map(run=>({run,textStyle:{typeface:/[^\x00-\x7F]/.test(run)?CJK:LATIN,fontSize:`${size}px`,bold,color}}));
}
function set(s,id,text,size=24,bold=false,color='#111111'){
 const sh=maps.get(s.id).get(String(id));if(!sh)throw Error('Missing source shape '+id);
 sh.text=String(text).split('\n').map(line=>({runs:runs(line,size,bold,color),spaceAfter:300,bulletCharacter:'',marginLeft:0,indent:0}));
 sh.text.style={typeface:CJK,fontSize:size,bold,color,autoFit:'none',wrap:'square',verticalAlignment:'top',insets:{left:0,right:0,top:0,bottom:0}};
 return sh;
}
function block(s,id,head,body){
 const sh=set(s,id,head+'\n'+body,24);
 sh.text=[{runs:runs(head,29,false),spaceAfter:800,bulletCharacter:'',marginLeft:0,indent:0},...body.split('\n').map(line=>({runs:runs(line,24),spaceAfter:350,bulletCharacter:'',marginLeft:0,indent:0}))];
 return sh;
}
function notes(s,text,urls=[]){s.speakerNotes.textFrame.setText(text+'\n\n资料日期：2026-09-09。\n'+urls.map((u,i)=>`${i+1}. ${u}`).join('\n'));}
function caption(s,text){
 const sh=s.shapes.add({geometry:'textbox',name:'evidence-caption',position:{left:42,top:644,width:1150,height:24},fill:'none',line:{fill:'none',width:0}});
 sh.text=text;sh.text.style={typeface:CJK,fontSize:16,color:'#555555',insets:{left:0,right:0,top:0,bottom:0}};
}
function table(s,title,intro,values,widths,size=23){
 set(s,'533',title,38);set(s,'14',intro,23);
 for(const t of [...s.tables.items])s.tables.deleteById(t.id);
 const t=s.tables.add({rows:values.length,columns:values[0].length,left:42,top:240,width:1196,height:380,columnWidths:widths,values});
 t.styleOptions={headerRow:true,bandedRows:false};
 t.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({fill:'#FFFFFF',textStyle:{typeface:CJK,fontSize:size,color:'#111111'},margins:{left:7,right:10,top:9,bottom:8},anchor:'center'});
 t.borders.assign({fill:'#D6E1E6',width:0.6,style:'solid'});
 t.rows[0].height=48;
 const h=(380-48)/(values.length-1);
 for(let r=1;r<values.length;r++)t.rows[r].height=h;
 for(let c=0;c<values[0].length;c++){
  t.getCell(0,c).text.style={typeface:CJK,fontSize:size,bold:true,color:BLUE};
  t.getCell(0,c).fill='#FFFFFF';
 }
 return t;
}
function topic(s,title,leftHead,leftBody,rows){
 set(s,'533',title,38);block(s,'3',leftHead,leftBody);
 for(let i=0;i<4;i++){set(s,String(15+i*2),rows[i][0],24,false,BLUE);set(s,String(12+(i===0?0:4+(i-1)*2)),rows[i][1],23);}
}
async function screenshot(s,file,alt){
 const im=s.images.items[0];const frame={...im.frame},geometry=im.geometry,borderRadius=im.borderRadius;
 im.delete();
 s.images.add({blob:new Uint8Array(await fs.readFile(file)),contentType:'image/png',alt,fit:'contain',position:frame,geometry,borderRadius,crop:{left:0,top:0,right:0,bottom:0}});
}

// 01. Retain the cover image and typography hierarchy from the selected template.
{
 const s=clone(1);set(s,'4','知识类产品与\n数据看板调研',64,false,'#2D607A');
 set(s,'5','周五讨论稿\n资料截至 2026 年 9 月 9 日',23);
 notes(s,'汇报范围为知识类产品与数据看板。依据用户最新口述，销售漏斗暂不纳入本次汇报。已有报告中的一期定位、Markdown 主线和架构推断不作为本轮已确认需求。建议正文约10分钟，来源附录按需查阅。');
}
// 02. Research status rather than an unconfirmed product recommendation.
{
 const s=clone(4);set(s,'533','知识产品补看权限\n数据看板比较使用路径',55);
 set(s,'4','知识类产品\n已有 6 款产品资料整理\n本轮补充权限机制',24);
 set(s,'7','数据看板\n初看 Power BI、Metabase\n依据官方资料，尚未实测',24);
 notes(s,'本次把原有知识产品观察与权限补查结合，同时展示两款数据看板的初步机制对比。个人使用反馈、官方说明、分析判断分别标注。此次尚未使用统一测试账号验证权限、性能或任务完成率。');
}
// 03. Native, editable comparison table.
{
 const s=clone(9);table(s,'知识类产品：已有调研发现','比较导入后的文档形态、组织方式与维护成本。下表的价值与代价为分析判断。',[
 ['产品','已观察的做法','参考价值【分析】','使用代价或边界'],
 ['Notion','页面层级与块编辑','创建和持续修改较集中','导入转为页面，复杂结构需核对'],
 ['飞书','页面树、子页面列表','适合围绕团队资料整理','上传附件与导入云文档需区分'],
 ['语雀','知识库与文档目录','归属清楚，适合手册阅读','默认归属为个人反馈，企业规则待验'],
 ['Obsidian','本地 MD 与文件夹','文件形态直接、便于携带','共享 Vault 不支持细粒度权限'],
 ['GitBook','目录与变更历史','适合连续阅读和内容维护','Git 同步、发布流程有学习成本'],
 ['有道云笔记','MD 编辑与文件夹','轻量记录和范围查找','个人笔记能力不能证明企业权限']
 ],[145,345,330,376],21);
 notes(s,'前期报告作为已有材料使用。保留竞品机制观察，不沿用其中已确认一期或架构性表述。语雀默认知识库行为来自用户本人反馈，不视为企业用户结论。有道与GitBook相关条目沿用前期查阅记录，当前账号与套餐未实测。Obsidian 共享权限本次复核。', [U.notionImport,U.notionEdit,U.feishuList,U.yuqueToc,U.obsidianFiles,U.obsidian,U.youdao,U.gitbook]);
 caption(s,'证据：既有调研及官方说明。未统一账号实测，不提供产品总分排名。');
}
// 04. User-provided screenshot remains an image, with its scope stated visibly.
{
 const s=clone(6);set(s,'533','语雀：知识库\n与文档归属',37);
 set(s,'534','个人体验样本\n个人反馈：未选知识库时，\n文档进入默认知识库。\n\n截图可见默认库、\n自建主题库和常用入口。\n\n【分析】先记录后整理\n值得验证。企业默认归属\n和可见范围仍需确认。',24);
 await screenshot(s,path.join(ROOT,'调研配图/语雀知识库列表.png'),'用户提供的语雀知识库列表，展示默认知识库与自建主题知识库');
 caption(s,'个人截图与使用反馈。不能据此推断企业账号的默认权限或其他用户偏好。');
 notes(s,'用户本人明确表示喜欢语雀的知识库处理，同时说明不能代表企业用户和领导偏好。截图只证明可见界面中的知识库组织，不单独证明未选库时的新建行为。图片内嵌，无需项目图片目录。');
}
// 05. Permissions are compared as user-facing mechanisms.
{
 const s=clone(9);table(s,'知识权限：授权范围与操作能力','权限补查样本。官方机制与适用判断分列，普通员工实际访问效果仍需验证。',[
 ['产品','官方说明中的机制','价值与代价【分析】','下一步验证'],
 ['飞书','按部门、用户组或成员\n配置文档默认权限','可统一默认规则\n需理解企业与文档设置的关系','新建默认范围\n移出部门后的访问'],
 ['Notion','向个人或组分享页面\n区分编辑与完整访问','单篇协作灵活\n需检查继承及其他授权来源','单篇例外授权\n取消分享与搜索表现'],
 ['Obsidian','共享 Vault 的协作者\n基本同权，邀请权除外','共享规则较少\n难覆盖同库内人员分级阅读','作为 MD 参考\n不作细粒度权限样本']
 ],[150,370,360,316],23);
 notes(s,'飞书官方帮助说明管理员可按全局或指定部门、用户组、成员设置文档权限默认值。Notion 官方说明页面授权等级、继承、覆盖和撤销，多个授权来源可能影响最终权限。Obsidian 共享 Vault 官方明确暂不支持细粒度权限，协作者与所有者权限相同但只有所有者可邀请。此页只比较已查到的机制，不声称完成权限实测。',[U.feishuDefault,U.notion,U.obsidian]);
}
// 06. Four bounded validation tasks, not an access-control architecture.
{
 const s=clone(13);topic(s,'知识权限的下一轮验证','统一任务样本','【待验证示例】\n全员制度、部门手册、\n指定人员报价说明。\n\n管理员与普通员工\n分别观察同一操作结果。',[
 ['默认归属','新建或导入后谁能看？\n用户是否能理解当前范围？'],
 ['单篇例外','部门共享中增加一份受限资料，\n能否单独设置并说明权限来源？'],
 ['权限撤销','取消邀请或移出部门后，\n原链接、附件和搜索怎样变化？'],
 ['搜索与问答','分别检查标题、摘要与正文。\n有 AI 问答时，再单独核对引用。']
 ]);notes(s,'这是下一轮候选验证任务，尚未执行。测试材料与人员边界是工作示例，不是业务已确认需求。AI 问答按竞品是否提供及可用账号条件单独验证，不能根据页面权限推断问答必然遵守同样边界。');
}
// 07. Dashboard task scope.
{
 const s=clone(11);set(s,'3','数据看板的调研范围',38);
 block(s,'10','指标理解','指标定义、时间范围和刷新时间，\n决定一个数字是否能用于判断。');
 block(s,'11','筛选与追查','从汇总进入明细，观察筛选条件\n能否保留，入口是否容易找到。');
 block(s,'4','人员可见范围','谁能打开看板，打开后可以查看\n哪些部门的数据与记录。');
 block(s,'5','制作与维护','谁接入数据、定义指标、更新看板，\n使用者需要理解多少配置。');
 notes(s,'本页是本轮调研问题清单。数据看板样本为Power BI和Metabase，不声称覆盖全部BI市场。指标和数据源尚未由业务指定，因此暂不比较真实计算准确率、刷新耗时或建设工期。');
}
// 08. A real official example, explicitly not company data.
{
 const s=clone(6);set(s,'533','Metabase：看板\n中的筛选与追查',36);
 set(s,'534','官方界面示例\n相关查询放到同一看板，\n通过筛选和点击继续查看。\n\n【分析】查看与追查相邻，\n可减少切换入口的负担。\n\n限制：钻取需要查询权限。\n原生 SQL 的交互范围\n还受查询方式约束。',24);
 await screenshot(s,path.join(TMP,'metabase-official.png'),'Metabase 官方帮助中的交互看板示例，图中均为官方示例数据');
 caption(s,'官方示例图，仅展示界面与组织方式。图中数据不代表本项目业务，也不是本次实测结果。');
 notes(s,'Metabase官方说明看板组合相关查询、支持筛选及自定义点击行为。钻取要求对底层数据拥有创建查询权限；查询改写类钻取适用于查询构建器，不能把所有原生SQL图表都当作同等可钻取。截图来自官方帮助，不用于分析其中的业务数字。',[U.metaIntro,U.metaFilter,U.metaDrill,U.metaImage]);
}
// 09. Keep Power BI's Dashboard vs Report distinction explicit.
{
 const s=clone(9);table(s,'数据看板：两款产品的使用路径','“看板”按业务用途比较，同时保留产品自身的页面与权限边界。',[
 ['维度','Power BI','Metabase'],
 ['页面组成','仪表板汇总报表磁贴\n详细分析进入关联报表','相关查询组合到看板\n可添加筛选与说明'],
 ['筛选与明细','筛选、切片及深入分析主要在报表\n普通仪表板不具备同等筛选能力','看板可配置筛选和点击行为\n钻取受查询权限与查询方式约束'],
 ['访问控制','分享报表与底层数据范围分别考虑\n界面隐藏不构成数据访问限制','集合权限与数据权限分开\n多个组授权需检查最终访问范围'],
 ['使用代价\n【分析】','概况与分析分工清楚\n需理解仪表板、报表和数据的关系','查询与看板衔接直接\n权限、钻取及付费能力需逐项核对']
 ],[160,518,518],22);
 notes(s,'Power BI 官方区别：Dashboard 单页汇总，Report 可多页；普通Dashboard不可像Report一样筛选或切片，固定整张报表页存在特殊行为。因此本页未宣称Power BI仪表板完全无交互。Metabase数据权限与集合权限分开；多组成员取得其中更宽的访问。使用代价是分析判断，不是计时实测。',[U.powerIntro,U.powerShare,U.metaIntro,U.metaDrill,U.metaPerm,U.metaData]);
}
// 10. The dashboard permission experiment is separate from document sharing.
{
 const s=clone(13);topic(s,'数据权限的下一轮验证','同一看板，不同人员','【待验证示例】\n负责人查看全公司，\n员工只查看本部门。\n实际范围由业务确认。\n\n先核对查看结果，\n再判断配置是否易用。',[
 ['页面访问','员工能否打开看板？\n无权时如何提示或申请？'],
 ['底层明细','点击图表或更改筛选后，\n是否仍只看到允许范围内的记录？'],
 ['导出与分享','下载、订阅、转发后，\n内容范围和接收对象怎样确定？'],
 ['人员变化','更换部门或撤销访问后，\n原链接与已有授权怎样处理？']
 ]);notes(s,'此页是候选试验，并非已完成结果或本项目确定的权限矩阵。Power BI官方指出隐藏页面或字段并不等于限制数据访问。Metabase区分数据权限与集合权限，行列范围和下载限制存在套餐边界。应分别用普通员工与负责人账号核对结果。',[U.powerShare,U.metaPerm,U.metaData]);
}
// 11. Conditional takeaways, with no architecture conclusion.
{
 const s=clone(11);set(s,'3','可借鉴的机制与适用条件',38);
 block(s,'10','默认值减少重复配置','【分析】适合边界稳定的部门资料。\n例外授权仍需可查、可撤回。');
 block(s,'11','查看与操作分别设置','【分析】阅读者与编辑者各有范围。\n规则越细，管理员维护工作越多。');
 block(s,'4','筛选后保留查看上下文','【分析】适合按时间、部门追查指标。\n页面应说明当前条件与数据时间。');
 block(s,'5','汇总与明细保持访问边界','【分析】适合定位异常来源。\n汇总、明细与导出要分别核对。');
 notes(s,'本页是依据已查机制提出的条件性分析，不是选型排名或需求承诺。知识类与看板可采用相同观察思路，但不因此推断需要统一产品架构。',[U.feishuDefault,U.notion,U.metaFilter,U.metaDrill,U.powerShare]);
}
// 12. Bounded questions for Friday.
{
 const s=clone(13);topic(s,'周五讨论与后续调研','本次需要校准','优先服务谁、解决哪项\n具体任务，再补实测。\n\n当前材料提供机制对比。\n尚无统一账号的权限、\n性能或完成率验证。',[
 ['服务对象','先服务普通员工、部门负责人，\n还是管理知识与数据的人？'],
 ['优先任务','先解决资料访问，还是某项指标\n的查看与追查？请指定一个例子。'],
 ['权限场景','需要部门共享、个人例外，\n还是按项目或业务记录控制？'],
 ['后续样本','按选定任务，为每类保留两款样本。\n补普通员工与管理员两端的实测。']
 ]);notes(s,'本页请领导确认调研评价标准及下一轮样本任务。问题均基于当前口述信息仍未明确的内容，不预设完整企业Agent架构，也不提出开发排期。');
}
// 13–14. Compact source appendices with clickable titles and complete notes.
{
 const s=clone(9);const entries=[
 ['K1','Notion：分享与权限',U.notion,'页面授权、继承、撤销'],
 ['K2','飞书：文档权限默认值',U.feishuDefault,'部门、组及成员默认规则'],
 ['K3','飞书：子页面列表',U.feishuList,'目录呈现与阅读范围'],
 ['K4','Obsidian：共享 Vault',U.obsidian,'共享权限的明确边界'],
 ['K5','语雀：目录编排',U.yuqueToc,'沿用前期记录，当前规则待验'],
 ['K6','GitBook：内容结构',U.gitbook,'目录与内容维护的已有观察'],
 ['K7','有道云笔记：更新记录',U.youdao,'轻量记录与文件夹的已有观察']
 ];
 const t=table(s,'附录：知识类产品资料入口','点击资料名称打开官网。完整链接和证据边界见本页及相关页备注。',[
 ['编号','官方资料','本次用途'],...entries.map(e=>[e[0],e[1],e[3]])
 ],[110,510,576],22);
 entries.forEach((e,i)=>{t.getCell(i+1,1).text.get(e[1]).link={uri:e[2],isExternal:true};});
 notes(s,'本次复核Notion、飞书与Obsidian权限相关公开说明。语雀目录、GitBook和有道维护观察沿用前期查阅记录，未作当前账号实测；语雀权限页面本次访问未成功，未在权限对比页补写未经复核的结论。个人语雀图由用户提供。原项目文档中的一期设计意见未视为已确认需求。',[...entries.map(e=>e[2]),U.yuque,U.youdao,U.notionImport,U.notionEdit,U.obsidianFiles]);
}
{
 const s=clone(9);const entries=[
 ['D1','Power BI：仪表板与报表',U.powerIntro,'页面、筛选与分析边界'],
 ['D2','Power BI：分享与访问',U.powerShare,'分享与底层数据权限'],
 ['D3','Metabase：看板介绍',U.metaIntro,'查询组合与官方示例'],
 ['D4','Metabase：筛选',U.metaFilter,'筛选范围与应用方式'],
 ['D5','Metabase：钻取',U.metaDrill,'明细追查与适用限制'],
 ['D6','Metabase：权限',U.metaPerm,'集合权限、多组授权'],
 ['D7','Metabase：数据权限',U.metaData,'数据范围、下载与套餐边界']
 ];
 const t=table(s,'附录：数据看板资料入口','查阅日期：2026 年 9 月 9 日。公开说明不等同当前账号或套餐的实际使用结果。',[
 ['编号','官方资料','本次用途'],...entries.map(e=>[e[0],e[1],e[3]])
 ],[110,510,576],21);
 entries.forEach((e,i)=>{t.getCell(i+1,1).text.get(e[1]).link={uri:e[2],isExternal:true};});
 notes(s,'所有外部事实以列出的官方资料为依据。Metabase行列数据限制、下载控制等能力存在Pro/Enterprise套餐限制，不能假设免费版可完整验证。Power BI分享与协作也有许可及容量要求。未执行真实企业数据接入、权限穿透或性能测试。',[...entries.map(e=>e[2]),U.metaImage]);
}

// Remove unused source slides while retaining imported layouts, masters and cover artwork.
for(const s of originals)s.delete();
deck.forEach((s,i)=>s.moveTo(i));
for(const [i,s] of deck.entries()){
 for(const sh of s.shapes.items){
  const text=sh.text?.toString().trim();
  if(text && /^\d+$/.test(text) && sh.position.width===0){
   sh.position={left:1230,top:665,width:28,height:25};
   sh.text=String(i+1);sh.text.style={typeface:LATIN,fontSize:14,color:'#222222',insets:{left:0,right:0,top:0,bottom:0}};
  }
 }
}
await fs.writeFile(path.join(TMP,'authored-inspect.ndjson'),(await p.inspect({kind:'slide,textbox,table,image,notes',maxChars:200000})).ndjson);
const candidate=path.join(TMP,'candidate.pptx');
await (await PresentationFile.exportPptx(p)).save(candidate);
console.log('EXPORTED',candidate);
await fs.mkdir(path.join(TMP,'draft-render'),{recursive:true});
for(let i=0;i<deck.length;i++){
 const b=await p.export({slide:deck[i],format:'png',scale:1});
 await fs.writeFile(path.join(TMP,'draft-render',`slide-${i+1}.png`),new Uint8Array(await b.arrayBuffer()));
}
const final=path.join(ROOT,'交付','知识类产品与数据看板调研_周五汇报稿.pptx');
const result=await finalizePresentation({
 workspaceDir:ROOT,candidatePath:candidate,finalPath:final,pythonExecutable:PY,
 integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...[3,5,9,13,14].flatMap(n=>['--require-native-table-slide',String(n)])],
 requiredNativeTableOwnerSlides:[3,5,9,13,14],
 fontPolicy:{basis:'design',families:['Inter','Inter Medium','Inter SemiBold','Arial Unicode MS','Arial','Helvetica Neue','Helvetica Neue Medium','Aptos','Aptos Display','OpenAI Sans'],scriptFonts:{ea:CJK}},
 verifyArtifactToolImport:true,receiptPath:path.join(TMP,'final-v2.validation.json')
});
console.log(JSON.stringify(result));
