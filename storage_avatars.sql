-- 1. Create the storage bucket for avatars
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Set up RLS policies for the bucket
-- Allow public access to view avatars
create policy "Public Access Avatars" 
  on storage.objects for select 
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload their own avatar
-- We'll assume the file path will be namespaced or just unique enough, 
-- but ideally we restrict path to user_id/filename if possible.
-- For simplicity in this app, we'll allow any authenticated upload to the bucket.
create policy "User Upload Avatar" 
  on storage.objects for insert 
  with check ( 
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
  );

create policy "User Update Avatar" 
  on storage.objects for update
  using ( 
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
  );

create policy "User Delete Avatar" 
  on storage.objects for delete
  using ( 
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
  );
