import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendReservationConfirmation(email: string, name: string, slotNumber: string, location: string, time: Date) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reservation Confirmed',
      template: './reservation-confirmed', 
      context: { name, slotNumber, location, time }, 
    });
  }

  async sendReservationCancelled(email: string, name: string, slotNumber: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reservation Cancelled',
      template: './reservation-cancelled',
      context: { name, slotNumber },
    });
  }
}