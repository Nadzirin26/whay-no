export function Landscape({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'landscape landscape-small' : 'landscape'} viewBox="0 0 520 480" fill="none" role="img" aria-label="Matahari hangat terbit di balik bukit, ditemani tanaman yang tumbuh pelan.">
    <defs>
      <clipPath id={small ? 'arch-small' : 'arch'}><path d="M55 438V219a205 205 0 0 1 410 0v219Z" /></clipPath>
      <pattern id={small ? 'paper-small' : 'paper'} width="7" height="9" patternUnits="userSpaceOnUse"><circle cx="1" cy="2" r=".65" fill="#7c7252" opacity=".12"/><circle cx="5" cy="7" r=".5" fill="#fff" opacity=".4"/></pattern>
    </defs>
    <g clipPath={`url(#${small ? 'arch-small' : 'arch'})`}>
      <path d="M55 438V219a205 205 0 0 1 410 0v219Z" fill="#eae8d8" />
      <circle cx="287" cy="169" r="70" fill="#d9a475"/>
      <path d="M0 319c92-60 169-68 260-28 90 40 160 4 266-83v252H0Z" fill="#bac4a2"/>
      <path d="M-5 345c79-88 132-132 223-95 104 41 109 150 302 40v170H-5Z" fill="#8c9d77"/>
      <path d="M-6 418c124-101 210-81 306-35 80 38 147 37 226-2v91H-6Z" fill="#687d59"/>
      <path d="M389 278c-27 56-120 77-159 129-10 13-17 25-20 40" stroke="#ded8b9" strokeWidth="24"/>
      <path d="M55 438V219a205 205 0 0 1 410 0v219Z" fill={`url(#${small ? 'paper-small' : 'paper'})`}/>
      <path d="m133 146 11-4 9 6m214 69 10-5 8 4" stroke="#657157" strokeWidth="2" strokeLinecap="round"/>
    </g>
    <path d="M54 439h411" stroke="#647258" strokeWidth="2" strokeLinecap="round"/>
    <g stroke="#4e6047" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M77 440c10-44 7-72 9-111m-2 39c-30 0-37-23-35-34 25 2 37 17 35 34Zm1-20c26 0 35-22 31-33-23 4-32 17-31 33Zm-3 45c-29-1-43-19-43-34 25-3 43 16 43 34Zm1-16c33-2 44-21 41-35-24 4-39 16-41 35Z" fill="#b1bc94"/>
      <path d="m59 407 42 1-5 33H65Z" fill="#c99b7c"/>
      <path d="M442 438c-2-23 3-54-3-80m1 30c-23 0-31-18-29-29 21 0 31 15 29 29Zm0 14c23 1 34-15 33-25-22-3-33 11-33 25Z" fill="#c0c8a9"/>
    </g>
    <path d="m24 285 12-3m-4-17 7 8m447-151 10-4m-15-7 3-10" stroke="#bc9472" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}
export function Tea() {
  return <svg viewBox="0 0 160 140" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M39 61h67v20c0 22-16 32-34 32S39 102 39 81V61Z" fill="currentColor" fillOpacity=".1"/><path d="M107 64c33-5 29 30-2 27M29 116c31 10 62 10 94 0M61 44c-13-16 12-17 1-33m20 33c-13-16 12-17 1-33"/></g></svg>;
}
