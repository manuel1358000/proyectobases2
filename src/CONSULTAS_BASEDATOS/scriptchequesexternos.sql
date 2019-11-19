CREATE OR REPLACE PROCEDURE GRABAR_CHEQUES_COMPENSADOS(
p_banco number,
p_referencia number,
p_cuenta number,
p_cheque number,
p_monto float,
p_estado varchar2
)IS
cursor c_cuenta(pp_cuenta number) is
select saldo, disponible 
from cuenta
where cod_cuenta=pp_cuenta
for update of saldo;
BEGIN
    IF p_estado='OK' THEN
        UPDATE CHEQUE_TEMPORAL SET ESTADO='OK' WHERE COD_CHEQUE_TEMPORAL=p_referencia; 
    ELSE
        UPDATE CHEQUE_TEMPORAL SET ESTADO='RECHAZADO' WHERE COD_CHEQUE_TEMPORAL=p_referencia; 
    END IF;
END GRABAR_CHEQUES_COMPENSADOS;



INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,cuenta_cod_cuenta) 
values(TO_DATE(sysdate,'YYYY-MM-DD'),'RETIRO','CHEQUE',v_cuenta.saldo,p_monto,v_cuenta.saldo-p_monto,'1','RECHAZADO','COMPENSACION RECHAZADA','123456',1,1,p_cuenta);                             
INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,cuenta_cod_cuenta) 
values(TO_DATE(sysdate,'YYYY-MM-DD'),'DEPOSITO','CHEQUE',v_destino.saldo,p_monto,v_destino.saldo+p_monto,'1','','','123456',1,1,p_cuenta);                 
            




SELECT * FROM TRANSACCION;



--select que trae todos los bancos de la tabla de cheques temporales
SELECT DISTINCT(banco)
FROM CHEQUE_TEMPORAL where LOTE_COD_LOTE is null
order by banco;


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
            INSERT INTO CHEQUE_TEMPORAL(CHEQUE,FECHA,CUENTA,VALOR,LOTE_COD_LOTE,BANCO,ESTADO)VALUES(p_numero_cheque,to_date(p_fecha_cheque,'YYYY-MM-DD'),p_cuenta_cheque,p_monto_cheque,null,p_banco_cheque,'CARGADOS');
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
UPDATE CHEQUE SET MONTO=0, ESTADO='GENERADO' where numero>1;
update cuenta set saldo=3000, disponible=3000, reserva=0 where cod_cuenta=7;
update cuenta set saldo=600, disponible=600, reserva=0 where cod_cuenta=1;
commit;
delete from transaccion where 1=1;
commit;

select * from transaccion;
select * from cheque order by numero;
select * from cuenta;

select * from cheque_temporal;























