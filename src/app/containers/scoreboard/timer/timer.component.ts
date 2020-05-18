import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { concat, fromEvent, Observable, timer } from 'rxjs';
import { first, repeatWhen, scan, shareReplay, skip, switchMapTo, takeUntil } from 'rxjs/operators';

import { QuizService } from '../../../shared/services/quiz.service';
import { TimerService } from '../../../shared/services/timer.service';


@Component({
  selector: 'codelab-scoreboard-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnChanges {
  @Input() set selectedAnswer(value) { this.answer = value; }
  answer;
  hasAnswer: boolean;
  timeLeft: number;
  timePerQuestion = 20;
  elapsedTime: number;
  elapsedTimes: number[] = [];
  completionTime: number;
  completionCount: number;
  quizIsOver: boolean;
  inProgress: boolean;

  timer: Observable<number>;
  timerObserver: PartialObserver<number>;
  isStop = new Subject();
  isPause = new Subject();

  constructor(
    private quizService: QuizService,
    private timerService: TimerService
  ) { }

  ngOnInit(): void {
    this.timerService.timeLeft$.subscribe(data => {
      this.timeLeft = data;
    });
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

    const src$ = concat(
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
            scan((acc, crt) => acc - 1000, 20000)
          )
      ),
      takeUntil(stop$),
      repeatWhen(completeSbj => completeSbj.pipe(switchMapTo(start$.pipe(skip(1), first()))))
    ).subscribe(console.log);
  }

  goOn() {
    this.timer.subscribe(this.timerObserver);
  }

  pauseTimer() {
    this.isPause.next();
    // setTimeout(() => this.goOn(), 1000)
  }

  stopTimer() {
    this.timePerQuestion = 0;
    this.isStop.next();
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
