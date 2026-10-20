#!/usr/bin/env python3
"""Adopt additive migrations in the isolated Studio development copy, after backup.
Refuses unknown SQL, mismatched column types, and paths outside this worktree.
Normal deployments use `pnpm payload migrate` instead.
"""
from pathlib import Path
import datetime, re, sqlite3
root=Path(__file__).resolve().parents[1]
if root.name != 'imonbuildweb-studio':
    raise SystemExit('This reconciliation is restricted to the isolated Studio worktree.')
path=root/'imonbuildweb.db'
if not path.exists(): raise SystemExit('Missing local database')
backup=root/'backups'/('studio-before-adoption-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'.db')
backup.parent.mkdir(exist_ok=True)
connection=sqlite3.connect(path,timeout=30)
destination=sqlite3.connect(backup);connection.backup(destination);destination.close()
expected=sqlite3.connect(':memory:')
statements=[]; migrations=[]
for filename in sorted((root/'src/migrations').glob('[0-9]*.ts')):
    source=filename.read_text().split('export async function down',1)[0]
    chunks=re.findall(r'await db\.run\(sql`((?:\\.|[^`])*)`\)',source,re.S)
    if not chunks or '${' in source: raise SystemExit('Unsupported migration syntax: '+filename.name)
    for chunk in chunks:
        sql=chunk.replace('\\`','`').strip()
        if not re.match(r'^(CREATE TABLE|CREATE (?:UNIQUE )?INDEX|ALTER TABLE .* ADD |PRAGMA )',sql,re.S):
            raise SystemExit('Non-additive statement refused: '+sql[:120])
        expected.executescript(sql)
        statements.append(sql)
    migrations.append(filename.stem)
connection.execute('PRAGMA foreign_keys=ON')
try:
    connection.execute('BEGIN IMMEDIATE')
    applied=0
    for sql in statements:
        table=re.match(r'CREATE TABLE `([^`]+)`',sql)
        index=re.match(r'CREATE (?:UNIQUE )?INDEX `([^`]+)`',sql)
        column=re.match(r'ALTER TABLE `([^`]+)` ADD `([^`]+)`',sql)
        if table:
            exists=connection.execute('select name from sqlite_master where type="table" and name=?',(table[1],)).fetchone()
            if not exists: connection.execute(sql);applied+=1
        elif index:
            exists=connection.execute('select name from sqlite_master where type="index" and name=?',(index[1],)).fetchone()
            if not exists: connection.execute(sql);applied+=1
        elif column:
            names={row[1] for row in connection.execute('pragma table_info("'+column[1]+'")')}
            if column[2] not in names: connection.execute(sql);applied+=1
        elif not sql.startswith('PRAGMA '): raise RuntimeError('Unknown statement')
    for (table,) in expected.execute('select name from sqlite_master where type="table" and name not like "sqlite_%"'):
        wanted={row[1]:row[2] for row in expected.execute('pragma table_info("'+table+'")')}
        actual={row[1]:row[2] for row in connection.execute('pragma table_info("'+table+'")')}
        if any(actual.get(key)!=kind for key,kind in wanted.items()): raise RuntimeError('Schema mismatch: '+table)
    violations=connection.execute('pragma foreign_key_check').fetchall()
    if violations: raise RuntimeError('Foreign key violations: '+str(violations[:10]))
    connection.execute('delete from payload_migrations where name="dev" and batch=-1')
    for i,name in enumerate(migrations,1):
        if not connection.execute('select id from payload_migrations where name=?',(name,)).fetchone():
            connection.execute('insert into payload_migrations(name,batch,created_at,updated_at) values(?,?,?,?)',(name,i,datetime.datetime.now(datetime.timezone.utc).isoformat(),datetime.datetime.now(datetime.timezone.utc).isoformat()))
    connection.commit()
    print('Verified migrations:',len(migrations),'Applied additive statements:',applied,'Backup:',backup.name)
    print('Content preserved:', {name:connection.execute('select count(*) from '+name).fetchone()[0] for name in ['users','pages','projects','articles','media','leads']})
except Exception:
    connection.rollback();raise
finally:
    expected.close();connection.close()
