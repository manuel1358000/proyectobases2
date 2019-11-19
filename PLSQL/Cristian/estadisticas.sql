--Saldos de bancos
SELECT A.nombre, SUM(T.valor)
FROM Agencia A, Transaccion T
WHERE A.cod_agencia = T.agencia_cod_agencia
AND A.banco_cod_lote = 1
GROUP BY A.nombre;

--Saldos totales disponible, real, reserva