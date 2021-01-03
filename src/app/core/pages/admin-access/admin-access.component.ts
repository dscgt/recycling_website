import { Component, OnInit } from '@angular/core';
import { AdminAccessService } from 'src/app/modules/backend/services/implementations/firebase/admin-access/admin-access.service';

@Component({
  selector: 'app-admin-access',
  templateUrl: './admin-access.component.html',
  styleUrls: ['./admin-access.component.scss']
})
export class AdminAccessComponent implements OnInit {

  public adminEmail: string;
  public admins: string[] = [];

  constructor(
    private adminAccessService: AdminAccessService
  ) { }

  ngOnInit(): void {
    this.listenForAdmins();
  }

  listenForAdmins(): void {
    this.adminAccessService.getAdmins()
      .subscribe(admins => this.admins = admins);
  }

  addAdmin(): void {
    if (!this.adminEmail) {
      return;
    }
    const newAdmins = Array.from(this.admins);
    newAdmins.push(this.adminEmail.trim());
    this.adminAccessService.updateAdmins(newAdmins);
    this.adminEmail = '';
  }

  deleteAdmin(index: number): void {
    const newAdmins = Array.from(this.admins);
    newAdmins.splice(index, 1);
    this.adminAccessService.updateAdmins(newAdmins);
  }
}
