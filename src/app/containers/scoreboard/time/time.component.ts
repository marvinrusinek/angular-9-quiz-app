import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { concat, fromEvent, Observable, of, Subscription, timer } from 'rxjs';
import { first, repeatWhen, scan, shareReplay, skip, switchMapTo, takeUntil } from 'rxjs/operators';

import { QuizService } from '../../../shared/services/quiz.service';
import { TimerService } from '../../../shared/services/timer.service';


@Component({
  selector: 'codelab-scoreboard-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss']
})
export class TimeComponent implements OnInit, OnChanges {
  @Input() set selectedAnswer(value) { this.answer = value; }
  answer;
  hasAnswer: boolean;
  timeLeft$: Observable<Subscription>;
  timeLeft: number;
  timePerQuestion = 20;
  elapsedTime: number;
  elapsedTimes: number[] = [];
  completionTime: number;
  completionCount: number;
  quizIsOver: boolean;
  inProgress: boolean;

  constructor(
    private quizService: QuizService,
    private timerService: TimerService
  ) { }

  ngOnInit(): void {
    /* this.timerService.timeLeft$.subscribe(data => {
      this.timeLeft = data;
    }); */
    this.countdownClock();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.selectedAnswer &&
      changes.selectedAnswer.currentValue !== changes.selectedAnswer.firstChange
    ) {
      this.answer = changes.selectedAnswer.currentValue;
    }
  }

  countdownClock() {
    const $ = document.querySelector.bind(document);

    const start$ = fromEvent($('#start'), 'click').pipe(shareReplay(1));
    const reset$ = fromEvent($('#reset'), 'click');
    const stop$ = fromEvent($('#stop'), 'click');
    const markTimestamp$ = fromEvent($('#mark'), 'click');
    const continueFromLastTimestamp$ = fromEvent($('#continue'), 'click');

    this.timeLeft$ = of(concat(
      start$.pipe(first()),
      reset$
    ).pipe(
      switchMapTo(
        timer(0, 1000)
          .pipe(
            takeUntil(markTimestamp$),
            repeatWhen(
              completeSbj => completeSbj.pipe(switchMapTo(
                continueFromLastTimestamp$.pipe(first())
              ))
            ),
            scan((acc) => acc - 1000, this.timePerQuestion * 1000)
          )
      ),
      takeUntil(stop$),
      repeatWhen(completeSbj => completeSbj.pipe(switchMapTo(start$.pipe(skip(1), first()))))
    ).subscribe(console.log));
  }

  calculateTotalElapsedTime(elapsedTimes: number[]): number {
    if (elapsedTimes.length > 0) {
      this.completionTime = elapsedTimes.reduce((acc, cur) => acc + cur, 0);
      return this.completionTime;
    }
  }

  sendCompletionTimeToTimerService(newValue) {
    this.completionCount = newValue;
    this.timerService.sendCompletionTimeToResults(this.completionCount);
  }
}