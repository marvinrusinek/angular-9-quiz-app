import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { QuizQuestion } from '../../shared/interfaces/QuizQuestion';
import { QuizService } from '../../shared/services/quiz.service';

export enum CorrectnessTypes {
  Default,
  Correct,
  Incorrect = 2,
  Warning
}

@Component({
  selector: 'codelab-quiz-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizQuestionComponent implements OnInit, OnChanges {
  @Input() type = CorrectnessTypes.Correct;
  private correctnessTypes = CorrectnessTypes;

  currentQuestion: QuizQuestion;
  @Output() answer = new EventEmitter<number>();
  @Input() set question(value: QuizQuestion) { this.currentQuestion = value; }
  get correctMessage(): string { return this.quizService.correctMessage; }
  formGroup: FormGroup;
  matRadio: boolean;

  constructor(private quizService: QuizService) { }

  ngOnInit() {
    this.formGroup = new FormGroup({
      answer: new FormControl(['', Validators.required])
    });
    this.matRadio = this.quizService.getQuestionType();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.question && changes.question.currentValue !== changes.question.firstChange) {
      this.currentQuestion = changes.question.currentValue;
      if (this.formGroup) {
        this.formGroup.patchValue({answer: ''});
      }
    }
  }

  radioChange(answer: number) {
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
      this.currentQuestion.options[optionIndex]['correct'] === true
    ) {
      this.quizService.correctAnswers = [...this.quizService.correctAnswers, optionIndex + 1];
    } else {
      console.log('else');
    }
    this.quizService.setExplanationAndCorrectAnswerMessages(this.quizService.correctAnswers);
  }
}
