import {
  IdentityClient,
  type DisplayableIdentity,
  type ResolveByAttributesOptions,
  type ResolveByIdentityKeyOptions
} from '@bsv/sdk'
import { createWalletClient } from '../wallet'

export const SAVED_CONTACTS_WARNING =
  'Saved contacts are unavailable. Results may exclude saved contacts.'

export const PUBLIC_LOOKUP_FAILURE =
  'Identity lookup failed. Check wallet access and try again.'

export const EXAMPLE_USER_NAME = 'deggen'
export const EXAMPLE_IDENTITY_KEY =
  '0240c42181068275a4f996ee570ed7c7a97c30003b174461bca5bad882fc06143f'

type ResolutionOptions = ResolveByAttributesOptions & ResolveByIdentityKeyOptions
type IdentityResolver = Pick<IdentityClient, 'resolveByAttributes' | 'resolveByIdentityKey'>

/**
 * Contacts lookups are optional and off by default. Opt in with useContacts.
 * fallback continues public discovery when Contacts fail. contactTimeoutMs
 * bounds only that wait (2 seconds here); it does not cancel a wallet request
 * or dismiss a permission prompt. onContactError marks a partial result.
 */
export function identityResolutionOptions(onPartial: () => void): ResolutionOptions {
  return {
    useContacts: true,
    contactErrorMode: 'fallback',
    contactTimeoutMs: 2000,
    onContactError() {
      onPartial()
    }
  }
}

type LookupOutcome =
  | { status: 'ok'; identities: DisplayableIdentity[]; partial: boolean }
  | { status: 'failed' }
  | { status: 'superseded' }

/**
 * One search UI keeps this session. Only complete results are cached.
 * start() and retry() supersede older queries so a late response cannot
 * replace a newer query, selection, or retry.
 */
export class IdentitySearchSession {
  #generation = 0
  #cache = new Map<string, DisplayableIdentity[]>()

  start(): number {
    this.#generation += 1
    return this.#generation
  }

  isCurrent(generation: number): boolean {
    return generation === this.#generation
  }

  cached(key: string): DisplayableIdentity[] | undefined {
    return this.#cache.get(key)
  }

  remember(key: string, generation: number, identities: DisplayableIdentity[], partial: boolean): boolean {
    if (!this.isCurrent(generation) || partial) return false
    this.#cache.set(key, identities)
    return true
  }

  retry(key: string): number {
    this.#cache.delete(key)
    return this.start()
  }

  clear(): void {
    this.#cache.clear()
    this.#generation += 1
  }
}

export const identitySearch = new IdentitySearchSession()

async function runLookup(
  cacheKey: string,
  generation: number,
  lookup: (options: ResolutionOptions) => Promise<DisplayableIdentity[]>
): Promise<LookupOutcome> {
  let partial = false
  try {
    const identities = await lookup(identityResolutionOptions(() => {
      partial = true
    }))
    if (!identitySearch.isCurrent(generation)) return { status: 'superseded' }
    identitySearch.remember(cacheKey, generation, identities, partial)
    return { status: 'ok', identities, partial }
  } catch {
    if (!identitySearch.isCurrent(generation)) return { status: 'superseded' }
    return { status: 'failed' }
  }
}

function settleLookup(
  runner: { log: (...args: unknown[]) => void },
  outcome: LookupOutcome
) {
  if (outcome.status === 'superseded') return
  // A public failure is not an empty result. Do not cache it or invent an identity.
  if (outcome.status === 'failed') throw new Error(PUBLIC_LOOKUP_FAILURE)
  if (outcome.partial) runner.log(SAVED_CONTACTS_WARNING)
  return runner.log(outcome.identities[0])
}

async function searchIdentity(
  runner: { log: (...args: unknown[]) => void },
  cacheKey: string,
  lookup: (options: ResolutionOptions) => Promise<DisplayableIdentity[]>
) {
  const generation = identitySearch.start()
  const cached = identitySearch.cached(cacheKey)
  if (cached) return runner.log(cached[0])
  return settleLookup(runner, await runLookup(cacheKey, generation, lookup))
}

/** Repeat the same query after a public lookup failure. Drops any stored answer and supersedes the failed query. */
export async function retryIdentityLookup(
  runner: { log: (...args: unknown[]) => void },
  cacheKey: string,
  lookup: (options: ResolutionOptions) => Promise<DisplayableIdentity[]>
) {
  const generation = identitySearch.retry(cacheKey)
  return settleLookup(runner, await runLookup(cacheKey, generation, lookup))
}

function attributesLookup(client: IdentityResolver) {
  return (options: ResolutionOptions) => client.resolveByAttributes({
    attributes: { userName: EXAMPLE_USER_NAME }
  }, options)
}

function identityKeyLookup(client: IdentityResolver) {
  return (options: ResolutionOptions) => client.resolveByIdentityKey({
    identityKey: EXAMPLE_IDENTITY_KEY
  }, options)
}

export async function resolveIdentityKey(
  runner,
  client: IdentityResolver = new IdentityClient(createWalletClient())
) {
  return searchIdentity(runner, `attributes:${EXAMPLE_USER_NAME}`, attributesLookup(client))
}

export async function retryResolveIdentityKey(
  runner,
  client: IdentityResolver = new IdentityClient(createWalletClient())
) {
  return retryIdentityLookup(runner, `attributes:${EXAMPLE_USER_NAME}`, attributesLookup(client))
}

export async function resolveKnownIdentityKey(
  runner,
  client: IdentityResolver = new IdentityClient(createWalletClient())
) {
  return searchIdentity(runner, `key:${EXAMPLE_IDENTITY_KEY}`, identityKeyLookup(client))
}

export async function retryResolveKnownIdentityKey(
  runner,
  client: IdentityResolver = new IdentityClient(createWalletClient())
) {
  return retryIdentityLookup(runner, `key:${EXAMPLE_IDENTITY_KEY}`, identityKeyLookup(client))
}
