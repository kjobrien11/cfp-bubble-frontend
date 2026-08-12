import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BubbleRequest } from '../dtos/bubble-request';
import { Team } from '../dtos/team';

@Injectable({
  providedIn: 'root'
})
export class BubbleService {

  constructor(private http: HttpClient) {}

  private apiUrl = '/bubbles';

  createBubble(request: BubbleRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl + "/create", request);
  }

  getBubblesByEmail(email:string): Observable<any[]>{
    return this.http.get<any>(this.apiUrl + "?email=" + email);
  }
}
