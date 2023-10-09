import { Component } from '@angular/core';
import { VideoDetailService } from '../service/video-detail.service';
import { ActivatedRoute } from '@angular/router';
// import { SnapshotReaction } from './path-to-snapshot-reaction';

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.css']
})
export class VideoDetailComponent {

  videoId: string | null = null;
  videoDetails: any;
  isEditing: boolean = false;
  editedTitle: string = '';
  user: any;
  isTitleEdited: boolean = true;
  type: string;
  timestamp: Date;

  constructor(
    private videoDetailService: VideoDetailService,
    private route: ActivatedRoute) {
    this.type = 'Snapshot';
    this.timestamp = new Date();
  }

  ngOnInit(): void {
    this.extractVideoIdFromRoute();
  }

  private extractVideoIdFromRoute() {
    this.route.paramMap.subscribe(params => {
      const paramVideoId = params.get('videoId');
      if (paramVideoId !== null) {
        this.videoId = paramVideoId;
        this.fetchVideoDetails();
      } else {
        this.videoId = null;
        // Handle the case where videoId is null, e.g., show an error or redirect
      }
    });
  }

  fetchVideoDetails() {
    if (this.videoId !== null) {
      this.videoDetailService.getVideoDetails(this.videoId).subscribe(
        (data) => {
          this.videoDetails = data;
          // console.log(this.videoDetails.url);
          // Handle the fetched video details here
        },
        (error) => {
          console.error('Error fetching video details:', error);
        }
      );
    }
  }

  private getUserFromLocalStorage(): any {
    const storedUser = localStorage.getItem('userProfile');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  isVideoOwnedByCurrentUser(): boolean {
    this.user = this.getUserFromLocalStorage();

    if (this.videoDetails.author.id !== null && this.user.id === this.videoDetails.author.id) {
      // If the video is owned by the logged-in user, enable editing
      this.isEditing = true;
      this.editedTitle = this.videoDetails.title;
      this.initializeTitleProperties();
      return true;
    }

    return false;
  }

  initializeTitleProperties() {
    this.editedTitle = this.videoDetails.title;
    this.isTitleEdited = false;
  }

  checkIfTitleIsEdited() {
    this.isTitleEdited = this.editedTitle !== this.videoDetails.title;
  }

  saveTitle() {
    this.isEditing = false
  }

  // takeSnapshot() {
  //   const snapshotReaction = new SnapshotReaction();
  
  //   // Send the Snapshot Reaction to the server
  //   this.videoService.createReaction(this.videoId, snapshotReaction).subscribe((response: any) => {
  //     // Assuming the server responds with the created Snapshot Reaction
  //     const createdSnapshotReaction: SnapshotReaction = response;
  
  //     // Add the created Snapshot Reaction to the list of reactions
  //     this.reactions.unshift(createdSnapshotReaction);
  //   });
  // }

}
