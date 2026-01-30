-- 1. Create the storage bucket for products
insert into storage.buckets (id, name, public) 
values ('products', 'products', true)
on conflict (id) do nothing;

-- 2. Set up RLS policies for the bucket
-- Allow public access to view images
create policy "Public Access" 
  on storage.objects for select 
  using ( bucket_id = 'products' );

-- Allow authenticated users (or just admins) to upload images
create policy "Admin Upload" 
  on storage.objects for insert 
  with check ( 
    bucket_id = 'products' 
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
    ) 
  );

create policy "Admin Update" 
  on storage.objects for update
  using ( 
    bucket_id = 'products' 
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
    ) 
  );

create policy "Admin Delete" 
  on storage.objects for delete
  using ( 
    bucket_id = 'products' 
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
    ) 
  );
