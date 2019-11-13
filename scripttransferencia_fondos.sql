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
    out_of_stock EXCEPTION;
    number_on_hand NUMBER:=666;
    v_error varchar2(32000);
    --cursor que trae la informacion de la cuenta a quien se le realiza el deposito del cheque
    cursor c_cuenta_destino(p_cuenta_destino number) is
    select saldo, disponible, reserva from cuenta
    where cod_cuenta=p_cuenta_destino;
    --cursor que trae la informacion de la cuenta origen del cheque si es del mismo banco
    cursor c_cuenta_cheque(p_cuenta_cheque number) is
    select saldo, disponible, reserva from cuenta
    where cod_cuenta=p_cuenta_cheque;
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
            
            --funcion que verifica si un cheque pertenece a una cuenta
            IF VERIFICAR_CHEQUE(p_cuenta_cheque,p_numero_cheque)=1 THEN
            
            --verificamos si el cheque fue reportado como robado, extraviado o si ya fue pagado
                IF REPORTE_CHEQUE(p_cuenta_cheque,p_numero_cheque)=1 THEN
                    --VERIFICAR_FONDOS_CUENTA();
                    for c_origen in c_cuenta_cheque(p_cuenta_cheque) loop
                        if c_origen.saldo>=p_monto_cheque then
                            --CUENTA DESTINO
                            UPDATE CUENTA SET DISPONIBLE=DISPONIBLE+p_monto_cheque where cod_cuenta=p_cuenta_destino;
                            --CUENTA ORIGEN
                            UPDATE CUENTA SET DISPONIBLE=DISPONIBLE-p_monto_cheque WHERE COD_CUENTA=p_cuenta_cheque;
                            INSERT INTO TRANSACCION(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,
                            autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,
                            cuenta_cod_cuenta) values(to_date(sysdate,'YYYY-MM-DD'),'RETIRO','CHEQUE',
                            c_origen.saldo,p_monto_cheque,(c_origen.saldo-p_monto_cheque),'1',
                            '','','123456',p_agencia,p_usuario,p_cuenta_cheque);
                            for c_destino in c_cuenta_destino(p_cuenta_destino) loop
                                INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,
                                autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,
                                cuenta_cod_cuenta) values(TO_DATE(sysdate,'YYYY-MM-DD'),'DEPOSITO','CHEQUE',
                                c_destino.saldo,p_monto_cheque,c_destino.saldo+p_monto_cheque,'1','','','123456',p_agencia,p_usuario,p_cuenta_destino);
                            
                            end loop;
                            UPDATE CUENTA SET SALDO=RESERVA + DISPONIBLE where cod_cuenta = p_cuenta_cheque;
                            UPDATE CUENTA SET SALDO=RESERVA + DISPONIBLE where cod_cuenta = p_cuenta_destino;
                            
                        else
                            DBMS_OUTPUT.put_line('LA CUENTA NO TIENE FONDOS');
                            number_on_hand:=20040;
                            RAISE out_of_stock; 
                        end if;
                    end loop;
                ELSE
                    DBMS_OUTPUT.put_line('EL CHEQUE YA FUE PAGADO, ESTA EXTRAVIADO O ESTA CANCELADO');
                    number_on_hand:=20030;
                    RAISE out_of_stock;
                END IF;
            ELSE
                DBMS_OUTPUT.put_line('EL CHEQUE NO PERTENECE A LA CUENTA');
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
        raise_application_error(-22222,v_error);
        commit;
    commit;
END deposito_cheque;

    --usuario,agencia,cuentadestino,cuentacheque,bancoactual,bancocheque,numerocheque,fechacheque,montocheque
    --CUENTA 7 A CUENTA2



update cuenta set saldo=2400, disponible=2400, reserva=0 where cod_cuenta=2;
update cuenta set saldo=70000, disponible=70000, reserva=0 where cod_cuenta=7;
update cuenta set saldo=600, disponible=600, reserva=0 where cod_cuenta=1;
commit;
delete from transaccion where 1=1;
commit;

select * from transaccion order by cod_transaccion;
select * from cuenta;

--funcion que permite verificar si un cheque pertenece a una cuenta
CREATE OR REPLACE FUNCTION VERIFICAR_CHEQUE(
    no_cuenta IN number,
    no_cheque IN number
)
RETURN NUMBER IS respuesta NUMBER:=1;
CURSOR C2 IS 
    SELECT COD_CHEQUERA, NO_CHEQUES, ULTIMO_CHEQUE
    FROM CHEQUERA
    WHERE CUENTA_COD_CUENTA=NO_CUENTA;
BEGIN
    FOR VALOR IN C2 LOOP
        IF VALOR.ULTIMO_CHEQUE>no_cheque then
            respuesta:=0;   
        end if;
    END LOOP;
    return(respuesta);
END VERIFICAR_CHEQUE;
execute DBMS_OUTPUT.put_line(VERIFICAR_CHEQUE(7,1));


CREATE OR REPLACE FUNCTION REPORTE_CHEQUE(
    no_cuenta IN number,
    no_cheque IN number
)
RETURN NUMBER IS respuesta NUMBER;
CURSOR c1 IS 
select CHEQUERA_COD_CHEQUERA, NUMERO
from cheque; 
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


execute DBMS_OUTPUT.put_line(REPORTE_CHEQUE(7,1));--retorna 0 si ya esta operado el cheque o 1 sino esta operado
execute DBMS_OUTPUT.put_line('hola');

select * from chequera;


select COUNT(*) from cheque inner join chequera ON cheque.chequera_cod_chequera=chequera.cod_chequera where cheque.numero=1 and chequera.cuenta_cod_cuenta=7


select * from chequeRA;
insert into cheque(NUMERO,FECHA,MONTO,ESTADO,LOTE_COD_LOTE,CHEQUERA_COD_CHEQUERA,FIRMA)VALUES(1,to_date('2019-11-05','YYYY-MM-DD'),0,'CANCELADO',NULL,1,'FIRMA');
insert into cheque(NUMERO,FECHA,MONTO,ESTADO,LOTE_COD_LOTE,CHEQUERA_COD_CHEQUERA,FIRMA)VALUES(2,to_date('2019-11-05','YYYY-MM-DD'),1000,'PAGADO',NULL,1,'FIRMA');

select * from cheque where COD_CHEQUE=30 and CUENTAv1=1 and (estado='CANCELADO' OR estado='EXTRAVIADO' OR estado='PAGADO');
SELECT * FROM CHEQUERA

DELETE FROM CHEQUE WHERE 1=1;












CREATE OR REPLACE PROCEDURE cargar_lote
(
    p_fecha varchar2,
    p_no_doc number,
    p_valor float,
    p_estado varchar2
)
IS  
    correlativo number;
    cursor c_lote is
    select COUNT(lote) as corre
    from lote_temporal;
BEGIN    
    for c in c_lote loop
        correlativo:=c.corre+1;
        insert into lote_temporal(lote,fecha,no_doc,valor,estado)values(correlativo,to_date(p_fecha,'YYYY-MM-DD'),p_no_doc,p_valor,p_estado);    
        commit;
    end loop;
END cargar_lote;









CREATE OR REPLACE PROCEDURE transferencia_fondos(
    p_usuario number,
    p_agencia number,
    p_cuenta_origen number,
    p_cuenta_destino number,
    p_monto number
)IS
    cursor c_cuenta_origen(p_cuenta_origen number) is
    select saldo
    from cuenta
    where cod_cuenta=p_cuenta_origen
    for update of saldo;
    cursor c_cuenta_destino(p_cuenta_destino number) is
    select saldo
    from cuenta
    where cod_cuenta=p_cuenta_destino
    for update of saldo;
    v_documento varchar2(255);
    v_error varchar2(32000);
BEGIN
    SAVEPOINT SALDO_INICIAL;
    UPDATE CUENTA SET DISPONIBLE= DISPONIBLE - p_monto where cod_cuenta = p_cuenta_origen;
    UPDATE CUENTA SET DISPONIBLE = DISPONIBLE + p_monto where cod_cuenta = p_cuenta_destino;
    for c_origen in c_cuenta_origen(p_cuenta_origen) loop
        INSERT INTO TRANSACCION(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,
        autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,
        cuenta_cod_cuenta) values(to_date(sysdate,'YYYY-MM-DD'),'RETIRO','TRANSFERENCIA',
        (c_origen.saldo+p_monto),p_monto,c_origen.saldo,'1',
        '','','123456',p_agencia,p_usuario,p_cuenta_origen);
    end loop;
    for c_destino in c_cuenta_destino(p_cuenta_destino) loop
        INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,
        autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,
        cuenta_cod_cuenta) values(TO_DATE(sysdate,'YYYY-MM-DD'),'DEPOSITO','TRANSFERENCIA',
        (c_destino.saldo-p_monto),p_monto,c_destino.saldo,'1','','','123456',p_agencia,p_usuario,p_cuenta_destino);
    end loop;
    UPDATE CUENTA SET SALDO=RESERVA + DISPONIBLE where cod_cuenta = p_cuenta_origen;
    UPDATE CUENTA SET SALDO=RESERVA + DISPONIBLE  where cod_cuenta = p_cuenta_destino;
    exception
        when others then 
        v_error := SQLERRM;
        raise_application_error(-20000,'Erro:'||v_error);
        ROLLBACK TO SALDO_INICIAL;
        commit;
    commit;
END transferencia_fondos;


CREATE OR REPLACE TRIGGER VERIFICAR_SALDO BEFORE INSERT OR UPDATE OR DELETE ON CUENTA FOR 
EACH ROW
BEGIN
    IF INSERTING THEN
        IF :NEW.saldo<0 THEN
            raise_application_error(-20000,'Saldo resultante negativo!');
        END IF;
    END IF;
END;

CREATE OR REPLACE TRIGGER VERIFICAR_SALDO_TRANSACCION BEFORE INSERT OR UPDATE OR DELETE ON TRANSACCION FOR 
EACH ROW
BEGIN
    IF INSERTING THEN
        IF :NEW.saldo_final<0 THEN
            raise_application_error(-20000,'Saldo resultante negativo!');
        END IF;
    END IF;
END;
