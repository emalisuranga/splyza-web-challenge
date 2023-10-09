import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoDetailService {

  private apiUrl = 'http://localhost:3000/api/videos';

  constructor(private http: HttpClient) { }

  getVideoDetails(videoId: string): Observable<any> {
    const url = `${this.apiUrl}/${videoId}`;
    return this.http.get(url);
  }
}
