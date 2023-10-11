import { Component, ElementRef, ViewChild } from '@angular/core';
import { VideoDetailService } from '../service/video-detail.service';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
// import { SnapshotReaction } from './path-to-snapshot-reaction';

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.css']
})
export class VideoDetailComponent {

  videoId: string | null = null;
  videoDetails: any;
  videoReactions: any;
  isEditing: boolean = false;
  editedTitle: string = '';
  user: any;
  isTitleEdited: boolean = true;
  type: string;
  timestamp: Date;
  isOwnedByCurrentUser: boolean = false;

  @ViewChild('videoElement', { static: true }) videoElement: ElementRef | undefined;
  screenshotDataUrl: string | undefined;
  screenshot: string | null = null;

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
        this.fetchVideoReactions()
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
          if(this.videoDetails.author) {
            this.isVideoOwnedByCurrentUser(this.videoDetails.author.id)
          }
          
          // console.log(this.videoDetails.url);
          // Handle the fetched video details here
        },
        (error) => {
          console.error('Error fetching video details:', error);
        }
      );
    }
  }

  fetchVideoReactions() {
    if (this.videoId !== null) {
      this.videoDetailService.getVideoReactions(this.videoId).subscribe(
        (data) => {
          this.videoReactions = data;
          console.log(this.videoReactions);
          // Handle the fetched video details here
        },
        (error) => {
          console.error('Error fetching video Reactions:', error);
        }
      );
    }
  }

  private getUserFromLocalStorage(): any {
    const storedUser = localStorage.getItem('userProfile');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  isVideoOwnedByCurrentUser(authorId: string): boolean {
    this.user = this.getUserFromLocalStorage();

    if (this.videoDetails && authorId !== null && this.user.id === authorId) {
      // If the video is owned by the logged-in user, enable editing
      this.isEditing = true;
      this.editedTitle = this.videoDetails.title;
      this.initializeTitleProperties();
      this.isOwnedByCurrentUser = true
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

  captureScreenshot1() {
    if (this.videoElement) {
      html2canvas(this.videoElement.nativeElement).then((canvas) => {
        // Convert the screenshot to a data URL
        this.screenshotDataUrl = canvas.toDataURL('image/png');
      });
    }
  }

  captureScreenshot(): void {

    const video = this.videoElement?.nativeElement;
    const canvas = document.createElement('canvas');
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.screenshot = canvas.toDataURL('image/png');
      }
    }

    // canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the captured frame to a data URL (base64)
    // this.screenshot = canvas.toDataURL('image/png');

    // You can also capture the video itself if needed
    // To capture the video, you can create a Blob from the video's MediaStream
    const mediaStream = video.captureStream();
    const mediaRecorder = new MediaRecorder(mediaStream);

    const videoChunks: Blob[] | undefined = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        videoChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: 'video/mp4' });
      // You can now use `videoBlob` to store or upload the captured video
    };

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 1000); // Capture video for 1 second (adjust as needed)
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
