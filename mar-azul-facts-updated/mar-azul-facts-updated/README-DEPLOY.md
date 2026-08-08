# Mar Azul Legal — deployment notes

This is a static site intended for the existing Vercel project `mar-azul-facts`.

## Deploy

From this folder:

    vercel --prod

## Custom domain

Add `marazullegal.com` in the Vercel project under Domains and complete the DNS instructions Vercel provides.

The site already uses:

    https://marazullegal.com/

as its canonical URL and sitemap URL.

## Important

Do not enable a redirect from `mar-azul-facts.vercel.app` to `marazullegal.com` until the custom domain is connected and serving correctly.

After the custom domain is live, the old Vercel hostname can be redirected to the canonical domain in Vercel.

## Content

The site deliberately avoids presenting the website itself as a legal authority or as a substitute for independent professional advice. It presents the documentary record and identifies the relevant permits, authorities, dates and reference numbers.

Supporting documents can be added later as stable public files where publication is appropriate and personal/confidential information has been redacted.
