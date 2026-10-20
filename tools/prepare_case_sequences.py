#!/usr/bin/env python3
"""Build editable, source-ordered project sequences from audited DOM positions."""
import json,pathlib,urllib.parse
root=pathlib.Path(__file__).resolve().parents[1]
audit=root/"audit"/"fidelity"
records={}
for slug,route in [("gac-m8","/cases/page"),("askona-life-group","/cases/askona-life-group")]:
 path=audit/("timeline-"+route.strip("/").replace("/","-")+".json")
 raw=json.loads(path.read_text())
 elements=raw[0]["elements"]
 cleaned=[]
 for row in elements:
  row=row.copy()
  if row["tag"] in ["IMG","VIDEO"]:
   u=urllib.parse.urlparse(row["src"]);name=pathlib.Path(u.path).name
   local=root/"public"/"media"/name
   if not local.exists():continue
   row["local"]="/media/"+name
  if row["tag"]=="IFRAME":
   row["local"]=row["src"]
  cleaned.append(row)
 items=[];pending=[];last_top=-1
 def flush():
  global pending
  if not pending:return
  if len(pending)==1:
   it=pending[0]
   form="portrait" if it["width"]<550 else "wide" if it["width"]<1200 and it["width"]>550 else "full"
   if it["tag"]=="IFRAME":form="full"
   items.append({"blockType":"visual","src":it["local"],"display":form,"caption":""})
  else:
   items.append({"blockType":"gallery","items":[{"src":x["local"],"caption":""} for x in pending]})
  pending=[]
 headings = {"О проекте","Задача","Автомобиль как пространство для бизнеса","Главная промо-страница","Архитектура, которая раскрывает продукт","Визуальная система","Интеллектуальные технологии","Панель управления","Конфигурация моделей","Экстерьер и характер","Интерьер как отдельный мир","Страница компании","Цельная цифровая презентация","Архитектура","UX/UI","История","Экосистема","Носители","Результат"}
 used=set()
 for i,item in enumerate(cleaned):
  if i in used:continue
  tag=item["tag"];y=item["top"]
  if tag in ("IMG","VIDEO","IFRAME"):
   if pending and abs(y-last_top)>7:flush()
   pending.append(item);last_top=y
   continue
  flush()
  if y<590 and slug=="gac-m8":continue
  if y<680 and slug=="askona-life-group":continue
  if tag=="H1":continue
  txt=item["text"].strip()
  if not txt:continue
  if (tag=="H2" or tag=="P" and txt in headings) and item["left"]<200:
   rest=[]
   for k,other in enumerate(cleaned):
    if k==i or k in used:continue
    if other["tag"] in ["P"] and other["left"]>350 and y<=other["top"]<y+125 and other["text"]:
     rest.append(other["text"]);used.add(k)
   items.append({"blockType":"text","heading":txt,"body":"\n\n".join(rest),"layout":"split","eyebrow":""})
   continue
  if tag=="P":
   if slug=="gac-m8" and y==7071:
    if items and items[-1]["blockType"]=="cards" and items[-1].get("_palette"):items[-1]["items"].append({"heading":txt,"body":""})
    else:items.append({"blockType":"cards","_palette":True,"items":[{"heading":txt,"body":""}]})
   if slug=="gac-m8" and y==29919:
    if items and items[-1]["blockType"]=="cards" and items[-1].get("_results"):items[-1]["items"].append({"heading":txt,"body":""})
    else:items.append({"blockType":"cards","_results":True,"items":[{"heading":txt,"body":""}]})
   if slug=="gac-m8" and y==29954:
    if items and items[-1]["blockType"]=="cards" and items[-1].get("_results"):
     j=sum(1 for x in cleaned if x["top"]==29954 and x["left"]<item["left"])
     if j<len(items[-1]["items"]):items[-1]["items"][j]["body"]=txt
   continue
 flush()
 for block in items:
  block.pop("_palette",None);block.pop("_results",None)
 if not items:raise RuntimeError("No items generated")
 records[route]={"blocks":items,"length":len(items),"mediaCount":sum(len(x.get("items",[])) if x["blockType"]=="gallery" else 1 for x in items if x["blockType"] in ("gallery","visual"))}
 print(route,"sections",len(items),"media",records[route]["mediaCount"])
out=root/"src"/"content"/"caseStories.json"
out.write_text(json.dumps(records,ensure_ascii=False,indent=2))
print("SAVED",out)
