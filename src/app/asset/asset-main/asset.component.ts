import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AssetService} from './asset.service';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetComponent  {
  pageTitle = 'Asset List';
  errorMessage = '';
  categories;

  assets$ = this.assetService.assets$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
    );

  constructor( private assetService: AssetService ) { }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    console.log('Not yet implemented');
  }
}
