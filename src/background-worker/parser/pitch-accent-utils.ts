const smallSyllables = ['ゃ', 'ゅ', 'ょ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ッ', 'ャ', 'ュ', 'ョ'];

const adjustForSmallSyllables = (reading: string, first: string, parts: string[]): void => {
  if (reading.length > 1 && smallSyllables.includes(reading.charAt(1))) {
    if (first === parts[0]) {
      parts.shift();
    }
  }
};

const countRises = (pitch: string): number => pitch.match(/LH/g)?.length ?? 0;
const countDrops = (pitch: string): number => pitch.match(/HL/g)?.length ?? 0;

const determinePitchClass = (
  startsHigh: boolean,
  drops: number,
  parts: string[],
  startsLow: boolean,
  endsLow: boolean,
  rises: number,
  allHigh: boolean,
  endsHigh: boolean,
): string => {
  if (startsHigh && drops === 1 && parts[0] === 'L') {
    return 'atamadaka';
  }

  if (startsLow && endsLow && rises === 1) {
    return 'nakadaka';
  }

  if (startsLow && rises === 1 && (endsLow || parts.length === 1)) {
    return 'odaka';
  }

  if (startsLow && allHigh && endsHigh) {
    return 'heiban';
  }

  if (rises > 1 || drops > 1) {
    return 'kifuku';
  }

  return 'unknown-pattern';
};

export const getPitchClass = (pitchAccent: string[], reading: string): string => {
  if (!pitchAccent.length) {
    return '';
  }

  const [pitch] = pitchAccent;
  const parts = pitch.split('');
  const first = parts.shift(); // The first syllable
  const last = parts.pop(); // The particle

  adjustForSmallSyllables(reading, first!, parts);

  const rises = countRises(pitch);
  const drops = countDrops(pitch);

  const startsLow = first === 'L';
  const startsHigh = !startsLow;

  const endsLow = last === 'L';
  const endsHigh = !endsLow;

  const allHigh = !parts.includes('L');

  // Special case: Handle very short words with "HL" pattern
  if (reading.length === 1 && pitch === 'HL') {
    return 'odaka';
  }

  return determinePitchClass(
    startsHigh,
    drops,
    parts,
    startsLow,
    endsLow,
    rises,
    allHigh,
    endsHigh,
  );
};
