CREATE OR REPLACE PROCEDURE cargar_cheques(
    banco number,
    numero_cheque number,
    monto float,
    cuenta_destino number,
    fecha_cheque date,
    p_usuario number,
    p_agencia number
)IS BEGIN
    

END cargar_cheques;






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
    UPDATE CUENTA SET SALDO = SALDO - p_monto where cod_cuenta = p_cuenta_origen;
    UPDATE CUENTA SET SALDO = SALDO + p_monto where cod_cuenta = p_cuenta_destino;
    for c_origen in c_cuenta_origen(p_cuenta_origen) loop
        INSERT INTO TRANSACCION(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,
        autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,
        cuenta_cod_cuenta) values(to_date(sysdate,'YYY-MM-DD'),'TRANSFERENCIA','RETIRO',
        (c_origen.saldo+p_monto),p_monto,c_origen.saldo,'1',
        '','','123456',p_agencia,p_usuario,p_cuenta_origen);
    end loop;
    for c_destino in c_cuenta_origen(p_cuenta_destino) loop
        INSERT INTO transaccion(fecha,tipo,naturaleza,saldo_inicial,valor,saldo_final,
        autorizacion,rechazo,razon_rechazo,documento,agencia_cod_agencia,usuario_cod_usuario,
        cuenta_cod_cuenta) values(TO_DATE(sysdate,'YYYY-MM-DD'),'TRANSFERENCIA','DEPOSITO',
        (c_destino.saldo-p_monto),p_monto,c_destino.saldo,'1','','','123456',p_agencia,p_usuario,p_cuenta_destino);
    end loop;
    UPDATE CUENTA SET DISPONIBLE=RESERVA + SALDO where cod_cuenta = p_cuenta_origen;
    UPDATE CUENTA SET DISPONIBLE=RESERVA + SALDO  where cod_cuenta = p_cuenta_destino;
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

/*eliminar triggers*/
drop trigger VERIFICAR_SALDO;

/*reiniciar valores*/

update cuenta set saldo=1000 where cod_cuenta=1;
update cuenta set saldo=2000 where cod_cuenta=2;
delete from transaccion where 1=1;

/*ejecutar procedimiento almacenados*/
exec transferencia_fondos(1,1,1,2,200);
begin transferencia_fondos(1,1,1,2,200); commit; end;
/*seleccionar valores*/
select * from cuenta;
select * from detalle_cuenta;
select * from agencia;
select * from cuenta;
select * from transaccion;

/*inner joins*/
SELECT c.comuna, p.provincia, r.region FROM CLIENTE C INNER JOIN DETALLE D ON c.idprovincia= p.idprovincia INNER JOIN Regiones r ON r.IdRegion = p.IdRegion;
SELECT c.COD_CLIENTE from CLIENTE C INNER JOIN DETALLE_CUENTA D ON C.COD_CLIENTE=D.CLIENTE_COD_CLIENTE INNER JOIN CUENTA CC ON CC.COD_CUENTA=D.CUENTA_COD_CUENTA WHERE CC.COD_CUENTA=1;


select saldo,reserva,disponible from cuenta where cod_cuenta=1;

select * from cuenta where cod_cuenta=1;

select saldo,reserva,disponible from cuenta where cod_cuenta=1;
