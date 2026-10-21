import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanPreferences, safeHref } from '../../src/studio/preferences'

test('only safe internal links, https, anchors and contact schemes are allowed', () => {
  for (const value of ['/about', '/work/gm8', '#contact', 'https://t.me/imonagency', 'mailto:info@imon.agency', 'tel:+74950000000'])
    assert.equal(safeHref(value), value)
  for (const value of ['javascript:alert(1)', '//evil.invalid', 'http://evil.invalid', 'data:text/html,<b>x</b>', '/\\redirect'])
    assert.throws(() => safeHref(value), Error)
})

test('navigation is validated without additional unsafe fields', () => {
  const result = cleanPreferences('navigation', {
    links: [{ id:'item1', label:'  О нас ', href:'/about', external:false, token:'secret' }],
    ctaText: 'Связаться', ctaHref:'/contact',
  })
  assert.deepEqual(result, {
    links:[{ id:'item1',label:'О нас',href:'/about',external:false }],
    ctaText:'Связаться',ctaHref:'/contact',
  })
})

test('empty required settings, invalid email, and excessive navigation rows fail', () => {
  const basic = {brand:'I’MON',email:'info@imon.agency',description:'',telegram:'https://t.me/imonagency',footerMessage:'Контакт',socials:[]}
  assert.equal(cleanPreferences('site-settings',basic).brand,'I’MON')
  assert.throws(() => cleanPreferences('site-settings',{...basic,email:'not-an-email'}))
  assert.throws(() => cleanPreferences('navigation',{links:[],ctaText:'',ctaHref:'/'}))
  assert.throws(() => cleanPreferences('navigation',{links:Array(41).fill({label:'x',href:'/'}),ctaText:'CTA',ctaHref:'/'}))
})
