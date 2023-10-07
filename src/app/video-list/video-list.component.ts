import { Component } from '@angular/core';
import { VideoService } from '../service/video-list.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.css']
})
export class VideoListComponent {

  videos: any[] = [];
  user: any;
  userAuthoredVideos: any[] = [];
  isGridFormat = true;
  dataSource = new MatTableDataSource<any>([]);

  constructor(private videoService: VideoService) { }

  ngOnInit() {
    this.fetchVideos();
  }

  fetchVideos() {
    this.videoService.getVideos().subscribe((response: any) => {
      this.videos = response;
  
      this.filterVideosByAuthor(this.videos);
    });
  }
  
  // Modify filterVideosByAuthor to accept the videos array as a parameter
  private filterVideosByAuthor(videos: any[]): void {
    const user = this.getUserFromLocalStorage(); 
  
    if (!user) {
      console.log('User not found in local storage');
      return;
    }
  
    const userAuthoredVideos = videos.filter((video) => {
      return video.author.id === user.id;
    });

    this.userAuthoredVideos = userAuthoredVideos
    this.dataSource.data = this.userAuthoredVideos;

  }
  
  private getUserFromLocalStorage(): any {
    const storedUser = localStorage.getItem('userProfile');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  handleListButtonClick(){
    
    this.isGridFormat = false
  }

  handleGridViewClick(){
    this.isGridFormat = true
  }
  



}
