/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { obfuscateText } from "@/lib/utils";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OtpVerificationProps {
  phoneNumber: string;
  onEditNumber: () => void;
  onOtpVerify: (otp: string) => void;
  disabled?: boolean;
}

export function OtpVerification({
  phoneNumber,
  onEditNumber,
  onOtpVerify,
  disabled = false,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (otp.length === 6) {
      onOtpVerify(otp);
    }
  }, [otp]);

  const handleOtpChange = (e: string) => {
    const value = e;
    setOtp(value);
  };

  const handleResend = () => {
    // Handle resend logic here
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        We&apos;ve sent a verification code to{" "}
        <span className="font-medium">{obfuscateText(phoneNumber, 0, 8)}</span>
      </p>

      <div className="flex items-center justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={handleOtpChange}
          placeholder="Enter 6-digit code"
          className="text-center text-lg tracking-widest"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator className=" hidden sm:block" />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex gap-2 justify-center">
        <Button variant="outline" size={"sm"} onClick={onEditNumber}>
          Edit Number
        </Button>
        <Button
          disabled={disabled}
          variant="secondary"
          size={"sm"}
          onClick={handleResend}
        >
          Resend Code
        </Button>
      </div>
    </div>
  );
}
