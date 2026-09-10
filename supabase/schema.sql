-- ============================================================================
--  SABOR DO SUL — ESTRUTURA COMPLETA DO BANCO DE DADOS (Supabase)
--  Cole TUDO neste arquivo no SQL Editor e clique em RUN.
--
--  DEPOIS DE RODAR:
--  1. Authentication → Users → crie o usuário SUPERADMIN (email + senha)
--  2. Copie o UUID dele e rode o seed comentado no final deste arquivo
--  3. Authentication → Sign In Providers → Email → desative "Confirm email"
--
--  Tabelas (na ordem de dependências):
--    restaurants → categories → menu_items → spins → prize_limits → user_roles
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1) RESTAURANTES
-- ---------------------------------------------------------------------------
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text,
  logo_url text,
  cor_primaria text not null default '#0c0a08',
  cor_secundaria text not null default '#e2703a',
  opening_time text not null default '18:00',
  closing_time text not null default '00:00',
  -- extras usados pelo site/painel (não listados no escopo, mas necessários):
  hours text not null default 'Todos os dias, 18h às 00h',
  address text,
  instagram text,
  roulette_daily_limit integer not null default 1,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2) CATEGORIAS (necessária para o CRUD de categorias do painel admin;
--    o campo menu_items.categoria guarda o NOME como texto — este é o
--    catálogo relacional usado no painel)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3) ITENS DO CARDÁPIO
-- ---------------------------------------------------------------------------
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  nome text not null,
  descricao text not null default '',
  preco numeric(10, 2) not null default 0,
  categoria text,
  foto_url text,
  disponivel boolean not null default true,
  -- extras usados pelo painel:
  category_id uuid references public.categories (id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4) GIROS DA ROLETA
--    O índice composto (restaurant_id, telefone_cliente, data_giro) permite
--    consultar em tempo logarítmico se um telefone JÁ GIROU HOJE — base do
--    limite de 1 giro por dia. data_giro é DATE (YYYY-MM-DD).
-- ---------------------------------------------------------------------------
create table if not exists public.spins (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  telefone_cliente text not null,
  premio_ganho text not null,
  data_giro date not null default current_date,
  -- extra usado pelo site (cupom gerado):
  cupom text,
  created_at timestamptz not null default now()
);

create index if not exists idx_spins_phone_date
  on public.spins (restaurant_id, telefone_cliente, data_giro);

-- ---------------------------------------------------------------------------
-- 5) LIMITES DE PRÊMIOS POR DIA
--    Controla quantos de cada prêmio já foram distribuídos na data.
--    A constraint UNIQUE (restaurant_id, prize_name, date) permite upsert
--    com ON CONFLICT para incrementar given_count atomicamente.
-- ---------------------------------------------------------------------------
create table if not exists public.prize_limits (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  prize_name text not null,
  daily_limit integer not null default 1,
  given_count integer not null default 0,
  date date not null default current_date,
  unique (restaurant_id, prize_name, date)
);

create index if not exists idx_prize_limits_lookup
  on public.prize_limits (restaurant_id, date);

-- ---------------------------------------------------------------------------
-- 6) PAPÉIS DOS USUÁRIOS
--    superadmin → restaurant_id NULL
--    admin      → restaurant_id aponta para o restaurante dele
-- ---------------------------------------------------------------------------
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('superadmin', 'admin')),
  restaurant_id uuid references public.restaurants (id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- ---------------------------------------------------------------------------
-- EXTRA: prêmios configuráveis da roleta (painel admin)
-- ---------------------------------------------------------------------------
create table if not exists public.roulette_prizes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  label text not null,
  weight integer not null default 10,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FUNÇÕES AUXILIARES (security definer — usadas pelas políticas RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_superadmin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'superadmin'
  );
$$;

create or replace function public.my_restaurant() returns uuid
language sql stable security definer set search_path = public as $$
  select restaurant_id from public.user_roles where user_id = auth.uid();
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- Regra de ouro:
--   admin       → só lê/escreve linhas do PRÓPRIO restaurant_id
--   superadmin  → acesso total (sem restrição)
--   público     → LÊ o cardápio (o site mostra o menu para visitantes) e
--                 GRAVA giros/limites na roleta (spins e prize_limits)
-- ============================================================================

alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.spins enable row level security;
alter table public.prize_limits enable row level security;
alter table public.user_roles enable row level security;
alter table public.roulette_prizes enable row level security;

-- ------------------------------------------------ restaurants
-- leitura pública: o site exibe os dados do restaurante para visitantes
create policy "restaurants_read_public" on public.restaurants for select to anon
  using (true);
create policy "restaurants_select" on public.restaurants for select to authenticated
  using (public.is_superadmin() or id = public.my_restaurant());
create policy "restaurants_insert" on public.restaurants for insert to authenticated
  with check (public.is_superadmin());
create policy "restaurants_update" on public.restaurants for update to authenticated
  using (public.is_superadmin() or id = public.my_restaurant());
create policy "restaurants_delete" on public.restaurants for delete to authenticated
  using (public.is_superadmin());

-- ------------------------------------------------ categories
create policy "categories_read_public" on public.categories for select to anon
  using (true);
create policy "categories_select" on public.categories for select to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "categories_insert" on public.categories for insert to authenticated
  with check (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "categories_update" on public.categories for update to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "categories_delete" on public.categories for delete to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());

-- ------------------------------------------------ menu_items
create policy "menu_read_public" on public.menu_items for select to anon
  using (true);
create policy "menu_select" on public.menu_items for select to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "menu_insert" on public.menu_items for insert to authenticated
  with check (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "menu_update" on public.menu_items for update to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "menu_delete" on public.menu_items for delete to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());

-- ------------------------------------------------ roulette_prizes
create policy "prizes_read_public" on public.roulette_prizes for select to anon
  using (true);
create policy "prizes_select" on public.roulette_prizes for select to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "prizes_insert" on public.roulette_prizes for insert to authenticated
  with check (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "prizes_update" on public.roulette_prizes for update to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "prizes_delete" on public.roulette_prizes for delete to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());

-- ------------------------------------------------ spins
-- inserção pública: cliente NÃO logado pode girar a roleta
-- (o restaurante de destino precisa existir)
create policy "spins_insert_public" on public.spins for insert to anon, authenticated
  with check (restaurant_id in (select id from public.restaurants));
-- leitura/edição: só admin do restaurante ou superadmin
create policy "spins_select" on public.spins for select to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "spins_update" on public.spins for update to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "spins_delete" on public.spins for delete to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());

-- ------------------------------------------------ prize_limits
create policy "prize_limits_insert_public" on public.prize_limits for insert to anon, authenticated
  with check (restaurant_id in (select id from public.restaurants));
create policy "prize_limits_select" on public.prize_limits for select to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "prize_limits_update" on public.prize_limits for update to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());
create policy "prize_limits_delete" on public.prize_limits for delete to authenticated
  using (public.is_superadmin() or restaurant_id = public.my_restaurant());

-- ------------------------------------------------ user_roles
-- cada usuário lê o PRÓPRIO papel; superadmin lê tudo.
-- escrita (criar/editar/remover admins) é exclusiva do superadmin.
create policy "roles_select" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_superadmin());
create policy "roles_insert" on public.user_roles for insert to authenticated
  with check (public.is_superadmin());
create policy "roles_update" on public.user_roles for update to authenticated
  using (public.is_superadmin());
create policy "roles_delete" on public.user_roles for delete to authenticated
  using (public.is_superadmin());

-- ============================================================================
-- STORAGE — bucket público de imagens (logotipos e fotos do cardápio)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

create policy "menu_images_public_read" on storage.objects for select
  using (bucket_id = 'menu-images');
create policy "menu_images_auth_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'menu-images');
create policy "menu_images_auth_update" on storage.objects for update to authenticated
  using (bucket_id = 'menu-images');
create policy "menu_images_auth_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'menu-images');

-- ============================================================================
-- SEED — rode manualmente após criar os usuários em Authentication → Users
-- ============================================================================

-- 1) SUPERADMIN: cole o UUID do usuário criado no painel do Supabase:
-- insert into public.user_roles (user_id, role)
-- values ('COLE-O-UUID-DO-SUPERADMIN', 'superadmin');

-- 2) RESTAURANTE INICIAL (opcional — também pode ser criado pelo painel):
-- insert into public.restaurants (nome, whatsapp, hours, address, opening_time, closing_time)
-- values ('Sabor do Sul', '(83) 99330-9886', 'Todos os dias, 18h às 00h',
--         'R. Inácia Maria de Souto, 228 — Gramame, João Pessoa/PB', '18:00', '00:00');
