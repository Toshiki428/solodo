import Dexie, { type Table } from 'dexie';

export interface StudyLog {
  id?: number;
  startTime: Date;
  endTime: Date | null;
  tagIds: number[];
  memo: string | null;
}

export interface Tag {
  id?: number;
  name: string;
}

export class SoloDoDB extends Dexie {
  studyLogs!: Table<StudyLog>;
  tags!: Table<Tag>;

  constructor() {
    super('solodoDatabase');
    this.version(1).stores({
      studyLogs: '++id, startTime, *tagIds',
      tags: '++id, &name'
    });
  }
}

export const db = new SoloDoDB();
