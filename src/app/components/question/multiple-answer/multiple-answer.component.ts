import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation
} from "@angular/core";
import { FormGroup } from "@angular/forms";

import { QuizQuestion } from "../../../shared/models/QuizQuestion.model";
import { QuizService } from "../../../shared/services/quiz.service";
import { TimerService } from "../../../shared/services/timer.service";

@Component({
  selector: "codelab-question-multiple-answer",
  templateUrl: "./multiple-answer.component.html",
  styleUrls: ["./multiple-answer.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class MultipleAnswerComponent implements OnInit, OnChanges {
  @Output() answer = new EventEmitter<number>();
  @Input() question: QuizQuestion;
  currentQuestion: QuizQuestion;
  formGroup: FormGroup;
  correctAnswers = [];
  correctMessage = "";

  quizStarted: boolean;
  alreadyAnswered: boolean;
  isCorrectAnswerSelected: boolean;
  isCorrectOption: boolean;
  isIncorrectOption: boolean;
  optionSelected = false;
  optionCorrect = false;
  multipleAnswer = true;

  previousAnswers: string[] = [];

  constructor(
    private quizService: QuizService,
    private timerService: TimerService
  ) {
    this.sendMultipleAnswerToQuizService();
  }

  ngOnInit(): void {
    this.currentQuestion = this.quizService.currentQuestion;
    this.question = this.currentQuestion;
    this.multipleAnswer = this.quizService.multipleAnswer;
    this.alreadyAnswered = this.quizService.alreadyAnswered;
    this.previousAnswers = this.quizService.previousAnswers;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.question &&
      changes.question.currentValue !== changes.question.firstChange
    ) {
      this.currentQuestion = changes.question.currentValue;
      this.correctAnswers = this.quizService.getCorrectAnswers(
        this.currentQuestion
      );
      this.correctMessage = this.quizService.correctMessage;

      if (this.formGroup) {
        this.formGroup.patchValue({ answer: "" });
        this.alreadyAnswered = false;
      }
    }
  }

  setSelected(optionIndex: number): void {
    this.quizStarted = true;
    this.isCorrectAnswerSelected = this.isCorrect(
      this.currentQuestion.options[optionIndex].correct,
      optionIndex
    );
    this.answer.emit(optionIndex);

    if (this.correctAnswers.length === 1) {
      this.currentQuestion.options.forEach(option => (option.selected = false));
    }
    this.currentQuestion.options[optionIndex].selected = true;

    if (
      optionIndex >= 0 &&
      this.currentQuestion &&
      this.currentQuestion.options &&
      this.currentQuestion.options[optionIndex]["correct"]
    ) {
      optionIndex = null;
      this.optionSelected = this.currentQuestion.options[optionIndex].selected;
      this.optionCorrect = this.currentQuestion.options[
        optionIndex
      ].correct = true;
      this.timerService.stopTimer();
      this.quizService.correctSound.play();
    } else {
      this.optionSelected = this.currentQuestion.options[optionIndex].selected;
      this.optionCorrect = this.currentQuestion.options[
        optionIndex
      ].correct = false;
      this.quizService.incorrectSound.play();
    }

    this.quizService.setOptions(true, this.optionCorrect);
    this.isCorrectOption = this.quizService.isCorrectOption;
    console.log("isCorrectOption:", this.isCorrectOption);
    this.isIncorrectOption = this.quizService.isIncorrectOption;
    console.log("isIncorrectOption:", this.isIncorrectOption);
    this.alreadyAnswered = true;
  }

  isCorrect(correct: boolean, optionIndex: number): boolean {
    return correct === this.currentQuestion.options[optionIndex].correct;
  }

  private sendMultipleAnswerToQuizService(): void {
    this.quizService.setMultipleAnswer(this.multipleAnswer);
  }
}
