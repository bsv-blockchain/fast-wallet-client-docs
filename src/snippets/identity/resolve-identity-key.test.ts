import type { DisplayableIdentity, ResolveByAttributesOptions, ResolveByIdentityKeyOptions } from '@bsv/sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  EXAMPLE_IDENTITY_KEY,
  EXAMPLE_USER_NAME,
  identityResolutionOptions,
  identitySearch,
  PUBLIC_LOOKUP_FAILURE,
  resolveIdentityKey,
  resolveKnownIdentityKey,
  retryResolveIdentityKey,
  retryResolveKnownIdentityKey,
  SAVED_CONTACTS_WARNING
} from './resolve-identity-key'

const identity: DisplayableIdentity = {
  name: 'deggen',
  avatarURL: 'avatar',
  abbreviatedKey: '0240…',
  identityKey: EXAMPLE_IDENTITY_KEY,
  badgeIconURL: 'badge',
  badgeLabel: 'X',
  badgeClickURL: 'https://example.invalid'
}

function runner() {
  return { log: vi.fn() }
}

beforeEach(() => {
  identitySearch.clear()
})

describe('identity resolution options', () => {
  it('opts into Contacts with a 2s fallback deadline and a fixed partial warning', () => {
    let partial = false
    const options = identityResolutionOptions(() => {
      partial = true
    })
    expect(options).toMatchObject({
      useContacts: true,
      contactErrorMode: 'fallback',
      contactTimeoutMs: 2000
    })
    options.onContactError?.(new Error('secret contact basket details'))
    expect(partial).toBe(true)
    expect(SAVED_CONTACTS_WARNING).toBe('Saved contacts are unavailable. Results may exclude saved contacts.')
    expect(SAVED_CONTACTS_WARNING).not.toContain('secret')
  })
})

describe('identity search session', () => {
  it('caches complete results and ignores partial or superseded answers', () => {
    const first = identitySearch.start()
    const second = identitySearch.start()
    expect(identitySearch.remember('attributes:deggen', first, [identity], false)).toBe(false)
    expect(identitySearch.cached('attributes:deggen')).toBeUndefined()
    expect(identitySearch.remember('attributes:deggen', second, [identity], true)).toBe(false)
    expect(identitySearch.cached('attributes:deggen')).toBeUndefined()
    expect(identitySearch.remember('attributes:deggen', second, [identity], false)).toBe(true)
    expect(identitySearch.cached('attributes:deggen')).toEqual([identity])
    const retried = identitySearch.retry('attributes:deggen')
    expect(identitySearch.cached('attributes:deggen')).toBeUndefined()
    expect(identitySearch.isCurrent(second)).toBe(false)
    expect(identitySearch.isCurrent(retried)).toBe(true)
  })
})

describe('IdentityClient recovery snippets', () => {
  it('resolves attributes with useContacts and caches a complete result', async () => {
    const resolveByAttributes = vi.fn(async (_args: { attributes: { userName: string } }, _options?: ResolveByAttributesOptions | boolean) => [identity])
    const resolveByIdentityKey = vi.fn()
    const log = runner()
    await resolveIdentityKey(log, { resolveByAttributes, resolveByIdentityKey })
    expect(resolveByAttributes).toHaveBeenCalledTimes(1)
    expect(resolveByAttributes.mock.calls[0][0]).toEqual({ attributes: { userName: EXAMPLE_USER_NAME } })
    expect(resolveByAttributes.mock.calls[0][1]).toMatchObject({
      useContacts: true,
      contactErrorMode: 'fallback',
      contactTimeoutMs: 2000
    })
    expect(log.log).toHaveBeenCalledWith(identity)
    expect(identitySearch.cached(`attributes:${EXAMPLE_USER_NAME}`)).toEqual([identity])

    log.log.mockClear()
    await resolveIdentityKey(log, { resolveByAttributes, resolveByIdentityKey })
    expect(resolveByAttributes).toHaveBeenCalledTimes(1)
    expect(log.log).toHaveBeenCalledWith(identity)
  })

  it('warns on a partial Contacts result and does not cache it', async () => {
    const resolveByAttributes = vi.fn(async (_args, options) => {
      options.onContactError?.(new Error('contacts timed out: secret'))
      return [identity]
    })
    const log = runner()
    await resolveIdentityKey(log, { resolveByAttributes, resolveByIdentityKey: vi.fn() })
    expect(log.log).toHaveBeenCalledWith(SAVED_CONTACTS_WARNING)
    expect(log.log).toHaveBeenCalledWith(identity)
    expect(log.log.mock.calls.flat().join(' ')).not.toContain('secret')
    expect(identitySearch.cached(`attributes:${EXAMPLE_USER_NAME}`)).toBeUndefined()
  })

  it('retries a public attribute lookup failure and leaves a failed retry uncached', async () => {
    const resolveByAttributes = vi.fn()
      .mockRejectedValueOnce(new Error('wallet transport secret'))
      .mockResolvedValueOnce([identity])
    const client = { resolveByAttributes, resolveByIdentityKey: vi.fn() }
    const log = runner()
    await expect(resolveIdentityKey(log, client)).rejects.toThrow(PUBLIC_LOOKUP_FAILURE)
    expect(identitySearch.cached(`attributes:${EXAMPLE_USER_NAME}`)).toBeUndefined()
    expect(log.log.mock.calls.flat().join(' ')).not.toContain('secret')

    await retryResolveIdentityKey(log, client)
    expect(resolveByAttributes).toHaveBeenCalledTimes(2)
    expect(resolveByAttributes.mock.calls[1][0]).toEqual(resolveByAttributes.mock.calls[0][0])
    expect(resolveByAttributes.mock.calls[1][1]).toMatchObject({ useContacts: true, contactTimeoutMs: 2000 })
    expect(identitySearch.cached(`attributes:${EXAMPLE_USER_NAME}`)).toEqual([identity])

    identitySearch.clear()
    resolveByAttributes.mockReset()
    resolveByAttributes.mockRejectedValue(new Error('still down'))
    await expect(resolveIdentityKey(log, client)).rejects.toThrow(PUBLIC_LOOKUP_FAILURE)
    await expect(retryResolveIdentityKey(log, client)).rejects.toThrow(PUBLIC_LOOKUP_FAILURE)
    expect(identitySearch.cached(`attributes:${EXAMPLE_USER_NAME}`)).toBeUndefined()
  })

  it('resolves an identity key with the same recovery options', async () => {
    const resolveByIdentityKey = vi.fn(async (_args: { identityKey: string }, _options?: ResolveByIdentityKeyOptions | boolean) => [identity])
    const log = runner()
    await resolveKnownIdentityKey(log, { resolveByAttributes: vi.fn(), resolveByIdentityKey })
    expect(resolveByIdentityKey.mock.calls[0][0]).toEqual({ identityKey: EXAMPLE_IDENTITY_KEY })
    expect(resolveByIdentityKey.mock.calls[0][1]).toMatchObject({ useContacts: true, contactTimeoutMs: 2000 })
    expect(identitySearch.cached(`key:${EXAMPLE_IDENTITY_KEY}`)).toEqual([identity])

    resolveByIdentityKey.mockRejectedValueOnce(new Error('overlay down'))
    identitySearch.clear()
    const failing = { resolveByAttributes: vi.fn(), resolveByIdentityKey }
    await expect(resolveKnownIdentityKey(log, failing)).rejects.toThrow(PUBLIC_LOOKUP_FAILURE)
    resolveByIdentityKey.mockResolvedValueOnce([identity])
    await retryResolveKnownIdentityKey(log, failing)
    expect(identitySearch.cached(`key:${EXAMPLE_IDENTITY_KEY}`)).toEqual([identity])
  })

  it('ignores a late response superseded by a newer query', async () => {
    let release: (value: DisplayableIdentity[]) => void = () => {}
    const resolveByAttributes = vi.fn(() => new Promise<DisplayableIdentity[]>(resolve => {
      release = resolve
    }))
    const log = runner()
    const pending = resolveIdentityKey(log, { resolveByAttributes, resolveByIdentityKey: vi.fn() })
    await vi.waitFor(() => expect(resolveByAttributes).toHaveBeenCalledTimes(1))
    identitySearch.start()
    release([identity])
    await pending
    expect(log.log).not.toHaveBeenCalled()
    expect(identitySearch.cached(`attributes:${EXAMPLE_USER_NAME}`)).toBeUndefined()
  })
})
