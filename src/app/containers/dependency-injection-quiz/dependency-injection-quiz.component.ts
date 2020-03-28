import { Component, ChangeDetectionStrategy, Input, Output, OnInit } from '@angular/core';

import { QUIZ_DATA } from '../../quiz';
import { Quiz } from '../../models/quiz';
import { QuizQuestion } from '../../models/QuizQuestion';
import { QuizService } from '../../services/quiz.service';


@Component({
  selector: 'dependency-injection-quiz-component',
  templateUrl: './dependency-injection-quiz.component.html',
  styleUrls: ['./dependency-injection-quiz.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QuizService]
})
export class DependencyInjectionQuizComponent implements OnInit {
  quizData: Quiz = QUIZ_DATA;
  @Output() question: QuizQuestion;
  @Output() answer: number;
  @Output() totalQuestions: number;
  @Input() questionIndex: number;
  @Input() optionIndex: number;
  hasAnswer: boolean;
  progressValue: number;
  correctAnswers = [];
  explanationOptionsText: string;
  option: number;
  disabled: boolean;
  
  constructor(private quizService: QuizService) {}

  ngOnInit() {
    this.question = this.quizService.getQuestion;
    this.totalQuestions = this.quizService.numberOfQuestions();
    this.progressValue = ((this.quizService.getQuestionIndex() + 1) / this.totalQuestions) * 100;
    this.disabled = this.answer === null; // to disable the next button
    this.mapCorrectAnswersAndCorrectOptions();
    this.explanationOptionsText = this.quizService.explanationOptionsText;
    this.quizService.setExplanationOptionsAndCorrectAnswerMessages(this.correctAnswers);
  }

  changeExplanation() {
    this.quizService.setExplanationOptionsText();
  }

  showExplanation() {
    this.quizService.getExplanationOptionsText();
  }


  mapCorrectAnswersAndCorrectOptions() {
    for (let j = 0; j < this.question.options.length; j++) {
      if (this.question.options[j].correct === true) {
        this.correctAnswers.push('Question ' + this.questionIndex++ + ', Options: ' + j++);
      }
    }
    console.log("Correct Answers: " + this.correctAnswers);
  }

  answerChanged($event) {
    this.answer = $event;
    this.hasAnswer = true;
    if (this.question.options[this.optionIndex].correct === true) {
      this.option = this.answer + 1;
    }
  }

  nextQuestion() {
    this.quizService.nextQuestion();
  }
  
  results() {
    this.quizService.navigateToResults();
  }
}
