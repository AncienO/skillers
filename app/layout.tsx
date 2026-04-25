// Import React components and standard Next.js types
import type { Metadata } from "next"
// Import Inter font from Google Fonts for a premium, modern typography feel
import { Inter } from "next/font/google"
// Import global Tailwind styles
import "./globals.css"

// Initialize the Inter font with latin subset
const inter = Inter({ subsets: ["latin"] })

// Export global metadata for SEO best practices
export const metadata: Metadata = {
  // Title template for child pages
  title: {
    // Default title
    default: "Skillers - Community Directory",
    // Template for specific pages
    template: "%s | Skillers"
  // End title configuration
  },
  // Compelling meta description for the directory
  description: "A platform where community members showcase who they are and the goals they are working toward.",
// End metadata object
}

// Export the root layout component
export default function RootLayout({
  // Accept children prop representing nested pages
  children,
// End props
}: Readonly<{
  // Type definition for children
  children: React.ReactNode
// End type definition
}>) {
  // Return the base HTML structure
  return (
    // Set language to English and add font classes
    <html lang="en" className={inter.className}>
      {/* 
        The body tag with background transitions.
        Using antialiased for smoother font rendering.
      */}
      <body className="antialiased min-h-screen transition-colors duration-300">
        {/* Render the children content */}
        {children}
        {/* Google Analytics 4 Script - injected dynamically if measurement ID exists */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          // Use standard React fragment
          <>
            {/* Load the external GA4 script asynchronously */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            // Close script tag
            />
            {/* Inline script to initialize GA4 datalayer */}
            <script
              dangerouslySetInnerHTML={{
                // Set the exact GA4 initialization script
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              // End dangerous inner HTML
              }}
            // Close script tag
            />
          {/* End Fragment */}
          </>
        // End conditionally rendered script
        )}
      {/* End body */}
      </body>
    {/* End HTML */}
    </html>
  // End return
  )
// End RootLayout component
}
