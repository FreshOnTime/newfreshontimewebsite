import { NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import { Subscriber } from "@/lib/models/Subscriber";
import { sendEmail } from "@/lib/services/mailService";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const email = String(data.email || "").toLowerCase().trim();
    const source = data.source || "homepage";

    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { ok: false, error: "You're already subscribed!" },
          { status: 409 }
        );
      } else {
        // Reactivate subscription
        existing.isActive = true;
        existing.subscribedAt = new Date();
        existing.unsubscribedAt = undefined;
        await existing.save();
      }
    } else {
      // Create new subscriber
      await Subscriber.create({ email, source });
    }

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(email).catch(console.error);

    return NextResponse.json({
      ok: true,
      message: "Successfully subscribed!",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string) {
  try {
    await sendEmail(
      email,
      "Welcome to Fresh Pick! 🥬",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669, #047857); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Fresh Pick!</h1>
          </div>
          <div style="padding: 30px 20px; background: #f9fafb;">
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Thanks for subscribing! You'll now receive:
            </p>
            <ul style="font-size: 16px; color: #374151; line-height: 1.8;">
              <li>🏷️ Exclusive weekly deals and discounts</li>
              <li>🥗 Fresh recipes and cooking tips</li>
              <li>🚚 Early access to new products</li>
              <li>🎁 Special subscriber-only offers</li>
            </ul>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://freshpick.lk/products" 
                 style="background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold;">
                Start Shopping
              </a>
            </div>
          </div>
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Fresh Pick - Pick Fresh, Live Easy</p>
          </div>
        </div>
      `
    );
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}
