'use client'
import type { Breakpoint } from './model'
import type { NodeStyle, MotionType } from './styles'

type SetStyle = (key: keyof NodeStyle, value: unknown) => void
const options = {
  display: [['', 'Из шаблона'], ['block', 'Блок'], ['flex', 'Flex / Stack'], ['grid', 'Grid']],
  flexDirection: [['', 'Auto'], ['row', 'Горизонтально'], ['column', 'Вертикально']],
  justifyContent: [['', 'Auto'], ['start', 'Начало'], ['center', 'Центр'], ['end', 'Конец'], ['space-between', 'Между'], ['space-around', 'Вокруг']],
  alignItems: [['', 'Auto'], ['start', 'Начало'], ['center', 'Центр'], ['end', 'Конец'], ['stretch', 'Растянуть']],
  overflow: [['', 'Из шаблона'], ['visible', 'Видимый'], ['hidden', 'Скрывать']],
  shadow: [['', 'Из шаблона'], ['none', 'Без тени'], ['subtle', 'Лёгкая'], ['soft', 'Мягкая']],
  textAlign: [['', 'Из шаблона'], ['left', 'Слева'], ['center', 'По центру'], ['right', 'Справа']],
} as const

function NumberProperty({ name, title, value, onChange, unit = 'px', step = 1, min = 0, max, description }: {
  name: keyof NodeStyle; title: string; value: unknown; onChange: SetStyle
  unit?: string; step?: number; min?: number; max?: number; description?: string
}) {
  return <label className="st-property">
    <span>{title}{description && <small title={description} className="st-prop-help">ⓘ</small>}</span>
    <div className="st-unit-input"><input type="number" aria-label={title} min={min} max={max} step={step} value={typeof value === 'number' ? value : ''} placeholder="Auto" onChange={event => onChange(name, event.target.value === '' ? '' : Number(event.target.value))}/><small>{unit}</small></div>
  </label>
}
function ChoiceProperty({ name, title, value, onChange, items }: {
  name: keyof NodeStyle; title: string; value: unknown; onChange: SetStyle; items: readonly (readonly [string, string])[]
}) {
  return <label className="st-property"><span>{title}</span><select aria-label={title} value={typeof value === 'string' ? value : ''} onChange={event => onChange(name, event.target.value)}>{items.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
}
function Section({ heading, children, defaultOpen = true }: { heading: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return <details className="st-property-section st-property-details" open={defaultOpen}><summary>{heading}</summary><div>{children}</div></details>
}
export function LayoutControls({ style, breakpoint, setStyle, resetStyle }: {
  style: NodeStyle; breakpoint: Breakpoint; setStyle: SetStyle; resetStyle: () => void
}) {
  const number = (name: keyof NodeStyle, title: string, unit = 'px', step = 1, min = 0, max?: number) =>
    <NumberProperty key={name} {...{name,title,value:style[name],onChange:setStyle,unit,step,min,max}}/>
  return <>
    <div className="st-property-section"><h3>Адаптив <span>{breakpoint}</span></h3><p className="st-hint">{breakpoint === 'desktop' ? 'Базовые значения. Изменения сохраняют пропорции других экранов, если не заданы отдельные правила.' : 'Пустое значение наследуется из большего брейкпоинта. Переопределение действует только здесь.'}</p></div>
    <Section heading="Размеры">{number('widthPercent', 'Ширина', '%', 1, 5, 100)}{number('maxWidth', 'Максимальная ширина')}{number('height', 'Высота')}{number('minHeight', 'Мин. высота')}{number('aspectRatio', 'Соотношение', '×', 0.05, 0.1, 5)}</Section>
    <Section heading="Раскладка">
      <ChoiceProperty name="display" title="Режим" value={style.display} onChange={setStyle} items={options.display}/>
      {style.display === 'flex' && <>
        <ChoiceProperty name="flexDirection" title="Направление" value={style.flexDirection} onChange={setStyle} items={options.flexDirection}/>
        <ChoiceProperty name="justifyContent" title="Распределение" value={style.justifyContent} onChange={setStyle} items={options.justifyContent}/>
        <ChoiceProperty name="alignItems" title="Выравнивание" value={style.alignItems} onChange={setStyle} items={options.alignItems}/>
      </>}
      {style.display === 'grid' && number('gridColumns', 'Колонки', 'кол.', 1, 1, 12)}
      {number('gap', 'Интервал')}
      <ChoiceProperty name="overflow" title="Обрезка" value={style.overflow} onChange={setStyle} items={options.overflow}/>
    </Section>
    <Section heading="Внутренние отступы">{number('paddingTop','Внутренний сверху')}{number('paddingRight','Внутренний справа')}{number('paddingBottom','Внутренний снизу')}{number('paddingLeft','Внутренний слева')}</Section>
    <Section heading="Внешние отступы">{number('marginTop','Внешний сверху','px',1,-800,600)}{number('marginBottom','Внешний снизу','px',1,-800,600)}</Section>
    <Section heading="Типографика">{number('fontSize','Размер текста')}{number('lineHeight','Высота строки','×',0.05,0.75,3)}{number('fontWeight','Насыщенность','',100,100,900)}{number('letterSpacing','Трекинг','px',0.1,-10,30)}<ChoiceProperty name="textAlign" title="Выравнивание" value={style.textAlign} onChange={setStyle} items={options.textAlign}/></Section>
    <Section heading="Оформление">{number('borderRadius','Радиус')}<ChoiceProperty name="shadow" title="Тень" value={style.shadow} onChange={setStyle} items={options.shadow}/>
      {(['backgroundColor','color'] as const).map(key => <label className="st-property" key={key}><span>{key === 'color' ? 'Текст' : 'Фон'}</span><div className="st-color-field">
        <input type="color" aria-label={key} value={/^#[a-f0-9]{6}$/i.test(String(style[key])) ? String(style[key]) : '#ffffff'} onChange={event => setStyle(key, event.target.value)}/>
        <input aria-label={key + ' hex'} placeholder="Auto" value={style[key] || ''} onChange={event => setStyle(key, event.target.value)}/>
      </div></label>)}
    </Section>
    <Section heading="Видимость"><label className="st-check"><input type="checkbox" checked={style.hidden === true} onChange={event => setStyle('hidden',event.target.checked)}/>Скрыть на этом размере</label></Section>
    <button type="button" className="st-secondary st-full" onClick={resetStyle}>Сбросить настройки этого адаптива</button>
  </>
}
export function MotionControls({ style, setStyle, available }: { style: NodeStyle; setStyle: SetStyle; available: boolean }) {
  if (!available) return <div className="st-property-section"><p className="st-hint">Выберите секцию или текстовый слой. Анимацию настраивают для выбранного элемента.</p></div>
  const variants: Array<[MotionType | '', string]> = [['', 'Как в шаблоне'], ['none', 'Без анимации'], ['fade', 'Проявление'], ['rise', 'Появление снизу'], ['scale', 'Масштабирование'], ['parallax', 'Параллакс']]
  return <div className="st-motion-panel">
    <div className="st-property-section"><h3>Появление при прокрутке</h3><p className="st-hint">Анимация сохраняется в CMS и воспроизводится на опубликованном сайте. Включите предпросмотр, чтобы проверить движение.</p></div>
    <label className="st-field"><span>Сценарий</span><select aria-label="Анимация слоя" value={style.motion || ''} onChange={event => setStyle('motion', event.target.value)}>{variants.map(([key,label]) => <option value={key} key={key}>{label}</option>)}</select></label>
    {!!style.motion && !['none'].includes(style.motion) && <>
      <NumberProperty name="motionDuration" title="Длительность" value={style.motionDuration} onChange={setStyle} unit="с" step={0.05} min={0.15} max={6}/>
      <NumberProperty name="motionDelay" title="Задержка" value={style.motionDelay} onChange={setStyle} unit="с" step={0.05} max={5}/>
      {['rise','parallax'].includes(style.motion) && <NumberProperty name="motionDistance" title="Смещение" value={style.motionDistance} onChange={setStyle} max={180}/>}
    </>}
    <p className="st-hint st-motion-note">Настройка «Без анимации» отключает стандартные появления внутри секции. При системной настройке «Уменьшение движения» анимация не запускается.</p>
  </div>
}
