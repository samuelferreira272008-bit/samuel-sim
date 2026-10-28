ALTER TABLE public.files
ADD COLUMN IF NOT EXISTS url TEXT;

UPDATE public.files
SET url = path
WHERE url IS NULL;

ALTER TABLE public.files
ALTER COLUMN url SET NOT NULL;