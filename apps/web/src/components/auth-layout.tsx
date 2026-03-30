interface AuthLayoutProps {
	children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex h-full w-full items-center justify-center bg-background">
			{children}
		</div>
	)
}
