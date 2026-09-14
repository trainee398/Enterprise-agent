from pathlib import Path
import hashlib, json, re, shutil, sys, zipfile
from lxml import etree
from PIL import Image, ImageOps, ImageDraw

BUILD=Path(__file__).resolve().parent
ROOT=BUILD.parent
DECK=BUILD/'企业知识库与数据看板调研'
OUT=ROOT/'交付/企业知识库与数据看板调研_codex-ppt重制版.pptx'
NS={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/package/2006/relationships'}
with zipfile.ZipFile(OUT) as z:
    slides=sorted([n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml',n)],key=lambda x:int(re.search(r'(\d+)\.xml',x).group(1)))
    assert len(slides)==12
    note_lengths=[]
    for n in range(1,13):
        sx=etree.fromstring(z.read(f'ppt/slides/slide{n}.xml'))
        assert len(sx.findall('.//p:pic',NS))==1
        rel=etree.fromstring(z.read(f'ppt/slides/_rels/slide{n}.xml.rels'))
        target=[r.get('Target') for r in rel if r.get('Type','').endswith('/image')]
        assert len(target)==1
        media='ppt/'+target[0].replace('../','')
        src=(DECK/f'origin_image/slide_{n:02d}.png').read_bytes()
        assert hashlib.sha256(z.read(media)).digest()==hashlib.sha256(src).digest()
        nx=etree.fromstring(z.read(f'ppt/notesSlides/notesSlide{n}.xml'))
        text='\n'.join(nx.xpath('//a:t/text()',namespaces=NS))
        assert len(text)>70
        note_lengths.append(len(text))
    assert '系统提供' in z.read('ppt/notesSlides/notesSlide4.xml').decode()
    assert 'metabase.com' in z.read('ppt/notesSlides/notesSlide10.xml').decode()

# Diagnostic overview only; never used as any final slide image.
files=sorted((BUILD/'final-render').glob('slide_*.png'))
assert len(files)==12
w,h,gap=668,376,20
sheet=Image.new('RGB',(3*w+4*gap,4*(h+30)+5*gap),'#EAF0F7')
draw=ImageDraw.Draw(sheet)
for i,p in enumerate(files):
    x=gap+(i%3)*(w+gap);y=gap+(i//3)*(h+30+gap)
    thumb=ImageOps.fit(Image.open(p).convert('RGB'),(w,h))
    sheet.paste(thumb,(x,y))
    draw.text((x+6,y+h+6),f'{i+1:02d}',fill='#142B49')
preview=ROOT/'交付/企业知识库与数据看板调研_codex-ppt全页预览.jpg'
sheet.save(preview,quality=92)
shutil.copyfile(DECK/'speech.md',ROOT/'交付/企业知识库与数据看板调研_codex-ppt讲稿.md')
qa={'slide_count':12,'images_embedded_unchanged':True,'notes_present':12,'note_character_counts':note_lengths,
    'final_bytes':OUT.stat().st_size,'final_sha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),
    'actual_source_image_size':[1672,941],'format':'16:9 full-slide images; individual slide text is not separately editable',
    'qa':'All generated slide images visually reviewed; slide 05 and 06 regenerated for missing Chinese text; all final slides rendered.',
    'powerpoint_native_execution_checked':False,'preview':str(preview)}
(BUILD/'package-content-check.json').write_text(json.dumps(qa,ensure_ascii=False,indent=2))
print(json.dumps(qa,ensure_ascii=False))
