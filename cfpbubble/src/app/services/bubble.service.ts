import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BubbleRequest } from '../dtos/bubble-request';
import { Team } from '../dtos/team';
import { Bubble } from '../dtos/bubble';

@Injectable({
  providedIn: 'root'
})
export class BubbleService {

  constructor(private http: HttpClient) { }

  private apiUrl = '/bubbles';

  createBubble(request: BubbleRequest): Observable<string> {
    return this.http.post(
      this.apiUrl + '/create',
      request,
      { responseType: 'text' }
    );
  }

  getBubblesByEmail(email: string): Observable<any[]> {
    return this.http.get<any>(this.apiUrl + "?email=" + email);
  }

  getBubbles(): Observable<Bubble[]> {
    return this.http.get<Bubble[]>(this.apiUrl);
  }
  getUniqueUserCount(): Observable<number> {
    return this.http.get<number>(
      this.apiUrl + '/users/count'
    );
  }
}
