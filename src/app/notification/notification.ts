import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.html',
  styleUrls: ['./notification.css'],
})
export class NotificationComponent {
  phone: any;
  loading = false; 

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.phone = params['phone'];
    });
  }

  async enableNotifications() {
    try {
      this.loading = true; 

      const registration = await navigator.serviceWorker.register('assets/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(environment.VAPID_PUBLIC_KEY)
      });

      await this.http.post(`${environment.SERVER_URL}/subscribe`, {
        phone: this.phone,
        subscription
      }).toPromise();

      await this.http.post(`${environment.SERVER_URL}/send`, {
        phone: this.phone,
        title: 'Welcome!',
        body: 'Notifications enabled'
      }).toPromise();
      console.log('Subscribed and test notification sent');

    } catch (err) {
      console.error('Subscription failed:', err);
      alert('Notification subscription failed. Check console.');
    } finally {
      this.loading = false;
    }
  }

  urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
  }
}