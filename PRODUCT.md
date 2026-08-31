# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React (client-side SPA), deployable to any static host.

## Users

Prospective and returning clients of a women's beauty salon: people researching services, professionals, and pricing before deciding where to book, and people ready to book an appointment directly from the site.

## Product Purpose

A public website for a women's beauty salon ("Sakura Bloom") that showcases the salon's work (portfolio), services, pricing, and professionals, with the core goal of converting visitors into booked appointments online.

## Positioning

Unlike a salon site that only lists information, this site closes the loop by letting a visitor go from browsing a professional's work and prices straight to booking an appointment with that professional, in one flow.

## Operating Context

- Portfolio: photos of completed work (hair, nails, facials, etc. — exact service mix TBD as content is built).
- Services: a defined service list, each with pricing.
- Professionals: staff profiles (name, specialty, portfolio tie-in).
- Booking: the primary conversion action across the site.

## Capabilities and Constraints

- Client-side SPA (Vite + React); no backend framework decided yet.
- Booking mechanism (real scheduling backend vs. a request/contact-style form vs. third-party booking widget) is undecided — treat as an open implementation decision for the surface that needs it, not an assumption to bake in silently.
- No CMS decided; content (services, prices, professionals) will initially live in the codebase.

## Brand Commitments

Visual direction: **Elegant Spa Classic** — the category-standard look, chosen deliberately by the user over bespoke bold directions (an earlier "Appointment Ledger" leather/stamp/ticket concept was built and explicitly rejected as gimmicky and wrong-personality). Executed straight, at full fidelity, no irony or smuggled quirk. Craft bar, user-named and directly studied: [goldustspa.com](https://goldustspa.com) (soft italic display type, rounded organic photo shapes, romantic blush/cream/gold) and [venetianspa.ca](https://venetianspa.ca) (bold tracked display headlines, arched photo frames, ornamental flourish motifs). Palette: soft neutral warm — cream ground, sakura-pink and sage accents, warm taupe ink, soft gold fine details. Typography: an editorial serif display (Libre Caslon Display, with Libre Caslon Text italic for emphasis) with a humanist sans body (Work Sans) — light, airy, generous whitespace, real photography. Brand name, user-chosen: **Sakura Bloom** — picked from four options against Casa Sakura, Hanami, and Flor de Cerezo. The user then directed that the entire personality run on cherry blossom ("el nombre, logos, fondos etc"), at the most immersive of three offered intensities. So the sakura motif is no longer one authored accent over the category standard — it is the identity the standard is executed in: a single five-petal notched mark (logo, favicon, dome apex, card seal, booking confirmation), a rose ramp promoted from accent to primary with --cherry as the AA-contrast action weight, a sparse fallen-petal ground texture under every full-width surface, and a line-art bough entering each section from a different corner. The discipline that replaces "one accent only" is "one shape, many scales" — see DESIGN.md. The salon has a logo now (Logo in src/components/Sakura.jsx, inline for nav, stacked for footer) and a favicon drawn from the same path.

## Evidence on Hand

No real photos, prices, or professional bios exist yet. The user has asked that real images be sourced via URL (found and presented for approval) rather than invented or left as generic placeholder blocks — this applies to imagery only, not to factual claims like pricing, credentials, or testimonials, which must not be fabricated and should stay clearly marked as placeholder text until real content is supplied.

## Product Principles

- Every page should move a visitor toward booking, not just inform them.
- Visual proof (the work itself) carries more weight than descriptive copy in this category.
- Professionals are a trust signal — give them real presence, not an afterthought staff list.
- Pricing and services must be scannable at a glance; hiding them costs trust in this category.
