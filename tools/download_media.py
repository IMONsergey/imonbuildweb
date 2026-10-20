#!/usr/bin/env python3
"""Acquire local media assets from the purchased source template. Idempotent."""
from __future__ import annotations
import requests,json,pathlib,urllib.parse,concurrent.futures,os,hashlib,collections
root=pathlib.Path(__file__).resolve().parents[1]
target=root/"public"/"media";target.mkdir(parents=True,exist_ok=True)
urls=json.loads((root/"audit"/"source-assets.json").read_text())
canonical={}
for u in urls:
 p=urllib.parse.urlparse(u)
 if p.netloc not in ("framerusercontent.com","www.framerusercontent.com"):continue
 if not p.path.lower().endswith((".png",".jpg",".jpeg",".webp",".svg",".mp4",".webm",".woff",".woff2")):continue
 bare=urllib.parse.urlunparse((p.scheme,p.netloc,p.path,"","",""))
 canonical.setdefault(bare,u)
def download(item):
 bare,variant=item
 name=pathlib.Path(urllib.parse.urlparse(bare).path).name
 fn=target/name
 if fn.exists() and fn.stat().st_size>200:return name,fn.stat().st_size,"cached"
 for url in (bare,variant):
  try:
   with requests.get(url,stream=True,timeout=55,headers={"User-Agent":"Mozilla/5.0"}) as r:
    r.raise_for_status()
    ct=r.headers.get("Content-Type","")
    if "text/html" in ct:raise ValueError("HTML instead of media")
    tmp=fn.with_suffix(fn.suffix+".part")
    with open(tmp,"wb") as f:
     for block in r.iter_content(1024*256):
      if block:f.write(block)
    if tmp.stat().st_size<128:raise ValueError("tiny response")
    tmp.replace(fn)
    return name,fn.stat().st_size,"ok"
  except Exception as e:err=str(e)
 return name,0,err
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 results=list(pool.map(download,canonical.items()))
for name,size,status in results:
 print(f"{status:16} {size:>12} {name}",flush=True)
manifest={bare:"/media/"+pathlib.Path(urllib.parse.urlparse(bare).path).name for bare in canonical}
(root/"audit"/"media-map.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print("Assets",len(manifest),"downloaded",sum(1 for _,s,_ in results if s),"failed",sum(1 for _,s,_ in results if not s),"total MB",round(sum(s for _,s,_ in results)/1048576,1),flush=True)
