-- Impact Fight Academy — Mitgliedschafts-Backend
-- In Supabase SQL Editor ausführen (Projekt > SQL Editor > New query)

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Stammdaten
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,

  -- Kampfsport-Kontext (wie bisher auf der Website abgefragt)
  discipline text not null, -- z.B. 'Boxen', 'Kickboxen', 'BJJ', 'Muay Thai', 'Kinder'
  experience_level text, -- 'Anfänger', 'Fortgeschritten', 'Profi'

  -- Mitgliedschaft
  plan text not null, -- z.B. '1_monat', '6_monate', '12_monate', '24_monate'
  billing_interval text not null default 'monthly', -- 'monthly' | 'yearly'

  -- Stripe-Referenzen
  stripe_customer_id text unique,
  stripe_subscription_id text unique,

  -- Status
  status text not null default 'pending_payment',
  -- Zulässige Werte: pending_payment | active | payment_failed | canceled

  constraint valid_status check (status in ('pending_payment', 'active', 'payment_failed', 'canceled'))
);

create index if not exists idx_members_email on members(email);
create index if not exists idx_members_status on members(status);
create index if not exists idx_members_stripe_customer on members(stripe_customer_id);

-- Zahlungsereignisse (Historie, auch für spätere Mahnstufen-Logik)
create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  member_id uuid references members(id) on delete cascade,
  stripe_event_id text unique not null, -- verhindert doppelte Verarbeitung (Idempotenz)
  event_type text not null, -- 'payment_succeeded' | 'payment_failed' | 'subscription_canceled'
  raw_payload jsonb
);

create index if not exists idx_payment_events_member on payment_events(member_id);

-- E-Mail-Log (welche automatisierte Mail wurde wann an wen verschickt)
create table if not exists email_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  member_id uuid references members(id) on delete cascade,
  email_type text not null,
  -- 'signup_confirmation' | 'payment_confirmation' | 'payment_failed_notice' | 'trial_reminder' | 'trial_followup'
  sent_to text not null,
  status text not null default 'sent' -- 'sent' | 'failed'
);

-- updated_at automatisch pflegen
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_members_updated_at on members;
create trigger trg_members_updated_at
  before update on members
  for each row
  execute function set_updated_at();
