-----------------------------------------------PROCEDIMIENTO GENERAL
CREATE OR REPLACE PROCEDURE deposito_cheque(
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
    v_saldo float;
    v_disponible float;
    out_of_stock EXCEPTION;
    number_on_hand NUMBER:=666;
    v_error varchar2(32000);
    --cursor que trae la informacion de la cuenta a quien se le realiza el deposito del cheque
    cursor c_cuenta_destino(pp_cuenta_destino number) is
    select saldo, disponible 
    from cuenta
    where cod_cuenta=pp_cuenta_destino
    for update of saldo;
    cursor c_cuenta_origen(pp_cuenta_origen number) is
    select saldo, disponible 
    from cuenta
    where cod_cuenta=pp_cuenta_origen
    for update of saldo;
    confirmar boolean:=false;
BEGIN
    --proceso para registrar cheque de banco propio
    /*
validaciones que se tiene que realizar
        -   validar fecha del cheque(pendiente)
        -   validar si el cheque pertenece a la cuenta
        -   validar si el cheque tiene algun reporte
        -   validar si tiene fondos la cuenta
        - CODIGO DE ERRORES
        - FECHA INVALIDA - 20010
        - CHEQUE NO PERTENECE A LA CUENTA - 20011
        - CHEQUE ESTA PAGADO, CANDELADO, EXTRAVIADO - 20012
        - LA CUENTA DEL CHEQUE NO TIENE FONDOS - 20013
    */
    IF p_banco_actual=p_banco_cheque THEN
        IF to_date(p_fecha_cheque,'YYYY-MM-DD')>sysdate THEN
            DBMS_OUTPUT.put_line('CHEQUE RECHAZADO POR FECHA INCORRECTA');
            number_on_hand:=20010;
            RAISE out_of_stock; 
        ELSE
            --vamos a verificar si un cheque pertenece a la cuenta
            --si pertenece vamos a retornar un 1 sino un 0
            IF VERIFICAR_CUENTA()=1 THEN
                --verificamos si el cheque ya fue pagado, reportado/robado o si no existe
                -- verificamos si la cuenta tiene fondos
                for v_origen in c_cuenta_origen(p_cuenta_cheque) loop
                    --se verifica si la cuenta tiene fondos;
                    if v_origen.disponible>=p_monto_cheque then
                        confirmar:=true;
                        INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,cuenta_cod_cuenta) 
                        values(TO_DATE(sysdate,'YYYY-MM-DD'),'RETIRO','CHEQUE',v_origen.saldo,p_monto_cheque,v_origen.saldo-p_monto_cheque,'1','','','123456',p_agencia,p_usuario,p_cuenta_destino);                 
                        UPDATE CUENTA SET SALDO=DISPONIBLE+RESERVA-p_monto_cheque, DISPONIBLE=DISPONIBLE-p_monto_cheque  WHERE cod_cuenta=p_cuenta_cheque;
                    else 
                        number_on_hand:=20040;
                        RAISE out_of_stock; 
                    end if;
                end loop;
                commit;
                for v_destino in c_cuenta_destino(p_cuenta_destino) loop
                    if confirmar then
                        INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,cuenta_cod_cuenta) 
                        values(TO_DATE(sysdate,'YYYY-MM-DD'),'DEPOSITO','CHEQUE',v_destino.saldo,p_monto_cheque,v_destino.saldo+p_monto_cheque,'1','','','123456',p_agencia,p_usuario,p_cuenta_destino);                 
                        UPDATE CUENTA SET SALDO=DISPONIBLE+RESERVA+p_monto_cheque, DISPONIBLE=DISPONIBLE+p_monto_cheque  WHERE cod_cuenta=p_cuenta_destino;
                    end if;
                end loop;
            ELSE 
                number_on_hand:=20020;
                RAISE out_of_stock; 
            END IF;                
        END IF;
    ELSE
        DBMS_OUTPUT.put_line('CHEQUE DE UN BANCO EXTERNO');
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
        when others then 
        v_error := SQLERRM;
        raise_application_error(-20000,v_error);
        commit;
    commit;
END deposito_cheque;


update cuenta set saldo=3000, disponible=3000, reserva=0 where cod_cuenta=2;
update cuenta set saldo=3000, disponible=3000, reserva=0 where cod_cuenta=7;
update cuenta set saldo=600, disponible=600, reserva=0 where cod_cuenta=1;
commit;
delete from transaccion where 1=1;
commit;


select * from chequera;
select * from transaccion order by cod_transaccion;
select * from cuenta;

select * from lote;


DROP FUNCTION VERIFICAR_CHEQUE;




SELECT * FROM CHEQUERA;
SELECT * FROM CHEQUE;

--funcion que permite verificar si un cheque pertenece a una cuenta
CREATE OR REPLACE FUNCTION VERIFICAR_CHEQUE(
    no_cuenta IN number,
    no_cheque IN number
)
RETURN NUMBER IS respuesta NUMBER:=1;
valor number:=1;
BEGIN
    SELECT CASE 
    WHEN EXISTS(
        SELECT * 
        FROM CUENTA
        INNER JOIN CHEQUERA
        ON CUENTA.COD_CUENTA=CHEQUERA.CUENTA_COD_CUENTA
        INNER JOIN CHEQUE
        ON CHEQUE.CHEQUERA_COD_CHEQUERA=CHEQUERA.COD_CHEQUERA
        AND CUENTA.COD_CUENTA=no_cuenta
        AND CHEQUE.NUMERO=no_cheque
    )
    then 0
    else 1
    END
    INTO valor
    FROM chequera;
respuesta:=valor;
return(respuesta);
END VERIFICAR_CHEQUE;

            
SELECT * FROM CHEQUERA;

CREATE OR REPLACE FUNCTION REPORTE_CHEQUE(
    no_cuenta IN number,
    no_cheque IN number
)
RETURN NUMBER IS respuesta NUMBER;
CURSOR c1 IS 
select CHEQUERA_COD_CHEQUERA, NUMERO
from cheque
where cheque; 
valor number:=1;
BEGIN
    for che in c1 LOOP
        SELECT CASE
            WHEN EXISTS(SELECT *
                        FROM CHEQUERA 
                        WHERE COD_CHEQUERA=che.CHEQUERA_COD_CHEQUERA 
                        and ULTIMO_CHEQUE>=no_cheque 
                        and cuenta_cod_cuenta=no_cuenta)
            then 0
            else 1
            END
            INTO valor
            FROM chequera;
    END LOOP;
    respuesta:=valor;
    return(respuesta);
END REPORTE_CHEQUE;

