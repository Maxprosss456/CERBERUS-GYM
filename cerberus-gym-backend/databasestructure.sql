-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- Copia de la base de datos en supabase, propenso a cambios.

CREATE TABLE public.Socios (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  Nombre text NOT NULL,
  dni bigint,
  teléfono bigint,
  e-mail text,
  fecha_asociación timestamp without time zone DEFAULT now(),
  fecha_expiración timestamp without time zone,
  precio_membresía bigint,
  descripción text,
  foto_perfil text,
  concurrente boolean NOT NULL DEFAULT true,
  CONSTRAINT Socios_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Registro_pago (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_usuario bigint NOT NULL,
  fecha_pagado timestamp without time zone NOT NULL DEFAULT now(),
  método_pago bigint NOT NULL,
  CONSTRAINT Registro_pago_pkey PRIMARY KEY (id),
  CONSTRAINT Registro_pago_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.Socios(id)
);