import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Quiz } from '../shared/models/*';
import { QUIZ_DATA } from '../shared/quiz-data';

@Component({
  selector: 'codelab-quiz-selection',
  templateUrl: './quiz-selection.component.html',
  styleUrls: ['./quiz-selection.component.scss']
})
export class QuizSelectionComponent implements OnInit {
  @Input() quiz: Quiz;
  @Input() currentQuestionIndex: number;
  quizData: Quiz[] = QUIZ_DATA;
  POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

  quizStatus = {
    start: 'M2.81,14.12L5.64,11.29L8.17,10.79C11.39,6.41 17.55,4.22 19.78,4.22C19.78,6.45 17.59,12.61 13.21,15.83L12.71,18.36L9.88,21.19L9.17,17.66C7.76,17.66 7.76,17.66 7.05,16.95C6.34,16.24 6.34,16.24 6.34,14.83L2.81,14.12M5.64,16.95L7.05,18.36L4.39,21.03H2.97V19.61L5.64,16.95M4.22,15.54L5.46,15.71L3,18.16V16.74L4.22,15.54M8.29,18.54L8.46,19.78L7.26,21H5.84L8.29,18.54M13,9.5A1.5,1.5 0 0,0 11.5,11A1.5,1.5 0 0,0 13,12.5A1.5,1.5 0 0,0 14.5,11A1.5,1.5 0 0,0 13,9.5Z',
    continue: 'M8,5.14V19.14L19,12.14L8,5.14Z',
    evaluation: 'M0.41,13.41L6,19L7.41,17.58L1.83,12M22.24,5.58L11.66,16.17L7.5,12L6.07,13.41L11.66,19L23.66,7M18,7L16.59,5.58L10.24,11.93L11.66,13.34L18,7Z'
  };

  constructor(private router: Router) { }
  ngOnInit(): void { }

  onClick(): void {
    if (this.currentQuestionIndex < Number.POSITIVE_INFINITY) {
      // start or continue
      this.router.navigate(['/quiz', this.quiz.id, this.currentQuestionIndex]);
    } else if (this.currentQuestionIndex === Number.POSITIVE_INFINITY) {
      // evaluation
      this.router.navigate(['/quiz', this.quiz.id, 'evaluation']);
    }
  }
}
