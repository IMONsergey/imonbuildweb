import json,re,time,urllib.parse,collections,pathlib,requests
from bs4 import BeautifulSoup
root="https://fantastic-future-931954.framer.app"
out=pathlib.Path(__file__).resolve().parents[1]/"audit";out.mkdir(exist_ok=True)
sess=requests.Session();sess.headers.update({"User-Agent":"Mozilla/5.0"})
queue=collections.deque(["/"]);done=set(); pages=[];media={}
from xml.etree import ElementTree as ET
for loc in ET.fromstring(sess.get(root+"/sitemap.xml",timeout=15).content).findall("{*}url/{*}loc"):
 queue.append(urllib.parse.urlparse(loc.text).path)

while queue and len(done)<60:
 p=urllib.parse.urlparse(queue.popleft()).path.rstrip("/") or "/"
 if p in done:continue
 done.add(p)
 try:
  r=sess.get(root+p,timeout=20);r.raise_for_status()
  r.encoding="utf-8";soup=BeautifulSoup(r.text,"html.parser")
  for e in soup(["script","style","noscript"]):e.decompose()
  texts=list(dict.fromkeys(x.get_text(" ",strip=True) for x in soup.select("h1,h2,h3,h4,p,li,button,blockquote") if x.get_text(" ",strip=True)))
  links=[]
  for a in soup.find_all("a",href=True):
   u=a["href"];parsed=urllib.parse.urlparse(urllib.parse.urljoin(root+p,u))
   if parsed.netloc=="fantastic-future-931954.framer.app":
    cp=parsed.path.rstrip("/") or "/"
    if cp not in done and cp not in queue:queue.append(cp)
   links.append({"text":a.get_text(" ",strip=True)[:120],"href":u})
  assets=[]
  for tag in soup.find_all(["img","video","source"]):
   for attr in ["src","poster","srcset"]:
    if tag.get(attr):
     for x in (tag[attr].split(",") if attr=="srcset" else [tag[attr]]):
      u=urllib.parse.urljoin(root+p,x.strip().split()[0]);media[u]=media.get(u,0)+1;assets.append({"tag":tag.name,"src":u,"attr":attr})
  for u in re.findall(r'https?://[^"\\s<>\\)]+',r.text):
   u=u.replace("&amp;","&")
   if "framerusercontent.com" in u and re.search(r'\\.(?:mp4|webm|woff2?|svg|png|jpe?g|webp)',u,re.I):media[u]=media.get(u,0)+1
  pages.append({"path":p,"status":r.status_code,"title":soup.title.get_text(" ",strip=True) if soup.title else "","texts":texts,"links":links,"assets":assets})
  print(r.status_code,p,"texts",len(texts),"media",len(assets),flush=True)
 except Exception as ex:print("ERROR",p,str(ex),flush=True)
 time.sleep(.08)
(out/"source-inventory.json").write_text(json.dumps(pages,ensure_ascii=False,indent=2))
(out/"source-assets.json").write_text(json.dumps(media,ensure_ascii=False,indent=2))
print("PAGES",len(pages),"MEDIA",len(media),flush=True)
