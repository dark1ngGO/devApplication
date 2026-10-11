export interface Question {
  id: number;
  text: string;
}

export interface Answers {
  [questionId: number]: string;
}
