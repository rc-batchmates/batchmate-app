interface AuthLayoutProps {
	children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex h-full w-full items-center justify-center bg-background">
			<div className="w-full max-w-md md:rounded-2xl md:bg-card md:px-10 md:py-12">
				{children}
			</div>
		</div>
	)
}
