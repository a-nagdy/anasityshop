import connectToDatabase from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Settings from "../models/Settings";

export async function POST(request: NextRequest) {
    try {
        const { name, email, subject, message } = await request.json();

        // Validate input
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        // Get email credentials from environment or database
        let gmailUser = process.env.GMAIL_USER;
        let gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

        // If not in environment, try to get from database
        if (!gmailUser || !gmailAppPassword) {
            try {
                await connectToDatabase();
                const homepageSettings = await Settings.findOne({ name: "homepage" });

                if (homepageSettings?.value?.emailConfig) {
                    gmailUser = gmailUser || homepageSettings.value.emailConfig.gmailUser;
                    gmailAppPassword =
                        gmailAppPassword || homepageSettings.value.emailConfig.gmailAppPassword;
                }
            } catch (dbError) {
                console.error("Error fetching email config from database:", dbError);
            }
        }

        // Check if we have credentials
        if (!gmailUser || !gmailAppPassword) {
            return NextResponse.json(
                {
                    error:
                        "Email service is not configured. Please contact the administrator.",
                },
                { status: 503 }
            );
        }

        // Create transporter using Gmail
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: gmailUser,
                pass: gmailAppPassword,
            },
        });

        // Email to admin (you)
        const adminMailOptions = {
            from: gmailUser,
            to: gmailUser,
            subject: `New Contact Form: ${subject}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ec4899;">New Contact Form Submission</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Reply directly to this email to respond to ${name} at ${email}
          </p>
        </div>
      `,
            replyTo: email,
        };

        // Auto-reply email to user
        const userMailOptions = {
            from: gmailUser,
            to: email,
            subject: `Re: ${subject} - We've received your message!`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ec4899;">Thank you for contacting Elyana!</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you as soon as possible, usually within 24 hours.</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <p>If you have any urgent concerns, please don't hesitate to reach out to us directly at ${gmailUser}</p>
          
          <p>Best regards,<br/>The Elyana Team</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated response. Please do not reply directly to this email.
          </p>
        </div>
      `,
        };

        // Send both emails
        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(userMailOptions);

        return NextResponse.json(
            { message: "Message sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json(
            { error: "Failed to send message. Please try again later." },
            { status: 500 }
        );
    }
}
