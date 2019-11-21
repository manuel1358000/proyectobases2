CREATE OR REPLACE PROCEDURE OPERAR_CHECOMP_PROPIO(
p_banco number,
p_referencia number,
p_cuenta number,
p_cheque number,
p_monto float,
p_banco_destino number
)IS
out_of_stock EXCEPTION;
number_on_hand NUMBER:=666;
v_error varchar2(32000);
cursor c_cuenta_destino(pp_cuenta_destino number) is
select saldo, disponible 
from cuenta
where cod_cuenta=pp_cuenta_destino
for update of saldo;    
BEGIN
    --verificar si el cheque existe en la cuenta
    --verificar si el cheque ya fue cambiado
    --verificar si la cuenta tiene fondos
    IF VERIFICAR_CUENTA(p_cuenta,p_cheque)=1 THEN
        IF VERIFICAR_ESTADO(p_cuenta,p_cheque,p_monto)=1 THEN
            for v_destino in c_cuenta_destino(p_cuenta_destino) loop
                if confirmar then
                    INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,cuenta_cod_cuenta) 
                    values(TO_DATE(sysdate,'YYYY-MM-DD'),'DEPOSITO','CHEQUE',v_destino.saldo,p_monto_cheque,v_destino.saldo+p_monto_cheque,'1','','','123456',p_agencia,p_usuario,p_cuenta_destino);                 
                    UPDATE CUENTA SET SALDO=DISPONIBLE+RESERVA+p_monto_cheque, DISPONIBLE=DISPONIBLE+p_monto_cheque  WHERE cod_cuenta=p_cuenta_destino;
                    UPDATE CHEQUE_TEMPORAL_PROPIO SET ESTADO='OK' WHERE CUENTA=p_cuenta and CHEQUE=p_cheque;
                end if;
            end loop;
            commit;
        ELSE
            number_on_hand:=20030;
            RAISE out_of_stock;
        END IF;
    ELSE
        number_on_hand:=20020;
        RAISE out_of_stock;
    END IF;
    exception
        when out_of_stock then
            IF number_on_hand=20010 THEN
                raise_application_error(-20010,'FECHA INVALIDA');
            ELSIF number_on_hand=20020 THEN
                raise_application_error(-20020,'CHEQUE NO PERTENECE A LA CUENTA');
            ELSIF number_on_hand=20030 THEN
                raise_application_error(-20030,'CHEQUE PAGADO/EXTRAVIADO/CANCELADO');
            ELSIF number_on_hand=20040 THEN
                raise_application_error(-20040,'CUENTA CHEQUE SIN FONDOS');
            END IF;
            commit;
        when others then 
        v_error := SQLERRM;
        raise_application_error(-20000,v_error);
        commit;
    commit;
END OPERAR_CHECOMP_PROPIO;






--ES NECESARIO ENVIAR LA FECHA DEL CHEQUE YA QUE SE TIENE QUE VERIFICAR
CREATE OR REPLACE PROCEDURE GRABAR_CHECOMP_PROPIO(
p_banco number,
p_referencia number,
p_cuenta number,
p_cheque number,
p_monto float,
p_banco_destino number
)IS
BEGIN
    INSERT INTO CHEQUE_TEMPORAL_PROPIO(CHEQUE,CUENTA,VALOR,BANCO,LOTE_COD_LOTE,BANCO_DESTINO,ESTADO)VALUES(p_cheque,p_cuenta,p_monto,p_banco,null,1,'GRABADO');
    COMMIT;
END GRABAR_CHECOMP_PROPIO;






select * from cheque_temporal_propio;


select * from cuenta;

select * from chequera;
select * from cheque_temporal_propio;

delete from cheque_temporal_propio where 1=1;



CREATE OR REPLACE PROCEDURE OPERAR_CHEQUES_COMPENSADOS(
p_banco number,
p_referencia number,
p_cuenta number,
p_cheque number,
p_monto float,
p_estado varchar2
)IS
out_of_stock EXCEPTION;
number_on_hand NUMBER:=666;
v_error varchar2(32000);
cursor c_cuenta(pp_cuenta number) is
select saldo, disponible 
from cuenta
where cod_cuenta=pp_cuenta
for update of saldo;
cursor c_cuenta_destino(p_referencia number) is
select cuenta_destino 
from cheque_temporal
where cod_cheque_temporal=p_referencia
for update of cuenta_destino;
BEGIN
    IF p_estado='OK' THEN
        for v_cuenta in c_cuenta(p_cuenta) loop
            INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,cuenta_cod_cuenta) 
            values(TO_DATE(sysdate,'YYYY-MM-DD'),'DEPOSITO','CHEQUE',v_cuenta.saldo,p_monto,v_cuenta.saldo+p_monto,'1','','','123456',1,1,p_cuenta);
        end loop;
        for v_destino in c_cuenta_destino(p_referencia) loop
            UPDATE CUENTA SET SALDO=DISPONIBLE+RESERVA, RESERVA=RESERVA-p_monto, DISPONIBLE=DISPONIBLE+p_monto where cod_cuenta=v_destino.cuenta_destino;
        end loop;
    ELSE
        for v_cuenta in c_cuenta(p_cuenta) loop
            INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,cuenta_cod_cuenta) 
            values(TO_DATE(sysdate,'YYYY-MM-DD'),'RETIRO','CHEQUE',v_cuenta.saldo,p_monto,v_cuenta.saldo-p_monto,'1','RECHAZADO','COMPENSACION RECHAZADA','123456',1,1,p_cuenta);                    
        end loop;
        for v_destino in c_cuenta_destino(p_referencia) loop
            UPDATE CUENTA SET SALDO=DISPONIBLE+RESERVA-p_monto, RESERVA=RESERVA-p_monto where cod_cuenta=v_destino.cuenta_destino;
        end loop;
        commit;
        number_on_hand:=20060;
        RAISE out_of_stock;
    END IF;
    exception
        when out_of_stock then
            IF number_on_hand=20060 THEN
                raise_application_error(-20060,'COMPENSACION RECHAZADA');
            END IF;
            commit;
        when others then 
        v_error := SQLERRM;
        raise_application_error(-20000,v_error);
        commit;
    commit;
END OPERAR_CHEQUES_COMPENSADOS;



select * from cheque_temporal;
select * from transaccion;


UPDATE CHEQUE_TEMPORAL SET ESTADO='RECHAZADO' WHERE COD_CHEQUE_TEMPORAL=p_referencia;






select * from chequera;
select * from cuenta;


select * from cheque_temporal;

delete from cheque_temporal where 1=1;

select * from cheque_temporal;


UPDATE CHEQUE_TEMPORAL SET ESTADO=NULL WHERE 1=1;

CREATE OR REPLACE PROCEDURE GRABAR_CHEQUES_COMPENSADOS(
p_banco number,
p_referencia number,
p_cuenta number,
p_cheque number,
p_monto float,
p_estado varchar2
)IS
BEGIN
    IF p_estado='OK' THEN
        UPDATE CHEQUE_TEMPORAL SET ESTADO='OK' WHERE COD_CHEQUE_TEMPORAL=p_referencia; 
    ELSE
        UPDATE CHEQUE_TEMPORAL SET ESTADO='RECHAZADO' WHERE COD_CHEQUE_TEMPORAL=p_referencia; 
    END IF;
    commit;
END GRABAR_CHEQUES_COMPENSADOS;



--select que trae todos los bancos de la tabla de cheques temporales
SELECT DISTINCT(banco)
FROM CHEQUE_TEMPORAL where LOTE_COD_LOTE is null
order by banco;


--trae toda la info del cheque temporal en base a un banco en especifico
SELECT BANCO,COD_CHEQUE_TEMPORAL AS REFERENCIA,CUENTA,CHEQUE AS NO_CHEQUE,VALOR AS MONTO
FROM CHEQUE_TEMPORAL
WHERE BANCO=3 AND LOTE_COD_LOTE IS NULL;

SELECT * FROM CHEQUE_TEMPORAL;


CREATE OR REPLACE PROCEDURE DEPOSITO_CHEQUE_EXTERNO(
    p_usuario IN number,
    p_agencia IN number,
    p_cuenta_destino IN number,
    p_cuenta_cheque IN number,
    p_banco_actual IN number,--banco donde se esta haciendo el deposito
    p_banco_cheque IN number,
    p_numero_cheque IN number,
    p_fecha_cheque IN VARCHAR2,
    p_monto_cheque IN float

)IS
out_of_stock EXCEPTION;
number_on_hand NUMBER:=666;
v_error varchar2(32000);
cursor c_cuenta_destino(pp_cuenta_destino number) is
select saldo, disponible 
from cuenta
where cod_cuenta=pp_cuenta_destino
for update of saldo;  
BEGIN
--VERIFICACIONES QUE SE TIENEN QUE REALIZAR
--VERIFICAR LA FECHA DEL CHEQUE
--VERIFICAR SI EL CHEQUE YA EXISTE EN LA TABLA DE CHEQUES DE COMPENSACION
--AGREGAR LA TRANSACCION DE DEPOSITO A LA CUENTA DESTINO
--AGREGAR EL MONTO A LA RESERVA DE LA CUENTA ACTUAL
--AGREGA EL CHEQUE A LA TABLA DE CHEQUE TEMPORAL
    --VERIFICAR LA FECHA DEL CHEQUE
    IF to_date(p_fecha_cheque,'YYYY-MM-DD')>sysdate THEN
        DBMS_OUTPUT.put_line('CHEQUE RECHAZADO POR FECHA INCORRECTA');
        number_on_hand:=20010;
        RAISE out_of_stock; 
    ELSE
        --VERIFICAR SI EL CHEQUE YA EXISTE EN LA TABLA DE CHEQUES DE COMPENSACION
        --si no existe el cheque entonces si se puede cambiar
        IF VERIFICAR_CHEQUE_EXTERNO(p_numero_cheque,p_cuenta_cheque,p_banco_cheque)=0 THEN
            --AGREGA EL CHEQUE A LA TABLA DE CHEQUE TEMPORAL
            for v_destino in c_cuenta_destino(p_cuenta_destino) loop
                INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,cuenta_cod_cuenta) 
                values(TO_DATE(sysdate,'YYYY-MM-DD'),'DEPOSITO','CHEQUE',v_destino.saldo,p_monto_cheque,v_destino.saldo+p_monto_cheque,'1','','','123456',p_agencia,p_usuario,p_cuenta_destino);                 
                UPDATE CUENTA SET SALDO=DISPONIBLE+RESERVA+p_monto_cheque, RESERVA=RESERVA+p_monto_cheque  WHERE cod_cuenta=p_cuenta_destino;
            end loop;
            INSERT INTO CHEQUE_TEMPORAL(CHEQUE,FECHA,CUENTA,VALOR,LOTE_COD_LOTE,BANCO,ESTADO,CUENTA_DESTINO)VALUES(p_numero_cheque,to_date(p_fecha_cheque,'YYYY-MM-DD'),p_cuenta_cheque,p_monto_cheque,null,p_banco_cheque,'CARGADOS',p_cuenta_destino);
        ELSE
            DBMS_OUTPUT.put_line('CHEQUE YA FUE PAGADO');
            number_on_hand:=20030;
            RAISE out_of_stock;
        END IF;
    END IF;
    exception
        when out_of_stock then
            IF number_on_hand=20010 THEN
                raise_application_error(-20010,'FECHA INVALIDA');
            ELSIF number_on_hand=20020 THEN
                raise_application_error(-20020,'CHEQUE NO PERTENECE A LA CUENTA');
            ELSIF number_on_hand=20030 THEN
                raise_application_error(-20030,'CHEQUE PAGADO/EXTRAVIADO/CANCELADO');
            ELSIF number_on_hand=20040 THEN
                raise_application_error(-20040,'CUENTA CHEQUE SIN FONDOS');
            END IF;
            commit;
        when others then 
        v_error := SQLERRM;
        raise_application_error(-20000,v_error);
        commit;
commit;
END DEPOSITO_CHEQUE_EXTERNO;




CREATE OR REPLACE FUNCTION VERIFICAR_CHEQUE_EXTERNO(
    no_cheque number,
    no_cuenta number,
    no_banco number
)
RETURN NUMBER IS respuesta NUMBER:=1;
valor number:=1;
val number:=1;
cursor c_cheque_temporal(pp_no_cuenta number, pp_no_cheque number,pp_no_banco number) is
select cod_cheque_temporal
from cheque_temporal
where cuenta=pp_no_cuenta and CHEQUE=pp_no_cheque and BANCO=pp_no_banco;
BEGIN
    for v_cheque in c_cheque_temporal(no_cuenta,no_cheque,no_banco) loop    
        SELECT cod_cheque_temporal into val
        FROM CHEQUE_TEMPORAL 
        WHERE CUENTA=no_cuenta AND CHEQUE=no_cheque AND BANCO=no_banco 
        FOR UPDATE;
    END LOOP;
    SELECT COUNT(CHEQUE) INTO valor
    FROM CHEQUE_TEMPORAL
    WHERE cuenta=no_cuenta AND CHEQUE=no_cheque AND BANCO=no_banco;
    respuesta:=valor;
    return (respuesta);
END VERIFICAR_CHEQUE_EXTERNO;









delete from cheque_temporal where 1=1;
delete from cheque_temporal_propio where 1=1;
UPDATE CHEQUE SET MONTO=0, ESTADO='GENERADO' where numero>0;
update cuenta set saldo=30000, disponible=30000, reserva=0 where cod_cuenta=1;
update cuenta set saldo=20000, disponible=20000, reserva=0 where cod_cuenta=4;
update cuenta set saldo=40000, disponible=40000, reserva=0 where cod_cuenta=7;
commit;
delete from transaccion where 1=1;
commit;






select * from cuenta;



select * from cheque_temporal;

select * from transaccion;
select * from cuenta;
select * from chequera;

select * from cheque_temporal;
select * from cuenta;



select * from transaccion;
select * from cheque order by numero;
select * from cuenta;

--reiniciar grabador
update cheque_temporal set estado=null where 1=1;


select * from cheque_temporal;

update cheque_temporal set cuenta_destino=1 where 1=1;


select * from transaccion;

select * from cuenta;



select * from cheque_temporal;

select * from cuenta;

--reiniciar operador
SELECT * FROM CUENTA;


--reiniciar cuentas antes de operar cheques que enviamos a compensar
update cuenta set saldo=1800, reserva=1200, disponible=600 where cod_cuenta=1;
delete from transaccion where cod_transaccion>14361;
UPDATE CHEQUE_TEMPORAL SET ESTADO=NULL WHERE 1=1;
commit;





--reiniciar cuentas que tenemos que verificar para generar archivo IN

delete from transaccion where cod_transaccion>14361;
update cuenta set saldo=3000, reserva=0, disponible=3000 where cod_cuenta=7;
delete from cheque_temporal_propio where 1=1;
commit;







update cuenta set saldo=1800, reserva=1200, disponible=600 where cod_cuenta=1;
delete from transaccion where cod_transaccion>14361;
UPDATE CHEQUE_TEMPORAL SET ESTADO=NULL WHERE 1=1;
commit;









SELECT T.COD_TRANSACCION, T.FECHA, T.TIPO, T.NATURALEZA, T.SALDO_INICIAL, T.VALOR, T.SALDO_FINAL, T.AUTORIZACION, T.RECHAZO, T.RAZON_RECHAZO, T.DOCUMENTO, A.NOMBRE, T.USUARIO_COD_USUARIO, T.CUENTA_COD_CUENTA 
FROM TRANSACCION T, AGENCIA A, USUARIO U 
WHERE T.AGENCIA_COD_AGENCIA = a.cod_agencia 
AND t.usuario_cod_usuario= u.cod_usuario
AND t.fecha = TO_DATE('20-NOV-19','YYYY-MM-DD')
ORDER BY t.cod_transaccion; 





CREATE OR REPLACE PROCEDURE DEPOSITO_EFECTIVO(
    p_usuario number,
    p_agencia number,
    p_cuenta number,
    p_monto float
)IS
cursor c_cuenta(pp_cuenta number) is
select saldo, disponible 
from cuenta
where cod_cuenta=pp_cuenta
for update of saldo; 
p_saldo float;
BEGIN
    SELECT SALDO INTO p_saldo
    FROM CUENTA
    WHERE COD_CUENTA=p_cuenta
    FOR UPDATE;
    UPDATE CUENTA SET SALDO=DISPONIBLE+RESERVA+p_monto, DISPONIBLE=DISPONIBLE+p_monto  WHERE cod_cuenta=p_cuenta;
    INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,cuenta_cod_cuenta) 
    values(TO_DATE(sysdate,'YYYY-MM-DD'),'DEPOSITO','EFECTIVO',p_saldo,p_monto,p_saldo+p_monto,'1','','','123456',p_agencia,p_usuario,p_cuenta);                 
    commit;
END DEPOSITO_EFECTIVO;


begin DEPOSITO_EFECTIVO(1,1,1,2000); END;


SELECT * FROM CUENTA;

SELECT * FROM TRANSACCION;

DELETE FROM TRANSACCION WHERE COD_TRANSACCION=30889;
