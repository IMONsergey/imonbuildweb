#!/usr/bin/env python3
"""Repair verified typing errors in Framecoded-generated Next.js reference output.

This is a migration QA helper, not a production renderer, and intentionally
does not relax TypeScript strictness or blanket-ignore generated modules.
Usage: python3 scripts/repair-framecoded-export.py /path/to/owned-export
"""
from pathlib import Path
import argparse
import re

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("project",type=Path)
    args=parser.parse_args()
    root=args.project.expanduser().resolve()
    manifest=root/"package.json"
    if not manifest.exists() or not (root/"src/ui/MotionRuntime.tsx").exists():
        parser.error("Not a Framecoded-generated project. Aborting.")
    changes=[]
    for file in (root/"src").rglob("*.tsx"):
        content=file.read_text(encoding="utf-8")
        result=re.sub(r'tabIndex=\{"(-?\d+)"\}',lambda m:'tabIndex={'+m[1]+'}',content)
        if file.name=="News.tsx":
            # HTML name attribute is invalid on divs. The captured value is a
            # nonsemantic marker rather than a form's required name field.
            result=result.replace('name={"Image"}','data-name={"Image"}')
            result=result.replace('name={"Image2"}','data-name={"Image2"}')
        if file.name=="page.tsx" and file.parent.name in {"app","about"}:
            result=result.replace(
                "const structuredData = [];",
                "const structuredData: Record<string, unknown>[] = [];",
            )
            result=result.replace(
                "interactions={interactionDefinitions}",
                "interactions={interactionDefinitions as unknown as React.ComponentProps<typeof MotionRuntime>['interactions']}",
            )
        if file.name=="MotionRuntime.tsx":
            result=result.replace(
                "element.animate([frame, frame],",
                "element.animate([frame as Keyframe, frame as Keyframe],",
            )
        if result!=content:
            file.write_text(result,encoding="utf-8")
            changes.append(str(file.relative_to(root)))
    print("Patched",len(changes),"files. Run npm run typecheck and npm run build.")
    for entry in changes[:25]:print(" ",entry)
    if len(changes)>25:print(" ...",len(changes)-25,"more")
    print("Missing Home navigation, CMS bindings and demo metadata are NOT fixed here.")
if __name__=="__main__":main()
