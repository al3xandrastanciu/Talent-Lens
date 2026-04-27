-- Update existing records to match new enum name
UPDATE application SET status = 'REVIEWED' WHERE status = 'UNDER_REVIEW';
