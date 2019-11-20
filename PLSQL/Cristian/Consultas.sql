--Saldos por agencia --este no sirve estoy haciendo una funcion
SELECT a.nombre, SUM(t.valor) as Saldo
FROM agencia a, transaccion t
WHERE a.cod_agencia = t.agencia_cod_agencia
AND a.banco_cod_lote = 1 --aqui va el codigo del banco que quiero
GROUP BY a.nombre;

CREATE OR REPLACE FUNCTION SUMA_SALDOS_AGENCIA( codigo_agencia_selec agencia.cod_agencia%TYPE )
RETURN FLOAT AS
    total float := 0;
BEGIN
    FOR r_trans IN(
        SELECT * 
        FROM transaccion 
        WHERE agencia_cod_agencia = codigo_agencia_selec
    )
    LOOP
        IF r_trans.tipo = 'DEPOSITO' THEN
            total := total + r_trans.valor;
        ELSIF r_trans.tipo = 'RETIRO' THEN
            total := total - r_trans.valor;
        ELSE
            total := total + r_trans.valor;
        END IF;
    END LOOP;
    RETURN total;
END;


--Saldos 
SELECT SUM(c.disponible)as Disponible, SUM(c.saldo) as Saldo, SUM(reserva) as Reserva
FROM cuenta c;

--Consulta de clientes con mayor numero de depositos
SELECT t.cuenta_cod_cuenta as "cuenta" , count(t.cuenta_cod_cuenta) as "NumeroDep"
FROM transaccion t
WHERE t.agencia_cod_agencia = 2 --aqui va el numero de agencia
AND t.tipo = 'DEPOSITO'
GROUP BY t.cuenta_cod_cuenta;

--Consulta de clientes con mayor numero de depositos
SELECT t.cuenta_cod_cuenta as "cuenta" , SUM(t.valor) as "NumeroCheq"
FROM transaccion t
WHERE t.agencia_cod_agencia = 1 --aqui va el numero de agencia
AND t.tipo= 'RETIRO'
AND t.naturaleza = 'CHEQUE'
GROUP BY t.cuenta_cod_cuenta;

--consultar los clientes que nunca han hecho un deposito
SELECT cl.nombres
FROM cliente cl, cuenta cu
WHERE cl.cod_cliente = cu.cod_cuenta
AND cu.cod_cuenta NOT IN( 
                            SELECT t.cuenta_cod_cuenta
                            FROM transaccion t
                            WHERE t.agencia_cod_agencia = 3 --aqui va el codigo de agencia
                            AND t.tipo = 'DEPOSITO'
                        );

select * from cliente;
select * from agencia;