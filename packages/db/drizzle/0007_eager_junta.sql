CREATE TABLE `snack_ledger_entry` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`sku_id` text,
	`sku_name` text,
	`amount_cents` integer NOT NULL,
	`source` text NOT NULL,
	`note` text,
	`idempotency_key` text,
	`recorded_by` text,
	`voided_at` integer,
	`voided_by` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sku_id`) REFERENCES `snack_sku`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recorded_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`voided_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `snack_ledger_entry_idempotency_key_unique` ON `snack_ledger_entry` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `snack_ledger_entry_user_id_idx` ON `snack_ledger_entry` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `snack_ledger_entry_created_at_idx` ON `snack_ledger_entry` (`created_at`);--> statement-breakpoint
CREATE TABLE `snack_sku` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price_cents` integer NOT NULL,
	`archived_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
