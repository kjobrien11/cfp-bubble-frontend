import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BubbleService {

  constructor(private http: HttpClient) {}

  private apiUrl = '/bubbles';

  createBubble(teamIds: number[]): Observable<any> {
    let body = {
    "name": "KJ O'Brien",
    "email": "kjokjo219@gmail.comm",
    "teams": 
        teamIds
    
}
    return this.http.post<any>(this.apiUrl + "/create", body);
  }
}
