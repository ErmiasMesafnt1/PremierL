-- Ensure profiles table exists and auto-creates a row when a user signs up
-- Run this in Supabase SQL Editor if profile data isn't persisting
-- Run add-profile-team-fk.sql after seed-teams.sql if you need the team FK

-- Create profiles table if it doesn't exist (no teams FK here - add via add-profile-team-fk.sql)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  favorite_team_id uuid,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create or replace trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if any, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ensure RLS policies exist (run rls-policies.sql if not already done)
-- Profiles policies: SELECT, INSERT, UPDATE for own row
