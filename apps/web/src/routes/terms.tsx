import { createFileRoute, Link } from "@tanstack/react-router"
import { PageLayout } from "@/components/page-layout"

export const Route = createFileRoute("/terms")({
	component: TermsOfService,
})

function Section({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col gap-3">{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return <h2 className="text-xl font-semibold text-foreground">{children}</h2>
}

function P({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-sm leading-relaxed text-text-secondary">{children}</p>
	)
}

function UL({ children }: { children: React.ReactNode }) {
	return (
		<ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-secondary">
			{children}
		</ul>
	)
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="text-cyan hover:underline"
		>
			{children}
		</a>
	)
}

function TermsOfService() {
	return (
		<PageLayout
			title="Terms of Service"
			subtitle="Last updated: November 5, 2026"
		>
			<div className="flex flex-col gap-8">
				<Section>
					<P>
						These Terms of Service (&quot;Terms&quot;) govern Your use of
						batchmate, including the mobile application and the website
						accessible from{" "}
						<A href="https://batchmate.app">https://batchmate.app</A> (together,
						the &quot;Service&quot;), provided by Left Shift Logical, LLC, 418
						Broadway STE N, Albany, NY, 12207 (&quot;the Company&quot;,
						&quot;We&quot;, &quot;Us&quot; or &quot;Our&quot;).
					</P>
					<P>
						By accessing or using the Service, You agree to be bound by these
						Terms. If You do not agree, do not use the Service.
					</P>
				</Section>

				<Section>
					<SectionTitle>Eligibility and Accounts</SectionTitle>
					<P>
						The Service is intended for members of the Recurse Center community.
						You sign in using Your Recurse Center account, and Your access to
						the Service depends on that account remaining active and in good
						standing. Your use of Your Recurse Center account is also subject to
						the Recurse Center&apos;s own terms and policies.
					</P>
					<P>
						You are responsible for all activity that occurs under Your account
						and for keeping Your Device and sign-in credentials secure. Notify
						Us promptly at{" "}
						<A href="mailto:support@leftshift.com">support@leftshift.com</A> if
						You believe Your account has been accessed without authorization.
					</P>
					<P>
						You must be at least 13 years old, or the minimum age required in
						Your country, to use the Service.
					</P>
				</Section>

				<Section>
					<SectionTitle>Building Access</SectionTitle>
					<P>
						The Service may allow You to unlock doors or operate the intercom at
						the Recurse Center space. This feature is provided only for Your own
						authorized entry. You agree to:
					</P>
					<UL>
						<li>
							Use building access features only when You are authorized to enter
							the space;
						</li>
						<li>
							Not let in, or unlock doors for, anyone who is not permitted to
							enter;
						</li>
						<li>
							Follow all rules and instructions of the Recurse Center and the
							building regarding access and security.
						</li>
					</UL>
					<P>
						Building access may be unavailable at any time due to network,
						hardware, or third-party issues. Do not rely on the Service as Your
						only means of entry.
					</P>
				</Section>

				<Section>
					<SectionTitle>Your Content</SectionTitle>
					<P>
						You may submit content to the Service, such as presentation
						sign-ups, check-ins, and profile information. You keep ownership of
						Your content. You grant Us a non-exclusive, worldwide, royalty-free
						license to host, store, display, and process Your content solely to
						operate and provide the Service.
					</P>
					<P>
						You are responsible for Your content and represent that You have the
						right to submit it. We may remove content that violates these Terms.
					</P>
				</Section>

				<Section>
					<SectionTitle>Acceptable Use</SectionTitle>
					<P>You agree not to:</P>
					<UL>
						<li>
							Use the Service in violation of any applicable law or the Recurse
							Center&apos;s policies;
						</li>
						<li>
							Harass, abuse, or harm other members, or post content that is
							unlawful, hateful, or infringes anyone&apos;s rights;
						</li>
						<li>
							Access or attempt to access accounts, data, or systems You are not
							authorized to access;
						</li>
						<li>
							Interfere with or disrupt the Service, its servers, or connected
							networks, or attempt to bypass any security measures;
						</li>
						<li>
							Scrape, collect, or export other members&apos; information for
							purposes unrelated to the Recurse Center community.
						</li>
					</UL>
				</Section>

				<Section>
					<SectionTitle>Privacy</SectionTitle>
					<P>
						Our collection and use of Personal Data is described in Our{" "}
						<Link to="/privacy" className="text-cyan hover:underline">
							Privacy Policy
						</Link>
						. By using the Service, You agree to that collection and use.
					</P>
				</Section>

				<Section>
					<SectionTitle>Third-Party Services</SectionTitle>
					<P>
						The Service relies on third-party services, including the Recurse
						Center API, Zoom, and Cloudflare. We are not responsible for the
						availability, content, or practices of third-party services, and
						Your use of them may be subject to their own terms.
					</P>
				</Section>

				<Section>
					<SectionTitle>Termination</SectionTitle>
					<P>
						We may suspend or terminate Your access to the Service at any time,
						without prior notice, if You violate these Terms or if Your Recurse
						Center account is no longer active. You may stop using the Service
						at any time. To request deletion of Your data, see Our{" "}
						<Link to="/support" className="text-cyan hover:underline">
							Support
						</Link>{" "}
						page.
					</P>
				</Section>

				<Section>
					<SectionTitle>Disclaimer of Warranties</SectionTitle>
					<P>
						The Service is provided &quot;AS IS&quot; and &quot;AS
						AVAILABLE&quot;, without warranties of any kind, whether express or
						implied, including implied warranties of merchantability, fitness
						for a particular purpose, and non-infringement. We do not warrant
						that the Service will be uninterrupted, secure, or error-free.
					</P>
				</Section>

				<Section>
					<SectionTitle>Limitation of Liability</SectionTitle>
					<P>
						To the maximum extent permitted by applicable law, the Company will
						not be liable for any indirect, incidental, special, consequential,
						or punitive damages, or any loss of data, use, or goodwill, arising
						out of or related to Your use of the Service. The Company&apos;s
						total liability for any claim relating to the Service will not
						exceed one hundred US dollars (US$100).
					</P>
					<P>
						Some jurisdictions do not allow the exclusion of certain warranties
						or the limitation of liability, so some of the above limitations may
						not apply to You.
					</P>
				</Section>

				<Section>
					<SectionTitle>Governing Law</SectionTitle>
					<P>
						These Terms are governed by the laws of the State of New York,
						United States, without regard to its conflict of law rules. Any
						dispute arising from these Terms or the Service will be resolved in
						the state or federal courts located in New York, and You consent to
						the jurisdiction of those courts. If You are a consumer in the
						European Union or United Kingdom, You also benefit from any
						mandatory provisions of the law of Your country of residence.
					</P>
				</Section>

				<Section>
					<SectionTitle>Changes to these Terms</SectionTitle>
					<P>
						We may update these Terms from time to time. We will post the
						updated Terms on this page and update the &quot;Last updated&quot;
						date above. If a change is material, We will make reasonable efforts
						to notify You before it takes effect. Continuing to use the Service
						after changes take effect means You accept the updated Terms.
					</P>
				</Section>

				<Section>
					<SectionTitle>Contact Us</SectionTitle>
					<P>
						If you have any questions about these Terms, You can contact us:
					</P>
					<UL>
						<li>
							By email:{" "}
							<A href="mailto:support@leftshift.com">support@leftshift.com</A>
						</li>
					</UL>
				</Section>
			</div>
		</PageLayout>
	)
}
