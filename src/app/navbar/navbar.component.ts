import { Component } from '@angular/core';
import { UserProfileService } from '../service/user-profile.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  userProfilePictureUrl: string = ''; 
  userName: string = '';
  userProfile: any = {};

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit() {
    this.fetchUserProfile();
  }

   fetchUserProfile() {
    this.userProfileService.getUserProfile().subscribe((response: any) => {
      const userProfileResponse = {
        id: response.id,
        name: response.name,
        pictureUrl: response.pictureUrl,
      };
      this.userProfile = userProfileResponse;
      this.setUserProfileInLocalStorage(userProfileResponse);
    });
  }

  private setUserProfileInLocalStorage(userProfile: any) {
    // Save the user profile data in local storage
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }
}

