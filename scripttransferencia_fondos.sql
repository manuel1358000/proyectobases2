
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









CREATE OR REPLACE PROCEDURE     bd2_p_transaccion(
   p_sku number, 
   p_tipo_transaccion varchar2, 
   p_cantidad number,
   p_usuario varchar2,
   p_saldo out number,
   p_commit boolean default true) 
is
   cursor c_skus (p_sku number) is
   select sku, saldo
   from   skus
   where  sku = p_sku
   for update of saldo;
   -- VL
   v_transaccion transacciones.transaccion%type;
   v_error varchar2(32000);
begin
   begin
   -- Leemos el registro
   for v_sku in c_skus (p_sku) loop
--      savepoint ultima_trx;
--      begin
      -- Siguiente # de transaccion
      select seq_transacciones.nextval into v_transaccion from dual;
      -- Creamos transaccion
      insert into transacciones (transaccion, tipo_transaccion, fecha, sku, no_documento, 
             cantidad, usuario)
      values (v_transaccion, p_tipo_transaccion, sysdate, p_sku, null,
             p_cantidad, p_usuario);
      -- Actuaalizamos saldo
      update skus
      set    saldo = nvl(saldo,0) + p_cantidad
      where  current of c_skus;
--      commit;
--      exception
--      when others then 
--      rollback to ultima_trx;
--      -- Bitacora
--      commit;
--      end;
      p_saldo := 100;
   end loop;
   exception
   when dup_val_on_index then
   raise_application_error(-20000,'Valor duplicado');
   when others then
   v_error := SQLERRM;
   raise_application_error(-20000,'Error:'||v_error);
   end;
   -- GC
   if p_commit then
      commit;
   end if;
end bd2_p_transaccion;














