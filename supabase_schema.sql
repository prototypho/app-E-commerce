-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  full_name text,
  avatar_url text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. PRODUCTS Table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null check (price >= 0),
  category text not null,
  image_url text,
  stock integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Products
alter table public.products enable row level security;

create policy "Products are viewable by everyone"
  on public.products for select
  using ( true );

create policy "Admins can insert products"
  on public.products for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update products"
  on public.products for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can delete products"
  on public.products for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 3. ORDERS Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  items jsonb not null, -- Stores the array of CartItem
  total numeric not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  shipping_address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Orders
alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders for select
  using ( auth.uid() = user_id );

create policy "Admins can view all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Users can insert their own orders"
  on public.orders for insert
  with check ( auth.uid() = user_id );

create policy "Admins can update orders (status)"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- STORAGE BUCKETS (Optional, if you use image upload)
-- insert into storage.buckets (id, name) values ('products', 'products');
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'products' );
-- create policy "Admin Upload" on storage.objects for insert with check ( bucket_id = 'products' and exists ( select 1 from public.profiles where id = auth.uid() and role = 'admin' ) );
