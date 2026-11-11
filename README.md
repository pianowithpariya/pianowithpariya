# Piano with Pariya: website

A one-page website: `index.html`, `styles.css`, `script.js`. No build step. Upload the three files to any web host.

Animation uses GSAP (with ScrollTrigger) and Lenis smooth scrolling, loaded from the jsDelivr CDN. If they fail to load, or a visitor has "reduce motion" turned on, the site still works with simple fades or no motion.

## Before launch

### 1. Connecting the inquiry form (required)

The form validates and shows a confirmation, but it does not send anything until it is connected. Until then it runs in "preview mode" and says so.

Your email address never appears on the website. The form uses Web3Forms, which gives you an access key that stands in for your address.

1. Go to web3forms.com and enter the email address where inquiries should be delivered.
2. Web3Forms emails you an access key (a long code).
3. In `index.html`, find `data-access-key=""` on the `<form id="inquiry-form">` tag and paste the key between the quotes.

Each inquiry then arrives by email with these fields: `parent_name`, `student_age`, `experience`, `location`, `availability`, `phone`, `email`, `comments`.

### Getting inquiries on your phone

Inquiries arrive as email. With that inbox set up in the Mail app on your phone and notifications on, each one shows up as a notification right away. A true SMS text for each inquiry needs a paid messaging service (for example Twilio, connected through Zapier or Make); it can be added later.

### 2. Once you have a web address

Add `<link rel="canonical" href="https://your-domain/">` and an `og:url` meta tag in the `<head>` of `index.html`.

## Photography

The only photo is your portrait, `images/pariya.jpg`. To add more of your own later, put them in the `images` folder and reference them with `<img>` tags.

## Preview on your computer

Open `index.html` in a browser.
