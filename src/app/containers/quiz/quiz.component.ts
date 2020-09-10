import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { QUIZ_DATA, QUIZ_RESOURCES } from '../../shared/quiz';
import { Quiz } from '../../shared/models/Quiz.model';
import { QuizQuestion } from '../../shared/models/QuizQuestion.model';
// import { Resource } from '../../shared/models/Resource.model';
// import { QuizResource } from '../../shared/models/QuizResource.model';
import { QuizService } from '../../shared/services/quiz.service';
import { TimerService } from '../../shared/services/timer.service';
import { ChangeRouteAnimation } from '../../animations/animations';


type AnimationState = 'animationStarted' | 'none';

enum Status {
  Started = 'Started',
  Continue = 'Continue',
  Completed = 'Completed'
}

@Component({
  selector: 'codelab-quiz-component',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  animations: [ChangeRouteAnimation.changeRoute],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizComponent implements OnInit, OnDestroy {
  quizData: Quiz[] = QUIZ_DATA;
  question: QuizQuestion;
  questions: QuizQuestion[];
  answers: number[] = [];
  questionIndex: number;
  totalQuestions: number;
  progressValue: number;
  correctCount: number;
  quizId: string;
  quizName = '';
  indexOfQuizId: number;
  status: Status;
  previousUserAnswers: any;
  checkedShuffle: boolean;
  unsubscribe$ = new Subject<void>();
  animationState$ = new BehaviorSubject<AnimationState>('none');
  get explanationText(): string { return this.quizService.explanationText; }
  get correctOptions(): string { return this.quizService.correctOptions; }
  get numberOfCorrectAnswers(): number { return this.quizService.numberOfCorrectAnswers; }

  constructor(
    private quizService: QuizService,
    private timerService: TimerService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.quizId = this.activatedRoute.snapshot.paramMap.get('quizId');
    this.indexOfQuizId = this.quizData.findIndex(element => element.quizId === this.quizId);
  }

  ngOnInit(): void {
    this.getQuizNameFromActivatedRoute();
    this.shuffleQuestionsAndAnswers();

    this.activatedRoute.params
      .pipe(takeUntil(this.unsubscribe$))
        .subscribe(params => {
          this.totalQuestions = this.quizData[this.indexOfQuizId].questions.length;
          this.quizService.setTotalQuestions(this.totalQuestions);

        if (params.questionIndex) {
          this.questionIndex = parseInt(params.questionIndex, 0);
          this.quizService.currentQuestionIndex = this.questionIndex;

          if (this.questionIndex === 1) {
            this.progressValue = 0;
            this.status = Status.Started;
          } else {
            this.progressValue = Math.ceil((this.questionIndex - 1) / this.totalQuestions * 100);
          }

          this.sendValuesToQuizService();
        }
    });

    if (this.questionIndex === 1) {
      this.quizService.correctAnswersCountSubject.next(0);
    }

    this.correctCount = this.quizService.correctAnswersCountSubject.getValue();
    this.sendCorrectCountToQuizService(this.correctCount);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isAnswered(): boolean {
    return this.answers && this.answers.length > 0;
  }

  animationDoneHandler(): void {
    this.animationState$.next('none');
  }

  selectedAnswer(data): void {
    const correctAnswers = this.question.options.filter((options) => options.correct);
    if (correctAnswers.length > 1 && this.answers.indexOf(data) === -1) {
      this.answers.push(data);
    } else {
      this.answers[0] = data;
    }
  }

  shuffleQuestionsAndAnswers(): void {
    if (this.quizService.checkedShuffle) {
      this.quizService.shuffle(this.quizData[this.indexOfQuizId].questions);
      this.quizService.shuffle(
        this.quizData[this.indexOfQuizId].questions[this.quizService.currentQuestionIndex].options
      );
    }
  }

  advanceToNextQuestion() {
    this.checkIfAnsweredCorrectly();
    this.answers = [];
    this.status = Status.Continue;
    this.animationState$.next('animationStarted');
    this.quizService.navigateToNextQuestion();
    this.timerService.resetTimer();
  }

  advanceToPreviousQuestion() {
    this.answers = null;
    this.status = Status.Continue;
    this.animationState$.next('animationStarted');
    this.quizService.navigateToPreviousQuestion();
  }

  advanceToResults() {
    this.quizService.resetAll();
    this.timerService.stopTimer();
    this.timerService.resetTimer();
    this.checkIfAnsweredCorrectly();
    this.quizService.navigateToResults();
  }

  restartQuiz() {
    this.quizService.resetAll();
    this.quizService.resetQuestions();
    this.timerService.stopTimer();
    this.timerService.resetTimer();
    this.timerService.elapsedTimes = [];
    this.timerService.completionTime = 0;
    this.answers = null;
    this.router.navigate(['/quiz/intro/', this.quizId]).then();
  }

  checkIfAnsweredCorrectly(): void {
    if (this.question) {
      const correctAnswerFound = this.answers.find((answer) => {
        return this.question.options &&
          this.question.options[answer] &&
          this.question.options[answer]['selected'] &&
          this.question.options[answer]['correct'];
      });

      const answers = this.isAnswered() ? this.answers.map((answer) => answer + 1) : [];
      this.quizService.userAnswers.push(this.isAnswered() ? answers : this.answers);

      this.addUpScores(answers, correctAnswerFound);
    }
  }

  addUpScores(answers: number[], correctAnswerFound: number): void {
    // TODO: for multiple-answer questions, ALL correct answers should be marked correct for the score to increase
    if (correctAnswerFound > -1 && answers.length === this.quizService.numberOfCorrectAnswers) {
      this.sendCorrectCountToQuizService(this.correctCount + 1);
    }
  }

  getQuizNameFromActivatedRoute(): void {
    this.activatedRoute.url.subscribe(segments => {
      this.quizName = segments[1].toString();
    });
  }

  sendValuesToQuizService(): void {
    this.sendQuestionToQuizService();
    this.sendQuestionsToQuizService();
    this.sendQuizIdToQuizService();
    this.sendQuizStatusToQuizService();
    this.sendPreviousUserAnswersToQuizService();
    this.sendIsAnsweredToQuizService();
  }

  private sendQuestionToQuizService(): void {
    this.question = this.quizData[this.indexOfQuizId].questions[this.questionIndex - 1];
    this.quizService.setQuestion(this.question);
  }

  private sendQuestionsToQuizService(): void {
    this.questions = this.quizData[this.indexOfQuizId].questions;
    this.quizService.setQuestions(this.questions);
  }

  private sendQuizIdToQuizService(): void {
    this.quizService.setQuizId(this.quizId);
  }

  private sendQuizStatusToQuizService(): void {
    this.quizService.setQuizStatus(this.status);
  }

  private sendPreviousUserAnswersToQuizService(): void {
    this.questions = this.quizData[this.indexOfQuizId].questions;
    this.quizService.setPreviousUserAnswersText(this.quizService.previousUserAnswers, this.questions);
  }

  private sendIsAnsweredToQuizService(): void {
    this.quizService.setIsAnswered(this.isAnswered());
  }

  private sendCorrectCountToQuizService(value: number): void {
    this.correctCount = value;
    this.quizService.sendCorrectCountToResults(this.correctCount);
  }
}
