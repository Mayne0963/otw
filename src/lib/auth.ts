import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        // Get the email server configuration from environment variables
        const { host, port, user, pass } = {
          host: process.env.EMAIL_SERVER_HOST,
          port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        };

        // Create a nodemailer transporter
        const nodemailer = await import("nodemailer");
        const transport = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });

        // Send the verification email
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to OTW`,
          text: `Hello,\n\nClick the link below to sign in to your account:\n\n${url}\n\nIf you did not request this email, you can safely ignore it.\n\nThanks,\nOTW Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; text-align: center;">Sign in to OTW</h2>
              <p>Hello,</p>
              <p>Click the button below to sign in to your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Sign in</a>
              </div>
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">${url}</p>
              <p>If you did not request this email, you can safely ignore it.</p>
              <p>Thanks,<br>OTW Team</p>
            </div>
          `,
        });
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user = {
          name: session.user?.name,
          email: session.user?.email,
          image: session.user?.image,
          id: token.sub,
        } as any;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
};
