-- Script para adicionar coluna horas_mensais na tabela jornadas_trabalho
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna horas_mensais se não existir
ALTER TABLE jornadas_trabalho 
ADD COLUMN IF NOT EXISTS horas_mensais DECIMAL(6,2) NOT NULL DEFAULT 0;

-- Atualizar registros existentes calculando horas_mensais baseado em horas_semanais
UPDATE jornadas_trabalho 
SET horas_mensais = horas_semanais * 4.33
WHERE horas_mensais = 0;

-- Verificar resultado
SELECT id, nome, horas_semanais, horas_mensais, ativa, padrao 
FROM jornadas_trabalho;
