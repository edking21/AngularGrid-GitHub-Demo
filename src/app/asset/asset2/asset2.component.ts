import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Asset2Service} from './asset2.service';
import { Asset } from '../asset';

@Component({
  selector: 'app-asset2',
  templateUrl: './asset2.component.html',
  styleUrls: ['./asset2.component.scss']
})
export class Asset2Component implements OnInit {
  errorMessage = '';
  assets: Asset[] = [];  
  sub: Subscription;

  constructor( private asset2Service: Asset2Service, ) { }

  ngOnInit(): void {
    this.sub = this.asset2Service.getAssets()
      .subscribe(
        assets => this.assets = assets,
        error => this.errorMessage = error
      )
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
