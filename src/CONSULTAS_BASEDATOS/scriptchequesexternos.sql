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
        IF VERIFICAR_CHEQUE_EXTERNO(p_numero_cheque,p_cuenta_cheque)=0 THEN
            INSERT INTO CHEQUE_TEMPORAL()VALUES();
        ELSE
            DBMS_OUTPUT.put_line('CHEQUE YA FUE PAGADO');
            number_on_hand:=20010;
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


select constraint_name, constraint_type 
from user_constraints 
where table_name='MITABLABUSCADA';


EXEC DEPOSITO_CHEQUE_EXTERNO(1,1,7,1,2,2,4,'2019-01-01',200);


CREATE OR REPLACE FUNCTION VERIFICAR_CHEQUE_EXTERNO(
    no_cheque number,
    no_cuenta number
)
RETURN NUMBER IS respuesta NUMBER:=1;
valor number:=1;
BEGIN
    SELECT COUNT(CHEQUE) INTO valor
    FROM CHEQUE_TEMPORAL
    WHERE CHEQUE=no_cheque and cuenta=no_cuenta;
    respuesta:=valor;
    return (respuesta);
END VERIFICAR_CHEQUE_EXTERNO;







--funcion que permite verificar si un cheque pertenece a una cuenta
CREATE OR REPLACE FUNCTION VERIFICAR_ESTADO_EXTERNO(
    no_cuenta IN number,
    no_cheque IN number,
    p_monto_cheque IN float
)
RETURN NUMBER IS respuesta NUMBER:=1;
valor number:=1;
val number;
cursor c_chequera(pp_cuenta_origen number,pp_numero_cheque number) is
select cod_chequera
from chequera
where cuenta_cod_cuenta=no_cuenta and ULTIMO_CHEQUE>no_cheque and no_cheque>(ULTIMO_CHEQUE-NO_CHEQUES);
BEGIN
    for v_chequera in c_chequera(no_cuenta,no_cheque) loop    
        SELECT cod_cheque into val
        FROM CHEQUE 
        WHERE NUMERO=no_cheque AND CHEQUERA_COD_CHEQUERA=v_chequera.cod_chequera
        FOR UPDATE;
    END LOOP;
    SELECT COUNT(COD_CUENTA) into valor 
    FROM CUENTA
    INNER JOIN CHEQUERA
    ON CUENTA.COD_CUENTA=CHEQUERA.CUENTA_COD_CUENTA
    INNER JOIN CHEQUE
    ON CHEQUE.CHEQUERA_COD_CHEQUERA=CHEQUERA.COD_CHEQUERA
    WHERE CUENTA.COD_CUENTA=no_cuenta
    AND CHEQUE.NUMERO=no_cheque
    AND CHEQUE.ESTADO='GENERADO'
    AND ROWNUM=1;
    for v_chequera in c_chequera(no_cuenta,no_cheque) loop    
        UPDATE CHEQUE SET ESTADO='PAGADO',MONTO=p_monto_cheque, FECHA=sysdate where NUMERO=no_cheque and CHEQUERA_COD_CHEQUERA=v_chequera.cod_chequera;
    end loop;
    respuesta:=valor;
    return(respuesta);
END VERIFICAR_ESTADO;













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
    cursor c_chequera(pp_cuenta_origen number,pp_numero_cheque number) is
    select cod_chequera, estado
    from chequera
    where cuenta_cod_cuenta=pp_cuenta_origen and ULTIMO_CHEQUE>pp_numero_cheque and pp_numero_cheque>(ULTIMO_CHEQUE-NO_CHEQUES)
    for update of estado;
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
            for v_chequera in c_chequera(p_cuenta_cheque,p_numero_cheque) loop    
                UPDATE CHEQUE SET ESTADO='RECHAZADO', FECHA=sysdate where NUMERO=p_numero_cheque and CHEQUERA_COD_CHEQUERA=v_chequera.cod_chequera;
            end loop; 
            commit;
            number_on_hand:=20010;
            RAISE out_of_stock; 
        ELSE
            --vamos a verificar si un cheque pertenece a la cuenta
            --si pertenece vamos a retornar un 1 sino un 0
            IF VERIFICAR_CUENTA(p_cuenta_cheque,p_numero_cheque)=1 THEN
                --verificamos si el cheque ya fue pagado, robado/cancelado
                IF VERIFICAR_ESTADO(p_cuenta_cheque,p_numero_cheque,p_monto_cheque)=1 THEN     
                    --verificamos si el cheque ya fue pagado, reportado/robado o si no existe
                    -- verificamos si la cuenta tiene fondos
                    --for v_chequera in c_chequera(p_cuenta_cheque,p_numero_cheque) loop    
                    --    UPDATE CHEQUE SET ESTADO='PAGADO',MONTO=p_monto_cheque, FECHA=sysdate where NUMERO=p_numero_cheque and CHEQUERA_COD_CHEQUERA=v_chequera.cod_chequera;
                    --end loop; 
                    for v_origen in c_cuenta_origen(p_cuenta_cheque) loop
                        --se verifica si la cuenta tiene fondos;
                        if v_origen.disponible>=p_monto_cheque then
                            confirmar:=true;
                            INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,cuenta_cod_cuenta) 
                            values(TO_DATE(sysdate,'YYYY-MM-DD'),'RETIRO','CHEQUE',v_origen.saldo,p_monto_cheque,v_origen.saldo-p_monto_cheque,'1','','','123456',p_agencia,p_usuario,p_cuenta_destino);                 
                            UPDATE CUENTA SET SALDO=DISPONIBLE+RESERVA-p_monto_cheque, DISPONIBLE=DISPONIBLE-p_monto_cheque  WHERE cod_cuenta=p_cuenta_cheque;
                        else 
                            for v_chequera in c_chequera(p_cuenta_cheque,p_numero_cheque) loop    
                                UPDATE CHEQUE SET ESTADO='RECHAZADO', FECHA=sysdate where NUMERO=p_numero_cheque and CHEQUERA_COD_CHEQUERA=v_chequera.cod_chequera;
                            end loop; 
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
                    for v_chequera in c_chequera(p_cuenta_cheque,p_numero_cheque) loop    
                        UPDATE CHEQUE SET ESTADO='RECHAZADO', FECHA=sysdate where NUMERO=p_numero_cheque and CHEQUERA_COD_CHEQUERA=v_chequera.cod_chequera;
                    end loop; 
                    number_on_hand:=20030;
                    RAISE out_of_stock; 
                END IF;
            ELSE 
                for v_chequera in c_chequera(p_cuenta_cheque,p_numero_cheque) loop    
                    UPDATE CHEQUE SET ESTADO='RECHAZADO', FECHA=sysdate where NUMERO=p_numero_cheque and CHEQUERA_COD_CHEQUERA=v_chequera.cod_chequera;
                end loop; 
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
            commit;
        when others then 
        v_error := SQLERRM;
        raise_application_error(-20000,v_error);
        commit;
    commit;
END deposito_cheque;


--funcion que permite verificar si un cheque pertenece a una cuenta
CREATE OR REPLACE FUNCTION VERIFICAR_ESTADO(
    no_cuenta IN number,
    no_cheque IN number,
    p_monto_cheque IN float
)
RETURN NUMBER IS respuesta NUMBER:=1;
valor number:=1;
val number;
cursor c_chequera(pp_cuenta_origen number,pp_numero_cheque number) is
select cod_chequera
from chequera
where cuenta_cod_cuenta=no_cuenta and ULTIMO_CHEQUE>no_cheque and no_cheque>(ULTIMO_CHEQUE-NO_CHEQUES);
BEGIN
    for v_chequera in c_chequera(no_cuenta,no_cheque) loop    
        SELECT cod_cheque into val
        FROM CHEQUE 
        WHERE NUMERO=no_cheque AND CHEQUERA_COD_CHEQUERA=v_chequera.cod_chequera
        FOR UPDATE;
    END LOOP;
    SELECT COUNT(COD_CUENTA) into valor 
    FROM CUENTA
    INNER JOIN CHEQUERA
    ON CUENTA.COD_CUENTA=CHEQUERA.CUENTA_COD_CUENTA
    INNER JOIN CHEQUE
    ON CHEQUE.CHEQUERA_COD_CHEQUERA=CHEQUERA.COD_CHEQUERA
    WHERE CUENTA.COD_CUENTA=no_cuenta
    AND CHEQUE.NUMERO=no_cheque
    AND CHEQUE.ESTADO='GENERADO'
    AND ROWNUM=1;
    for v_chequera in c_chequera(no_cuenta,no_cheque) loop    
        UPDATE CHEQUE SET ESTADO='PAGADO',MONTO=p_monto_cheque, FECHA=sysdate where NUMERO=no_cheque and CHEQUERA_COD_CHEQUERA=v_chequera.cod_chequera;
    end loop;
    respuesta:=valor;
    return(respuesta);
END VERIFICAR_ESTADO;


--funcion que permite verificar si un cheque pertenece a una cuenta
CREATE OR REPLACE FUNCTION VERIFICAR_CUENTA(
    no_cuenta IN number,
    no_cheque IN number
)
RETURN NUMBER IS respuesta NUMBER:=1;
valor number:=1;
BEGIN
    SELECT COUNT(COD_CUENTA) into valor 
    FROM CUENTA
    INNER JOIN CHEQUERA
    ON CUENTA.COD_CUENTA=CHEQUERA.CUENTA_COD_CUENTA
    INNER JOIN CHEQUE
    ON CHEQUE.CHEQUERA_COD_CHEQUERA=CHEQUERA.COD_CHEQUERA
    WHERE CUENTA.COD_CUENTA=no_cuenta
    AND CHEQUE.NUMERO=no_cheque
    AND ROWNUM=1;
    respuesta:=valor;
    return(respuesta);
END VERIFICAR_CUENTA;




UPDATE CHEQUE SET MONTO=0, ESTADO='GENERADO' where numero>1;
update cuenta set saldo=3000, disponible=3000, reserva=0 where cod_cuenta=7;
update cuenta set saldo=600, disponible=600, reserva=0 where cod_cuenta=1;
commit;
delete from transaccion where 1=1;
commit;

select * from transaccion;
select * from cheque order by numero;
