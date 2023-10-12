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
  isOwnedByCurrentUser: boolean = false;
  isStarActive = false;
  displayStyle = 'none';

  @ViewChild('videoElement') videoElement: ElementRef | undefined;
  @ViewChild('screenshotCanvas') screenshotCanvas: ElementRef | undefined;
  readonly typeStar: string = 'star';
  readonly typeSnapshot: string = 'snapshot';
  base64ImageData: string | null = null;



  constructor(
    private videoDetailService: VideoDetailService,
    private route: ActivatedRoute) {
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
      }
    });
  }

  fetchVideoDetails() {
    if (this.videoId !== null) {
      this.videoDetailService.getVideoDetails(this.videoId).subscribe(
        (data) => {
          this.videoDetails = data;
          if (this.videoDetails.author) {
            this.isVideoOwnedByCurrentUser(this.videoDetails.author.id)
          }
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
          this.videoReactions = data.reverse();
        },
        (error) => {
          console.error('Error fetching video Reactions:', error);
        }
      );
    }
  }

  updateVideoTitle() {
    const reactionData = {
      title: this.editedTitle
    };
    if (this.videoId !== null) {
      this.videoDetailService.updateVideoTitle(this.videoId, reactionData).subscribe(
        (data) => {
          console.log('Reaction sent successfully:', data);
        },
        (error) => {
          console.error('Error fetching video Reactions:', error);
        }
      );
    }
    
  }

  private sendReactionToServer(reactionData: any) {
    if (this.videoId !== null) {
      this.videoDetailService.sendReaction(this.videoId, reactionData).subscribe(
        (response) => {
          this.videoReactions = response.reverse();
          console.log('Reaction sent successfully:', response);
        },
        (error) => {
          console.error('Error sending reaction:', error);
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

  sendVideoReactionWithTimeFrame(type: string, timeframe: number) {
    const reactionData = {
      videoId: this.videoId,
      type: type,
      timeframe: timeframe,
    };
  
    this.sendReactionToServer(reactionData);
  }

  sendVideoReactionWithImageData(type: string, timeframe: number, base64ImageData: any) {
    const reactionData = {
      videoId: this.videoId,
      type: type,
      timeframe: timeframe,
      dataUri: base64ImageData
    };
  
    this.sendReactionToServer(reactionData);
  }

  takeScreenshot() {
    if (this.videoElement && this.screenshotCanvas) {
      const videoElement: HTMLVideoElement = this.videoElement.nativeElement;
      const screenshotCanvas: HTMLCanvasElement = this.screenshotCanvas.nativeElement;
      const context = screenshotCanvas.getContext('2d');

      if (context) {
        screenshotCanvas.width = videoElement.videoWidth;
        screenshotCanvas.height = videoElement.videoHeight;

        context.drawImage(videoElement, 0, 0, screenshotCanvas.width, screenshotCanvas.height);

        screenshotCanvas.style.display = 'block';

        const base64ImageData: string = screenshotCanvas.toDataURL('image/png');
        this.base64ImageData = screenshotCanvas.toDataURL('image/png');
        const currentTimeInSeconds = videoElement.currentTime;
        const minutes = (currentTimeInSeconds / 60).toFixed(4);
        this.sendVideoReactionWithImageData(this.typeSnapshot,parseInt(minutes),base64ImageData)

      }
    }

  }

  updateCurrentTimeAndSendReaction() {
    if (this.videoElement) {
      const video: HTMLVideoElement = this.videoElement.nativeElement;
      const currentTimeInSeconds = video.currentTime;
      const minutes = (currentTimeInSeconds / 60).toFixed(4);
      // this.currentTime = parseInt(minutes)
      this.sendVideoReactionWithTimeFrame(this.typeStar,parseInt(minutes))
    }
    this.isStarActive = !this.isStarActive;
    this.displayStyle = this.isStarActive ? 'block' : 'none';

  }

}
