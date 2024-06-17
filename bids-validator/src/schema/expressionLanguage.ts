function exists(list: string[], rule: string = 'dataset'): number {
  if (list == null) {
    return 0
  }

  const prefix: string[] = []

  // Stimuli and subject-relative paths get prefixes
  if (rule == 'stimuli') {
    prefix.push('stimuli')
  } else if (rule == 'subject') {
    // @ts-expect-error
    prefix.push('sub-' + this.entities.sub)
  }

  if (!Array.isArray(list)) {
    list = [list]
  }
  if (rule == 'bids-uri') {
    return list.filter((x) => {
      // XXX To implement
      if (x.startsWith('bids:')) {
        return true
      }
      return false
    }).length
  } else {
    // dataset, subject and stimuli
    return list.filter((x) => {
      const parts = prefix.concat(x.split('/'))
      // @ts-expect-error
      return this.fileTree.contains(parts)
    }).length
  }
}

export const expressionFunctions = {
  index: <T>(list: T[], item: T): number | null => {
    const index = list.indexOf(item)
    return index != -1 ? index : null
  },
  intersects: <T>(a: T[], b: T[]): boolean => {
    if (!Array.isArray(a)) {
      a = [a]
    }
    if (!Array.isArray(b)) {
      b = [b]
    }
    return a.some((x) => b.includes(x))
  },
  match: (target: string, regex: string): boolean => {
    let re = RegExp(regex)
    return target.match(re) !== null
  },
  type: <T>(operand: T): string => {
    if (Array.isArray(operand)) {
      return 'array'
    }
    if (typeof operand === 'undefined' || operand === null) {
      return 'null'
    }
    return typeof operand
  },
  min: (list: number[]): number | null => {
    return list != null
      ? Math.min(...list.filter((x) => typeof x === 'number'))
      : null
  },
  max: (list: number[]): number | null => {
    return list != null
      ? Math.max(...list.filter((x) => typeof x === 'number'))
      : null
  },
  length: <T>(list: T[]): number | null => {
    if (Array.isArray(list) || typeof list == 'string') {
      return list.length
    }
    return null
  },
  count: <T>(list: T[], val: T): number => {
    return list.filter((x) => x === val).length
  },
  exists: exists,
  substr: (arg: string, start: number, end: number): string | null => {
    if (arg == null || start == null || end == null) {
      return null
    }
    return arg.substr(start, end - start)
  },
  sorted: <T>(list: T[]): T[] => {
    // Use a cmp function that will work for any comparable types
    return list.toSorted((a, b) => +(a > b) - +(a < b))
  },
  allequal: <T>(a: T[], b: T[]): boolean => {
    return (a != null && b != null) && a.length === b.length && a.every((v, i) => v === b[i])
  },
}
