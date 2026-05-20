CREATE TABLE `recurse_profile` (
	`person_id` integer PRIMARY KEY NOT NULL,
	`image_url` text,
	`batch` text,
	`cached_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
