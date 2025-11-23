import { Lecture } from '../model/types';
import { LectureRepository } from '../ports/Repository';

export class JsonLectureRepository implements LectureRepository {
  async getLectures(): Promise<Lecture[]> {
    try {
      const res = await fetch('/data/lectures.json');
      if (!res.ok) return [];
      const lectures: Lecture[] = await res.json();
      return lectures;
    } catch {
      return [];
    }
  }
}
