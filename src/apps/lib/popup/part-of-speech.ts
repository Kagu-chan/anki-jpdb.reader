export const PARTS_OF_SPEECH: Record<string, string> = {
  n: 'Noun',
  pn: 'Pronoun',
  pref: 'Prefix',
  suf: 'Suffix',
  // 'n-adv': '', // Not used in jpdb: n + adv instead. JMDict: "adverbial noun (fukushitekimeishi)"
  // 'n-pr': '', // Not used in jpdb: name instead. JMDict: "proper noun"
  // 'n-pref': '', // Not used in jpdb: n + pref instead. JMDict: "noun, used as a prefix"
  // 'n-suf': '', // Not used in jpdb: n + suf instead. JMDict: "noun, used as a suffix"
  // 'n-t': '', // Not used in jpdb: n instead. JMDict: "noun (temporal) (jisoumeishi)"
  // 'n-pr': '', // JMDict: "proper noun"
  name: 'Name',
  'name-fem': 'Name (Feminine)',
  'name-male': 'Name (Masculine)',
  'name-surname': 'Surname',
  'name-person': 'Personal Name',
  'name-place': 'Place Name',
  'name-company': 'Company Name',
  'name-product': 'Product Name',
  'adj-i': 'Adjective',
  'adj-na': 'な-Adjective',
  'adj-no': 'の-Adjective',
  'adj-pn': 'Adjectival',
  'adj-nari': 'なり-Adjective (Archaic/Formal)',
  'adj-ku': 'く-Adjective (Archaic)',
  'adj-shiku': 'しく-Adjective (Archaic)',
  // 'adj-ix': 'Adjective (いい/よい irregular)', // Not used in jpdb, adj-i instead. JMDict: "adjective (keiyoushi) - yoi/ii class"
  // 'adj-f': '', // Not used in jpdb. JMDict: "noun or verb acting prenominally"
  // 'adj-t': '', // Not used in jpdb. JMDict: "'taru' adjective"
  // 'adj-kari': '', // Not used in jpdb. JMDict: "'kari' adjective (archaic)"
  adv: 'Adverb',
  // 'adv-to': '', // Not used in jpdb: adv instead. JMDict: "adverb taking the `to' particle"
  aux: 'Auxiliary',
  'aux-v': 'Auxiliary Verb',
  'aux-adj': 'Auxiliary Adjective',
  conj: 'Conjunction',
  cop: 'Copula',
  ctr: 'Counter',
  exp: 'Expression',
  int: 'Interjection',
  num: 'Numeric',
  prt: 'Particle',
  // 'cop-da': '',  // Not used in jpdb: cop instead. JMDict: "copula"
  vt: 'Transitive Verb',
  vi: 'Intransitive Verb',
  v1: 'Ichidan Verb',
  'v1-s': 'Ichidan Verb (くれる Irregular)',
  v5: 'Godan Verb',
  v5u: 'う Godan Verb',
  'v5u-s': 'う Godan Verb (Irregular)',
  v5k: 'く Godan Verb',
  'v5k-s': 'く Godan Verb (いく/ゆく Irregular)',
  v5g: 'ぐ Godan Verb',
  v5s: 'す Godan Verb',
  v5t: 'つ Godan Verb',
  v5n: 'ぬ Godan Verb',
  v5b: 'ぶ Godan Verb',
  v5m: 'む Godan Verb',
  v5r: 'る Godan Verb',
  'v5r-i': 'る Godan Verb (Irregular)',
  v5aru: 'る Godan Verb (-ある Irregular)',
  // 'v5uru': '', // JMDict: "Godan verb - Uru old class verb (old form of Eru)"
  vk: 'Irregular Verb (くる)',
  // vn: '', // Not used in jpdb. JMDict: "irregular nu verb"
  // vr: '', // Not used in jpdb. JMDict: "irregular ru verb, plain form ends with -ri"
  vs: 'する Verb',
  vz: 'ずる Verb',
  'vs-c': 'す Verb (Archaic)',
  // 'vs-s': '', // Not used in jpdb. JMDict: "suru verb - special class"
  // 'vs-i': '', // JMDict: "suru verb - included"
  // iv: '',  // Not used in jpdb. JMDict: "irregular verb"
  // 'v-unspec': '', // Not used in jpdb. JMDIct: "verb unspecified"
  v2: 'Nidan Verb (Archaic)',
  // 'v2a-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb with 'u' ending (archaic)"
  // 'v2b-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'bu' ending (archaic)"
  // 'v2b-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'bu' ending (archaic)"
  // 'v2d-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'dzu' ending (archaic)"
  // 'v2d-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'dzu' ending (archaic)"
  // 'v2g-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'gu' ending (archaic)"
  // 'v2g-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'gu' ending (archaic)"
  // 'v2h-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'hu/fu' ending (archaic)"
  // 'v2h-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'hu/fu' ending (archaic)"
  // 'v2k-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'ku' ending (archaic)"
  // 'v2k-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'ku' ending (archaic)"
  // 'v2m-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'mu' ending (archaic)"
  // 'v2m-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'mu' ending (archaic)"
  // 'v2n-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'nu' ending (archaic)"
  // 'v2r-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'ru' ending (archaic)"
  // 'v2r-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'ru' ending (archaic)"
  // 'v2s-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'su' ending (archaic)"
  // 'v2t-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'tsu' ending (archaic)"
  // 'v2t-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'tsu' ending (archaic)"
  // 'v2w-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'u' ending and 'we' conjugation (archaic)"
  // 'v2y-k': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (upper class) with 'yu' ending (archaic)"
  // 'v2y-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'yu' ending (archaic)"
  // 'v2z-s': '', // Not used in jpdb: v2 instead. JMDict: "Nidan verb (lower class) with 'zu' ending (archaic)"
  v4: 'Yodan Verb (Archaic)',
  v4k: '',
  v4g: '',
  v4s: '',
  v4t: '',
  v4h: '',
  v4b: '',
  v4m: '',
  v4r: '',
  // v4n: '', // Not used in jpdb. JMDict: "Yodan verb with 'nu' ending (archaic)"
  va: 'Archaic', // Not from JMDict? TODO Don't understand this one, seems identical to #v4n ?
  // 'unc': '', // Not used in jpdb: empty list instead. JMDict: "unclassified"
};
