create table if not exists tasks (
  id serial primary key,
  title text not null,
  owner text not null
);
