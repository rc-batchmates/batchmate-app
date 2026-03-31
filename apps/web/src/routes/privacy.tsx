import { createFileRoute } from "@tanstack/react-router"
import { PageLayout } from "@/components/page-layout"

export const Route = createFileRoute("/privacy")({
	component: PrivacyPolicy,
})

function Section({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col gap-3">{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<h2 className="text-xl font-semibold text-foreground">{children}</h2>
	)
}

function SubTitle({ children }: { children: React.ReactNode }) {
	return <h3 className="text-lg font-semibold text-foreground">{children}</h3>
}

function SubSubTitle({ children }: { children: React.ReactNode }) {
	return (
		<h4 className="text-[15px] font-semibold text-foreground">{children}</h4>
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

function PrivacyPolicy() {
	return (
		<PageLayout
			title="Privacy Policy"
			subtitle="Last updated: March 31, 2026"
		>
			<div className="flex flex-col gap-8">
				<Section>
					<P>
						This Privacy Policy describes Our policies and procedures on the
						collection, use and disclosure of Your information when You use the
						Service and tells You about Your privacy rights and how the law
						protects You.
					</P>
					<P>
						We use Your Personal Data to provide and improve the Service. By
						using the Service, You agree to the collection and use of
						information in accordance with this Privacy Policy.
					</P>
				</Section>

				<Section>
					<SectionTitle>Interpretation and Definitions</SectionTitle>
					<SubTitle>Interpretation</SubTitle>
					<P>
						The words whose initial letters are capitalized have meanings
						defined under the following conditions. The following definitions
						shall have the same meaning regardless of whether they appear in
						singular or in plural.
					</P>

					<SubTitle>Definitions</SubTitle>
					<P>For the purposes of this Privacy Policy:</P>
					<UL>
						<li>
							<strong className="text-foreground">Account</strong> means a
							unique account created for You to access our Service or parts of
							our Service.
						</li>
						<li>
							<strong className="text-foreground">Affiliate</strong> means an
							entity that controls, is controlled by, or is under common
							control with a party, where &quot;control&quot; means ownership
							of 50% or more of the shares, equity interest or other securities
							entitled to vote for election of directors or other managing
							authority.
						</li>
						<li>
							<strong className="text-foreground">Application</strong> refers
							to batchmate, the software program provided by the Company.
						</li>
						<li>
							<strong className="text-foreground">Company</strong> (referred to
							as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot;
							or &quot;Our&quot; in this Privacy Policy) refers to Left Shift
							Logical, LLC, 418 Broadway STE N, Albany, NY, 12207.
						</li>
						<li>
							<strong className="text-foreground">Cookies</strong> are small
							files that are placed on Your computer, mobile device or any
							other device by a website, containing the details of Your
							browsing history on that website among its many uses.
						</li>
						<li>
							<strong className="text-foreground">Country</strong> refers to:
							New York, United States
						</li>
						<li>
							<strong className="text-foreground">Device</strong> means any
							device that can access the Service such as a computer, a cell
							phone or a digital tablet.
						</li>
						<li>
							<strong className="text-foreground">Personal Data</strong> (or
							&quot;Personal Information&quot;) is any information that relates
							to an identified or identifiable individual. We use &quot;Personal
							Data&quot; and &quot;Personal Information&quot; interchangeably
							unless a law uses a specific term.
						</li>
						<li>
							<strong className="text-foreground">Service</strong> refers to
							the Application or the Website or both.
						</li>
						<li>
							<strong className="text-foreground">Service Provider</strong>{" "}
							means any natural or legal person who processes the data on behalf
							of the Company. It refers to third-party companies or individuals
							employed by the Company to facilitate the Service, to provide the
							Service on behalf of the Company, to perform services related to
							the Service or to assist the Company in analyzing how the Service
							is used.
						</li>
						<li>
							<strong className="text-foreground">Usage Data</strong> refers to
							data collected automatically, either generated by the use of the
							Service or from the Service infrastructure itself (for example,
							the duration of a page visit).
						</li>
						<li>
							<strong className="text-foreground">Website</strong> refers to
							batchmate, accessible from{" "}
							<A href="https://recurse.rocks">https://recurse.rocks</A>.
						</li>
						<li>
							<strong className="text-foreground">You</strong> means the
							individual accessing or using the Service, or the company, or
							other legal entity on behalf of which such individual is accessing
							or using the Service, as applicable.
						</li>
					</UL>
				</Section>

				<Section>
					<SectionTitle>
						Collecting and Using Your Personal Data
					</SectionTitle>

					<SubTitle>Types of Data Collected</SubTitle>

					<SubSubTitle>Personal Data</SubSubTitle>
					<P>
						While using Our Service, We may collect personally identifiable
						information that can be used to contact or identify You. For
						example, when You sign in via Recurse Center SSO, We receive
						information from Your Recurse Center profile. Personally
						identifiable information may include, but is not limited to:
					</P>
					<UL>
						<li>Email address</li>
						<li>First name and last name</li>
						<li>Phone number</li>
						<li>Current town/city</li>
					</UL>

					<SubSubTitle>Usage Data</SubSubTitle>
					<P>
						Usage Data is collected automatically when using the Service.
					</P>
					<P>
						Usage Data may include information such as Your Device's Internet
						Protocol address (e.g. IP address), browser type, browser version,
						the pages of our Service that You visit, the time and date of Your
						visit, the time spent on those pages, unique device identifiers and
						other diagnostic data.
					</P>
					<P>
						When You access the Service by or through a mobile device, We may
						collect certain information automatically, including, but not
						limited to, the type of mobile device You use, Your mobile device's
						unique ID, the IP address of Your mobile device, Your mobile
						operating system, the type of mobile Internet browser You use,
						unique device identifiers and other diagnostic data.
					</P>
					<P>
						We may also collect information that Your browser sends whenever
						You visit Our Service or when You access the Service by or through
						a mobile device.
					</P>

					<SubSubTitle>
						Information Collected while Using the Application
					</SubSubTitle>
					<P>
						While using Our Application, in order to provide features of Our
						Application, We may collect, with Your prior permission:
					</P>
					<UL>
						<li>Information regarding your location</li>
						<li>
							Information from your Device's phone book (contacts list)
						</li>
						<li>
							Pictures and other information from your Device's camera and
							photo library
						</li>
					</UL>
					<P>
						We use this information to provide features of Our Service, to
						improve and customize Our Service. The information may be uploaded
						to the Company's servers and/or a Service Provider's server or it
						may be simply stored on Your device.
					</P>
					<P>
						You can enable or disable access to this information at any time,
						through Your Device settings.
					</P>

					<SubSubTitle>Tracking Technologies and Cookies</SubSubTitle>
					<P>
						We use Cookies and similar tracking technologies to track the
						activity on Our Service and store certain information. Tracking
						technologies We use include beacons, tags, and scripts to collect
						and track information and to improve and analyze Our Service. The
						technologies We use may include:
					</P>
					<UL>
						<li>
							<strong className="text-foreground">
								Cookies or Browser Cookies.
							</strong>{" "}
							A cookie is a small file placed on Your Device. You can instruct
							Your browser to refuse all Cookies or to indicate when a Cookie
							is being sent. However, if You do not accept Cookies, You may not
							be able to use some parts of our Service.
						</li>
						<li>
							<strong className="text-foreground">Web Beacons.</strong> Certain
							sections of our Service and our emails may contain small
							electronic files known as web beacons (also referred to as clear
							gifs, pixel tags, and single-pixel gifs) that permit the Company,
							for example, to count users who have visited those pages or
							opened an email and for other related website statistics (for
							example, recording the popularity of a certain section and
							verifying system and server integrity).
						</li>
					</UL>
					<P>
						Cookies can be &quot;Persistent&quot; or &quot;Session&quot;
						Cookies. Persistent Cookies remain on Your personal computer or
						mobile device when You go offline, while Session Cookies are deleted
						as soon as You close Your web browser.
					</P>
					<P>
						Where required by law, we use non-essential cookies (such as
						analytics, advertising, and remarketing cookies) only with Your
						consent. You can withdraw or change Your consent at any time using
						Our cookie preferences tool (if available) or through Your
						browser/device settings. Withdrawing consent does not affect the
						lawfulness of processing based on consent before its withdrawal.
					</P>
					<P>
						We use both Session and Persistent Cookies for the purposes set out
						below:
					</P>
					<div className="flex flex-col gap-4">
						<div className="rounded-xl bg-card p-4">
							<p className="text-sm font-semibold text-foreground">
								Necessary / Essential Cookies
							</p>
							<p className="mt-1 text-xs text-text-tertiary">
								Type: Session Cookies · Administered by: Us
							</p>
							<p className="mt-2 text-sm leading-relaxed text-text-secondary">
								These Cookies are essential to provide You with services
								available through the Website and to enable You to use some of
								its features. They help to authenticate users and prevent
								fraudulent use of user accounts. Without these Cookies, the
								services that You have asked for cannot be provided, and We
								only use these Cookies to provide You with those services.
							</p>
						</div>
						<div className="rounded-xl bg-card p-4">
							<p className="text-sm font-semibold text-foreground">
								Cookies Policy / Notice Acceptance Cookies
							</p>
							<p className="mt-1 text-xs text-text-tertiary">
								Type: Persistent Cookies · Administered by: Us
							</p>
							<p className="mt-2 text-sm leading-relaxed text-text-secondary">
								These Cookies identify if users have accepted the use of
								cookies on the Website.
							</p>
						</div>
						<div className="rounded-xl bg-card p-4">
							<p className="text-sm font-semibold text-foreground">
								Functionality Cookies
							</p>
							<p className="mt-1 text-xs text-text-tertiary">
								Type: Persistent Cookies · Administered by: Us
							</p>
							<p className="mt-2 text-sm leading-relaxed text-text-secondary">
								These Cookies allow Us to remember choices You make when You
								use the Website, such as remembering your login details or
								language preference. The purpose of these Cookies is to provide
								You with a more personal experience and to avoid You having to
								re-enter your preferences every time You use the Website.
							</p>
						</div>
					</div>
					<P>
						For more information about the cookies we use and your choices
						regarding cookies, please visit our Cookies Policy or the Cookies
						section of Our Privacy Policy.
					</P>
				</Section>

				<Section>
					<SubTitle>Use of Your Personal Data</SubTitle>
					<P>
						The Company may use Personal Data for the following purposes:
					</P>
					<UL>
						<li>
							<strong className="text-foreground">
								To provide and maintain our Service
							</strong>
							, including to monitor the usage of our Service.
						</li>
						<li>
							<strong className="text-foreground">
								To manage Your Account:
							</strong>{" "}
							to manage Your registration as a user of the Service. The
							Personal Data You provide can give You access to different
							functionalities of the Service that are available to You as a
							registered user.
						</li>
						<li>
							<strong className="text-foreground">
								For the performance of a contract:
							</strong>{" "}
							the development, compliance and undertaking of the purchase
							contract for the products, items or services You have purchased
							or of any other contract with Us through the Service.
						</li>
						<li>
							<strong className="text-foreground">To contact You:</strong> To
							contact You by email, telephone calls, SMS, or other equivalent
							forms of electronic communication, such as a mobile application's
							push notifications regarding updates or informative
							communications related to the functionalities, products or
							contracted services, including the security updates, when
							necessary or reasonable for their implementation.
						</li>
						<li>
							<strong className="text-foreground">To provide You</strong> with
							news, special offers, and general information about other goods,
							services and events which We offer that are similar to those that
							you have already purchased or inquired about unless You have
							opted not to receive such information.
						</li>
						<li>
							<strong className="text-foreground">
								To manage Your requests:
							</strong>{" "}
							To attend and manage Your requests to Us.
						</li>
						<li>
							<strong className="text-foreground">
								For business transfers:
							</strong>{" "}
							We may use Your Personal Data to evaluate or conduct a merger,
							divestiture, restructuring, reorganization, dissolution, or other
							sale or transfer of some or all of Our assets, whether as a going
							concern or as part of bankruptcy, liquidation, or similar
							proceeding, in which Personal Data held by Us about our Service
							users is among the assets transferred.
						</li>
						<li>
							<strong className="text-foreground">For other purposes</strong>:
							We may use Your information for other purposes, such as data
							analysis, identifying usage trends, determining the effectiveness
							of our promotional campaigns and to evaluate and improve our
							Service, products, services, marketing and your experience.
						</li>
					</UL>
					<P>
						We may share Your Personal Data in the following situations:
					</P>
					<UL>
						<li>
							<strong className="text-foreground">
								With Service Providers:
							</strong>{" "}
							We may share Your Personal Data with Service Providers to monitor
							and analyze the use of our Service, to contact You.
						</li>
						<li>
							<strong className="text-foreground">
								For business transfers:
							</strong>{" "}
							We may share or transfer Your Personal Data in connection with,
							or during negotiations of, any merger, sale of Company assets,
							financing, or acquisition of all or a portion of Our business to
							another company.
						</li>
						<li>
							<strong className="text-foreground">With Affiliates:</strong> We
							may share Your Personal Data with Our affiliates, in which case
							we will require those affiliates to honor this Privacy Policy.
							Affiliates include Our parent company and any other subsidiaries,
							joint venture partners or other companies that We control or that
							are under common control with Us.
						</li>
						<li>
							<strong className="text-foreground">
								With business partners:
							</strong>{" "}
							We may share Your Personal Data with Our business partners to
							offer You certain products, services or promotions.
						</li>
						<li>
							<strong className="text-foreground">With other users:</strong> If
							Our Service offers public areas, when You share Personal Data or
							otherwise interact in the public areas with other users, such
							information may be viewed by all users and may be publicly
							distributed outside.
						</li>
						<li>
							<strong className="text-foreground">With Your consent</strong>:
							We may disclose Your Personal Data for any other purpose with
							Your consent.
						</li>
					</UL>
				</Section>

				<Section>
					<SubTitle>Retention of Your Personal Data</SubTitle>
					<P>
						The Company will retain Your Personal Data only for as long as is
						necessary for the purposes set out in this Privacy Policy. We will
						retain and use Your Personal Data to the extent necessary to comply
						with our legal obligations (for example, if We are required to
						retain Your data to comply with applicable laws), resolve disputes,
						and enforce our legal agreements and policies.
					</P>
					<P>
						Where possible, We apply shorter retention periods and/or reduce
						identifiability by deleting, aggregating, or anonymizing data.
						Unless otherwise stated, the retention periods below are maximum
						periods (&quot;up to&quot;) and We may delete or anonymize data
						sooner when it is no longer needed for the relevant purpose. We
						apply different retention periods to different categories of
						Personal Data based on the purpose of processing and legal
						obligations:
					</P>
					<div className="flex flex-col gap-4">
						<div className="rounded-xl bg-card p-4">
							<p className="text-sm font-semibold text-foreground">
								Account Information
							</p>
							<UL>
								<li>
									User Accounts: retained for the duration of your account
									relationship plus up to 24 months after account closure to
									handle any post-termination issues or resolve disputes.
								</li>
							</UL>
						</div>
						<div className="rounded-xl bg-card p-4">
							<p className="text-sm font-semibold text-foreground">
								Customer Support Data
							</p>
							<UL>
								<li>
									Support tickets and correspondence: up to 24 months from
									the date of ticket closure to resolve follow-up inquiries,
									track service quality, and defend against potential legal
									claims.
								</li>
								<li>
									Chat transcripts: up to 24 months for quality assurance and
									staff training purposes.
								</li>
							</UL>
						</div>
						<div className="rounded-xl bg-card p-4">
							<p className="text-sm font-semibold text-foreground">
								Usage Data
							</p>
							<UL>
								<li>
									Website analytics data (cookies, IP addresses, device
									identifiers): up to 24 months from the date of collection.
								</li>
								<li>
									Application usage statistics: up to 24 months to understand
									feature adoption and service improvements.
								</li>
								<li>
									Server logs (IP addresses, access times): up to 24 months
									for security monitoring and troubleshooting purposes.
								</li>
							</UL>
						</div>
					</div>
					<P>
						Usage Data is retained in accordance with the retention periods
						described above, and may be retained longer only where necessary
						for security, fraud prevention, or legal compliance.
					</P>
					<P>
						We may retain Personal Data beyond the periods stated above for
						different reasons:
					</P>
					<UL>
						<li>
							Legal obligation: We are required by law to retain specific data
							(e.g., financial records for tax authorities).
						</li>
						<li>
							Legal claims: Data is necessary to establish, exercise, or defend
							legal claims.
						</li>
						<li>
							Your explicit request: You ask Us to retain specific information.
						</li>
						<li>
							Technical limitations: Data exists in backup systems that are
							scheduled for routine deletion.
						</li>
					</UL>
					<P>
						You may request information about how long We will retain Your
						Personal Data by contacting Us.
					</P>
					<P>
						When retention periods expire, We securely delete or anonymize
						Personal Data according to the following procedures:
					</P>
					<UL>
						<li>
							Deletion: Personal Data is removed from Our systems and no
							longer actively processed.
						</li>
						<li>
							Backup retention: Residual copies may remain in encrypted
							backups for a limited period consistent with our backup retention
							schedule and are not restored except where necessary for
							security, disaster recovery, or legal compliance.
						</li>
						<li>
							Anonymization: In some cases, We convert Personal Data into
							anonymous statistical data that cannot be linked back to You.
							This anonymized data may be retained indefinitely for research
							and analytics.
						</li>
					</UL>
				</Section>

				<Section>
					<SubTitle>Transfer of Your Personal Data</SubTitle>
					<P>
						Your information, including Personal Data, is processed at the
						Company's operating offices and in any other places where the
						parties involved in the processing are located. It means that this
						information may be transferred to — and maintained on — computers
						located outside of Your state, province, country or other
						governmental jurisdiction where the data protection laws may differ
						from those from Your jurisdiction.
					</P>
					<P>
						Where required by applicable law, We will ensure that international
						transfers of Your Personal Data are subject to appropriate
						safeguards and supplementary measures where appropriate. The
						Company will take all steps reasonably necessary to ensure that
						Your data is treated securely and in accordance with this Privacy
						Policy and no transfer of Your Personal Data will take place to an
						organization or a country unless there are adequate controls in
						place including the security of Your data and other personal
						information.
					</P>
				</Section>

				<Section>
					<SubTitle>Delete Your Personal Data</SubTitle>
					<P>
						You have the right to delete or request that We assist in deleting
						the Personal Data that We have collected about You.
					</P>
					<P>
						Our Service may give You the ability to delete certain information
						about You from within the Service.
					</P>
					<P>
						You may update, amend, or delete Your information at any time by
						signing in to Your Account, if you have one, and visiting the
						account settings section that allows you to manage Your personal
						information. You may also contact Us to request access to, correct,
						or delete any Personal Data that You have provided to Us.
					</P>
					<P>
						Please note, however, that We may need to retain certain
						information when we have a legal obligation or lawful basis to do
						so.
					</P>
				</Section>

				<Section>
					<SubTitle>Disclosure of Your Personal Data</SubTitle>

					<SubSubTitle>Business Transactions</SubSubTitle>
					<P>
						If the Company is involved in a merger, acquisition or asset sale,
						Your Personal Data may be transferred. We will provide notice
						before Your Personal Data is transferred and becomes subject to a
						different Privacy Policy.
					</P>

					<SubSubTitle>Law enforcement</SubSubTitle>
					<P>
						Under certain circumstances, the Company may be required to
						disclose Your Personal Data if required to do so by law or in
						response to valid requests by public authorities (e.g. a court or a
						government agency).
					</P>

					<SubSubTitle>Other legal requirements</SubSubTitle>
					<P>
						The Company may disclose Your Personal Data in the good faith
						belief that such action is necessary to:
					</P>
					<UL>
						<li>Comply with a legal obligation</li>
						<li>
							Protect and defend the rights or property of the Company
						</li>
						<li>
							Prevent or investigate possible wrongdoing in connection with the
							Service
						</li>
						<li>
							Protect the personal safety of Users of the Service or the public
						</li>
						<li>Protect against legal liability</li>
					</UL>
				</Section>

				<Section>
					<SubTitle>Security of Your Personal Data</SubTitle>
					<P>
						The security of Your Personal Data is important to Us, but remember
						that no method of transmission over the Internet, or method of
						electronic storage is 100% secure. While We strive to use
						commercially reasonable means to protect Your Personal Data, We
						cannot guarantee its absolute security.
					</P>
				</Section>

				<Section>
					<SectionTitle>GDPR Privacy Rights</SectionTitle>
					<P>
						If You are a resident of the European Economic Area (EEA), the
						United Kingdom, or Switzerland, You have certain data protection
						rights under the General Data Protection Regulation (GDPR) and
						applicable local legislation.
					</P>

					<SubTitle>Legal Basis for Processing</SubTitle>
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

					<SubTitle>Your Rights Under the GDPR</SubTitle>
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
					<P>
						If You wish to exercise any of the rights set out above, please
						contact Us. We will respond to Your request within one month. That
						period may be extended by two further months where necessary,
						taking into account the complexity and number of requests.
					</P>
					<P>
						You also have the right to lodge a complaint with a supervisory
						authority if You believe that Our processing of Your Personal Data
						violates applicable data protection law.
					</P>

					<SubTitle>International Data Transfers</SubTitle>
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
					<SectionTitle>
						Your California Privacy Rights (CCPA/CPRA)
					</SectionTitle>
					<P>
						If You are a California resident, You have specific rights
						regarding Your Personal Information under the California Consumer
						Privacy Act, as amended by the California Privacy Rights Act
						(collectively, &quot;CCPA&quot;).
					</P>

					<SubTitle>Categories of Personal Information Collected</SubTitle>
					<P>
						In the preceding twelve months, We may have collected the following
						categories of Personal Information:
					</P>
					<UL>
						<li>
							<strong className="text-foreground">Identifiers:</strong> such as
							name, email address, IP address, and account name.
						</li>
						<li>
							<strong className="text-foreground">
								Personal information under California Civil Code Section
								1798.80(e):
							</strong>{" "}
							such as name, address, and phone number.
						</li>
						<li>
							<strong className="text-foreground">
								Internet or similar network activity:
							</strong>{" "}
							such as browsing history, search history, and information on
							interaction with Our Service.
						</li>
						<li>
							<strong className="text-foreground">Geolocation data:</strong>{" "}
							approximate location derived from IP address.
						</li>
					</UL>

					<SubTitle>Your Rights Under the CCPA</SubTitle>
					<P>Under the CCPA, California residents have the following rights:</P>
					<UL>
						<li>
							<strong className="text-foreground">Right to know:</strong> You
							have the right to request that We disclose the categories and
							specific pieces of Personal Information We have collected about
							You, the categories of sources from which it was collected, the
							business or commercial purpose for collecting or selling it, and
							the categories of third parties with whom We share it.
						</li>
						<li>
							<strong className="text-foreground">Right to delete:</strong> You
							have the right to request the deletion of Your Personal
							Information, subject to certain exceptions.
						</li>
						<li>
							<strong className="text-foreground">Right to correct:</strong>{" "}
							You have the right to request the correction of inaccurate
							Personal Information.
						</li>
						<li>
							<strong className="text-foreground">
								Right to opt-out of sale or sharing:
							</strong>{" "}
							You have the right to opt out of the sale or sharing of Your
							Personal Information. We do not sell Your Personal Information.
							We do not share Your Personal Information for cross-context
							behavioral advertising.
						</li>
						<li>
							<strong className="text-foreground">
								Right to limit use of sensitive Personal Information:
							</strong>{" "}
							You have the right to limit the use and disclosure of sensitive
							Personal Information, if applicable.
						</li>
						<li>
							<strong className="text-foreground">
								Right to non-discrimination:
							</strong>{" "}
							You have the right not to be discriminated against for exercising
							any of Your CCPA rights. We will not deny You goods or services,
							charge different prices or rates, provide a different level or
							quality of goods or services, or suggest that You will receive a
							different price or rate or a different level or quality of goods
							or services because You exercised Your rights.
						</li>
					</UL>

					<SubTitle>Exercising Your Rights</SubTitle>
					<P>
						To exercise any of the rights described above, please contact Us by
						email at{" "}
						<A href="mailto:support@leftshift.com">support@leftshift.com</A>.
						We will verify Your identity before processing Your request. You
						may also designate an authorized agent to make a request on Your
						behalf, subject to verification.
					</P>
					<P>
						We will respond to a verifiable consumer request within 45 days of
						its receipt. If We require more time, We will inform You of the
						reason and extension period in writing.
					</P>

					<SubTitle>
						&quot;Do Not Track&quot; / Global Privacy Control
					</SubTitle>
					<P>
						Some browsers transmit &quot;Do Not Track&quot; (DNT) signals. We
						currently honor Global Privacy Control (GPC) signals where required
						by law. For other DNT mechanisms, Our Service does not currently
						alter its practices when it receives a DNT signal, as no uniform
						technology standard for recognizing and implementing DNT signals
						has been finalized.
					</P>

					<SubTitle>Financial Incentives</SubTitle>
					<P>
						We do not offer financial incentives or price or service differences
						in exchange for the retention or sale of Your Personal Information.
					</P>
				</Section>

				<Section>
					<SectionTitle>
						Detailed Information on the Processing of Your Personal Data
					</SectionTitle>
					<P>
						The Service Providers We use may have access to Your Personal Data.
						These third-party vendors collect, store, use, process and transfer
						information about Your activity on Our Service in accordance with
						their Privacy Policies.
					</P>

					<SubTitle>Usage, Performance and Miscellaneous</SubTitle>
					<P>
						We may use third-party Service Providers to maintain and improve
						our Service.
					</P>
					<div className="flex flex-col gap-4">
						<div className="rounded-xl bg-card p-4">
							<p className="text-sm font-semibold text-foreground">
								Cloudflare
							</p>
							<p className="mt-2 text-sm text-text-secondary">
								Their Privacy Policy can be viewed at{" "}
								<A href="https://www.cloudflare.com/privacypolicy/">
									cloudflare.com/privacypolicy
								</A>
							</p>
						</div>
						<div className="rounded-xl bg-card p-4">
							<p className="text-sm font-semibold text-foreground">Github</p>
							<p className="mt-2 text-sm text-text-secondary">
								Their Privacy Policy can be viewed at{" "}
								<A href="https://docs.github.com/en/site-policy">
									docs.github.com/en/site-policy
								</A>
							</p>
						</div>
					</div>
				</Section>

				<Section>
					<SectionTitle>Children's Privacy</SectionTitle>
					<P>
						Our Service does not address anyone under the age of 16. We do not
						knowingly collect personally identifiable information from anyone
						under the age of 16. If You are a parent or guardian and You are
						aware that Your child has provided Us with Personal Data, please
						contact Us. If We become aware that We have collected Personal Data
						from anyone under the age of 16 without verification of parental
						consent, We take steps to remove that information from Our servers.
					</P>
					<P>
						If We need to rely on consent as a legal basis for processing Your
						information and Your country requires consent from a parent, We may
						require Your parent's consent before We collect and use that
						information.
					</P>
				</Section>

				<Section>
					<SectionTitle>Links to Other Websites</SectionTitle>
					<P>
						Our Service may contain links to other websites that are not
						operated by Us. If You click on a third party link, You will be
						directed to that third party's site. We strongly advise You to
						review the Privacy Policy of every site You visit.
					</P>
					<P>
						We have no control over and assume no responsibility for the
						content, privacy policies or practices of any third party sites or
						services.
					</P>
				</Section>

				<Section>
					<SectionTitle>Changes to this Privacy Policy</SectionTitle>
					<P>
						We may update Our Privacy Policy from time to time. We will notify
						You of any changes by posting the new Privacy Policy on this page.
					</P>
					<P>
						We will let You know via email and/or a prominent notice on Our
						Service, prior to the change becoming effective and update the
						&quot;Last updated&quot; date at the top of this Privacy Policy.
					</P>
					<P>
						You are advised to review this Privacy Policy periodically for any
						changes. Changes to this Privacy Policy are effective when they are
						posted on this page.
					</P>
				</Section>

				<Section>
					<SectionTitle>Contact Us</SectionTitle>
					<P>
						If you have any questions about this Privacy Policy, You can
						contact us:
					</P>
					<UL>
						<li>
							By email:{" "}
							<A href="mailto:support@leftshift.com">
								support@leftshift.com
							</A>
						</li>
					</UL>
				</Section>
			</div>
		</PageLayout>
	)
}
