import type { SVGProps } from 'react'

/** One consistent, optically centred arrow across desktop, mobile and all browsers. */
export function ArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return <svg className="imon-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
    fill="none" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" {...props}>
    <path d="M5 19 19 5M7 5h12v12"/>
  </svg>
}
