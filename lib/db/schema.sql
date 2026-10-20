-- Larkspur House — database schema
-- Works on Postgres 14+ and on the embedded PGlite database used for local previews.

create table if not exists rooms (
  id            serial primary key,
  slug          text not null unique,
  name          text not null,
  tagline       text not null default '',
  description   text not null default '',
  capacity      integer not null check (capacity between 1 and 12),
  beds          text not null default '',
  size_sqm      integer,
  nightly_rate  integer not null check (nightly_rate >= 0), -- whole pounds, per night
  amenities     text[] not null default '{}',
  is_listed     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists room_photos (
  id          serial primary key,
  room_id     integer not null references rooms(id) on delete cascade,
  storage_key text not null unique,
  alt         text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists room_photos_room_idx on room_photos (room_id, sort_order);

create table if not exists grounds_photos (
  id          serial primary key,
  storage_key text not null unique,
  alt         text not null default '',
  caption     text not null default '',
  sort_order  integer not null default 0
);

create table if not exists stay_requests (
  id              serial primary key,
  reference       text not null unique,
  room_id         integer not null references rooms(id),
  guest_name      text not null,
  guest_email     text not null,
  guest_phone     text not null default '',
  check_in        date not null,
  check_out       date not null,
  adults          integer not null default 2 check (adults between 1 and 12),
  children        integer not null default 0 check (children between 0 and 12),
  message         text not null default '',
  status          text not null default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  innkeeper_note  text,
  decided_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (check_out > check_in)
);

create index if not exists stay_requests_room_dates_idx on stay_requests (room_id, check_in, check_out);
create index if not exists stay_requests_status_idx on stay_requests (status, created_at);

create table if not exists blocked_dates (
  id          serial primary key,
  room_id     integer not null references rooms(id) on delete cascade,
  start_date  date not null,
  end_date    date not null,
  reason      text not null default '',
  created_at  timestamptz not null default now(),
  check (end_date > start_date)
);

create index if not exists blocked_dates_room_dates_idx on blocked_dates (room_id, start_date, end_date);

create table if not exists menus (
  id            serial primary key,
  season        text not null unique check (season in ('spring', 'summer', 'autumn', 'winter')),
  title         text not null,
  intro         text not null default '',
  is_published  boolean not null default true,
  updated_at    timestamptz not null default now()
);

create table if not exists menu_items (
  id          serial primary key,
  menu_id     integer not null references menus(id) on delete cascade,
  section     text not null,
  name        text not null,
  description text not null default '',
  dietary     text[] not null default '{}',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists menu_items_menu_idx on menu_items (menu_id, sort_order);

create table if not exists guestbook_entries (
  id          serial primary key,
  guest_name  text not null,
  location    text not null default '',
  stay_month  text not null default '',
  message     text not null,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'hidden', 'rejected')),
  created_at  timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists guestbook_status_idx on guestbook_entries (status, created_at);

create table if not exists innkeepers (
  id            serial primary key,
  email         text not null unique,
  name          text not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);
