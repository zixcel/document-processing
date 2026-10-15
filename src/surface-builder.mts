import type { SurfaceNode, SurfaceNodeKind, SurfaceRelation, SurfaceSpan } from './types.mjs'
import { STRUCTURED_SURFACE_LIMITS as limits } from './limits.mjs'

type Options = Partial<Pick<SurfaceNode, 'value' | 'valueType' | 'label' | 'traits' | 'attributes' | 'span'>>
function endOf(value: string, start: number, maximum: number): number {
  let end = Math.min(value.length, start + maximum)
  if (end < value.length && end > start && /[\uD800-\uDBFF]/u.test(value[end - 1]!) && /[\uDC00-\uDFFF]/u.test(value[end]!)) end--
  return end
}
export function boundedSource(source: string): string {
  return source.slice(0, endOf(source, 0, limits.inputCharacters))
}

/** Share bounded node construction across independently distributed format adapters. */
export class SurfaceBuilder {
  readonly nodes: SurfaceNode[]
  readonly relations: SurfaceRelation[] = []
  truncated = false
  private sequence = 0
  private tails = new Map<string, string>()
  constructor(document: SurfaceNode, private readonly prefix: string, private readonly initialId?: string) { this.nodes = [document] }

  add(parent: string, kind: SurfaceNodeKind, formatName: string, options: Options = {}, exactTextSpan = false): string | null {
    if (kind !== 'text' && (options.value?.length ?? 0) > limits.valueCharacters) {
      this.truncated = true
      return null
    }
    const value = options.value
    let start = 0
    let first: string | null = null
    let previous: string | null = null
    do {
      const end = value === undefined ? 0 : endOf(value, start, limits.valueCharacters)
      const required = previous ? 2 : 1
      if (this.nodes.length >= limits.nodes || this.relations.length + required > limits.relations) {
        this.truncated = true
        break
      }
      const sequence = this.sequence++
      const id = sequence === 0 && this.initialId ? this.initialId : `${this.prefix}-${sequence}`
      const span: SurfaceSpan | undefined = exactTextSpan && options.span
        ? { start: options.span.start + start, end: options.span.start + end } : options.span
      const traits = [...new Set([...(options.traits ?? []), ...(previous ? ['text-continuation'] : [])])]
      this.nodes.push({ id, kind, formatName, traits, attributes: options.attributes ?? {},
        ...(value === undefined ? {} : { value: value.slice(start, end) }),
        ...(options.valueType ? { valueType: options.valueType } : {}),
        ...(options.label ? { label: options.label } : {}), ...(span ? { span } : {}) })
      this.relations.push({ source: parent, target: id, kind: 'contains' })
      if (previous) this.relations.push({ source: previous, target: id, kind: 'follows' })
      first ??= id
      previous = id
      start = end
    } while (value !== undefined && start < value.length)
    if (first && previous) this.tails.set(first, previous)
    return first
  }

  follow(previous: string, current: string): void {
    if (this.relations.length >= limits.relations) { this.truncated = true; return }
    this.relations.push({ source: this.tails.get(previous) ?? previous, target: current, kind: 'follows' })
  }
}
