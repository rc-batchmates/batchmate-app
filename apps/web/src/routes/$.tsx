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
				backgroundColor: "#0f172a",
				color: "white",
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
					color: "rgb(34, 211, 238)",
					lineHeight: 1,
				}}
			>
				404
			</h1>
			<p
				style={{
					fontSize: "1.25rem",
					color: "rgb(148, 163, 184)",
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
					backgroundColor: "rgb(34, 211, 238)",
					color: "#0f172a",
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
