import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/$")({
	component: NotFoundPage,
})

function NotFoundPage() {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				backgroundColor: "var(--surface-inset)",
				color: "var(--foreground)",
				fontFamily: "system-ui, -apple-system, sans-serif",
				padding: "1rem",
				textAlign: "center",
			}}
		>
			<img
				src="/batchmate-squid-404.svg"
				alt="404 squid"
				style={{
					width: "min(300px, 60vw)",
					height: "auto",
					marginBottom: "2rem",
				}}
			/>
			<h1
				style={{
					fontSize: "clamp(3rem, 10vw, 6rem)",
					fontWeight: 800,
					margin: 0,
					color: "var(--cyan)",
					lineHeight: 1,
				}}
			>
				404
			</h1>
			<p
				style={{
					fontSize: "1.25rem",
					color: "var(--text-secondary)",
					marginTop: "0.75rem",
					marginBottom: "2rem",
				}}
			>
				This page swam away.
			</p>
			<Link
				to="/"
				style={{
					padding: "0.75rem 2rem",
					backgroundColor: "var(--primary)",
					color: "var(--primary-foreground)",
					borderRadius: "0.5rem",
					textDecoration: "none",
					fontWeight: 600,
					fontSize: "1rem",
				}}
			>
				Go Home
			</Link>
		</div>
	)
}
