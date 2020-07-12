import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IntroductionComponent } from '../containers/introduction/introduction.component';
import { QuizComponent } from '../containers/quiz/quiz.component';
import { QuizSelectionComponent } from '../containers/quiz-selection/quiz-selection.component';
import { ResultsComponent } from '../containers/results/results.component';

const routes: Routes = [
  { path: '', redirectTo: 'select', pathMatch: 'full' },
  { path: 'select', component: QuizSelectionComponent, pathMatch: 'full' },
  { path: 'intro', component: IntroductionComponent, pathMatch: 'full' },
  { path: 'intro/:id', component: IntroductionComponent, pathMatch: 'full' },
  { path: 'question', component: QuizComponent, pathMatch: 'full' },
  { path: 'question/:questionIndex', component: QuizComponent, pathMatch: 'full' },
  { path: 'results', component: ResultsComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class QuizRoutingModule {}
