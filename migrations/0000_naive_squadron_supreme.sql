CREATE TABLE `vault_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`label` text NOT NULL,
	`iv` text NOT NULL,
	`url` text NOT NULL,
	`notes` text NOT NULL,
	`username` text NOT NULL,
	`encrypted_password` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
