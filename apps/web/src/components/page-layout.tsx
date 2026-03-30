import { Link, useMatches } from "@tanstack/react-router"
import { House, Search, User, Users } from "lucide-react"
import type { ReactNode } from "react"

const navItems = [
	{ to: "/", label: "Home" },
	{ to: "/hub", label: "Hub" },
	{ to: "/directory", label: "Directory" },
	{ to: "/profile", label: "Profile" },
] as const

function DesktopNav() {
	const matches = useMatches()
	const currentPath = matches[matches.length - 1]?.fullPath ?? "/"

	return (
		<nav className="mt-1 hidden items-center gap-5 md:flex">
			{navItems.map((item) => {
				const isActive =
					item.to === "/"
						? currentPath === "/"
						: currentPath.startsWith(item.to)
				return isActive ? (
					<span key={item.to} className="text-sm font-semibold text-cyan">
						{item.label}
					</span>
				) : (
					<Link
						key={item.to}
						to={item.to}
						className="text-sm font-medium text-text-tertiary no-underline hover:text-foreground"
					>
						{item.label}
					</Link>
				)
			})}
		</nav>
	)
}

const mobileNavItems = [
	{ to: "/", label: "Home", icon: House },
	{ to: "/hub", label: "Hub", icon: Users },
	{ to: "/directory", label: "Directory", icon: Search },
	{ to: "/profile", label: "Profile", icon: User },
] as const

function MobileNav() {
	const matches = useMatches()
	const currentPath = matches[matches.length - 1]?.fullPath ?? "/"

	return (
		<nav className="fixed inset-x-0 bottom-0 z-50 flex items-center border-t border-[#1E293B] bg-[#0F172A] pb-[env(safe-area-inset-bottom)] md:hidden">
			{mobileNavItems.map((item) => {
				const isActive =
					item.to === "/"
						? currentPath === "/"
						: currentPath.startsWith(item.to)
				const Icon = item.icon
				return (
					<Link
						key={item.to}
						to={item.to}
						className="flex flex-1 flex-col items-center gap-1 py-3 no-underline"
					>
						<Icon size={22} color={isActive ? "#22D3EE" : "#64748B"} />
						<span
							className={`text-[10px] font-medium ${isActive ? "text-cyan" : "text-[#64748B]"}`}
						>
							{item.label}
						</span>
					</Link>
				)
			})}
		</nav>
	)
}

export function PageLayout({
	subtitle,
	title,
	headerRight,
	children,
	className,
}: {
	subtitle?: ReactNode
	title: ReactNode
	headerRight?: ReactNode
	children: ReactNode
	className?: string
}) {
	return (
		<div
			className={`mx-auto flex min-h-full max-w-md flex-col gap-7 px-6 py-8 pb-[calc(theme(spacing.24)+env(safe-area-inset-bottom))] md:max-w-4xl md:pb-8 md:py-12 ${className ?? ""}`}
		>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-1">
					{subtitle &&
						(typeof subtitle === "string" ? (
							<span className="text-sm text-text-tertiary">{subtitle}</span>
						) : (
							subtitle
						))}
					<span className="text-2xl font-semibold text-foreground md:text-3xl">
						{title}
					</span>
					<DesktopNav />
				</div>
				{headerRight}
			</div>

			{children}

			<MobileNav />
		</div>
	)
}
