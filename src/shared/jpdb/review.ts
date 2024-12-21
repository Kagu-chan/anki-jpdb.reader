import { JPDBRequestOptions } from './api.types';
import { request } from './request';
import { JPDBGrade } from './types';

export const review = (
  grade: JPDBGrade,
  vid: number,
  sid: number,
  options?: JPDBRequestOptions,
): Promise<void> => request('review', { vid, sid, grade }, options);
