import { Injectable, Logger } from '@nestjs/common';

/**
 * Simple OTP sender that mocks the delivery provider.
 * Logs the OTP to the application logger so that future integrations
 * with SMS/email providers can reuse the same contract.
 */
@Injectable()
export class OtpSenderService {
  private readonly logger = new Logger(OtpSenderService.name);

  async sendOtp(curp: string, otp: string): Promise<void> {
    this.logger.log(`OTP for CURP ${curp}: ${otp}`);
  }
}
