export type Sequence<TPromise = void, TData = unknown> = {
  sequenceId: number;
  promise: Promise<TPromise>;
  data: TData;
};

export type AbortableSequence<TPromise = void, TData = unknown> = Sequence<TPromise, TData> & {
  abort: () => void;
};

export type PreparedRequest = {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
};
