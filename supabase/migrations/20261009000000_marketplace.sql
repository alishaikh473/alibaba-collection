create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.admin_users force row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
revoke all on public.admin_users from public, anon, authenticated, service_role;
grant insert on public.admin_users to service_role;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 90),
  creator text not null check (char_length(btrim(creator)) between 1 and 80),
  type text not null check (type in ('Images', 'Documents')),
  category text not null check (char_length(btrim(category)) between 1 and 40),
  price numeric(10, 2) not null check (price between 0 and 10000),
  description text not null check (char_length(description) <= 500),
  file_name text not null check (char_length(file_name) between 1 and 255),
  file_path text not null unique check (char_length(file_path) <= 512),
  image_url text check (image_url is null or char_length(image_url) <= 2048),
  created_at timestamptz not null default now()
);

revoke all on public.products from public, anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

alter table public.products enable row level security;
alter table public.products force row level security;

create policy "Published products are public"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "Only allowlisted admins publish products"
  on public.products for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Only allowlisted admins update products"
  on public.products for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Only allowlisted admins delete products"
  on public.products for delete
  to authenticated
  using ((select public.is_admin()));

create policy "Product inserts require admin allowlist"
  on public.products as restrictive for insert
  to public
  with check ((select public.is_admin()));

create policy "Product updates require admin allowlist"
  on public.products as restrictive for update
  to public
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Product deletes require admin allowlist"
  on public.products as restrictive for delete
  to public
  using ((select public.is_admin()));

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 110),
  category text not null check (char_length(category) <= 120),
  creator text not null check (char_length(btrim(creator)) between 1 and 80),
  body text not null check (char_length(btrim(body)) between 30 and 50000),
  image_url text check (image_url is null or char_length(image_url) <= 2048),
  created_at timestamptz not null default now()
);

revoke all on public.stories from public, anon, authenticated;
grant select on public.stories to anon, authenticated;
grant insert, update, delete on public.stories to authenticated;

alter table public.stories enable row level security;
alter table public.stories force row level security;

create policy "Published stories are public"
  on public.stories for select
  to anon, authenticated
  using (true);

create policy "Only allowlisted admins publish stories"
  on public.stories for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Only allowlisted admins update stories"
  on public.stories for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Only allowlisted admins delete stories"
  on public.stories for delete
  to authenticated
  using ((select public.is_admin()));

create policy "Story inserts require admin allowlist"
  on public.stories as restrictive for insert
  to public
  with check ((select public.is_admin()));

create policy "Story updates require admin allowlist"
  on public.stories as restrictive for update
  to public
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Story deletes require admin allowlist"
  on public.stories as restrictive for delete
  to public
  using ((select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketplace-files',
  'marketplace-files',
  true,
  15728640,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/tiff',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/epub+zip'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Only allowlisted admins upload marketplace files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'marketplace-files'
    and (select public.is_admin())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Only allowlisted admins update marketplace files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'marketplace-files'
    and (select public.is_admin())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'marketplace-files'
    and (select public.is_admin())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Only allowlisted admins delete marketplace files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'marketplace-files'
    and (select public.is_admin())
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Marketplace file inserts require admin allowlist"
  on storage.objects as restrictive for insert
  to public
  with check (
    bucket_id <> 'marketplace-files'
    or (
      (select public.is_admin())
      and (storage.foldername(name))[1] = (select auth.uid())::text
    )
  );

create policy "Marketplace file updates require admin allowlist"
  on storage.objects as restrictive for update
  to public
  using (
    bucket_id <> 'marketplace-files'
    or (
      (select public.is_admin())
      and (storage.foldername(name))[1] = (select auth.uid())::text
    )
  )
  with check (
    bucket_id <> 'marketplace-files'
    or (
      (select public.is_admin())
      and (storage.foldername(name))[1] = (select auth.uid())::text
    )
  );

create policy "Marketplace file deletes require admin allowlist"
  on storage.objects as restrictive for delete
  to public
  using (
    bucket_id <> 'marketplace-files'
    or (
      (select public.is_admin())
      and (storage.foldername(name))[1] = (select auth.uid())::text
    )
  );
