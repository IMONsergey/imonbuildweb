'use client'
import { ArrowIcon } from './ArrowIcon'
import { useEffect, useRef, useState } from 'react'
import dimensions from '@/content/mediaDimensions.json'
import { isVideoEmbed } from '@/lib/mediaPolicy'

export function CaseMedia({ src, alt = '', className = '', poster }: {
  src: string; alt?: string; className?: string; poster?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [activated, setActivated] = useState(false)
  const filename=src.split('?')[0]?.split('/').pop()||''
  const dimensionsByFile=dimensions as Record<string,number[]>
  const [intrinsicWidth,intrinsicHeight]=dimensionsByFile[filename]||[1600,900]
  const isVideo = /\.(mp4|webm)(\?.*)?$/i.test(src)
  const isEmbed = isVideoEmbed(src)
  useEffect(()=>{
    if(!isVideo)return
    const element=videoRef.current
    if(!element)return
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches
    if(reduce)return
    const obs=new IntersectionObserver(entries=>{
      if(entries[0]?.isIntersecting) {
        element.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false))
      } else {
        element.pause(); setPlaying(false)
      }
    },{threshold:.15,rootMargin:'200px 0px'})
    obs.observe(element)
    return ()=>{obs.disconnect();element.pause()}
  },[src,isVideo])

  if(isVideo)return <div className={'case-media case-media--video '+className}>
    <video ref={videoRef} src={src} muted playsInline loop preload="metadata"
      poster={poster} controls={false} aria-label={alt||'Видео проекта'}/>
    <button type="button" className="case-video-toggle"
      aria-label={playing?'Приостановить видео':'Воспроизвести видео'}
      onClick={()=>{const v=videoRef.current;if(!v)return;if(v.paused){v.play().then(()=>setPlaying(true)).catch(()=>{})}else{v.pause();setPlaying(false)}}}>
      {playing?'Ⅱ':'▶'}
    </button>
  </div>
  if(isEmbed)return <div className={'case-media case-media--embed '+className}>
    {activated ? <iframe title={alt||'Видео проекта'} src={src}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/> :
      <button type="button" onClick={()=>setActivated(true)} className="case-embed-cover" aria-label="Открыть видеопрезентацию">
        <img src={poster||'/media/FFN0jZcyJMA4Z1LOoQu3bTkaXuM.jpg'} alt="Обложка видеопрезентации" loading="lazy"/>
        <span className="case-embed-play" aria-hidden="true">▶</span>
      </button>}
  </div>
  if (/\.pdf(?:$|\?)/i.test(src)) return <a href={src} target="_blank" rel="noopener noreferrer" className="document-media-link">{alt || 'Открыть документ'} <ArrowIcon/></a>
  if (!src.startsWith('/') || src.startsWith('//')) return null
  return <div className={'case-media case-media--image '+className} data-photo-in>
    <img src={src} alt={alt||'Материал проекта'} width={intrinsicWidth} height={intrinsicHeight} loading="lazy"/>
  </div>
}
