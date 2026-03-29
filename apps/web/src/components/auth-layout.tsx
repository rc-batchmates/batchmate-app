interface AuthLayoutProps {
	tagline: string
	taglineSub: string
	children: React.ReactNode
}

export function AuthLayout({ tagline, taglineSub, children }: AuthLayoutProps) {
	return (
		<div className="font-primary flex h-full w-full bg-[var(--page-bg)]">
			{/* Brand Panel */}
			<div className="hidden w-[560px] shrink-0 flex-col gap-8 overflow-hidden bg-[var(--brand)] p-[64px_56px] lg:flex">
				{/* Logo */}
				<div className="flex w-full items-center gap-2.5">
					<span className="text-[22px] font-semibold leading-none tracking-[-0.5px] text-white">
						batchmate.app
					</span>
				</div>

				{/* Tagline */}
				<div className="flex flex-1 flex-col gap-4">
					<h1 className="whitespace-pre-line text-[52px] font-bold leading-[1.1] tracking-[-1.5px] text-white">
						{tagline}
					</h1>
					<p className="text-base font-normal leading-[1.6] text-white/80">
						{taglineSub}
					</p>
				</div>

				{/* Dots */}
				<div className="flex items-center gap-2">
					<div className="h-1.5 w-6 rounded-full bg-white" />
					<div className="h-1.5 w-1.5 rounded-full bg-white/40" />
					<div className="h-1.5 w-1.5 rounded-full bg-white/40" />
				</div>
			</div>

			{/* Form Panel */}
			<div className="flex flex-1 flex-col items-center justify-center">
				<div className="w-full max-w-[420px] px-6">{children}</div>
			</div>
		</div>
	)
}
