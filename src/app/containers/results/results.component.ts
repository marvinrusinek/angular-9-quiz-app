import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatAccordion } from '@angular/material/expansion';

import { QUIZ_DATA, QUIZ_RESOURCES } from '../../shared/quiz';
import { Quiz } from '../../shared/models/Quiz.model';
import { QuizQuestion } from '../../shared/models/QuizQuestion.model';
// import { QuizResource } from '../../shared/models/QuizResource.model';
// import { Resource } from '@codelab-quiz/shared/models/Resource.model';
import { QuizMetadata } from '../../shared/models/QuizMetadata.model';
import { Result } from '../../shared/models/Result.model';
import { Score } from '../../shared/models/Score.model';
import { QuizService } from '../../shared/services/quiz.service';
import { TimerService } from '../../shared/services/timer.service';


@Component({
  selector: 'codelab-quiz-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsComponent implements OnInit {
  quizData: Quiz[] = JSON.parse(JSON.stringify(QUIZ_DATA));
  // quizResources: QuizResource[] = JSON.parse(JSON.stringify(QUIZ_RESOURCES));

  quizMetadata: Partial<QuizMetadata> = {
    totalQuestions: this.quizService.totalQuestions,
    correctAnswersCount$: this.quizService.correctAnswersCountSubject,
    percentage: this.calculatePercentageOfCorrectlyAnsweredQuestions(),
    completionTime: this.timerService.calculateTotalElapsedTime(this.timerService.elapsedTimes)
  };
  results: Result = {
    userAnswers: this.quizService.userAnswers,
    elapsedTimes: this.timerService.elapsedTimes
  };
  highScores: Score[] = [];
  score: Score = {
    quizId: '',
    score: this.quizMetadata.correctAnswersCount$,
    time: new Date()
  };
  questions: QuizQuestion[];
  // resources: Resource[];
  quizName = '';
  quizId: string;
  indexOfQuizId: number;
  status: string;
  previousUserAnswers: any;
  
  correctAnswers: number[] = [];
  numberOfCorrectAnswers = [];
  elapsedMinutes: number;
  elapsedSeconds: number;

  checkedShuffle: boolean;

  @ViewChild('accordion', { static: false }) accordion: MatAccordion;
  panelOpenState = false;

  CONGRATULATIONS = 'https://raw.githubusercontent.com/marvinrusinek/angular-9-quiz-app/master/src/assets/images/congratulations.jpg';
  NOT_BAD = 'https://raw.githubusercontent.com/marvinrusinek/angular-9-quiz-app/master/src/assets/images/not-bad.jpg';
  TRY_AGAIN = 'https://raw.githubusercontent.com/marvinrusinek/angular-9-quiz-app/master/src/assets/images/try-again.jpeg';
  codelabUrl = 'https://www.codelab.fun';

  constructor(
    private quizService: QuizService,
    private timerService: TimerService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.quizId = this.activatedRoute.snapshot.paramMap.get('quizId');
    this.indexOfQuizId = this.quizData.findIndex(el => el.quizId === this.quizId);
    this.quizData[this.indexOfQuizId].status = 'completed';

    this.getCompletedQuizId(this.quizId);
    this.getQuizStatus();
    this.previousUserAnswers = this.quizService.userAnswers;
    this.getUserAnswers(this.previousUserAnswers);
    this.calculateElapsedTime();
    this.saveHighScores();
  }

  ngOnInit() {
    this.activatedRoute.url.subscribe(segments => {
      this.quizName = segments[1].toString();
    });
    this.correctAnswers = this.quizService.correctAnswers;
    this.questions = this.quizService.questions;
    this.numberOfCorrectAnswers = this.quizService.numberOfCorrectAnswersArray;
    this.checkedShuffle = this.quizService.checkedShuffle;
    // this.resources = this.quizService.resources;
  }

  private getCompletedQuizId(quizId): void {
    this.quizService.setCompletedQuizId(quizId);
  }

  private getQuizStatus(): void {
    this.status = this.quizData[this.indexOfQuizId].status;
    this.quizService.setQuizStatus(this.status);
  }

  private getUserAnswers(previousAnswers: []): void {
    this.quizService.setUserAnswers(previousAnswers);
  }

  calculateElapsedTime(): void {
    this.elapsedMinutes = Math.floor(this.quizMetadata.completionTime / 60);
    this.elapsedSeconds = this.quizMetadata.completionTime % 60;
  }

  calculatePercentageOfCorrectlyAnsweredQuestions(): number {
    return Math.ceil(100 * this.quizService.correctAnswersCountSubject.value / this.quizService.totalQuestions);
  }

  checkIfAnswersAreCorrect(correctAnswers, userAnswers, index: number): boolean {
    return !(!userAnswers[index] || 
             userAnswers[index].length === 0 || 
             userAnswers[index].find((answer) => correctAnswers[index][0].indexOf(answer) === -1));
  }

  saveHighScores(): void {
    // TODO: set a max of 5 high scores per quizId, is the code below sufficient?
    const MAX_LENGTH = 5;
    if (this.quizId === this.quizName) {
      this.highScores = new Array(MAX_LENGTH);
    }
    this.highScores.push(this.score);
    console.log('High Scores:', this.highScores);
  }

  openAllPanels() {
    this.accordion.openAll();
  }
  closeAllPanels() {
    this.accordion.closeAll();
  }

  restartQuiz() {
    this.quizService.resetAll();
    this.quizService.resetQuestions();
    this.timerService.elapsedTimes = [];
    this.timerService.completionTime = 0;
    this.router.navigate(['/question/', this.quizId, 1]).then();
  }

  selectQuiz() {
    this.quizService.resetAll();
    this.quizService.resetQuestions();
    this.quizId = '';
    this.indexOfQuizId = 0;
    this.router.navigate(['/select/']).then();
  }
}
