#!/usr/bin/env python3
"""Convert captured owned site content into framework-independent seed JSON."""
import json,pathlib,urllib.parse
root=pathlib.Path(__file__).resolve().parents[1]
pages=json.loads((root/"audit/source-inventory.json").read_text())
mapping=json.loads((root/"audit/media-map.json").read_text())
def url_to_local(url):
 p=urllib.parse.urlparse(url)
 bare=urllib.parse.urlunparse((p.scheme,p.netloc,p.path,"","",""))
 return mapping.get(bare)
out=[]
for p in pages:
 route=p["path"]
 raw=p["texts"][9:]
 if "Меню" in raw:raw=raw[:raw.index("Меню")]
 raw=[x for x in raw if "Framer" not in x and "Solace" not in x and x not in ["Mata Nguyen","Design by"]]
 assets=[];video=[]
 for a in p["assets"]:
  local=url_to_local(a["src"])
  if not local:continue
  if local.endswith((".mp4",".webm")):
   if local not in video:video.append(local)
  else:
   if local not in assets:assets.append(local)
 if route=="/": kind="home";title="I’MON"
 elif route=="/about":kind="about";title="О нас"
 elif route=="/work":kind="work";title="Проекты"
 elif route=="/news":kind="news";title="Журнал"
 elif route=="/contact":kind="contact";title="Контакты"
 elif route.startswith("/news/"):kind="article";title=raw[2] if len(raw)>2 else route.rsplit("/",1)[-1]
 elif route.startswith(("/work/","/cases/")):kind="case";title=raw[0] if raw else route.rsplit("/",1)[-1]
 else:kind="legal";title="Юридическая информация"
 intro=raw[0] if raw and kind in ["about","work","news","contact"] else (raw[1] if len(raw)>1 and kind=="case" else "")
 if kind=="article":intro=raw[3] if len(raw)>3 else ""
 if kind=="legal":
  raw=["Текст документа проходит юридическое согласование. Для вопросов об обработке персональных данных напишите на info@imon.agency."]
 if kind=="about":
  raw=["Мы подключаемся в момент, когда бизнесу нужна не новая оболочка, а единая система бренда, продукта и коммуникации.","Работаем со стратегией, визуальной системой и digital как с взаимосвязанными частями бизнеса.","Глубина. Погружаемся в задачу, а не действуем по готовому шаблону.","Системность. Учитываем последствия решений для всего продукта и бизнеса.","Партнерство. Обсуждаем варианты и вместе отвечаем за результат."]
 out.append({"path":route,"slug":route.lstrip("/") or "home","kind":kind,"title":title,"intro":intro,"texts":raw,"images":assets,"videos":video})
projects=[p for p in out if p["kind"]=="case" and p["path"].startswith("/work/")]
# Preserve homepage card order, and include the two separate original case pages.
order=["limbo","be-fresh","gray","weekend","vindex","day-off"]
projects.sort(key=lambda x:order.index(x["slug"].split("/")[-1]) if x["slug"].split("/")[-1] in order else 99)
work=next(p for p in out if p["kind"]=="work")
work_images=[u for u in work["images"] if u.endswith((".png",".webp",".jpg"))]
for i,p in enumerate(projects):
 p["cover"]=work_images[i] if i<len(work_images) else (p["images"][0] if p["images"] else "")
 p["category"]=(work["texts"][4+i*2] if len(work["texts"])>4+i*2 else "Brand & Digital")
 p["year"]=next((p["texts"][i+1] for i,t in enumerate(p["texts"][:-1]) if t in ("Year","Год")), "")
for p in out:
 if p["kind"]=="case" and not p.get("cover"):p["cover"]=p["images"][0] if p["images"] else ""
articles=[p for p in out if p["kind"]=="article"]
news=next(p for p in out if p["kind"]=="news")
for i,p in enumerate(articles):
 p["category"]=p["texts"][0] if p["texts"] else "Journal"
 p["cover"]=news["images"][i] if i<len(news["images"]) else p["images"][0] if p["images"] else ""
 p["date"]="2025-07-16"
(root/"src"/"content").mkdir(exist_ok=True)
(root/"src"/"content"/"source.json").write_text(json.dumps(out,ensure_ascii=False,indent=2))
print("generated",len(out),"routes",len(projects),"projects",len(articles),"articles")
