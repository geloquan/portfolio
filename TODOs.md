# Owner verification before launch

These items are intentionally left as explicit verification tasks rather than inferred public claims.

- [ ] **Medical Arts project:** Confirm project scope, your role, dates, technology stack, and at least one feature or outcome from project records. Update the corresponding owner-verification fields in `src/App.tsx`.
- [ ] **Public project media:** Configure verified, shareable media URLs for each project using the `VITE_PROJECT_*_MEDIA_URL` variables. Check that screenshots/videos are authorized for public use and correctly match the project.
- [ ] **Research publication:** Verify publication status and date against the original publisher. The CV lists September 2026; confirm this date/status before presenting it as published. Add a verified public paper URL, or confirm that the bundled thesis PDF is cleared for public distribution.
- [ ] **Contact delivery:** Configure a trusted server-side contact endpoint and replace the `sendInquiry` stub in `src/App.tsx`. Test delivery, abuse protection, and failure/retry handling before inviting inquiries. Until then, the form explicitly states that messages are not sent.
- [ ] **Local credentials:** The ignored local `.env` may contain R2 credentials. Rotate them if they have ever been exposed or shared; do not place credentials in `VITE_*` variables or client bundles.
- [ ] **Pre-launch:** Review all public copy, CV-derived metrics, dates, links, downloadable files, image rights, and contact details for accuracy and permission to publish. Run `npm run check:placeholders` to catch new markers, then resolve each current owner verification item before launch.
