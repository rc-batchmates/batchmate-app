CREATE TABLE `zoom_room` (
	`slug` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`direct_url` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
