import { Grid, Typography, Link as MuiLink, IconButton, Divider } from "@mui/material"
import Link from "next/link"
import FacebookIcon from "@mui/icons-material/Facebook"
import TwitterIcon from "@mui/icons-material/Twitter"
import InstagramIcon from "@mui/icons-material/Instagram"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import Image from "next/image"

const footerSections = [
  {
    title: "Services",
    links: [
      { name: "Food Delivery", path: "/broskis" },
      { name: "Grocery Shop & Drop", path: "/otw" },
      { name: "Local Rides & Moving", path: "/otw" },
      { name: "Tier Membership", path: "/tier" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", path: "/about" },
      { name: "Partners", path: "/partners" },
      { name: "Volunteers", path: "/volunteers" },
      { name: "Hall of Hustle", path: "/hall-of-hustle" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", path: "/help" },
      { name: "Track Order", path: "/track" },
      { name: "Contact Us", path: "/contact" },
      { name: "Emergency", path: "/emergency" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Cookie Policy", path: "/cookies" },
      { name: "Accessibility", path: "/accessibility" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">About OTW</h3>
            <p className="text-gray-400">
              Delivering flavors and motion to your doorstep. Fast, reliable, and
              community-driven service.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/restaurants"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Restaurants
                </a>
              </li>
              <li>
                <a
                  href="/otw"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  OTW Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Email: support@otw.com</li>
              <li className="text-gray-400">Phone: (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-center">
            © {new Date().getFullYear()} OTW. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
