import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
import { revalidatePath } from 'next/cache'
import { Media } from '../../src/collections/Media'

beforeEach(() => vi.clearAllMocks())

describe('Replacing media in the CMS', () => {
  it('invalidates pages after file/alt updates and deletion', async () => {
    for (const event of ['afterChange', 'afterDelete'] as const) {
      const hook = Media.hooks![event]![0]
      await hook({ doc: { id: 1 }, req: { context: {} } } as never)
    }
    expect(revalidatePath).toHaveBeenCalledTimes(2)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('keeps standalone CLI imports safe with disableRevalidate', async () => {
    for (const event of ['afterChange', 'afterDelete'] as const) {
      await Media.hooks![event]![0]({
        doc: { id: 1 },
        req: { context: { disableRevalidate: true } },
      } as never)
    }
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
