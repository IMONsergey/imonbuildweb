#!/usr/bin/env python3
"""Consistent backup of I’MON Payload SQLite database and media uploads.

Uses SQLite's online backup API to safely capture WAL databases without
copying a live .db file directly. Keep archives private; they include leads.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import tarfile

parser = argparse.ArgumentParser(description="Create a recoverable private I’MON backup")
parser.add_argument("--skip-media", action="store_true", help="Database-only snapshot for quick validation")
parser.add_argument("--destination", help="Output directory (defaults to ./backups)")
options = parser.parse_args()
root = Path(__file__).resolve().parents[1]
env_file = root / ".env"
database = os.environ.get("DATABASE_URL")
if not database and env_file.exists():
    for line in env_file.read_text().splitlines():
        if line.startswith("DATABASE_URL="):
            database = line.split("=", 1)[1].strip().strip("'\"")
            break
if not database or not database.startswith("file:"):
    raise SystemExit("This tool expects a local SQLite DATABASE_URL=file:...")

database_path = Path(database[5:])
if not database_path.is_absolute():
    database_path = root / database_path
database_path = database_path.resolve()
if not database_path.is_file():
    raise SystemExit(f"Database does not exist: {database_path}")

out = Path(options.destination).expanduser() if options.destination else root / "backups"
out.mkdir(parents=True, exist_ok=True, mode=0o700)
os.chmod(out, 0o700)
stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
folder = out / ("imon-backup-" + stamp)
folder.mkdir(mode=0o700)
db_copy = folder / "database.sqlite"
with sqlite3.connect(str(database_path), timeout=30) as original:
    with sqlite3.connect(str(db_copy)) as snapshot:
        original.backup(snapshot)
        verdict = snapshot.execute("PRAGMA integrity_check").fetchone()
        if verdict[0] != "ok":
            raise RuntimeError("SQLite snapshot integrity failure: " + str(verdict[0]))
os.chmod(db_copy, 0o600)

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for data in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(data)
    return h.hexdigest()

manifest: dict = {
    "project": "I'MON Web",
    "created_at_utc": stamp,
    "database": str(database_path),
    "files": [{"file": "database.sqlite", "bytes": db_copy.stat().st_size, "sha256": sha256(db_copy)}],
}
uploads = root / "uploads"
if not options.skip_media and uploads.is_dir():
    tar_path = folder / "uploads.tar.gz"
    with tarfile.open(tar_path, "w:gz") as archive:
        archive.add(uploads, arcname="uploads", recursive=True)
    os.chmod(tar_path, 0o600)
    manifest["files"].append({"file": "uploads.tar.gz", "bytes": tar_path.stat().st_size, "sha256": sha256(tar_path)})
manifest_path = folder / "manifest.json"
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
os.chmod(manifest_path, 0o600)
print("Backup created:", folder)
print("SQLite integrity: ok")
print("Archive files:", ", ".join(file["file"] for file in manifest["files"]))
