import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { writeFileSync, chmodSync } from 'node:fs'
import { resolve } from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload=await getPayload({config})
const users=await payload.count({collection:'users',overrideAccess:true})
if(users.totalDocs>0) {
  console.log('Administrator already configured — leaving existing users unchanged.')
  process.exit(0)
}
const email=process.env.IMON_ADMIN_EMAIL || 'info@imon.agency'
const password=randomBytes(27).toString('base64url')
await payload.create({
  collection:'users',overrideAccess:true,
  data:{name:'I’MON Administrator',email,password,role:'admin'},
})
const file=resolve(process.cwd(),'.initial-admin')
writeFileSync(file,'I’MON CMS initial admin\nEmail: '+email+'\nPassword: '+password+'\nPlease rotate after first login.\n',{mode:0o600})
chmodSync(file,0o600)
console.log('Administrator created. Credentials saved locally (0600):',file)
process.exit(0)
