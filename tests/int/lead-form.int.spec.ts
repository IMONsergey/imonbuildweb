import { createElement } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LeadForm } from '@/components/Interactive'

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })
function setup() {
  const view = render(createElement(LeadForm))
  fireEvent.change(screen.getByLabelText(/Как к вам обращаться/), { target: { value: 'Test Person' } })
  fireEvent.change(screen.getByLabelText(/Почта для связи/), { target: { value: 'test@example.invalid' } })
  fireEvent.change(screen.getByLabelText(/Коротко о задаче/), { target: { value: 'Synthetic test inquiry.' } })
  fireEvent.click(screen.getByRole('checkbox'))
  return view.container.querySelector('form')!
}
const success = (options: RequestInit) => {
  const data = JSON.parse(options.body as string)
  return Response.json({ ok: true, receipt: data.submissionId, duplicate: false }, { status: 201 })
}
describe('lead form retry behavior', () => {
  it('keeps the same id and values after a lost response, then clears only on confirmation', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('Lost response')).mockImplementationOnce((_url, options) => success(options))
    vi.stubGlobal('fetch', fetcher)
    const form = setup(); fireEvent.submit(form)
    await screen.findByRole('alert')
    expect((screen.getByLabelText(/Почта для связи/) as HTMLInputElement).value).toBe('test@example.invalid')
    fireEvent.submit(form)
    await screen.findByText('Заявка получена. Свяжемся с вами.')
    const bodies = fetcher.mock.calls.map(([, o]) => JSON.parse(o.body))
    expect(bodies[0].submissionId).toBe(bodies[1].submissionId)
    expect((screen.getByLabelText(/Почта для связи/) as HTMLInputElement).value).toBe('')
  })
  it('does not treat an arbitrary 200 response as confirmation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({})))
    fireEvent.submit(setup()); await screen.findByRole('alert')
    expect(screen.queryByText('Заявка получена. Свяжемся с вами.')).toBeNull()
  })
  it('uses a new id after the user edits a failed inquiry', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('offline')); vi.stubGlobal('fetch', fetcher)
    const form = setup(); fireEvent.submit(form); await screen.findByRole('alert')
    fireEvent.change(screen.getByLabelText(/Коротко о задаче/), { target: { value: 'Changed inquiry content.' } })
    fireEvent.submit(form)
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    expect(JSON.parse(fetcher.mock.calls[0][1].body).submissionId).not.toBe(JSON.parse(fetcher.mock.calls[1][1].body).submissionId)
    await screen.findByRole('alert')
  })
  it('blocks double submission and editing while awaiting a receipt', async () => {
    let finish!: (value: Response) => void
    let options!: RequestInit
    const fetcher = vi.fn((_url, o) => { options = o; return new Promise<Response>(resolve => { finish = resolve }) })
    vi.stubGlobal('fetch', fetcher)
    const form = setup()
    act(() => { fireEvent.submit(form); fireEvent.submit(form) })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect((screen.getByLabelText(/Коротко о задаче/) as HTMLTextAreaElement).disabled).toBe(true)
    await act(async () => { finish(success(options)) })
    await screen.findByText('Заявка получена. Свяжемся с вами.')
  })
})
