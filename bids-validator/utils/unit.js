const roots = [
  'metre',
  'm',
  'kilogram',
  'kg',
  'second',
  's',
  'ampere',
  'A',
  'kelvin',
  'K',
  'mole',
  'mol',
  'candela',
  'cd',
  'radian',
  'rad',
  'steradian',
  'sr',
  'hertz',
  'Hz',
  'newton',
  'N',
  'pascal',
  'Pa',
  'joule',
  'J',
  'watt',
  'W',
  'coulomb',
  'C',
  'volt',
  'V',
  'farad',
  'F',
  'ohm',
  'Ω',
  'siemens',
  'S',
  'weber',
  'Wb',
  'tesla',
  'T',
  'henry',
  'H',
  'degree',
  'Celsius',
  '°C',
  'lumen',
  'lm',
  'lux',
  'lx',
  'becquerel',
  'Bq',
  'gray',
  'Gy',
  'sievert',
  'Sv',
  'katal',
  'kat',
]
const prefixes = [
  // multiples
  'deca',
  'da',
  'hecto',
  'h',
  'kilo',
  'k',
  'mega',
  'M',
  'giga',
  'G',
  'tera',
  'T',
  'peta',
  'P',
  'exa',
  'E',
  'zetta',
  'Z',
  'yotta',
  'Y',
  // sub-multiples
  'deci',
  'd',
  'centi',
  'c',
  'milli',
  'm',
  'micro',
  'µ',
  'nano',
  'n',
  'pico',
  'p',
  'femto',
  'f',
  'atto',
  'a',
  'zepto',
  'z',
  'yocto',
  'y',
]
const unitOperators = ['/', '*', '⋅']
const exponentOperator = '^'
const operators = [...unitOperators, exponentOperator]

// from 0-9
const superscriptNumbers = [
  '\u2070',
  '\u00B9',
  '\u00B2',
  '\u00B3',
  '\u2074',
  '\u2075',
  '\u2076',
  '\u2077',
  '\u2078',
  '\u2079',
]
const superscriptNegative = '\u207B'

const start = '^'
const end = '$'
const prefix = `(${prefixes.join('|')})?`
const root = `(${roots.join('|')})`
const superscriptExp = `(${superscriptNegative}?[${superscriptNumbers}]+)?`
const operatorExp = `(\\^-?[0-9]+)?`
const unitWithExponentPattern = new RegExp(
  `${start}${prefix}${root}(${superscriptExp}|${operatorExp})${end}`,
)

const unitOperatorPattern = new RegExp(`[${unitOperators.join('')}]`)

const isUnavailable = (unit) => unit.trim().toLowerCase() === 'n/a'
const isPercent = (unit) => unit.trim() === '%'

/* Validate currently not used, out of line with specification:
 * https://github.com/bids-standard/bids-specification/pull/411
 * Once updated to use cmixf uncomment section in tsv validator that
 * calls this function, remove this comment, and uncomment test in tests/tsv.spec.js
 */
/**
 * validate
 *
 * Checks that the SI unit given is valid.
 * Whitespace characters are not supported.
 * Unit must include at least one root unit of measuremnt.
 * Multiple root units must be separated by one of the operators '/' (division) or '*' (multiplication).
 * Each root unit may or may not pre preceded by a multiplier prefix,
 *   and may or may not be followed by an exponent.
 * Exponents may only be to integer powers,
 *   and may be formatted as either unicode superscript numbers,
 *   or as integers following the '^' operator.
 *
 * @param {string} derivedUnit - a simple or complex SI unit
 * @returns {object} - { isValid, evidence }
 */
const validate = (derivedUnit) => {
  if (isUnavailable(derivedUnit) || isPercent(derivedUnit)) {
    return { isValid: true, evidence: '' }
  } else {
    const separatedUnits = derivedUnit
      .split(unitOperatorPattern)
      .map((str) => str.trim())
    const invalidUnits = separatedUnits.filter(
      (unit) => !unitWithExponentPattern.test(unit),
    )

    const isValid = invalidUnits.length === 0
    const evidence = isValid
      ? ''
      : `Subunit${invalidUnits.length === 1 ? '' : 's'} (${invalidUnits.join(
          ', ',
        )}) of unit ${derivedUnit} is invalid. `

    return { isValid, evidence }
  }
}

export { roots, prefixes, superscriptNumbers, operators, validate }
export default {
  roots,
  prefixes,
  superscriptNumbers,
  operators,
  validate,
}
