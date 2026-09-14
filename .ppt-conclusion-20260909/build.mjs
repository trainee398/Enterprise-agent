import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const TMP=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.dirname(TMP);
const SKILL='/Users/linhe/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const PY='/Users/linhe/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')));
const P=Presentation.create({slideSize:{width:1280,height:720}});
const F='PingFang SC',C={bg:'#F7F7F3',ink:'#182B25',green:'#006B52',muted:'#58675F',line:'#CFD8D1',dark:'#173D31',light:'#B9D6CA'};
const U={nav:'https://www.notion.com/help/navigate-with-the-sidebar',search:'https://www.notion.com/help/search',perm:'https://www.notion.com/help/sharing-and-permissions',wiki:'https://www.notion.com/help/wikis-and-verified-pages',feishu:'https://www.feishu.cn/hc/zh-CN/articles/265017155035',obsidian:'https://obsidian.md/help/data-storage',obsPerm:'https://obsidian.md/help/sync/collaborate',power:'https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards',powerShare:'https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-share-dashboards',meta:'https://www.metabase.com/docs/latest/dashboards/introduction',drill:'https://www.metabase.com/docs/latest/questions/visualizations/drill-through',metaPerm:'https://www.metabase.com/docs/latest/permissions/introduction'};
function txt(s,text,x,y,w,h,size=28,color=C.ink,bold=false){
 const t=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 t.text=String(text).split('\n').map(run=>({runs:[{run,textStyle:{typeface:F,fontSize:`${size}px`,bold,color}}],bulletCharacter:'',marginLeft:0,indent:0,spaceAfter:450}));
 t.text.style={typeface:F,fontSize:size,bold,color,autoFit:'none',wrap:'square',verticalAlignment:'top',insets:{left:0,right:0,top:0,bottom:0}};return t;
}
function slide(title,dark=false){const s=P.slides.add();s.background.fill=dark?C.dark:C.bg;if(title)txt(s,title,68,55,1130,72,46,dark?'#FFFFFF':C.ink,true);txt(s,String(P.slides.items.length).padStart(2,'0'),1160,659,50,25,17,dark?C.light:C.muted);return s;}
function note(s,copy,urls=[]){s.speakerNotes.textFrame.setText(copy+'\n\n资料日期：2026-09-09。\n'+urls.map((u,i)=>`${i+1}. ${u}`).join('\n'));}
function foot(s,text,dark=false){txt(s,text,68,628,1110,38,18,dark?C.light:C.muted);}
function matrix(s,values,widths,y=190,h=400,size=25){
 const t=s.tables.add({rows:values.length,columns:values[0].length,left:68,top:y,width:1144,height:h,columnWidths:widths,values});
 t.styleOptions={headerRow:true,bandedRows:false};
 t.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({fill:C.bg,textStyle:{typeface:F,fontSize:size,color:C.ink},margins:{left:12,right:18,top:12,bottom:12},anchor:'center'});
 t.borders.assign({outside:{fill:'none',width:0},insideVertical:{fill:'none',width:0},insideHorizontal:{fill:C.line,width:1}});
 t.rows[0].height=58;for(let r=1;r<values.length;r++)t.rows[r].height=(h-58)/(values.length-1);
 for(let c=0;c<values[0].length;c++){t.getCell(0,c).fill='#E7EDE6';t.getCell(0,c).text.style={typeface:F,fontSize:size,color:C.green,bold:true};}
 return t;
}
function pair(s,x,y,label,body,w=500){txt(s,label,x,y,w,54,34,C.green,true);txt(s,body,x,y+69,w,145,28);}
// 01: conclusion-led cover.
{
 const s=slide();
 s.images.add({blob:new Uint8Array(await fs.readFile(path.join(TMP,'cover-art.png'))),contentType:'image/png',position:{left:716,top:45,width:550,height:590},fit:'contain',alt:'用于封面的纸页与绿色玻璃概念配图'});
 txt(s,'企业知识库\n一期建议',68,134,680,220,76,C.ink,true);
 txt(s,'简洁功能与持续使用',72,382,650,65,38,C.green);
 txt(s,'竞品调研结论 · 附数据看板摘要',72,502,640,42,25,C.muted);
 txt(s,'2026 年 9 月 9 日',72,557,640,36,21,C.muted);
 note(s,'本次汇报重点为：在已确认的企业Agent方向下，先上线简洁知识库，并通过竞品调研提出可评估的一期取舍。数据看板调研摘要保留在第9页。封面为AI生成概念配图。');
}
// 02: established context, without inventing architecture detail.
{
 const s=slide('已确认的背景与本期任务',true);
 txt(s,'企业知识 · 企业数据 · OKR',68,194,1140,76,49,'#FFFFFF',true);
 txt(s,'共同组成事实层，供 Agent 调用，提升公司业务能力。',68,282,1130,66,32,C.light);
 txt(s,'本期先上线知识库',68,437,1080,70,48,'#FFFFFF',true);
 txt(s,'调研需要给出：哪些功能值得保留，怎样让员工愿意持续使用。',68,524,1110,86,30,'#FFFFFF');
 note(s,'整体方向来自用户最新转述的领导确认，作为已确认背景。知识库先上线、避免复杂，是本次决策约束。下面的具体功能、默认归属与试点方式均为建议，不等于已评审PRD。整体框架已确认，不代表一期必须交付Agent问答，问答排期单独确认。');
}
// 03: comparison evidence and selective reuse.
{
 const s=slide('竞品中值得保留的机制');
 matrix(s,[['参考产品','观察到的机制','对一期的启发【建议】'],['Notion','搜索正文、最近访问与收藏入口','减少再次找到资料的路径'],['飞书','按部门、用户组或成员\n配置文档默认权限','统一默认规则，减少逐篇配置'],['语雀','默认库承接资料，之后主动整理\n（用户个人体验）','减少录入前的归类负担'],['Obsidian','本地 Markdown 文件与直接读写','基础编辑顺手，内容便于迁移']],[185,470,489],182,404,25);
 foot(s,'保留具体机制；个人偏好与竞品功能都不能直接证明企业用户留存。');
 note(s,'Notion官方可核实搜索正文、搜索窗口最近页和收藏导航。飞书默认权限可按部门/用户组/成员设置。语雀的未选库默认归属仅来自用户本人反馈，不能当作企业账号通用规则。Obsidian使用本地Markdown，但共享库无细粒度权限，不能照搬其权限模型。借鉴判断没有留存数据支持。',[U.search,U.nav,U.feishu,U.obsidian,U.obsPerm]);
}
// 04: one core task and the retention hypothesis.
{
 const s=slide('一期建议：查到并用上业务资料');
 txt(s,'员工需要资料时，\n能找到有权访问、适合当前任务的内容。',68,183,1132,160,49,C.ink,true);
 pair(s,68,403,'容易开始','少填信息，少选类型。\n先让已有资料顺利进来。',490);
 pair(s,676,403,'愿意回来【推测】','查找有效，同事也引用同一份资料。\n下次遇到需求时仍愿意使用。',536);
 foot(s,'资料归属、维护人、来源与更新时间提供判断线索；更新时间不等于内容已核验。');
 note(s,'建议将资料的实际查用作为一期价值主线。顺利上传只是首次使用条件；可重复使用的知识才可能促成员工回访。这是待验证的产品假设，不能承诺留存。Notion负责人和验证状态机制可启发重要知识的维护，但一期不要求复制完整验证审批。',[U.wiki,U.search]);
}
// 05: visible simplicity.
{
 const s=slide('员工的主路径：搜索 → 阅读 → 复用');
 txt(s,'首页优先服务查找',68,185,570,65,40,C.green,true);
 txt(s,'搜索最突出，最近资料帮助返回。\n上传 / 新建作为次级入口。',68,276,550,138,32);
 txt(s,'打开文档后再呈现',694,185,520,65,40,C.green,true);
 txt(s,'正文与来源，维护人与更新时间。\n复制稳定链接，按权限直接修改。',694,276,520,150,32);
 txt(s,'录入时减少必填项',68,473,560,58,34,C.green,true);
 txt(s,'默认位置和可见范围始终清楚；\n目录、标签不作为上传前的必做题。',68,550,1110,84,29);
 note(s,'这是建议的交互方向，不是完整页面原型。查找为主任务，因此不让上传、新建、搜索并列竞争首页注意力。最近资料可以先做；收藏按首批任务决定。进入某库时可默认当前库并显示可见范围；全局录入若没有明确目标，可先进入仅本人可见的待整理位置，但此机制也需按实际权限样本确认。不能因未选分类而默认全员共享。',[U.nav,U.search]);
}
// 06: privilege behaviour, with a clear limiting condition.
{
 const s=slide('权限简化：先验证库级继承');
 txt(s,'按库设置阅读、编辑与管理，文档默认继承。',68,152,1134,57,32,C.green,true);
 matrix(s,[['示例资料','库的访问范围【示例】','员工看到的结果'],['全员制度','全员可读，指定维护人可改','全员能查阅，仅维护人能修改'],['部门操作手册','本部门可读，维护人可改','其他部门的搜索与原链接均受限'],['指定人员资料','单独受限库，仅指定成员访问','正文、附件、分享遵守同一范围']],[225,480,439],238,318,24);
 foot(s,'适用前提：资料能按稳定的访问范围分组。例外很多时，再评估单篇权限，避免库过多。');
 note(s,'库级继承是建议验证的简化方案，不是已定权限矩阵或RBAC/ACL实现。管理员需要理解最终授权来源，特别是人员同时属于多个组时。撤权后检查搜索、原链接、附件和分享；未来Agent调用也要遵守内容访问范围，但此处不展开技术架构。上述文档和成员组合是虚构业务示例。',[U.perm,U.feishu]);
}
// 07: narrow the feature surface while retaining integrity.
{
 const s=slide('功能取舍：把投入集中在查用体验');
 const cols=[
 [68,'本期保留','已验证格式的收录\n标题与正文搜索、最近资料\n阅读、基础编辑、稳定链接\n库级权限与清楚的可见范围'],
 [465,'按需呈现的基础保障','保存状态与失败处理\n来源、维护人、更新时间\n必要的版本与删除恢复\n移动归档、联系维护人'],
 [862,'暂缓扩展','复杂标签与多视图体系\n图谱、插件、模板市场\n社交打卡和活动激励\n完整协同审批与权限编排']
 ];
 for(const [x,h,b] of cols){txt(s,h,x,201,350,63,32,x===862?C.muted:C.green,true);txt(s,b,x,301,350,274,26,x===862?C.muted:C.ink);}
 foot(s,'以上为一期建议，需结合研发工作量定范围。Markdown 可作内容形式，普通员工无需先学习语法。');
 note(s,'界面入口精简与可靠性保障同时考虑，恢复、来源、权限等不因首页简化而消失。维护人可先是创建者或指定人员；纠错先做到能联系到人并定位文档，不必另建工单系统。格式清单按真实资料验证，不承诺任意Office/PDF全量转换。是否一期接入Agent问答单独确认。');
}
// 08: behaviour-based measurement, not invented retention promises.
{
 const s=slide('用真实任务验证持续使用的可能性');
 txt(s,'先准备有维护人的高频资料，再选一个小团队试用两周。',68,152,1130,56,31,C.green,true);
 matrix(s,[['观察的问题','记录方式'],['第一次是否容易用','无帮助完成一次收录或查找；记录耗时与卡点'],['是否帮助完成真实工作','抽样确认资料是否实际用于完成任务，记录失败原因'],['有同类需求时是否再次使用','仅在确实再次遇到同类需求的人中，记录再次使用'],['资料是否越用越有用','记录无结果搜索、过期或错误内容，检查维护后是否改善']],[365,779],235,328,25);
 foot(s,'试点是早期验证，不是留存证明。先建立基线；登录次数、上传数量和链接点击不代替业务价值。');
 note(s,'先放入一组经常被问到、且有明确维护人的资料。再选择确有重复查找需求的小团队。两周是建议的早期试点周期，没有捏造样本规模、成功率或留存目标。阅读者和维护者分开看：阅读者的查找成功与再次使用，维护者的纠错更新成本。默认权限错误、保存丢失、查用到过期资料作为质量约束。问题登记可人工进行，不因测量需要扩建分析或工单系统。');
}
// 09: retain the dashboard research, now connected to the confirmed context.
{
 const s=slide('数据看板：汇总、追查与可见范围');
 matrix(s,[['产品','初步调研发现','后续比较重点'],['Power BI','仪表板汇总磁贴，详细分析进入报表；\n筛选与切片主要在报表中进行。','从概况进入明细的路径，\n以及分享后的底层数据范围。'],['Metabase','查询组合到看板，可配置筛选与点击；\n钻取受查询权限和查询方式约束。','筛选后是否容易追查，\n集合权限与数据权限是否清楚。']],[185,540,419],190,289,25);
 txt(s,'与知识库共用的评价思路',68,513,1125,50,33,C.green,true);
 txt(s,'完成一个业务任务是否省事，结果能否判断，访问范围是否一致。',68,577,1120,55,28);
 foot(s,'官方资料初步调研，尚未统一账号实测。');
 note(s,'数据是已确认事实层方向之一；本页比较人的看数和追查体验，不预设看板产品等于事实层，也不据此给出数据接入架构。Power BI Dashboard与Report区分来自官方，固定整张报表页有特殊交互行为。Metabase原生SQL钻取能力不能等同查询构建器。当前仍是官方资料初步调研，尚未统一账号实测。',[U.power,U.powerShare,U.meta,U.drill,U.metaPerm]);
}
// 10: concrete decision, not another open-ended research list.
{
 const s=slide('周五建议确认的取舍',true);
 txt(s,'建议以“查到并用上业务资料”\n作为知识库一期的重点。',68,173,1130,170,50,'#FFFFFF',true);
 txt(s,'优先打磨',68,394,340,57,32,C.light,true);
 txt(s,'搜索与阅读路径，\n默认归属和可见范围。',68,467,470,122,31,'#FFFFFF');
 txt(s,'会上确认',676,394,470,57,32,C.light,true);
 txt(s,'先覆盖哪个团队的哪类资料？\n是否存在必须支持的单篇权限例外？\nAgent 问答是否本期交付？',676,466,540,156,27,'#FFFFFF');
 note(s,'汇报先给出建议，不再把已确认的整体框架作为开放问题。请领导拍板的是具体一期场景和范围，随后将真实资料、人员访问样本和原型任务带入验证。建议以一个小团队的重复查询场景开始，例如经常被问到的操作流程或业务口径；这些仍是候选例子，不是已确认的首批业务。');
}
// 11: direct official source links.
{
 const s=slide('附录：知识产品的资料依据');
 const e=[['Notion：搜索与最近访问',U.search,'搜索范围、最近页面与查找入口'],['Notion：侧边栏与页面归属',U.nav,'特定新建入口的 Private 默认归属、收藏'],['Notion：分享与权限',U.perm,'继承与授权来源，不能只看一次取消分享'],['Notion：Wiki 负责人和验证',U.wiki,'维护责任、验证状态；更新时间不等于验证'],['飞书：文档权限默认值',U.feishu,'按部门、用户组或成员配置默认规则'],['Obsidian：本地文件与共享权限',U.obsidian,'Markdown 内容形态；共享权限另见备注']];
 for(let i=0;i<e.length;i++){const y=169+i*72;const a=txt(s,e[i][0],68,y,530,48,26,C.green,true);a.text.get(e[i][0]).link={uri:e[i][1],isExternal:true};txt(s,e[i][2],636,y+2,575,52,24,C.muted);}
 foot(s,'语雀的默认库使用感受来自用户本人；不推断为企业账号通用规则或企业用户偏好。');
 note(s,'点击资料标题可打开对应官网。飞书权限默认值来自官方帮助可检索资料；当前账号和套餐未实测。语雀使用反馈来自用户，截图不是对默认归属行为的完整验证。产品能力受版本和套餐影响，应按试点账号核验。',[...e.map(x=>x[1]),U.obsPerm]);
}
// 12: dashboard citations and evidence scope.
{
 const s=slide('附录：数据看板的资料依据');
 const e=[['Power BI：仪表板与报表',U.power],['Power BI：分享与数据访问',U.powerShare],['Metabase：看板组成与交互',U.meta],['Metabase：钻取的适用条件',U.drill],['Metabase：集合和数据权限',U.metaPerm]];
 for(let i=0;i<e.length;i++){const t=txt(s,e[i][0],68,172+i*65,1090,47,27,C.green,true);t.text.get(e[i][0]).link={uri:e[i][1],isExternal:true};}
 txt(s,'证据口径',68,523,400,52,32,C.ink,true);
 txt(s,'产品事实来自官方资料；具体取舍为建议。\n持续使用机制为【推测】，需通过真实任务验证。',68,582,1100,82,26,C.muted);
 note(s,'本轮没有执行真实企业数据接入、权限实测、性能测试或用户留存实验。数据看板调研与知识库一期建议分别呈现，不因为共同服务Agent就合并为一份完整架构。',[...e.map(x=>x[1])]);
}
await fs.writeFile(path.join(TMP,'authored-inspect.ndjson'),(await P.inspect({kind:'slide,textbox,table,notes',maxChars:160000})).ndjson);
const candidate=path.join(TMP,'candidate.pptx');await (await PresentationFile.exportPptx(P)).save(candidate);
await fs.mkdir(path.join(TMP,'draft-render'),{recursive:true});for(let i=0;i<P.slides.items.length;i++){const b=await P.export({slide:P.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(TMP,'draft-render',`slide-${i+1}.png`),new Uint8Array(await b.arrayBuffer()));}
if(!process.env.FINALIZE){console.log('DRAFT_READY');process.exit(0);}
const tables=[3,6,8,9];const final=path.join(ROOT,'交付','企业知识库一期建议_简洁功能与持续使用.pptx');
console.log(await finalizePresentation({workspaceDir:ROOT,candidatePath:candidate,finalPath:final,pythonExecutable:PY,integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...tables.flatMap(n=>['--require-native-table-slide',String(n)])],requiredNativeTableOwnerSlides:tables,fontPolicy:{basis:'design',families:[F],scriptFonts:{ea:F}},verifyArtifactToolImport:true,receiptPath:path.join(TMP,'final.validation.json')}));
