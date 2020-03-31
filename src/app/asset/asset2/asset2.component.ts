import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Asset2Service} from './asset2.service';

@Component({
  selector: 'app-asset2',
  templateUrl: './asset2.component.html',
  styleUrls: ['./asset2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Asset2Component  {
  pageTitle = 'Asset List';
  errorMessage = '';
  categories;

  assets$ = this.asset2Service.assets$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  constructor( private asset2Service: Asset2Service ) { }



}
