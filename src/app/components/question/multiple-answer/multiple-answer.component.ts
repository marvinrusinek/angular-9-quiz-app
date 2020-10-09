import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { QuizQuestion } from '../../../shared/models/QuizQuestion.model';
import { QuizService } from '../../../shared/services/quiz.service';
import { TimerService } from '../../../shared/services/timer.service';

@Component({
  selector: 'codelab-question-multiple-answer',
  templateUrl: './multiple-answer.component.html',
  styleUrls: ['./multiple-answer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class MultipleAnswerComponent implements OnInit, OnChanges {
  @Output() answer = new EventEmitter<number>();
  @Input() question: QuizQuestion;
  formGroup: FormGroup;
  multipleAnswer: boolean;
  alreadyAnswered: boolean;
  currentQuestion: QuizQuestion;

  quizStarted: boolean;
  correctAnswers = [];
  correctMessage = '';
  isAnswered: boolean;
  isCorrectAnswerSelected: boolean;
  isCorrectOption: boolean;
  isIncorrectOption: boolean;
  optionSelected: boolean;
  optionCorrect: boolean;

  constructor(
    private quizService: QuizService,
    private timerService: TimerService
  ) {
    this.sendMultipleAnswerToQuizService();
   }

  ngOnInit(): void {
    this.question = this.currentQuestion;
    this.multipleAnswer = this.quizService.multipleAnswer;
    this.alreadyAnswered = this.quizService.alreadyAnswered;
    this.isAnswered = this.quizService.isAnswered;
    this.currentQuestion = this.quizService.currentQuestion;
    this.isCorrectOption = this.quizService.isCorrectOption;
    console.log('IsCorrectOption: ', this.isCorrectOption);
    this.isIncorrectOption = this.quizService.isIncorrectOption;
    console.log('IsIncorrectOption: ', this.isCorrectOption);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.question && changes.question.currentValue !== changes.question.firstChange) {
      this.currentQuestion = changes.question.currentValue;
      this.correctAnswers = this.quizService.getCorrectAnswers(this.currentQuestion);
      this.correctMessage = this.quizService.correctMessage;
      this.multipleAnswer = this.correctAnswers.length > 1;
      
      if (this.formGroup) {
        this.formGroup.patchValue({answer: ''});
        this.alreadyAnswered = false;
      }
    }
  }

  setSelected(optionIndex: number): void {
    this.quizStarted = true;
    this.isCorrectAnswerSelected = this.isCorrect(this.currentQuestion.options[optionIndex].correct, optionIndex);
    this.answer.emit(optionIndex);

    /* this.optionSelected = this.currentQuestion.options[optionIndex].selected;
    console.log(this.optionSelected);
    this.optionCorrect = this.currentQuestion.options[optionIndex].correct;
    console.log(this.optionCorrect);
    this.sendOptionSelectedToQuizService(this.optionSelected);
    this.sendOptionCorrectToQuizService(this.optionCorrect); */

    if (this.correctAnswers.length === 1) {
      this.currentQuestion.options.forEach((option) => option.selected = false);
    }
    this.currentQuestion.options[optionIndex].selected = true;

    if (
      optionIndex >= 0 &&
      this.currentQuestion &&
      this.currentQuestion.options &&
      this.currentQuestion.options[optionIndex]['correct']
    ) {
      this.optionSelected = true;
      this.optionCorrect = true;
      this.sendOptionSelectedToQuizService(this.optionSelected);
      this.sendOptionCorrectToQuizService(this.optionCorrect);

      this.timerService.stopTimer();
      this.quizService.correctSound.play();
      optionIndex = null;
    } else {
      this.optionSelected = true;
      this.optionCorrect = false;
      this.sendOptionSelectedToQuizService(this.optionSelected);
      this.sendOptionCorrectToQuizService(this.optionCorrect);

      this.quizService.incorrectSound.play();
    }
    this.alreadyAnswered = true;
  }

  isCorrect(correct: boolean, optionIndex: number): boolean {
    return correct === this.currentQuestion.options[optionIndex].correct;
  }

  private sendMultipleAnswerToQuizService(): void {
    this.quizService.setMultipleAnswer(true);
  }

  private sendOptionSelectedToQuizService(optionSelected: boolean): void {
    this.quizService.setOptionSelected(optionSelected);
  }

  private sendOptionCorrectToQuizService(optionCorrect: boolean ): void {
    this.quizService.setOptionCorrect(optionCorrect);
  }
}
