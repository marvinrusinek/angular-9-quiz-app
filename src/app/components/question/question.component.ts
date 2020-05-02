import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { QuizQuestion } from '../../shared/models/QuizQuestion.model';
import { QuizService } from '../../shared/services/quiz.service';
import { TimerService } from '../../shared/services/timer.service';


@Component({
  selector: 'codelab-quiz-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizQuestionComponent implements OnInit, OnChanges {
  currentQuestion: QuizQuestion;
  @Output() answer = new EventEmitter<number>();
  @Input() set question(value: QuizQuestion) { this.currentQuestion = value; }
  get correctMessage(): string { return this.quizService.correctMessage; }
  formGroup: FormGroup;
  multipleAnswer: boolean;
  alreadyAnswered = false;

  constructor(
    private formBuilder: FormBuilder,
    private quizService: QuizService,
    private timerService: TimerService
  ) { }

  ngOnInit() {
    this.formGroup = new FormGroup({
      answer: new FormControl(['', Validators.required])
    });
    this.multipleAnswer = this.quizService.getQuestionType();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.question) {
      switch (this.question.type) {
        case 'SINGLE_CHOICE':
          this.formGroup = new FormGroup({
            answer: new FormControl([null, Validators.required])
          });
          this.alreadyAnswered = false;
          break;
        case 'MULTIPLE_CHOICE':
          const multipleChoiceValidator = (control: AbstractControl) =>
            control.value.reduce(
              (valid: boolean, currentValue: boolean) => valid || currentValue
              , false
            ) ? null : {answers: 'At least one answer needs to be checked!'};
          this.formGroup = new FormGroup({
            answers: this.formBuilder.array(this.question.shuffledAnswers
                .map((answer: string) => this.formBuilder.control(false)),
              multipleChoiceValidator
            ),
          });
          this.alreadyAnswered = false;
          break;
      }
    }
  }


  // old onChanges
  /* ngOnChanges(changes: SimpleChanges) {
    if (changes.question && changes.question.currentValue !== changes.question.firstChange) {
      this.currentQuestion = changes.question.currentValue;
      if (this.formGroup) {
        this.formGroup.patchValue({answer: ''});
        this.alreadyAnswered = false;
      }
    }
  } */

  radioChange(answer: number) {
    this.answer.emit(answer);
  }
  checkboxChange(answer: number) {
    this.answer.emit(answer);
  }

  isCorrect(correct: boolean, optionIndex: number): boolean {
    return correct === this.currentQuestion.options[optionIndex].correct;
  }

  setSelected(optionIndex: number): void {
    this.currentQuestion.options.forEach(o => o.selected = false);
    this.currentQuestion.options[optionIndex].selected = true;

    if (
      optionIndex &&
      this.currentQuestion &&
      this.currentQuestion.options &&
      this.currentQuestion.options[optionIndex]['selected'] ===
      this.currentQuestion.options[optionIndex]['correct'] &&
      this.currentQuestion.options[optionIndex]['correct'] === true
    ) {
      this.quizService.addCorrectAnswers(optionIndex + 1);
      this.timerService.resetTimer();
      optionIndex = null;
    }

    this.quizService.setExplanationAndCorrectAnswerMessages(this.quizService.correctAnswers);
    this.alreadyAnswered = true;
  }
}
