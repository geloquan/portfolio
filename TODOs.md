# Owner verification before launch

These items are intentionally left as explicit verification tasks rather than inferred public claims.

- [ ] **Medical Arts project:** Confirm project scope, your role, dates, technology stack, and at least one feature or outcome from project records. Update the corresponding owner-verification fields in `src/App.tsx`.
- [ ] **Project media:** Add verified, authorized screenshots/videos to `public/assets/media/projects/flagship/`, `medical-arts/`, `seashell/`, and `doctor-directory/`, then configure the matching `VITE_PROJECT_*_MEDIA_URL` paths. Check that each file correctly matches the project.
- [ ] **Research publication:** Verify publication status and date against the original publisher. The CV lists September 2026; confirm this date/status before presenting it as published. Add a verified public paper URL, or confirm that the bundled thesis PDF is cleared for public distribution.
- [ ] **Contact delivery:** Configure a trusted server-side contact endpoint and replace the `sendInquiry` stub in `src/App.tsx`. Test delivery, abuse protection, and failure/retry handling before inviting inquiries. Until then, the form explicitly states that messages are not sent.
- [ ] **Pre-launch:** Review all public copy, CV-derived metrics, dates, links, downloadable files, image rights, and contact details for accuracy and permission to publish. Run `npm run check:placeholders` to catch new markers, then resolve each current owner verification item before launch.
