import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Team } from '../dtos/Team';



@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(private http: HttpClient) {}

  private apiUrl = '/teams';


  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  } 

  
}
