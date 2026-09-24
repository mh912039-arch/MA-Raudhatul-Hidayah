-- Run once in a new Supabase project's SQL editor as the database owner.
-- Never run this against a database belonging to an unrelated application.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check (length(name) between 2 and 150),
 role text not null check (role in ('super_admin','admin','humas')),
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
-- Role membership is provisioned only from the SQL editor / trusted service.
create function private.staff_role() returns text language sql stable security definer set search_path='' as $$
 select p.role from public.profiles p where p.id=auth.uid() and auth.uid() is not null
$$;
revoke all on function private.staff_role() from public,anon;
grant execute on function private.staff_role() to authenticated;
create policy profile_self_read on public.profiles for select to authenticated using(id=(select auth.uid()));
revoke all on public.profiles from anon,authenticated;
grant select on public.profiles to authenticated;

create table public.schools (
 id text primary key default 'main' check(id='main'),
 name text not null, short_name text not null, tagline text not null, intro text not null,
 principal_name text not null, principal_message text not null, principal_image text not null default '',
 vision text not null, mission jsonb not null default '[]' check(jsonb_typeof(mission)='array'),
 phone text not null default '', email text not null default '', address text not null,
 maps_url text not null, academic_year text not null check(academic_year ~ '^20[0-9]{2}/20[0-9]{2}$'),
 ppdb_open boolean not null default false, ppdb_start date not null, ppdb_end date not null,
 maintenance boolean not null default false, check(ppdb_end>=ppdb_start)
);
alter table public.schools enable row level security;
create policy school_public_read on public.schools for select to anon,authenticated using(true);
create policy school_super_update on public.schools for update to authenticated using((select private.staff_role())='super_admin') with check((select private.staff_role())='super_admin');
grant select on public.schools to anon,authenticated;
grant update on public.schools to authenticated;

create table public.posts (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 5 and 160),
 slug text unique not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 category text not null check(category in ('Akademik','Kegiatan','Sekolah','Prestasi')),
 body text not null check(length(body) between 20 and 30000), image text not null default '',
 published boolean not null default false,pinned boolean not null default false,
 author_id uuid not null references auth.users(id),created_at timestamptz not null default now()
);
create table public.announcements (
 id uuid primary key default gen_random_uuid(),title text not null check(length(title) between 5 and 160),
 body text not null check(length(body) between 10 and 5000),pinned boolean not null default false,
 author_id uuid not null references auth.users(id),created_at timestamptz not null default now()
);
create table public.gallery (
 id uuid primary key default gen_random_uuid(),title text not null check(length(title) between 3 and 160),
 image text not null, category text not null check(category in ('Akademik','Kegiatan','Sekolah','Prestasi')),
 author_id uuid not null references auth.users(id),created_at timestamptz not null default now()
);
create function private.content_guard() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if exists(select 1 from public.schools where maintenance) then raise exception 'Maintenance mode active'; end if;
 if TG_OP='INSERT' then new.author_id:=auth.uid();
 elsif TG_OP='UPDATE' then new.author_id:=old.author_id;new.created_at:=old.created_at;
 end if;
 if TG_OP='DELETE' then return old;end if;return new;
end $$;
revoke all on function private.content_guard() from public;
DO $$ declare tbl text; begin
 foreach tbl in array array['posts','announcements','gallery'] loop
 execute format('alter table public.%I enable row level security',tbl);
 execute format('grant select on public.%I to anon,authenticated',tbl);
 execute format('grant insert,update,delete on public.%I to authenticated',tbl);
 execute format('create policy staff_read on public.%I for select to authenticated using ((select private.staff_role()) in (''super_admin'',''admin'',''humas''))',tbl);
 execute format('create policy staff_insert on public.%I for insert to authenticated with check ((select private.staff_role()) in (''super_admin'',''admin'',''humas'') and author_id=(select auth.uid()))',tbl);
 execute format('create policy staff_update on public.%I for update to authenticated using ((select private.staff_role()) in (''super_admin'',''admin'',''humas'')) with check ((select private.staff_role()) in (''super_admin'',''admin'',''humas''))',tbl);
 execute format('create policy staff_delete on public.%I for delete to authenticated using ((select private.staff_role()) in (''super_admin'',''admin'',''humas''))',tbl);
 execute format('create trigger content_guard before insert or update or delete on public.%I for each row execute function private.content_guard()',tbl);
 end loop;
end $$;
create policy published_posts on public.posts for select to anon,authenticated using(published);
create policy public_announcements on public.announcements for select to anon,authenticated using(true);
create policy public_gallery on public.gallery for select to anon,authenticated using(true);
create index posts_public_order on public.posts(published,pinned desc,created_at desc);

create sequence private.registration_seq;
create table public.ppdb_registrations (
 id uuid primary key default gen_random_uuid(), request_id uuid unique not null,
 registration_number text unique not null,
 access_token_hash text not null check(access_token_hash ~ '^[a-f0-9]{64}$'),
 academic_year text not null, student_name text not null check(length(student_name) between 3 and 100),
 nisn text not null check(nisn ~ '^[0-9]{10}$'),birth_date date not null,
 gender text not null check(gender in ('Laki-laki','Perempuan')),
 previous_school text not null,parent_name text not null,parent_phone text not null,email text not null,address text not null,
 report_path text not null,birth_path text not null,consent boolean not null check(consent),
 status text not null default 'Menunggu' check(status in ('Menunggu','Perlu revisi','Diterima','Ditolak')),
 notes text not null default '',verified_by uuid references auth.users(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(academic_year,nisn)
);
alter table public.ppdb_registrations enable row level security;
revoke all on public.ppdb_registrations from anon,authenticated;
grant select on public.ppdb_registrations to authenticated;
grant update(status,notes) on public.ppdb_registrations to authenticated;
create policy ppdb_staff_read on public.ppdb_registrations for select to authenticated using((select private.staff_role()) in ('super_admin','admin'));
create policy ppdb_staff_update on public.ppdb_registrations for update to authenticated using((select private.staff_role()) in ('super_admin','admin')) with check((select private.staff_role()) in ('super_admin','admin'));
create index ppdb_status_created on public.ppdb_registrations(status,created_at desc);
create index ppdb_nisn on public.ppdb_registrations(nisn);

create table public.verification_logs (
 id uuid primary key default gen_random_uuid(),registration_id uuid not null references public.ppdb_registrations(id) on delete restrict,
 old_status text,new_status text not null,notes text not null,actor_id uuid not null references auth.users(id),created_at timestamptz not null default now()
);
alter table public.verification_logs enable row level security;
revoke all on public.verification_logs from anon,authenticated;
grant select on public.verification_logs to authenticated;
create policy log_admin_read on public.verification_logs for select to authenticated using((select private.staff_role()) in ('super_admin','admin'));
-- Registration number and verification log are database-generated atomically.
create function private.registration_guard() returns trigger language plpgsql security definer set search_path='' as $$
declare s public.schools; today_jakarta date;begin
 select * into s from public.schools where id='main';
 if not found then raise exception 'School configuration missing';end if;
 if s.maintenance then raise exception 'Maintenance mode active';end if;
 if TG_OP='INSERT' then
  today_jakarta:=(now() at time zone 'Asia/Jakarta')::date;
  if not s.ppdb_open or today_jakarta<s.ppdb_start or today_jakarta>s.ppdb_end then raise exception 'Registration closed';end if;
  if new.academic_year<>s.academic_year then raise exception 'Wrong academic year';end if;
  if new.birth_date>=today_jakarta or new.birth_date<date '1990-01-01' then raise exception 'Invalid birth date';end if;
  new.registration_number:='PPDB-'||split_part(s.academic_year,'/',1)||'-'||lpad(nextval('private.registration_seq')::text,6,'0');
  new.status:='Menunggu';new.notes:='';new.verified_by:=null;
 else
  if auth.uid() is null or private.staff_role() not in ('super_admin','admin') then raise exception 'Forbidden verification';end if;
  if new.status in ('Perlu revisi','Ditolak') and length(trim(new.notes))<5 then raise exception 'Notes required';end if;
  new.verified_by:=auth.uid();new.updated_at:=clock_timestamp();
  insert into public.verification_logs(registration_id,old_status,new_status,notes,actor_id) values(old.id,old.status,new.status,new.notes,auth.uid());
 end if;
 return new;
end $$;
revoke all on function private.registration_guard() from public,anon,authenticated;
create trigger registration_guard before insert or update on public.ppdb_registrations for each row execute function private.registration_guard();
create function public.verify_registration(registration_id uuid,new_status text,new_notes text,expected_updated_at timestamptz) returns void language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null or coalesce(private.staff_role(),'') not in ('super_admin','admin') then raise exception 'Forbidden';end if;
 if new_status not in ('Menunggu','Perlu revisi','Diterima','Ditolak') or length(new_notes)>2000 then raise exception 'Invalid status';end if;
 update public.ppdb_registrations set status=new_status,notes=new_notes where id=registration_id and updated_at=expected_updated_at;
 if not found then raise exception 'Record changed or not found';end if;
end $$;
revoke all on function public.verify_registration(uuid,text,text,timestamptz) from public,anon;
grant execute on function public.verify_registration(uuid,text,text,timestamptz) to authenticated;

create table private.submission_limits(key_hash text primary key,started_at timestamptz not null,hits integer not null);
alter table private.submission_limits enable row level security;
-- Invoker-only, service-role-only RPC. Public callers cannot consume or reset counters.
create function public.consume_submission_limit(key_hash text) returns boolean language plpgsql security invoker set search_path='' as $$
declare hits_now integer;begin
 if key_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid key';end if;
 insert into private.submission_limits as t values(key_hash,now(),1)
 on conflict on constraint submission_limits_pkey do update set hits=case when t.started_at<now()-interval '1 hour' then 1 else t.hits+1 end,
 started_at=case when t.started_at<now()-interval '1 hour' then now() else t.started_at end returning hits into hits_now;
 return hits_now<=5;
end $$;
revoke all on function public.consume_submission_limit(text) from public,anon,authenticated;
grant usage on schema private to service_role;
grant all on private.submission_limits to service_role;
grant execute on function public.consume_submission_limit(text) to service_role;
grant all on public.ppdb_registrations to service_role;
grant select on public.schools to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('documents','documents',false,5242880,array['application/pdf','image/jpeg','image/png']),
 ('media','media',true,2097152,array['image/webp','image/jpeg','image/png']);
-- No anonymous insert/select policy on documents. Uploads are server-only.
create policy document_staff_read on storage.objects for select to authenticated using(bucket_id='documents' and (select private.staff_role()) in ('super_admin','admin'));
create policy media_staff_insert on storage.objects for insert to authenticated with check(bucket_id='media' and (select private.staff_role()) in ('super_admin','admin','humas') and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy media_staff_read on storage.objects for select to authenticated using(bucket_id='media' and (select private.staff_role()) in ('super_admin','admin','humas'));

insert into public.schools(id,name,short_name,tagline,intro,principal_name,principal_message,vision,mission,address,maps_url,academic_year,ppdb_open,ppdb_start,ppdb_end)
values('main','SMA Cakrawala','Cakrawala','Berkarakter. Berprestasi. Berdampak.','Setiap anak membawa potensi yang berbeda. Kami hadir untuk mendampingi mereka mengenali diri dan tumbuh.','Nama Kepala Sekolah','Selamat datang di sekolah kami. Ganti sambutan ini dengan sambutan resmi kepala sekolah.','Generasi berkarakter, berwawasan global, dan peduli terhadap sesama.','["Membangun budaya belajar aktif dan menyenangkan.","Mengembangkan karakter dan kepedulian.","Mendampingi minat dan bakat siswa."]','Ganti dengan alamat lengkap sekolah.','https://www.google.com/maps?q=Bandung&output=embed','2027/2028',false,'2026-09-01','2027-06-30');
commit;
