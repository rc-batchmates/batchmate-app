import { createFileRoute, Link } from "@tanstack/react-router"
import { PageLayout } from "@/components/page-layout"

export const Route = createFileRoute("/gdpr")({
	component: GDPRPage,
})

function Section({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col gap-3">{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<h2 className="text-xl font-semibold text-foreground">{children}</h2>
	)
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

function A({
	href,
	children,
}: {
	href: string
	children: React.ReactNode
}) {
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

function GDPRPage() {
	return (
		<PageLayout
			title="GDPR"
			subtitle="General Data Protection Regulation"
		>
			<div className="flex flex-col gap-8">
				<Section>
					<P>
						If You are a resident of the European Economic Area (EEA), the
						United Kingdom, or Switzerland, You have certain data protection
						rights under the General Data Protection Regulation (GDPR) and
						applicable local legislation. This page explains those rights and
						how We comply with the GDPR.
					</P>
					<P>
						This page supplements Our{" "}
						<Link to="/privacy" className="text-cyan hover:underline">
							Privacy Policy
						</Link>
						, which describes the full scope of data We collect and how We use
						it.
					</P>
				</Section>

				<Section>
					<SectionTitle>Data Controller</SectionTitle>
					<P>
						Left Shift Logical, LLC is the data controller responsible for Your
						Personal Data. If You have questions about how We process Your data
						or wish to exercise Your rights, please contact Us at{" "}
						<A href="mailto:support@leftshift.com">support@leftshift.com</A>.
					</P>
				</Section>

				<Section>
					<SectionTitle>Legal Basis for Processing</SectionTitle>
					<P>
						We will process Your Personal Data only if We have a lawful basis
						for doing so. Our lawful bases for processing include:
					</P>
					<UL>
						<li>
							<strong className="text-foreground">Consent:</strong> You have
							given Us permission to process Your Personal Data for one or more
							specific purposes.
						</li>
						<li>
							<strong className="text-foreground">
								Performance of a contract:
							</strong>{" "}
							Processing is necessary for the performance of a contract with
							You or to take steps at Your request before entering into a
							contract.
						</li>
						<li>
							<strong className="text-foreground">
								Legitimate interests:
							</strong>{" "}
							Processing is necessary for Our legitimate interests or those of
							a third party, provided those interests are not overridden by
							Your rights and interests.
						</li>
						<li>
							<strong className="text-foreground">Legal obligation:</strong>{" "}
							Processing is necessary for compliance with a legal obligation to
							which We are subject.
						</li>
					</UL>
				</Section>

				<Section>
					<SectionTitle>What Personal Data We Collect</SectionTitle>
					<P>
						When You sign in via Recurse Center SSO, We receive information
						from Your Recurse Center profile. Personal Data We collect may
						include, but is not limited to:
					</P>
					<UL>
						<li>Email address</li>
						<li>First name and last name</li>
						<li>Phone number</li>
						<li>Current town/city</li>
					</UL>
					<P>
						We also collect Usage Data automatically, such as IP address,
						browser type, pages visited, and device identifiers. See Our{" "}
						<Link to="/privacy" className="text-cyan hover:underline">
							Privacy Policy
						</Link>{" "}
						for full details.
					</P>
				</Section>

				<Section>
					<SectionTitle>Your Rights Under the GDPR</SectionTitle>
					<P>
						Under certain circumstances, You have the following data protection
						rights:
					</P>
					<UL>
						<li>
							<strong className="text-foreground">Right of access:</strong> You
							have the right to request copies of Your Personal Data.
						</li>
						<li>
							<strong className="text-foreground">
								Right to rectification:
							</strong>{" "}
							You have the right to request that We correct any information You
							believe is inaccurate or complete information You believe is
							incomplete.
						</li>
						<li>
							<strong className="text-foreground">Right to erasure:</strong>{" "}
							You have the right to request that We erase Your Personal Data,
							under certain conditions.
						</li>
						<li>
							<strong className="text-foreground">
								Right to restrict processing:
							</strong>{" "}
							You have the right to request that We restrict the processing of
							Your Personal Data, under certain conditions.
						</li>
						<li>
							<strong className="text-foreground">
								Right to object to processing:
							</strong>{" "}
							You have the right to object to Our processing of Your Personal
							Data, under certain conditions.
						</li>
						<li>
							<strong className="text-foreground">
								Right to data portability:
							</strong>{" "}
							You have the right to request that We transfer the data that We
							have collected to another organization, or directly to You, under
							certain conditions.
						</li>
						<li>
							<strong className="text-foreground">
								Right to withdraw consent:
							</strong>{" "}
							Where We rely on Your consent to process Your Personal Data, You
							have the right to withdraw that consent at any time. Withdrawal
							of consent does not affect the lawfulness of processing based on
							consent before its withdrawal.
						</li>
					</UL>
				</Section>

				<Section>
					<SectionTitle>How to Exercise Your Rights</SectionTitle>
					<P>
						To exercise any of the rights set out above, please contact Us at{" "}
						<A href="mailto:support@leftshift.com">support@leftshift.com</A>.
						We will respond to Your request within one month. That period may
						be extended by two further months where necessary, taking into
						account the complexity and number of requests.
					</P>
					<P>
						We may need to verify Your identity before processing Your request.
						We will not charge a fee for exercising Your rights unless the
						request is manifestly unfounded or excessive, in which case We may
						charge a reasonable fee or refuse to act on the request.
					</P>
				</Section>

				<Section>
					<SectionTitle>International Data Transfers</SectionTitle>
					<P>
						Your Personal Data may be transferred to and processed in countries
						outside the EEA, United Kingdom, or Switzerland. When We transfer
						Your data internationally, We ensure appropriate safeguards are in
						place, such as Standard Contractual Clauses approved by the
						European Commission or other legally recognized transfer
						mechanisms.
					</P>
				</Section>

				<Section>
					<SectionTitle>Data Retention</SectionTitle>
					<P>
						We retain Your Personal Data only for as long as necessary for the
						purposes set out in Our{" "}
						<Link to="/privacy" className="text-cyan hover:underline">
							Privacy Policy
						</Link>
						. When retention periods expire, We securely delete or anonymize
						Personal Data. You may request information about specific retention
						periods by contacting Us.
					</P>
				</Section>

				<Section>
					<SectionTitle>Data Protection Officer</SectionTitle>
					<P>
						If You have any questions or concerns about Our data processing
						practices, You can contact Us at{" "}
						<A href="mailto:support@leftshift.com">support@leftshift.com</A>.
					</P>
				</Section>

				<Section>
					<SectionTitle>Right to Lodge a Complaint</SectionTitle>
					<P>
						You have the right to lodge a complaint with a supervisory
						authority if You believe that Our processing of Your Personal Data
						violates applicable data protection law. We would, however,
						appreciate the chance to address Your concerns before You approach a
						supervisory authority, so please contact Us first.
					</P>
				</Section>
			</div>
		</PageLayout>
	)
}
