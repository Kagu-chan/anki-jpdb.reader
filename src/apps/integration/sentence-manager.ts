import { JPDBCardState, JPDBToken } from '@shared/jpdb/types';
import { Registry } from './registry';

export class SentenceManager {
  private _sentenceToCards = new Map<string, string[]>();
  private _sentenceToElements = new Map<string, Node[]>();

  private _cardToState = new Map<string, JPDBCardState[]>(); // CHECK
  private _cardToSentence = new Map<string, string[]>();
  private _cardToElements = new Map<string, Node[]>();
  private _cardToFrequency = new Map<string, number>();

  private _elementToCard = new Map<Node, string>();
  private _elementsToSentence = new Map<Node, string>();
  private _processedSentences = new Set<string>();

  private _disabled = false;

  public disable(): void {
    this._disabled = true;
  }

  public updateCardState(vid: number, sid: number, state: JPDBCardState[]): void {
    if (this._disabled) {
      return;
    }

    const key = `${vid}/${sid}`;

    this._cardToState.set(key, state);
    this.calculateTargetSentencesByKey(key);
  }

  public addElement(element: Node, token?: JPDBToken): void {
    if (this._disabled) {
      return;
    }

    if (!token?.sentence?.length) {
      return;
    }

    const { sentence, card } = token;
    const { vid, sid, cardState, frequencyRank } = card;
    const vidSid = `${vid}/${sid}`;

    this.addToMap(this._sentenceToCards, sentence, vidSid);
    this.addToMap(this._sentenceToElements, sentence, element);
    this.addToMap(this._cardToSentence, vidSid, sentence);
    this.addToMap(this._cardToElements, vidSid, element);

    this._elementToCard.set(element, vidSid);
    this._elementsToSentence.set(element, sentence);
    this._cardToState.set(vidSid, cardState);
    this._cardToFrequency.set(vidSid, frequencyRank);
  }

  public calculateTargetSentences(): void {
    if (this._disabled) {
      return;
    }

    for (const sentence of this._sentenceToCards.keys()) {
      if (this._processedSentences.has(sentence)) {
        continue;
      }

      this.calculateSentence(sentence);
    }
  }

  public reprocess(): void {
    if (this._disabled) {
      return;
    }

    this._processedSentences.clear();

    this.calculateTargetSentences();
  }

  public reset(): void {
    this._sentenceToCards.clear();
    this._sentenceToElements.clear();
    this._cardToState.clear();
    this._cardToSentence.clear();
    this._cardToElements.clear();
    this._cardToFrequency.clear();
    this._elementToCard.clear();
    this._elementsToSentence.clear();
    this._processedSentences.clear();

    document.querySelectorAll('.i-plus-one').forEach((element) => {
      (element as HTMLElement).classList.remove('i-plus-one');
    });
  }

  public resetProcessedSentences(): void {
    this._processedSentences.clear();
  }

  public dismissNode(element: Node): void {
    const sentence = this._elementsToSentence.get(element);

    if (!sentence) {
      return;
    }

    // Remove element from sentence-to-elements map
    this.filterMap(this._sentenceToElements, sentence, element);

    // Remove card mapping for this element
    const card = this._elementToCard.get(element);

    if (card) {
      this.filterMap(this._cardToElements, card, element);
      this._elementToCard.delete(element);
    }

    this._elementsToSentence.delete(element);

    // Remove i-plus-one class if present
    (element as HTMLElement).classList.remove('i-plus-one');

    // If no more elements for this sentence, clean up sentence references
    if (!this._sentenceToElements.get(sentence)?.length) {
      this._sentenceToElements.delete(sentence);
      this._sentenceToCards.delete(sentence);
      this._processedSentences.delete(sentence);
    }

    // If no more elements for this card, clean up card references
    if (card && !this._cardToElements.get(card)?.length) {
      this._cardToElements.delete(card);
      this._cardToSentence.delete(card);
      this._cardToState.delete(card);
      this._cardToFrequency.delete(card);
    }
  }

  public dismissContainer(container: HTMLElement): void {
    if (this._disabled) {
      return;
    }

    const elements = Array.from(container.querySelectorAll('[ajb]'));

    elements.forEach((element) => {
      this.dismissNode(element);
    });
  }

  protected removeFromMap<Key, Value>(
    map: Map<Key, Value[]>,
    key: Key,
    withElement: (value: Value) => void,
  ): void {
    const elements = map.get(key);

    if (!elements) {
      return;
    }

    elements.forEach(withElement);
    map.delete(key);
  }

  protected filterMap<Key, Value>(map: Map<Key, Value[]>, key: Key, value: Value): void {
    const values = map.get(key);

    if (!values) {
      return;
    }

    const filteredValues = values.filter((v) => v !== value);

    if (filteredValues.length === 0) {
      map.delete(key);
    } else {
      map.set(key, filteredValues);
    }
  }

  protected addToMap<Key, Value>(map: Map<Key, Value[]>, key: Key, value: Value): void {
    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)?.push(value);
  }

  protected calculateTargetSentencesByKey(key: string): void {
    const sentences = this._cardToSentence.get(key) ?? [];

    sentences.forEach((sentence) => this.calculateSentence(sentence));
  }

  protected calculateSentence(sentence: string): void {
    const { markOnlyFrequent, markFrequency, minSentenceLength, newStates } =
      Registry.textHighlighterOptions;

    this._processedSentences.add(sentence);

    const cards = this._sentenceToCards.get(sentence) ?? [];
    const unknownCards = cards.filter((card) => {
      const states = this._cardToState.get(card)!;

      return states.some((s) => newStates.includes(s));
    });

    let notIPlusOne =
      unknownCards.length === 0 || unknownCards.length > 1 || cards.length < minSentenceLength;

    if (markFrequency && markOnlyFrequent && !notIPlusOne) {
      // Apply frequency-based filtering
      const relevantFrequency = this._cardToFrequency.get(unknownCards[0])!;

      if (relevantFrequency > markFrequency) {
        notIPlusOne = true;
      }
    }

    if (notIPlusOne) {
      // Force remove i+1 class if it was previously set
      this._sentenceToElements.get(sentence)?.forEach((element) => {
        (element as HTMLElement).classList.remove('i-plus-one');
      });

      return; // No i+1 sentence or too many unknown cards
    }

    const [vid, sid] = unknownCards[0].split('/');

    // If we have exactly one unknown card, mark the element as i+1
    this._sentenceToElements.get(sentence)?.forEach((element) => {
      const e = element as HTMLElement;

      // if element attributes match the vid and sid, add the i-plus-one class
      if (e.getAttribute('vid') === vid && e.getAttribute('sid') === sid) {
        e.classList.add('i-plus-one');
      }
    });
  }
}
