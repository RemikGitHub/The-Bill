import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { User } from '../api/user';
import { map, ReplaySubject } from 'rxjs';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
import {
  AngularFirestore,
  CollectionReference,
} from '@angular/fire/compat/firestore';
import { Settlement } from '../api/settlement';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userUpdate: ReplaySubject<User> = new ReplaySubject<User>(1);

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore
  ) {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.userUpdate.next(this.formatToCustomUser(user));
      }
    });
  }

  getUser(): ReplaySubject<User> {
    return this.userUpdate;
  }

  logout() {
    return this.afAuth.signOut().then(() => {
      this.router.navigate(['login']).then(() => {
        this.userUpdate.next(null);
      });
    });
  }

  addUserToFirestore(user: User) {
    const formattedUser = this.formatToCustomUser(user);
    return this.firestore
      .collection('/users')
      .doc(formattedUser.uid)
      .set(formattedUser);
  }

  getsSettlementUsers(settlement: Settlement) {
    const usersId = Object.keys(settlement.permissions);

    const query = (ref: CollectionReference) => {
      return ref.where('uid', 'in', usersId);
    };

    return this.firestore
      .collection<User>('/users', query)
      .get()
      .pipe(
        map(
          (users) =>
            users.docs.map(
              (usersDocument) => usersDocument.data() as User
            ) as User[]
        )
      );
  }

  getsUserById(userId: string) {
    return this.firestore.collection<User>('/users').doc(userId).get();
  }

  private formatToCustomUser(userFromApi): User {
    return {
      uid: userFromApi.uid,
      email: userFromApi.email,
      displayName: userFromApi.displayName,
      photoURL: userFromApi.photoURL,
      emailVerified: userFromApi.emailVerified,
    };
  }
}
