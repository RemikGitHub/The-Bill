import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { map, Observable } from 'rxjs';
import { SettlementService } from '../service/settlement.service';

@Injectable({
  providedIn: 'root',
})
export class SelectedSettlementGuard implements CanActivate {
  constructor(
    private settlementService: SettlementService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.settlementService.getSelectedSettlement().pipe(
      map((selectedSettlement) => {
        if (!!selectedSettlement) {
          return true;
        }
        this.router.navigate(['settlements']);
        return false;
      })
    );
  }
}
