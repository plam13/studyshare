-- StudyShare: global material search (/search?q=).
-- The client filters with ILIKE '%word%' on title and description. Plain B-tree indexes cannot serve a
-- leading wildcard; trigram GIN indexes can, and they work for Cyrillic text and partial words.

create extension if not exists pg_trgm with schema extensions;

create index materials_title_trgm_idx
  on public.materials using gin (title extensions.gin_trgm_ops);

create index materials_description_trgm_idx
  on public.materials using gin (description extensions.gin_trgm_ops);
