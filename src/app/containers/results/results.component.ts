import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatAccordion } from '@angular/material/expansion';
import { Observable } from 'rxjs';

import { QUIZ_DATA } from '../../shared/quiz';
import { Quiz } from '../../shared/models/Quiz.model';
import { Result } from '../../shared/models/Result.model';
import { QuizService } from '../../shared/services/quiz.service';
import { TimerService } from '../../shared/services/timer.service';


@Component({
  selector: 'codelab-quiz-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsComponent implements OnInit {
  quizData: Quiz = QUIZ_DATA;
  totalQuestions: number;
  percentage: number;
  correctAnswersCount$: Observable<number>;
  completionTime$: Observable<number>;
  elapsedMinutes: number;
  elapsedSeconds: number;
  codelabUrl = 'https://www.codelab.fun';
  userAnswersResults: Result[];

  get correctAnswers(): number[] { return this.quizService.correctAnswers };
  get userAnswers(): number[] { return this.quizService.userAnswers; };
  get elapsedTimes(): number[] { return this.timerService.elapsedTimes; };
  get completionTime(): number { return this.timerService.completionTime; };

  @ViewChild('accordion', { static: false }) Accordion: MatAccordion;
  panelOpenState = false;

  CONGRATULATIONS = "../../assets/images/congratulations.jpg";
  NOT_BAD = '../../assets/images/notbad.jpg';
  TRY_AGAIN = '../../assets/images/tryagain.jpeg';

  constructor(
    private quizService: QuizService,
    private timerService: TimerService,
    private router: Router
  )
  {
    // this.userAnswersResults = new Result(this.userAnswers, this.elapsedTimes);
    // this.resultsMap = [this.userAnswers[], this.elapsedTimes];
    this.totalQuestions = quizService.totalQuestions;
    this.percentageOfCorrectlyAnsweredQuestions();
    this.calculateElapsedTime();
  }

  ngOnInit() {
    console.log('correct answers: ', this.correctAnswers);
    console.log('user answers: ', this.userAnswers);

    this.correctAnswersCount$ = this.quizService.correctAnswersCountSubject;
    // this.completionTime$ = this.timerService.completionTimeSubject;
    console.log('completionTime: ', this.completionTime$);
  }

  percentageOfCorrectlyAnsweredQuestions(): void {
    this.percentage = Math.ceil(100 * this.quizService.correctAnswersCountSubject.value / this.totalQuestions);
  }

  calculateElapsedTime() {
    // this.elapsedMinutes = this.timerService.completionTimeSubject.value / 60;
    // this.elapsedSeconds = this.timerService.completionTimeSubject.value % 60;
    
    this.elapsedMinutes = this.timerService.completionTime / 60;
    this.elapsedSeconds = this.timerService.completionTime % 60;

    console.log('elapsedMinutes: ', this.elapsedMinutes);
    console.log('elapsedSeconds: ', this.elapsedSeconds);
  }

  openAllPanels() {
    this.Accordion.openAll();
  }
  closeAllPanels() {
    this.Accordion.closeAll();
  }

  restart() {
    this.quizService.resetAll();
    this.router.navigate(['/intro']);
  }
}
