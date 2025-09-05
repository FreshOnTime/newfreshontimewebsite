/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { PhoneNumberInput } from "./phone-number-input";
import { OtpVerification } from "./otpverification";
import { PageContainer } from "@/components/templates/PageContainer";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "@/config/firebase";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

// Import the User type from AuthContext
interface User {
  userId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber: string;
  role: string;
  _id: string;
}

export default function PhoneAuthPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOtpState, setIsOtpState] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpConfirmation, setOtpCofirmation] =
    useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (user) {
      handleUserRedirect(user);
    }
  }, [user]);

  const getRedirectUrl = () => {
    const redirectUrl = `/${searchParams.get("redirect") || ""}` || "/";
    if (redirectUrl.includes("auth")) {
      return "/";
    }

    return redirectUrl;
  };

  const handleUserRedirect = async (user: User) => {
    const redirectUrl = getRedirectUrl();

    try {
      if (user) {
        const response = await fetch(`/api/users/exists/${user.userId}`);
        if (response.ok) {
          toast.success("Welcome back! You are now logged in");
          router.push(redirectUrl);
          return;
        } else {
          toast.success("Welcome to Fresh Pick!");
          router.push("register");
          return;
        }
      }
    } catch {
      toast.error("Something went wrong");
      router.push(redirectUrl);
    }
  };

  useEffect(() => {
    const recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });

    setRecaptchaVerifier(recaptcha);

    return () => {
      recaptcha?.clear();
    };
  }, [auth]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendCountdown]);

  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone);
    sendOtp(phone);
  };

  const handleEditNumber = () => {
    setIsOtpState(false);
  };

  const sendOtp = async (phone: string) => {
    setResendCountdown(60);

    try {
      if (!recaptchaVerifier) {
        toast.error("Recaptcha is not initialized");
        return;
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        recaptchaVerifier
      );
      setOtpCofirmation(confirmation);
      setIsOtpState(true);

      toast.success("Verification Sent");
    } catch (e) {
      setResendCountdown(0);
      if (e instanceof FirebaseError) {
        if (e.code === "auth/invalid-phone-number") {
          toast.error("Invalid phone number");
        } else if (e.code === "auth/too-many-requests") {
          toast.error("Too many requests");
        } else {
          toast.error(e.code);
        }
      }
    }
  };

  const verifyOtp = async (otp: string) => {
    try {
      if (otpConfirmation) {
        await otpConfirmation.confirm(otp);
        toast.success("Verified Successfully");
      }
    } catch (e) {
      if (e instanceof FirebaseError) {
        if (e.code === "auth/invalid-verification-code") {
          toast.error("Invalid OTP");
        } else {
          toast.error("Something went wrong");
        }
      }
    }
  };

  return (
    <PageContainer className="min-h-screen flex items-center justify-center py-12">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bgs/landing-page-bg-1.jpg"
          alt="Fresh vegetables background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 to-green-600/30 backdrop-blur-md"></div>
      </div>

      <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-8">
          <Image
            src="/fresh-pick.svg"
            alt="Fresh vegetables background"
            width={160}
            height={48.5}
            className="object-cover"
            priority
          />
        </div>

        {!isOtpState ? (
          <PhoneNumberInput
            onSubmit={handlePhoneSubmit}
            disabled={resendCountdown > 0}
          />
        ) : (
          <OtpVerification
            phoneNumber={phoneNumber}
            onEditNumber={handleEditNumber}
            onOtpVerify={verifyOtp}
            disabled={resendCountdown > 0}
          />
        )}

        {resendCountdown > 0 && (
          <p className="text-center font-semibold text-gray-600 text-sm mt-4">
            Resend OTP in {resendCountdown}s
          </p>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </PageContainer>
  );
}
