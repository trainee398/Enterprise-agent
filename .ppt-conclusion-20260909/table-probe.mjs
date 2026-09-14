import {Presentation} from '@oai/artifact-tool';
const p=Presentation.create({slideSize:{width:1280,height:720}});const s=p.slides.add();const t=s.tables.add({rows:2,columns:2,left:40,top:40,width:600,height:300,values:[['a','b'],['c','d']]});
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(t.borders)));
console.log(String(t.borders.assign));
console.log(String(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t.cells.block({row:0,column:0,rowCount:2,columnCount:2})),'borders')?.set));
for(const k of ['outside','inside','insideHorizontal','insideVertical']){const d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t.borders),k);console.log(k,String(d.get),String(d.set));}
console.log('PROTO',JSON.stringify(t.toProto?.()).slice(0,3000));
